const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is running!'));

app.listen(port);

process.on('uncaughtException', function (err) {
    const errorStr = String(err || '');
    const ignoreList = [
        'Error: read ECONNRESET',
        'Connection Closed',
        'Socket connection timeout',
        'Timed Out',
        'Bad MAC',
        'bad mac',
        'already-exists',
        'rate-overlimit',
        'not-authorized',
        'SessionCipher.decryptWithSessions',
        'SessionCipher.doDecryptWhisperMessage',
        'Decrypted message with closed session.',
        'Closing open session',
        'Closing stale open session',
        'Closing session',
        'Closing open session in favor of incoming prekey bundle',
        'Closing stale open session for new outgoing prekey bundle',
        'Failed to decrypt message with any known session',
        'MessageCounterError: Key used already or never filled',
        'Unexpected handshake error'
    ];
    if (ignoreList.some(item => errorStr.toLowerCase().includes(item.toLowerCase()))) return;
    log('ERROR', '[Uncaught Exception] ' + (err?.stack || errorStr));
});

process.on('unhandledRejection', reason => {
    if (!String(reason).toLowerCase().includes('Error: read ECONNRESET')) {
        log('ERROR', '[Unhandled Rejection] ' + reason);
    }
});

const originalLog = console.log;
const originalError = console.error;
const originalDebug = console.debug;
const originalStdout = process.stdout.write;
const originalStderr = process.stderr.write;

function isNoisy(text) {
    return typeof text === 'string' && (
        text.includes('Error: read ECONNRESET') ||
        text.includes('Connection Closed') ||
        text.includes('Socket connection timeout') ||
        text.includes('Timed Out') ||
        text.includes('Bad MAC') ||
        text.includes('Closing stale open session') ||
        text.includes('Closing session') ||
        text.includes('Decrypted message with closed session.') ||
        text.includes('Closing open session') ||
        text.includes('Failed to decrypt message with any known session') ||
        text.includes('MessageCounterError: Key used already or never filled') ||
        text.includes('already-exists') ||
        text.includes('rate-overlimit') ||
        text.includes('not-authorized') ||
        text.includes('Unexpected handshake error')
    );
}

console.log = (...args) => {
    if (isNoisy(args[0])) return;
    originalLog.apply(console, args);
};
console.error = (...args) => {
    if (isNoisy(args[0])) return;
    originalError.apply(console, args);
};
console.debug = (...args) => {
    if (isNoisy(args[0])) return;
    originalDebug.apply(console, args);
};
process.stdout.write = (chunk, encoding, callback) => {
    if (isNoisy(chunk)) return true;
    return originalStdout.apply(process.stdout, [chunk, encoding, callback]);
};
process.stderr.write = (chunk, encoding, callback) => {
    if (isNoisy(chunk)) return true;
    return originalStderr.apply(process.stderr, [chunk, encoding, callback]);
};

require('./config.js');
require('./lib/update');

const chalk = require('chalk');
global.log = function (type, text) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const time = `${hours}:${minutes}:${seconds}`;
    const logType = type.toUpperCase();
    const coloredType = logType === 'INFO' ? chalk.cyan(logType) :
        logType === 'WARN' ? chalk.yellow(logType) :
            logType === 'ERROR' ? chalk.red(logType) : logType;
    console.log(coloredType + ' [' + time + ']:', chalk.white(text));
};

require('events').EventEmitter.defaultMaxListeners = 600;

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    makeInMemoryStore,
    jidDecode,
    downloadContentFromMessage,
    delay,
    Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Boom } = require('@hapi/boom');
const yargs = require('yargs/yargs');
const NodeCache = require('node-cache');
const moment = require('moment-timezone');
const FileType = require('file-type');
const axios = require('axios');
const _ = require('lodash');
const PhoneNumber = require('awesome-phonenumber');
const DataBase = require('./lib/database');
const { delArrSave } = require('./lib/arrfunction.js');
const {
    smsg,
    imageToWebp,
    videoToWebp,
    writeExif,
    writeExifImg,
    writeExifVid,
    toAudio,
    toPTT,
    toVideo,
    getBuffer,
    getSizeMedia
} = require('./lib/converter');
const {
    getTime,
    tanggal,
    toRupiah,
    telegraPh,
    pinterest,
    ucapan,
    generateProfilePicture
} = require('./all/function.js');
const { color } = require('./all/color');

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

global.opts = new Object(yargs(process.argv.slice(2)).help(false).parse());
const groupCache = new NodeCache({ stdTTL: 3600 });
const pkg = require('./package.json');

const deleteFolderRecursive = function (folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(file => {
            const curPath = path.join(folderPath, file);
            fs.lstatSync(curPath).isDirectory() ?
                deleteFolderRecursive(curPath) :
                fs.unlinkSync(curPath);
        });
        fs.rmdirSync(folderPath);
    }
};

const question = text => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(text, resolve));
};

async function startBotz() {
    const { state, saveCreds } = await useMultiFileAuthState('./tmp/session');
    const db = new DataBase(process.env.DATABASE_URL);
    const dbData = await db.read();

    global.db = {
        reconnect: 0,
        loadedPlugins: false,
        groups: {},
        settings: {},
        database: {},
        sticker: {},
        warns: {},
        setsudo: [],
        disabled: [],
        ban: [],
        gcban: [],
        plugins: {},
        ...dbData
    };

    const conn = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Ubuntu', 'Chrome', '100.0.4815.0'],
        version: [2, 3000, 1028280621]
    });

    global.ednut = conn;
    store.bind(conn.ev);

    require('./all/connect/messages')(conn, store);
    require('./all/connect/creds')(conn, store, saveCreds);
    require('./all/connect/group')(conn);
    require('./all/connect/statusForward')(conn);
    require('./all/connect/antistatus')(conn);
    require('./all/connect/antidelete')(conn, store);
    require('./all/connect/call')(conn, store);
    require('./all/connect/connection')(conn, () => {
        log('WARN', 'Restart triggered');
        process.exit(0);
    });

    setInterval(async () => {
        try {
            await db.write(global.db);
        } catch (err) {
            log('ERROR', 'DB Save: ' + err.message);
        }
    }, 10000);

    setInterval(() => {
        const tmpPath = path.join(__dirname, './tmp/');
        const sessionPath = path.join(tmpPath, 'session');
        if (fs.existsSync(sessionPath)) {
            const files = fs.readdirSync(sessionPath);
            for (const file of files) {
                if (file.endsWith('.json') && file.startsWith('creds')) {
                    try {
                        fs.unlinkSync(path.join(sessionPath, file));
                    } catch { }
                }
            }
        }
        const keep = ['session', 'arch.jpg', 'tmp', 'helper.js', 'data.js'];
        const allFiles = fs.readdirSync(tmpPath);
        for (const file of allFiles) {
            if (!keep.includes(file)) {
                const fullPath = path.join(tmpPath, file);
                try {
                    const stat = fs.statSync(fullPath);
                    stat.isDirectory() ?
                        fs.rmSync(fullPath, { recursive: true, force: true }) :
                        fs.unlinkSync(fullPath);
                } catch { }
            }
        }
        global.gc && global.gc();
    }, 20 * 60 * 1000);

    conn.decodeJid = jid => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decoded = jidDecode(jid) || {};
            return decoded.user && decoded.server ? decoded.user + '@' + decoded.server : jid;
        } else return jid;
    };

    conn.getName = (jid, withoutContact = false) => {
        id = conn.decodeJid(jid);
        withoutContact = conn.user && withoutContact;
        let v;
        if (id.endsWith('@g.us')) {
            return new Promise(async resolve => {
                v = store.contacts[id] || {};
                if (!(v.name || v.subject)) v = await conn.groupMetadata(id) || {};
                resolve(v.subject || v.name || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'));
            });
        } else {
            v = id === '0@s.whatsapp.net' ? { id, name: 'WhatsApp' } : id === conn.decodeJid(conn.user.id) ? conn.user : store.contacts[id] || {};
            return (withoutContact ? '' : v.name) || v.notify || v.vname || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
        }
    };

    conn.sendText = (jid, text, quoted = '', options = {}) =>
        conn.sendMessage(jid, { text: text, ...options }, { quoted: quoted });

    conn.sendContact = async (jid, numbers, name = 'Patron', caption = '', options = {}) => {
        let contacts = [];
        for (let num of numbers) {
            contacts.push({
                displayName: global.botname,
                vcard:
                    'BEGIN:VCARD\n' +
                    'VERSION:3.0\n' +
                    'N;' + global.botname + ';;;\n' +
                    'FN:' + global.botname + '\n' +
                    'item1.TEL;waid=' + num + ':' + num + '\n' +
                    'item1.X-ABLabel:Ponsel\n' +
                    'X-WA-BIZ-NAME:' + name + '\n' +
                    'X-WA-BIZ-DESCRIPTION:' + caption + '\n' +
                    'END:VCARD'
            });
        }
        conn.sendMessage(jid, { contacts: { displayName: contacts.length + ' contacts', contacts: contacts }, ...options }, { quoted: caption });
    };

    conn.downloadMediaMessage = async message => {
        let mime = (message.msg || message).mimetype || '';
        let type = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(message, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        global.gc?.();
        return buffer;
    };

    conn.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path :
            /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') :
                /^https?:\/\//.test(path) ? await await getBuffer(path) :
                    fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        let buffer;
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options);
        } else {
            buffer = await imageToWebp(buff);
        }
        await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted: quoted });
        buff = null;
        buffer = null;
        global.gc?.();
        return buffer;
    };

    conn.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path :
            /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') :
                /^https?:\/\//.test(path) ? await getBuffer(path) :
                    fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        let buffer;
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options);
        } else {
            buffer = await videoToWebp(buff);
        }
        await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted: quoted });
        buff = null;
        buffer = null;
        global.gc?.();
        return buffer;
    };

    conn.sendFile = async (jid, path, filename = '', caption = '', quoted, asDocument = false, options = {}) => {
        let { res, data, filename: fname } = await conn.getFile(path, true);
        if (res && res.status >= 200 || data.length <= 65536) {
            try {
                throw { json: JSON.parse(data.toString()) };
            } catch (err) {
                if (err.json) throw err.json;
            }
        }
        let opt = { filename: filename };
        if (asDocument) opt.document = asDocument;
        if (!res) options.asDocument = true;
        let type = '';
        let mime = res.mime;
        let media;
        if (/webp/.test(res.mime) || /image/.test(res.mime) && options.asSticker) {
            type = 'sticker';
        } else {
            if (/image/.test(res.mime) || /webp/.test(res.mime) && options.asImage) {
                type = 'image';
            } else {
                if (/video/.test(res.mime)) {
                    type = 'video';
                } else {
                    if (/audio/.test(res.mime)) {
                        media = await (asDocument ? toPTT : toAudio)(data, res.ext);
                        fname = media.filename;
                        data = media.data;
                        mime = 'audio/ogg; codecs=opus';
                        type = 'audio';
                    } else {
                        type = 'document';
                    }
                }
            }
        }
        if (options.asDocument) type = 'document';
        let message = { ...options, caption: caption, ptt: asDocument, [type]: { url: fname }, mimetype: mime };
        let m;
        try {
            m = await conn.sendMessage(jid, message, { ...opt, ...options });
        } catch (err) {
            console.error(err);
            m = null;
        } finally {
            if (!m) m = await conn.sendMessage(jid, { ...message, [type]: data }, { ...opt, ...options });
            if (fs.existsSync(fname)) {
                try {
                    await fs.promises.unlink(fname);
                } catch (err) {
                    console.error('Failed to delete temp file:', err);
                }
            }
            data = null;
            global.gc?.();
            return m;
        }
    };

    conn.getFile = async (path, saveToFile = false) => {
        let res, buffer = Buffer.isBuffer(path) ? path :
            /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split(',')[1], 'base64') :
                /^https?:\/\//.test(path) ? await (res = await getBuffer(path)) :
                    fs.existsSync(path) ? fs.readFileSync(path) :
                        typeof path === 'string' ? path : Buffer.alloc(0);
        const fileInfo = await FileType.fromBuffer(buffer) || { mime: 'application/octet-stream', ext: 'bin' };
        const fileName = path.join(__dirname, './tmp/' + new Date().getTime() + '.' + fileInfo.ext);
        if (buffer && saveToFile) fs.promises.writeFile(fileName, buffer);
        return {
            res: res,
            filename: fileName,
            size: await getSizeMedia(buffer),
            ...fileInfo,
            data: buffer
        };
    };

    conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let m = message.m ? message.m : message;
        let mimetype = (message.m || message).mimetype || '';
        let mediaType = message.mtype ? message.mtype.replace(/Message/gi, '') : mimetype.split('/')[0];
        const stream = await downloadContentFromMessage(m, mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        let fileInfo = await FileType.fromBuffer(buffer);
        let finalName = attachExtension ? filename + '.' + fileInfo.ext : filename;
        const dir = './tmp/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        const filepath = dir + '/' + finalName;
        await fs.promises.writeFile(filepath, buffer);
        buffer = null;
        global.gc?.();
        return filepath;
    };

    return conn;
}

async function startBot() {
    try {
        let sessionId = global.sessionId;
        if (!sessionId) {
            log('ERROR', 'Session ID not found. Please add one in config.js');
            return;
        }
        if (!/^Zed-Bot~/.test(sessionId)) {
            log('ERROR', 'Invalid session ID. Please scan a new session from ' + global.botname);
            return;
        }
        const tmpDir = path.join(__dirname, 'tmp');
        const sessionFile = path.join(tmpDir, 'session/creds.json');
        !fs.existsSync(tmpDir) && fs.mkdirSync(tmpDir, { recursive: true });
        if (!fs.existsSync(sessionFile)) {
            let gistId = sessionId.replace(/^Zed-Bot~/, '');
            try {
                const url = 'https://gist.githubusercontent.com/hacker263/' + gistId + '/raw/session.json';
                const res = await axios.get(url);
                const data = typeof res.data === 'object' ? res.data : JSON.parse(res.data);
                await fs.promises.writeFile(sessionFile, data);
                log('INFO', '✅ Session downloaded and saved.');
            } catch (err) {
                log('ERROR', '❌ Failed to fetch or save session');
                return;
            }
        } else {
            log('INFO', '✅ Using existing session creds.json');
        }
        global.ednut?.ev && (global.ednut.ev.removeAllListeners(), global.ednut = null);
        await startBotz();
    } catch (err) {
        log('ERROR', 'Encountered Error: ' + (err?.stack || err));
    }
}
startBot();