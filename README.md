# coverage-diff-back

Send the coverage difference back to the github on each pull requests

## Install

```
npm install -g coverage-diff-back
```

Or you can use coverage-diff-back with `npx`.

```
npx coverage-diff-back
```

## Usage

```
Usage: coverage-diff-back [options]

Options:
  --help           Show help  [boolean]
  --version        Show version number  [boolean]
  --coverage-glob  A glob pattern to specify path of coverage-summary.json  [string] [default: "**/coverage/coverage-summary.json"]
  --from           Compare branch  [string] [default: "master"]
  --status         Update commit status  [boolean]

Examples:
  coverage-diff-back --no-status     # Doesn't update commit status
  coverage-diff-back --from develop  # Compare between develop and current pull request

For more information, find our manual at https://github.com/Leko/coverage-diff-back
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
