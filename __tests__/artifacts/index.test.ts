import getArtifactFetcher from "../../src/artifacts";

describe("artifacts", () => {
  it("returns ArtifactFetcher when the argument is 'circleci'", () => {
    expect(getArtifactFetcher("circleci")).toBeTruthy();
  });
  it("throws Error when the argument is not supported", () => {
    expect(() => getArtifactFetcher("xxx")).toThrow();
  });
});
