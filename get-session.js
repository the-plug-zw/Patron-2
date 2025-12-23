#!/usr/bin/env node
/**
 * get-session.js
 * Helper to generate a local WhatsApp session for Zed.
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
const util = require('util');

const args = process.argv.slice(2);
const FLAG_PRINT = args.includes('--print');
const FLAG_SAVE_SESSION_JSON = args.includes('--save-session-json');

async function start() {
  const sessionDir = path.join(__dirname, 'tmp', 'session');
  !fs.existsSync(sessionDir) && fs.mkdirSync(sessionDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  // connection logic with retry/backoff to handle stream errors and allow pairing to complete
  let conn = null;
  let connected = false;

  async function attemptConnect(maxRetries = 8) {
    let attempt = 0;
    while (attempt < maxRetries) {
      attempt++;
      console.log(`\n--- Connection attempt ${attempt}/${maxRetries} ---`);

      conn = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['Zed-Session-Generator', 'Chrome', '100.0']
      });

      conn.ev.on('creds.update', saveCreds);

      // wait for either open or close
      const evResult = await new Promise(resolve => {
        const onUpdate = update => {
          console.log('Connection update:', update);
          if (update.qr) console.log('QR updated — scan it now.');
          if (update.connection === 'open') {
            conn.ev.off('connection.update', onUpdate);
            resolve({ type: 'open', update });
          }
          if (update.connection === 'close') {
            conn.ev.off('connection.update', onUpdate);
            resolve({ type: 'close', update });
          }
        };

        conn.ev.on('connection.update', onUpdate);

        // safety timeout in case no events occur
        setTimeout(() => resolve({ type: 'timeout' }), 120000);
      });

      if (evResult.type === 'open') {
        connected = true;
        console.log('\n✅ Connection opened — device should be paired now.');
        console.log('Credentials will be saved to:', path.join(sessionDir, 'creds.json'));
        return conn;
      }

      // handle close / timeout
      if (evResult.type === 'timeout') {
        console.log('No connection events within timeout (120s). Will retry.');
      } else if (evResult.type === 'close') {
        const update = evResult.update;
        console.log('\n⚠️ Connection closed. Capturing verbose lastDisconnect details for debugging:');
        try {
          console.log(util.inspect(update.lastDisconnect, { depth: null }));
        } catch (err) {
          console.log('Error inspecting lastDisconnect:', err.message);
        }

        try {
          const debugPath = path.join(sessionDir, 'session-debug.log');
          const entry = `----- ${new Date().toISOString()} -----\n` + util.inspect(update, { depth: null }) + '\n\n';
          fs.appendFileSync(debugPath, entry, 'utf8');
          console.log('Wrote debug details to', debugPath);
        } catch (err) {
          console.error('Failed to write debug log:', err.message || err);
        }

        const statusCode = update.lastDisconnect && update.lastDisconnect.output && update.lastDisconnect.output.statusCode;
        const errMsg = (update.lastDisconnect && (update.lastDisconnect.error && update.lastDisconnect.error.message)) || (update.lastDisconnect && update.lastDisconnect.output && update.lastDisconnect.output.payload && update.lastDisconnect.output.payload.message) || '';

        if (statusCode === 515 || errMsg.includes('Stream Errored')) {
          // recommended restart: wait and retry (exponential backoff)
          const backoff = Math.min(5 * 1000 * attempt, 60 * 1000); // 5s * attempt up to 60s
          console.log(`Stream Errored / restart required. Waiting ${backoff / 1000}s then retrying...`);
          await new Promise(r => setTimeout(r, backoff));
          continue; // next attempt
        } else {
          console.log('Non-restartable disconnect or pairing failed. Will not retry automatically.');
          break;
        }
      }

      // cleanup before next attempt
      try {
        conn.ev.removeAllListeners();
        conn.end && conn.end();
      } catch (e) {}

      // small delay before next attempt
      await new Promise(r => setTimeout(r, 2000));
    }

    return null;
  }

  // start attempts
  console.log('Scan the QR with your WhatsApp (it should appear above).');
  const activeConn = await attemptConnect(8);
  if (!activeConn) {
    console.error('Failed to establish a stable connection after multiple attempts. Check network, run locally (not in Codespaces) and ensure phone has internet and try again.');
    process.exit(1);
  }

  // On successful connection, export creds/session.json and print messages
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
}

start().catch(err => {
  console.error('Error starting session generator:', err);
  process.exit(1);
});
