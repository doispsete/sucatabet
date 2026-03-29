const { execSync } = require('child_process');
const path = require('path');

// Ensure we are in the apps/api directory
const apiDir = 'C:\\Users\\2p7\\Desktop\\Nova pasta\\sucatabet\\apps\\api';

console.log(`[FORCE PUSH] TARGET: ${apiDir}`);

try {
  execSync('npx.cmd prisma db push --accept-data-loss', {
    cwd: apiDir,
    stdio: 'inherit'
  });
  console.log('[FORCE PUSH] SUCCESS');
} catch (err) {
  console.error('[FORCE PUSH] FAILED');
  process.exit(1);
}
