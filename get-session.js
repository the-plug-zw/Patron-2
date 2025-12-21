#!/usr/bin/env node
/**
 * get-session.js
 * Helper to generate a local WhatsApp session for Patron.
 * Usage:
 *  1) node get-session.js        -> starts and prints QR to terminal; saves creds to ./tmp/session/creds.json
 *  2) node get-session.js --print -> prints the JSON of creds.json to stdout (safe to pipe into files)
 *  3) node get-session.js --save-session-json -> creates ./tmp/session/session.json (useful for gist upload)
 *
 * Notes:
 *  - Make sure `@whiskeysockets/baileys` is installed (this repo already depends on it).
 *  - The script writes creds to the same folder `main.js` expects: ./tmp/session/creds.json
 *  - session.json (created by --save-session-json) has the same contents as creds.json and can be uploaded as the gist file.
 */

const fs = require('fs');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const args = process.argv.slice(2);
const FLAG_PRINT = args.includes('--print');
const FLAG_SAVE_SESSION_JSON = args.includes('--save-session-json');

async function start() {
  const sessionDir = path.join(__dirname, 'tmp', 'session');
  !fs.existsSync(sessionDir) && fs.mkdirSync(sessionDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  const conn = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ['Patron-Session-Generator', 'Chrome', '100.0']
  });

  conn.ev.on('creds.update', saveCreds);

  conn.ev.on('connection.update', update => {
    console.log('Connection update:', update);
    if (update.connection === 'close') {
      console.log('Connection closed. If creds.json exists the session is saved at:', path.join(sessionDir, 'creds.json'));
      process.exit(0);
    }
  });

  conn.ev.on('open', async () => {
    console.log('\n✅ Authenticated. Credentials saved to:', path.join(sessionDir, 'creds.json'));

    try {
      const credsPath = path.join(sessionDir, 'creds.json');
      if (FLAG_PRINT) {
        const data = fs.readFileSync(credsPath, 'utf8');
        console.log('\n--- creds.json start ---');
        console.log(data);
        console.log('--- creds.json end ---');
      }

      if (FLAG_SAVE_SESSION_JSON) {
        const data = fs.readFileSync(credsPath, 'utf8');
        const outPath = path.join(sessionDir, 'session.json');
        fs.writeFileSync(outPath, data, 'utf8');
        console.log('\n✅ session.json written to:', outPath);
      }
    } catch (err) {
      console.error('Failed to export creds:', err.message);
    }

    console.log('You may now close this script (Ctrl+C) once you have the creds saved.');
  });

  console.log('Scan the QR with your WhatsApp (it should appear above).');
}

start().catch(err => {
  console.error('Error starting session generator:', err);
  process.exit(1);
});
