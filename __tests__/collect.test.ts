import { addPrefix, toRelative } from "../src/collect";

describe("collect", () => {
  describe("addPrefix", () => {
    it("adds prefix correctly", () => {
      const report = addPrefix("/")({
        path: "tmp/foo/bar",
        // @ts-ignore
        coverage: {}
      });
      expect(report.path).toBe("/tmp/foo/bar");
    });
  });
  describe("toRelative", () => {
    it("calculates correctly", () => {
      const report = toRelative("/home/leko/repo")({
        path: "/home/leko/repo/packages/foo/coverage/coverage-summary.json",
        // @ts-ignore
        coverage: {}
      });
      expect(report.path).toBe("packages/foo/coverage/coverage-summary.json");
    });
  });
});
