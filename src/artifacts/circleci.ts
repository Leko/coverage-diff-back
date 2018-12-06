import querystring from "querystring";
import { Glob } from "glob";
import fetch from "node-fetch";
import { CoverageReport } from "../CoverageReport";

interface CircleCIArtifact {
  path: string;
  pretty_path: string;
  node_index: 0;
  url: string;
}

export const fetchArtifacts = async ({
  slug,
  branch,
  globPattern
}: {
  slug: string;
  branch: string;
  globPattern: string;
}): Promise<CoverageReport[]> => {
  if (!process.env.CIRCLECI_TOKEN) {
    throw new Error("Environment variable CIRCLECI_TOKEN must be required");
  }

  const { minimatch } = new Glob(globPattern);
  const endpoint = `https://circleci.com/api/v1.1/project/github/${slug}/latest/artifacts`;
  const query = querystring.stringify({
    "circle-token": process.env.CIRCLECI_TOKEN,
    branch: branch,
    filter: "successful"
  });
  const response: CircleCIArtifact[] = await fetch(`${endpoint}?` + query).then(
    res => res.json()
  );

  const coverageArtifactMeta = response.filter(({ path }) =>
    minimatch.match(path)
  );
  const tokenQuery = querystring.stringify({
    "circle-token": process.env.CIRCLECI_TOKEN
  });
  return Promise.all(
    coverageArtifactMeta.map(({ url }) =>
      fetch(`${url}?${tokenQuery}`).then(res => res.json())
    )
  );
};
