export interface StatItem {
  old: number | null;
  now: number;
  diff: number;
}
export interface DiffItem {
  old: number | null;
  now: number;
  diff: number;
}

export interface Diff {
  stats: {
    files: StatItem;
    lines: StatItem;
  };
  total: DiffItem;
  lines: DiffItem;
  statements: DiffItem;
  functions: DiffItem;
  branches: DiffItem;
}
export interface DiffReport {
  path: string;
  diff: Diff;
}

export interface CoverageMetrics {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
}

export interface CoverageSummary {
  lines: CoverageMetrics;
  statements: CoverageMetrics;
  functions: CoverageMetrics;
  branches: CoverageMetrics;
}

export interface CoverageSummaryJSON {
  total: CoverageSummary;
  [file: string]: CoverageSummary;
}

export interface CoverageReport {
  path: string;
  coverage: CoverageSummaryJSON;
}
