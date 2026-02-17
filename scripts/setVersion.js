#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const semverRegex = /^\d+\.\d+\.\d+$/;
const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const packageLockPath = path.join(rootDir, 'package-lock.json');
const appVersionPath = path.join(rootDir, 'src', 'data', 'appVersion.js');

const updateJsonFile = (filePath, updater) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);
  updater(json);
  fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
};

const setVersion = (versionArg) => {
  if (!versionArg || !semverRegex.test(versionArg)) {
    throw new Error('Usage: node scripts/setVersion.js <x.y.z>');
  }

  updateJsonFile(packageJsonPath, (json) => {
    json.version = versionArg;
  });

  if (fs.existsSync(packageLockPath)) {
    updateJsonFile(packageLockPath, (json) => {
      json.version = versionArg;
      if (json.packages && json.packages['']) {
        json.packages[''].version = versionArg;
      }
    });
  }

  const appVersionContent = `export const APP_VERSION = '${versionArg}';\n\nexport default APP_VERSION;\n`;
  fs.writeFileSync(appVersionPath, appVersionContent, 'utf8');

  console.log(`✅ App version updated to ${versionArg}`);
  console.log('Updated: package.json, package-lock.json, src/data/appVersion.js');
};

if (require.main === module) {
  try {
    setVersion(process.argv[2]);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { setVersion };
