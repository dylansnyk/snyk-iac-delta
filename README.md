# Snyk IaC Delta

Run Snyk IaC as a PR check by comparing two `snyk iac test` scan results

IaC issues are considered new if the combination of the file name + configuration path + issue id are not present in the baseline scan results

## Run from CLI

```
# install snyk-iac-delta
npm i -g snyk-iac-delta

# scan a baseline branch
snyk iac test --json > baseline.json

# checkout and scan another branch
git checkout current-branch
snyk iac test --json > current.json

# compare the current and baseline iac scans
snyk-iac-delta --current current.json --baseline baseline.json
```

## GitHub Action

A sample GitHub Action to run on a Pull Request

```
name: "snyk iac delta"
on: [pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: snyk/actions/setup@master
      - name: Snyk IaC on current branch
        run: snyk iac test --json > iac-current.json
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      - name: Save current IaC scan
        uses: actions/upload-artifact@v2
        with:
          name: current
          path: iac-current.json
      - uses: actions/checkout@v2
        with:
          ref: ${{ github.event.pull_request.base.ref }}
      - name: Snyk IaC on baseline branch
        run: snyk iac test --json > iac-baseline.json
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: install snyk-iac-delta
        run: npm install -g snyk-iac-delta
      - name: Fetch current IaC scan result
        uses: actions/download-artifact@v2
        with:
          name: current
      - name: Run Snyk IaC Delta
        run: snyk-iac-delta --baseline iac-baseline.json --current iac-current.json
```

Example PR: https://github.com/dylansnyk/nodejs-goof/pull/34