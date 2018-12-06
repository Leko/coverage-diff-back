// @ts-ignore
import Octokit from "@octokit/rest";
import { DiffReport } from "./CoverageReport";
import { generateTable } from "./utils/table";

export const generateMarkdown = ({
  prId,
  branch
}: {
  prId: string;
  branch: string;
}) => (diffReport: DiffReport): string => {
  const table = generateTable(diffReport.diff, {
    prId,
    branch
  });
  return `## ${diffReport.path}\n${table}`;
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
    .map(generateMarkdown({ branch, prId }))
    .join("\n\n");
  const { data } = await octokit.issues.createComment({
    owner,
    repo,
    number: parseInt(prId, 10),
    body: comment
  });
  return data.html_url;
};
