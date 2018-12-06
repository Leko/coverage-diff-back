import fs from "fs";
import { sync as glob } from "glob";
import yargs from "yargs";
// @ts-ignore
import envCI from "env-ci";
import getArtifactFetcher from "./artifacts";
import { collect } from "./collect";
import { reporter } from "./report";

const options = yargs
  .option("metric", {
    description: ""
  })
  .option("coverage-glob", {
    default: "**/coverage/coverage-summary.json",
    description: ""
  })
  .option("from", {
    default: "master",
    description: "Compare branch"
  })
  .option("status", {
    type: "boolean"
  }).argv;

if (!process.env.GITHUB_TOKEN) {
  throw new Error("Environment variable GITHUB_TOKEN must be required");
}
const token = process.env.GITHUB_TOKEN;
const { service, slug, pr } = envCI();

collect({
  cwd: process.cwd(),
  slug,
  branch: options.from,
  globPattern: options.coverageGlob,
  artifactFetcher: getArtifactFetcher(service),
  globFetcher: async pattern =>
    glob(pattern, { ignore: "**/{node_modules,.git}/**" }).map(path => ({
      path,
      coverage: JSON.parse(fs.readFileSync(path, "utf8"))
    }))
})
  .then(diffReports => {
    if (diffReports.length === 0) {
      throw new Error("Cannot found any coverage reports");
    }
    return diffReports;
  })
  .then(
    reporter({
      slug,
      prId: pr,
      branch: options.from,
      token
    })
  )
  .then((url: string) => {
    console.log(`Comment created: ${url}`);
  })
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
