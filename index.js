#!/usr/bin/env node

import * as fs from 'fs';
import minimist from 'minimist'

const argv = minimist(process.argv.slice(2));

const BASELINE_FILE = argv['baseline']
const CURRENT_FILE = argv['current']

const paramsAreValid = () => {
  if (BASELINE_FILE == null) {
    console.log('Error: specify baseline Snyk IaC json file: --baseline')
    return false
  }

  if (CURRENT_FILE == null) {
    console.log('Error: specify update Snyk IaC json file: --current')
    return false
  }

  return true
}

// construct list of IaC vulnerabilities 
const createIacIssueArray = (snykOutput) => {

    const iacIssues = [];

    snykOutput.forEach(file => {
        const targetFile = file.targetFile
        file.infrastructureAsCodeIssues.forEach(iacIssue => {
            iacIssues.push({
                ...iacIssue,
                targetFile
            })
        })
    })

    return iacIssues
}

// create unique key for the iac issue
const createIssueKey = (iacIssue) => {
    return `${iacIssue.targetFile}${iacIssue.path.toString()}${iacIssue.id}`
}

// convert array to map
const arrToFileMap = (map, obj) => {
    map[createIssueKey(obj)] = obj;
    return map;
}

// compare the iac issue maps
const compareIacIssueMaps = (oldMap, newMap) => {

    const netNewIacIssues = []

    Object.entries(newMap).forEach(([key, val]) => {
        if (!(key in oldMap)) {
            // key not in old issue map => issue is new
            netNewIacIssues.push(val)
        }
    })

    return netNewIacIssues
}

// pretty print iac issues
const printIacIssues = (iacIssues) => {

    console.log(`${iacIssues.length} new IaC issues added:\n`)

    if (iacIssues.length == 0) {
        console.log('No new issues!')
        return;
    }

    iacIssues.forEach(issue => {
        console.log(`  ✗ ${issue.title} [${issue.severity} severity] [${issue.id}] in ${issue.subType}`)

        const path = issue.path.reduce((pathItem, path) => {
            return `${pathItem} > ${path}`
        })

        console.log(`    introduced by ${path}`)
        console.log(`    target file: ${issue.targetFile}`)
        console.log()
    })
}

if (!paramsAreValid()) {
    process.exit()
}

let oldResultsRaw = fs.readFileSync(BASELINE_FILE);
let oldResultsJson = JSON.parse(oldResultsRaw);

let newResultsRaw = fs.readFileSync(CURRENT_FILE);
let newResultsJson = JSON.parse(newResultsRaw);

const oldIacIssues = createIacIssueArray(oldResultsJson)
const newIacIssues = createIacIssueArray(newResultsJson)

const oldIacIssuesMap = oldIacIssues.reduce(arrToFileMap, {});
const newIacIssuesMap = newIacIssues.reduce(arrToFileMap, {});

const netNewIacIssues = compareIacIssueMaps(oldIacIssuesMap, newIacIssuesMap)

printIacIssues(netNewIacIssues)