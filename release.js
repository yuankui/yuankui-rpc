const { spawn } = require('child_process');
const path = require('path');

const packagesDir = path.join(__dirname, 'packages');

const packages = require('fs').readdirSync(packagesDir);

async function release() {
  for (const pkg of packages) {
    const pkgPath = path.join(packagesDir, pkg);
    if (require('fs').statSync(pkgPath).isDirectory()) {
      await new Promise((resolve, reject) => {
        const child = spawn('npm', ['publish', '--access', 'public'], { cwd: pkgPath, stdio: 'inherit' });
        child.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Failed to publish ${pkg}`));
          }
        });
      });
    }
  }
}

release();
