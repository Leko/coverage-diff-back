import * as circleci from "./circleci";
import { ArtifactFetcher } from "./ArtifactFetcher";

// https://github.com/pvdlg/env-ci#supported-ci
const services: { [service: string]: ArtifactFetcher } = {
  circleci
};

export default (service: string) => {
  if (!services[service]) {
    throw new Error(`Not supported: ${service}`);
  }

  return services[service].fetchArtifacts;
};
