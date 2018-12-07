import { relative } from "path";
import { ArtifactFetcher } from "./artifacts/ArtifactFetcher";
import {
  CoverageReport,
  CoverageSummaryJSON,
  Diff,
  DiffReport
} from "./CoverageReport";

const getCoverageDiff = (
  oldCoverage: CoverageSummaryJSON | null,
  nowCoverage: CoverageSummaryJSON
): Diff => {
  return {
    stats: {
      files: {
        // -1 means "total"
        old: oldCoverage ? Object.keys(oldCoverage).length - 1 : null,
        now: Object.keys(nowCoverage).length - 1,
        diff: oldCoverage
          ? Object.keys(nowCoverage).length - Object.keys(oldCoverage).length
          : Object.keys(nowCoverage).length
      },
      lines: {
        old: oldCoverage ? oldCoverage.total.lines.total : null,
        now: nowCoverage.total.lines.total,
        diff: oldCoverage
          ? nowCoverage.total.lines.total - oldCoverage.total.lines.total
          : nowCoverage.total.lines.total
      }
    },
    total: {
      old: oldCoverage ? oldCoverage.total.lines.pct : null,
      now: nowCoverage.total.lines.pct,
      diff: oldCoverage
        ? nowCoverage.total.lines.pct - oldCoverage.total.lines.pct
        : nowCoverage.total.lines.pct
    },
    lines: {
      old: oldCoverage ? oldCoverage.total.lines.pct : null,
      now: nowCoverage.total.lines.pct,
      diff: oldCoverage
        ? nowCoverage.total.lines.pct - oldCoverage.total.lines.pct
        : nowCoverage.total.lines.pct
    },
    statements: {
      old: oldCoverage ? oldCoverage.total.statements.pct : null,
      now: nowCoverage.total.statements.pct,
      diff: oldCoverage
        ? nowCoverage.total.statements.pct - oldCoverage.total.statements.pct
        : nowCoverage.total.statements.pct
    },
    functions: {
      old: oldCoverage ? oldCoverage.total.functions.pct : null,
      now: nowCoverage.total.functions.pct,
      diff: oldCoverage
        ? nowCoverage.total.functions.pct - oldCoverage.total.functions.pct
        : nowCoverage.total.functions.pct
    },
    branches: {
      old: oldCoverage ? oldCoverage.total.branches.pct : null,
      now: nowCoverage.total.branches.pct,
      diff: oldCoverage
        ? nowCoverage.total.branches.pct - oldCoverage.total.branches.pct
        : nowCoverage.total.branches.pct
    }
  };
};

export const addPrefix = (prefix: string) => ({
  path,
  ...other
}: CoverageReport): CoverageReport => ({
  path: prefix + path,
  ...other
});

export const toRelative = (cwd: string) => ({
  path,
  ...other
}: CoverageReport): CoverageReport => ({
  path: relative(cwd, path),
  ...other
});

export const collect = ({
  slug,
  cwd,
  branch,
  globPattern,
  artifactFetcher,
  globFetcher
}: {
  slug: string;
  cwd: string;
  branch: string;
  globPattern: string;
  artifactFetcher: ArtifactFetcher["fetchArtifacts"];
  globFetcher: (globPattern: string) => Promise<CoverageReport[]>;
}): Promise<Array<DiffReport>> => {
  return Promise.all([
    artifactFetcher({
      slug,
      branch,
      globPattern
    }),
    globFetcher(globPattern)
  ])
    .then(
      ([remoteReports, localReports]: [CoverageReport[], CoverageReport[]]) => [
        remoteReports.map(addPrefix("/")).map(toRelative(cwd)),
        localReports.map(toRelative(cwd))
      ]
    )
    .then(([remoteReports, localReports]) => {
      return localReports.map(
        (localReport): [CoverageReport, CoverageReport | null] => {
          const remoteReport = remoteReports.find(
            ({ path }) => localReport.path === path
          );
          return [localReport, remoteReport || null];
        }
      );
    })
    .then(coveragePairs =>
      coveragePairs.map(([localReport, remoteReport]) => {
        const diff = getCoverageDiff(
          remoteReport ? remoteReport.coverage : null,
          localReport.coverage
        );

        return { path: localReport.path, diff };
      })
    );
};
