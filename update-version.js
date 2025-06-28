const fs = require('fs');
const path = require('path');

const versionType = process.argv[2];

const packagesDir = path.join(__dirname, 'packages');

fs.readdirSync(packagesDir).forEach(pkg => {
  const pkgJsonPath = path.join(packagesDir, pkg, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    const version = pkgJson.version.split('.');
    if (versionType === 'major') {
      version[0] = parseInt(version[0]) + 1;
      version[1] = 0;
      version[2] = 0;
    } else if (versionType === 'minor') {
      version[1] = parseInt(version[1]) + 1;
      version[2] = 0;
    } else if (versionType === 'patch') {
      version[2] = parseInt(version[2]) + 1;
    }
    pkgJson.version = version.join('.');
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');
  }
});
