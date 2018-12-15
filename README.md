# coverage-diff-back

[![CircleCI](https://circleci.com/gh/Leko/coverage-diff-back.svg?style=svg)](https://circleci.com/gh/Leko/coverage-diff-back)
![](https://img.shields.io/npm/v/coverage-diff-back.svg)
![](https://img.shields.io/npm/dm/coverage-diff-back.svg)
![](https://img.shields.io/npm/l/coverage-diff-back.svg)

Send the coverage difference back to the github on each pull requests

- Report coverage diff on every pull request
- Update GitHub commit status
- Monorepo ready

<img width="708" alt="Update GitHub commit status" src="https://user-images.githubusercontent.com/1424963/49980569-540bbc80-ff97-11e8-8bc4-c2f798d01890.png">
<img width="769" alt="Report coverage diff on every pull request" src="https://user-images.githubusercontent.com/1424963/49980573-566e1680-ff97-11e8-8f5d-eed4495bea73.png">

## TOC

- [Supported services](#supported-services)
- [Install](#install)
- [Usage](#usage)
  - [Common setup](#common-setup)
  - [CI Setup](#ci-setup)
    - [CircleCI](#circleci)
  - [Command-line usage](#command-line-usage)
- [Contribution](#contribution)
- [Development](#development)
- [License](#license)

---

## Supported services

- [CircleCI](https://circleci.com)

Is there anything you want from these?  
Please [contribute](#contribution) or [create a issue](https://github.com/Leko/coverage-diff-back/issues/new).

## Install

```
npm install -g coverage-diff-back
```

Or you can use coverage-diff-back with `npx` without `npx install`.

```
npx coverage-diff-back
```

## Usage

### Common setup

Please add `json-summary` to coverage reporters.  
If you use jest, please refer [here](https://jestjs.io/docs/en/configuration.html#coveragereporters-array-string).  
Or if you use nyc(istanbul), please refer [here](https://github.com/istanbuljs/nyc#running-reports).

### CI Setup

#### CircleCI

Please add `store_artifacts` step after your test step.  
And then, set environment variables.

- `CIRCLECI_TOKEN`: A CircleCI [personal API token](https://circleci.com/account/api)
- `GITHUB_TOKEN`: A Github [personal access token](https://github.com/settings/tokens) with `repo` scope

Optional: Turn on the `Only build pull requests` in Advanced Settings (if you needed).

Working example is [here](https://github.com/Leko/coverage-diff-back/blob/master/.circleci/config.yml).

### Command-line usage

```
Usage: coverage-diff-back [options]

Options:
  --help           Show help                                                     [boolean]
  --version        Show version number                                           [boolean]
  --coverage-glob  A glob pattern to specify path of coverage-summary.json
                                   [string] [default: "**/coverage/coverage-summary.json"]
  --from           Compare branch                             [string] [default: "master"]
  --status         Update commit status                                          [boolean]

Examples:
  coverage-diff-back --no-status     # Doesn't update commit status
  coverage-diff-back --from develop  # Compare between develop and current pull request
```

## Contribution

1. Fork this repository
1. Write your code
1. Run tests
1. Create pull request to master branch

## Development

```
git clone git@github.com:Leko/coverage-diff-back.git
cd coverage-diff-back
npm i
```

## License

This package under [MIT](https://opensource.org/licenses/MIT) license.
