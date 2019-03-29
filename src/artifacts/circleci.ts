import querystring from "querystring";
import { Glob } from "glob";
import fetch from "node-fetch";
import { CoverageReport } from "../CoverageReport";

interface CircleCIBuild {
  build_num: number;
  workflows: {
    workflow_name: string;
  };
}
interface CircleCIArtifact {
  path: string;
  pretty_path: string;
  node_index: 0;
  url: string;
}

const { CIRCLECI_TOKEN } = process.env;

const request = (endpoint: string, queryParams: object = {}) => {
  const query = querystring.stringify({
    ...queryParams,
    "circle-token": CIRCLECI_TOKEN
  });
  return fetch(`${endpoint}?${query}`).then(res => res.json());
};

const getLatestBuild = async (
  slug: string,
  branch: string,
  workflow: string
): Promise<CircleCIBuild> => {
  const url = `https://circleci.com/api/v1.1/project/github/${slug}/tree/${branch}`;
  const builds: CircleCIBuild[] = await request(url, {
    filter: "successful",
    limit: 100
  });

  const build = builds.find(
    (b: CircleCIBuild) => b.workflows.workflow_name === workflow
  );
  if (!build) {
    throw new Error(
      `Build not found (repository=${slug}, branch=${branch}, workflow=${workflow})`
    );
  }

  return build;
};

const getArtifacts = async (
  slug: string,
  buildNum: number
): Promise<CircleCIArtifact[]> => {
  const url = `https://circleci.com/api/v1.1/project/github/${slug}/${buildNum}/artifacts`;
  const response = await request(url);
  // @ts-ignore Property 'message' does not exist on type 'CircleCIArtifact[]'
  if (response.message) {
    // @ts-ignore
    throw new Error(response.message);
  }

  return response;
};

export const fetchArtifacts = async ({
  slug,
  branch,
  globPattern,
  misc
}: {
  slug: string;
  branch: string;
  globPattern: string;
  misc: { circleciWorkflow: string };
}): Promise<CoverageReport[]> => {
  if (!process.env.CIRCLECI_TOKEN) {
    throw new Error("Environment variable CIRCLECI_TOKEN must be required");
  }

  const build = await getLatestBuild(slug, branch, misc.circleciWorkflow);
  const artifacts = await getArtifacts(slug, build.build_num);
  const { minimatch } = new Glob(globPattern);

  const coverageArtifactMeta = artifacts.filter(({ path }) =>
    minimatch.match(path)
  );
  const tokenQuery = querystring.stringify({
    "circle-token": process.env.CIRCLECI_TOKEN
  });
  return Promise.all(
    coverageArtifactMeta.map(({ path, url }) =>
      fetch(`${url}?${tokenQuery}`)
        .then(res => res.json())
        .then(coverage => ({ path: `/${path}`, coverage }))
    )
  );
};
