#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { setVersion } = require('./setVersion');

const bumpType = process.argv[2];
const allowedTypes = ['patch', 'minor', 'major'];

if (!allowedTypes.includes(bumpType)) {
  console.error('Usage: node scripts/bumpVersion.js <patch|minor|major>');
  process.exit(1);
}

const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;
const match = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)$/);

if (!match) {
  console.error(`Current version is not valid semver: ${currentVersion}`);
  process.exit(1);
}

let major = Number(match[1]);
let minor = Number(match[2]);
let patch = Number(match[3]);

if (bumpType === 'patch') {
  patch += 1;
}

if (bumpType === 'minor') {
  minor += 1;
  patch = 0;
}

if (bumpType === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
}

const nextVersion = `${major}.${minor}.${patch}`;
setVersion(nextVersion);
console.log(`🔼 Bump type: ${bumpType} (${currentVersion} → ${nextVersion})`);
