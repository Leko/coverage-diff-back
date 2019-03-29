import { CoverageReport } from "../CoverageReport";

export interface ArtifactFetcher {
  fetchArtifacts({
    slug,
    branch,
    globPattern,
    misc
  }: {
    slug: string;
    branch: string;
    globPattern: string;
    misc: { circleciWorkflow: string };
  }): Promise<CoverageReport[]>;
}
