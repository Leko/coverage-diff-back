// @ts-ignore
import Octokit from "@octokit/rest";
// @ts-ignore
import graphql from "@octokit/graphql";
import { DiffReport } from "./CoverageReport";
import { generateTable } from "./utils/table";

const signature =
  "Powered by [coverage-diff-back](https://github.com/Leko/coverage-diff-back)";

export const generateMarkdown = ({
  prId,
  branch,
  signature
}: {
  prId: string;
  branch: string;
  signature: string;
}) => (diffReport: DiffReport): string => {
  const table = generateTable(diffReport.diff, {
    prId,
    branch
  });
  return `<!-- ${signature} -->\n\n## ${diffReport.path}\n${table}`;
};

export const reporter = ({
  slug,
  prId,
  branch,
  token
}: {
  slug: string;
  prId: string;
  branch: string;
  token: string;
}) => async (diffReports: Array<DiffReport>): Promise<string> => {
  const octokit = new Octokit();
  octokit.authenticate({
    type: "token",
    token
  });
  const [owner, repo] = slug.split("/");
  const comment = diffReports
    .map(generateMarkdown({ signature, branch, prId }))
    .join("\n\n");
  await hideExistingComments({ token, owner, repo, id: parseInt(prId, 10) });
  const { data } = await octokit.issues.createComment({
    owner,
    repo,
    number: parseInt(prId, 10),
    body: comment
  });
  return data.html_url;
};

const hideExistingComments = async ({
  token,
  owner,
  repo,
  id
}: {
  token: string;
  owner: string;
  repo: string;
  id: number;
}) => {
  const {
    repository: {
      pullRequest: {
        comments: { nodes }
      }
    }
  } = await graphql(
    `
      query comments($owner: String!, $repo: String!, $id: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $id) {
            comments(first: 100) {
              nodes {
                id
                body
                isMinimized
              }
            }
          }
        }
      }
    `,
    {
      owner,
      repo,
      id,
      headers: {
        Authorization: `token ${token}`
      }
    }
  );
  for (let node of nodes) {
    if (node.isMinimized || !node.body.includes(signature)) {
      continue;
    }

    await graphql(
      `
        mutation hideComment($subjectId: ID!) {
          minimizeComment(
            input: { classifier: OUTDATED, subjectId: $subjectId }
          ) {
            clientMutationId
          }
        }
      `,
      {
        subjectId: node.id,
        headers: {
          Authorization: `token ${token}`,
          // https://developer.github.com/v4/mutation/minimizecomment/
          Accept: "application/vnd.github.queen-beryl-preview+json"
        }
      }
    );
  }
};
