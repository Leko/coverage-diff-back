import { CoverageReport } from "../CoverageReport";

export interface ArtifactFetcher {
  fetchArtifacts({
    slug,
    branch,
    globPattern
  }: {
    slug: string;
    branch: string;
    globPattern: string;
  }): Promise<CoverageReport[]>;
}
