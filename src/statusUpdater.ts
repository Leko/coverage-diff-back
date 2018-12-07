// @ts-ignore
import Octokit from "@octokit/rest";
import { DiffReport } from "./CoverageReport";
import { withSign } from "./utils/table";

const isGood = ({ diff }: DiffReport): boolean => {
  return diff.total.diff >= 0;
};

const summarise = (diffReport: DiffReport): string => {
  const {
    diff: {
      total: { now, diff }
    }
  } = diffReport;
  return `${Math.round(now)}% (${withSign(Math.round(diff))}%)`;
};

export const statusUpdater = ({
  slug,
  sha,
  buildUrl,
  token
}: {
  slug: string;
  sha: string;
  buildUrl: string;
  token: string;
}) => async (diffReports: Array<DiffReport>): Promise<void> => {
  const octokit = new Octokit();
  octokit.authenticate({
    type: "token",
    token
  });
  const [owner, repo] = slug.split("/");
  for (let diffReport of diffReports) {
    await octokit.repos.createStatus({
      owner,
      repo,
      sha,
      state: isGood(diffReport) ? "success" : "failure",
      target_url: buildUrl,
      description: summarise(diffReport),
      context: `coverage-diff-back: ${diffReport.path}`
    });
  }
};
