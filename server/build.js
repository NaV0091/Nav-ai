import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('--- Nav AI Vercel Build Step ---');

// 1. Prepare server/dist directory
const distDir = path.join(__dirname, 'dist');
fs.mkdirSync(distDir, { recursive: true });

// 2. Copy server source code into dist
const srcDir = path.join(__dirname, 'src');
fs.cpSync(srcDir, distDir, { recursive: true });

// 3. Ensure entrypoints exist for Vercel Express builder
const serverFile = path.join(srcDir, 'server.js');
fs.copyFileSync(serverFile, path.join(distDir, 'index.js'));
fs.copyFileSync(serverFile, path.join(distDir, 'app.js'));
fs.copyFileSync(serverFile, path.join(distDir, 'server.js'));

// 4. Build client frontend if client folder exists
const clientDir = path.join(__dirname, '../client');
if (fs.existsSync(clientDir)) {
  try {
    const clientModules = path.join(clientDir, 'node_modules');
    if (!fs.existsSync(clientModules)) {
      console.log('Installing client dependencies on Vercel...');
      execSync('npm install --no-audit --prefer-offline', { cwd: clientDir, stdio: 'inherit' });
    }
    console.log('Building client frontend for static serving...');
    execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });
    const clientDist = path.join(clientDir, 'dist');
    if (fs.existsSync(clientDist)) {
      fs.cpSync(clientDist, path.join(distDir, 'public'), { recursive: true });
      console.log('Client static assets mirrored to server/dist/public successfully.');
    }
  } catch (err) {
    console.warn('Optional client build notice:', err.message);
  }
}

console.log('--- Server build complete and ready for Vercel deployment ---');
