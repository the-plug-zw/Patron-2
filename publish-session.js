#!/usr/bin/env node
/**
 * publish-session.js
 * Helper to publish an exported session.json to a private gist and print a SESSION_ID ready to use.
 * Usage:
 *   - node publish-session.js                    # uses ./tmp/session/session.json
 *   - node publish-session.js --file ./path.json # specify file
 *   - node publish-session.js --public           # make gist public
 *   - GITHUB_TOKEN=ghp_xxx node publish-session.js  # use token if `gh` is not installed
 *
 * Behavior:
 *   - If `gh` CLI is available and logged in, it will be used and the created gist URL printed.
 *   - Otherwise, if environment variable `GITHUB_TOKEN` is set, the script will call the GitHub Gist API.
 *   - The script prints the final `SESSION_ID` value you should use (format: Zed-Bot~<gistId>)
 *
 * Security: Keep the created gist private. Do not share the gist id or URL publicly.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const axios = require('axios');

const args = process.argv.slice(2);
let file = './tmp/session/creds.json';
const publicFlag = args.includes('--public');
const yesFlag = args.includes('--yes') || args.includes('-y');
let envFile;
for (let i = 0; i < args.length - 1; i++) {
  if (args[i] === '--file') file = args[i + 1];
  if (args[i] === '--env') envFile = args[i + 1];
}
const envPathDefault = envFile ? path.resolve(process.cwd(), envFile) : path.resolve(process.cwd(), '.env');

async function createWithGh(filePath, isPublic) {
  try {
    const ghPath = execSync('which gh', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (!ghPath) throw new Error('gh not found');
  } catch (err) {
    throw new Error('gh CLI not available');
  }

  const cmd = ['gist', 'create', filePath, isPublic ? '--public' : '--private', '-d', 'Patron session.json'];
  const proc = spawnSync('gh', cmd, { encoding: 'utf8' });
  if (proc.error) throw proc.error;
  if (proc.status !== 0) throw new Error(proc.stderr || proc.stdout || 'gh gist create failed');
  const out = proc.stdout.trim();
  // gh prints the gist URL; find the id
  const match = out.match(/gist.github.com\/(?:[^\/]+)\/([a-f0-9]+)/i);
  if (match) {
    const id = match[1];
    const ownerMatch = out.match(/gist.github.com\/([^\/]+)\//i);
    const owner = ownerMatch ? ownerMatch[1] : null;
    const rawUrl = owner ? `https://gist.githubusercontent.com/${owner}/${id}/raw/session.json` : null;
    return { id, url: out, rawUrl };
  }
  // fallback: try to read last line with https://gist.github.com/...
  const fallbackMatch = out.match(/https:\/\/gist.github.com\/[\w\-]+\/[a-f0-9]+/i);
  if (fallbackMatch) {
    const url = fallbackMatch[0];
    const id = url.split('/').pop();
    return { id, url, rawUrl: null };
  }
  throw new Error('Failed to parse gist id from gh output');
}

async function createWithApi(filePath, isPublic, token) {
  const content = fs.readFileSync(filePath, 'utf8');
  const body = {
    description: 'Patron session',
    public: !!isPublic,
    files: {
      'session.json': { content }
    }
  };
  const headers = { 'Content-Type': 'application/json', 'User-Agent': 'Patron Session Publisher' };
  if (token) headers['Authorization'] = `token ${token}`;
  const res = await axios.post('https://api.github.com/gists', body, { headers });
  return { id: res.data.id, url: res.data.html_url, rawUrl: `https://gist.githubusercontent.com/${res.data.owner.login}/${res.data.id}/raw/session.json` };
}

(async function main() {
  try {
    const f = path.resolve(process.cwd(), file);
    if (!fs.existsSync(f)) {
      console.error('File not found:', f);
      process.exit(2);
    }

    // helper to write to .env safely
    async function writeSessionToEnv(id, envPath) {
      try {
        const target = envPath || path.resolve(process.cwd(), '.env');
        if (fs.existsSync(target)) {
          const bak = target + `.bak.${Date.now()}`;
          fs.copyFileSync(target, bak);
          console.log('Backup of env saved to', bak);
        }
        let content = '';
        if (fs.existsSync(target)) content = fs.readFileSync(target, 'utf8');
        const line = `SESSION_ID=Zed-Bot~${id}`;
        if (/^SESSION_ID=/m.test(content)) {
          content = content.replace(/^SESSION_ID=.*$/m, line);
        } else {
          if (content && !content.endsWith('\n')) content += '\n';
          content += line + '\n';
        }
        fs.writeFileSync(target, content, 'utf8');
        console.log('✅ Written SESSION_ID to', target);
      } catch (err) {
        console.error('Failed to write to env file:', err.message || err);
      }
    }

    // Try gh CLI first
    try {
      const res = await createWithGh(f, publicFlag);
      console.log('\n✅ Gist created via gh CLI:');
      console.log(res.url + '\n');
      console.log('Use this SESSION_ID (copy and add to your .env):');
      console.log('\nSESSION_ID=Zed-Bot~' + res.id + '\n');
      if (res.rawUrl) console.log('Raw URL (what main.js fetches):', res.rawUrl);

      // If requested, write SESSION_ID into .env (or specified file)
      if (yesFlag) await writeSessionToEnv(res.id, envPathDefault);
      else console.log('\nTip: Run with --yes --env .env to automatically save SESSION_ID to a file.');

      return;
    } catch (err) {
      console.log('gh CLI not available or failed, falling back to GitHub API (GITHUB_TOKEN required).');
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error('GITHUB_TOKEN not set and gh CLI not available. Set GITHUB_TOKEN or install and auth gh CLI.');
      process.exit(3);
    }

    const res = await createWithApi(f, publicFlag, token);
    console.log('\n✅ Gist created via GitHub API:');
    console.log(res.url + '\n');
    console.log('Use this SESSION_ID (copy and add to your .env):');
    console.log('\nSESSION_ID=Zed-Bot~' + res.id + '\n');
    console.log('Raw URL (what main.js fetches):', res.rawUrl);

    // If requested, write SESSION_ID into .env (or specified file)
    if (yesFlag) await writeSessionToEnv(res.id, envPathDefault);
    else console.log('\nTip: Run with --yes --env .env to automatically save SESSION_ID to a file.');
  } catch (err) {
    console.error('Failed to publish session:', err.message || err);
    process.exit(1);
  }
})();

// Export helper for tests or external use
module.exports = { createWithGh, createWithApi };
