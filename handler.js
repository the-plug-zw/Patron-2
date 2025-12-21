const chalk = require('chalk');
const { modul } = require('./lib/module');
const { util, baileys, speed } = modul;
const {
    BufferJSON,
    WA_DEFAULT_EPHEMERAL,
    generateWAMessageFromContent,
    proto,
    generateWAMessageContent,
    generateWAMessage,
    prepareWAMessageMedia,
    downloadContentFromMessage,
    areJidsSameUser,
    getContentType
} = baileys;
const {
    bytesToSize,
    getRandomFile,
    smsg,
    checkBandwidth,
    sleep,
    formatSize,
    getRandom,
    format,
    getBuffer,
    isUrl,
    jsonformat,
    nganuin,
    pickRandom,
    runtime,
    shorturl,
    formatp,
    fetchJson,
    color,
    getGroupAdmins
} = require('./all/myfunc');
const {
    getTime,
    tanggal,
    toRupiah,
    telegraPh,
    ucapan,
    generateProfilePicture
} = require('./all/function.js');
const { getDevice, jidDecode } = require('@whiskeysockets/baileys');
const https = require('https');
const googleTTS = require('google-tts-api');
const { toAudio, toPTT, toVideo, ffmpeg } = require('./all/converter.js');
const cheerio = require('cheerio');
const BodyForm = require('form-data');
const FormData = require('form-data');
const { randomBytes } = require('crypto');
const uploadImage = require('./lib/upload');
const api = require('./lib/api');
const { igdl } = require('./lib/downloader');
const { tiktokDl } = require('btch-downloader');
const fetch = require('node-fetch');
const os = require('os');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const { cekArrSave } = require('./lib/arrfunction.js');
const { LoadDataBase } = require('./lib/database');

module.exports = ednut = async (conn, msg, store, m, chatUpdate) => {
    try {
        await LoadDataBase(conn, msg);
        if (!msg) return;

        const { type, quotedMsg } = msg;
        const quoted = msg.quoted ? msg.quoted : msg;
        const mime = (quoted.msg || quoted).mimetype || '';
        const isMedia = /image|video|sticker|audio/.test(mime);
        const body = msg.isGroup ?
            (msg.mtype === 'conversation' ? msg.message.conversation :
                msg.mtype === 'imageMessage' ? msg.message.imageMessage.caption :
                msg.mtype === 'videoMessage' ? msg.message.videoMessage.caption :
                msg.mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text :
                msg.mtype === 'buttonsResponseMessage' ? msg.message.buttonsResponseMessage.selectedButtonId :
                msg.mtype === 'listResponseMessage' ? msg.message.listResponseMessage.singleSelectReply.selectedRowId :
                msg.mtype === 'templateButtonReplyMessage' ? msg.message.templateButtonReplyMessage.selectedId :
                msg.mtype === 'messageContextInfo' ? msg.message.messageContextInfo.stanzaId :
                msg.mtype === 'buttonsResponseMessage' ? msg.message.buttonsResponseMessage.selectedButtonId :
                '') :
            msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || msg.message.extendedTextMessage?.text || msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply?.selectedRowId || msg.message.templateButtonReplyMessage?.selectedId || msg.text || '';

        const commandBody = typeof msg.text === 'string' ? msg.text : '';
        const prefix = Array.isArray(global.prefix) ? global.prefix : [global.prefix];
        const bodyTrim = body.trimStart();
        const command = bodyTrim.split(/\s+/)[0]?.toLowerCase();

        let handler = null;
        let isCommand = false;
        let isOwner = true;
        let cmd = '';
        let args = [];
        let text = '';
        let q = [];

        for (const pre of prefix) {
            if (command.startsWith(pre.toLowerCase())) {
                handler = pre;
                const sliceBody = body.slice(pre.length).trim();
                const splitBody = sliceBody.split(/\s+/);
                cmd = splitBody[0]?.toLowerCase() || '';
                args = splitBody.slice(1);
                text = args.join(' ');
                q = text;
                isCommand = true;
                isOwner = false;
                break;
            }
        }

        conn.decodeJid = jid => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decoded = jidDecode(jid) || {};
                return decoded.user && decoded.server ? decoded.user + '@' + decoded.server : jid;
            } else return jid;
        };

        const isImage = msg.mtype === 'imageMessage' && msg.message.imageMessage.caption ? msg.message.imageMessage.caption :
            msg.mtype === 'conversation' && msg.message.conversation ? msg.message.conversation :
            msg.mtype === 'extendedTextMessage' && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text :
            msg.mtype === 'videoMessage' && msg.message.videoMessage.caption ? msg.message.videoMessage.caption :
            msg.mtype === 'buttonsResponseMessage' && msg.message.buttonsResponseMessage.selectedButtonId ? msg.message.buttonsResponseMessage.selectedButtonId :
            msg.mtype === 'listResponseMessage' && msg.message.listResponseMessage.singleSelectReply.selectedRowId ? msg.message.listResponseMessage.singleSelectReply.selectedRowId :
            msg.mtype === 'templateButtonReplyMessage' && msg.message.templateButtonReplyMessage.selectedId ? msg.message.templateButtonReplyMessage.selectedId :
            '';

        const isText = msg.mtype === 'conversation' && msg.message.conversation ? msg.message.conversation :
            msg.mtype === 'imageMessage' && msg.message.imageMessage.caption ? msg.message.imageMessage.caption :
            msg.mtype === 'videoMessage' && msg.message.videoMessage.caption ? msg.message.videoMessage.caption :
            msg.mtype === 'extendedTextMessage' && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text :
            '';

        const trimBody = isText.slice(0).trim().toLowerCase();
        const prefixCommand = trimBody.split(/\s+/).shift()?.toLowerCase() || '';
        const from = msg.key.remoteJid;
        const sender = msg.key.fromMe ? conn.decodeJid(conn.user.id) : msg.key.participant ? msg.key.participant : msg.key.remoteJid;
        const botNumber = conn.decodeJid(conn.user.id)?.split('@')[0] + '@s.whatsapp.net';
        const ownerNumber = ['263781564004@s.whatsapp.net', '27694176088@s.whatsapp.net'];
        const pushname = msg.pushName || 'Unknown';
        const groupMetadata = msg.isGroup ? await conn.groupMetadata(msg.chat).catch(() => null) : null;
        const groupName = groupMetadata?.subject || '';
        const participants = groupMetadata?.participants || [];
        const groupAdmins = groupMetadata ? getGroupAdmins(participants) : [];
        const isBotAdmin = groupAdmins.includes(botNumber);
        const isAdmins = groupAdmins.includes(sender);
        const isOwnerNumber = ownerNumber.includes(sender) || global.botnumber?.replace(/[^0-9]/g, '') + '@s.whatsapp.net' === sender;
        const isGroup = msg.isGroup;
        const isPrivate = !msg.isGroup;

        const { util: utilNode, promisify } = require('util');
        const yts = require('youtube-yts');
        const { exec, spawn, execSync } = require('child_process');
        const { lookup } = require('dns');
        const example = text => `Usage : *${prefix.join('')}${cmd}* ${text}`;
        const moment = require('moment-timezone');
        const timeW = moment().tz('Africa/Lagos').format('HH:mm:ss');
        let waktu;
        if (timeW < '06:00:00') waktu = 'Good morning🏙️';
        else if (timeW < '11:00:00') waktu = 'Good morning🏙️';
        else if (timeW < '15:00:00') waktu = 'Good afternoon🌄';
        else if (timeW < '19:00:00') waktu = 'Good afternoon🏞️';
        else if (timeW < '22:00:00') waktu = 'Good evening🌃';
        else waktu = 'Good night🌃';

        const timeX = moment(Date.now()).tz('Africa/Lagos').locale('ng').format('LTS');
        const timeY = moment(Date.now()).tz('Africa/Lagos').locale('ng').format('LL');
        const timeZ = moment(Date.now()).tz('Africa/Lagos').locale('ng').format('LLLL');
        const timeA = moment(Date.now()).tz('Africa/Lagos').locale('ng').format('a');

        let ucapanWaktu = chalk.hex('#ff5e78')(chalk.bold('🚀 There is a message 🚀'));
        let pushnameColor = chalk.white(chalk.hex('#4a69bd').bold('🗣️ SENDERNAME : '));
        let timeColor = chalk.magentaBright('📅 DATE         : ' + new Date().toLocaleString());
        let chatColor = chalk.cyanBright('🔍 MESS LOCATION : ' + msg.chat);
        let senderColor = chalk.yellowBright('👤 JIDS        : ' + sender);
        let messageColor = chalk.greenBright('💬 MESSAGE      : ' + (msg.text || msg.message));

        if (process.env.MODE === 'private' || process.env.MODE === 'self') {
            if ((isCommand && !isOwner) && !msg.isGroup) {
                console.log(ucapanWaktu);
                console.log(pushnameColor);
                console.log(timeColor);
                console.log(chatColor);
                console.log(senderColor);
                console.log(messageColor);
                console.log(chalk.white('------------------------------------------'));
            } else if (msg.isGroup) {
                let groupNameColor = chalk.redBright('🕸️ GROUP        : ' + groupName);
                console.log(ucapanWaktu);
                console.log(pushnameColor);
                console.log(timeColor);
                console.log(chatColor);
                console.log(senderColor);
                console.log(messageColor);
                console.log(groupNameColor);
                console.log(chalk.hex('#ff5e78')('------------------------------------------'));
            }
        }

        conn.sendPresenceUpdate('composing', msg.chat);

        const getRandomQuote = async () => {
            try {
                const { data } = await axios.get('https://favqs.com/api/qotd');
                return data.quote.body;
            } catch (err) {
                log('ERROR', err?.stack || err);
                return 'Internal server error!';
            }
        };

        let profilePicture;
        try {
            profilePicture = await conn.profilePictureUrl(sender, 'image');
        } catch {
            profilePicture = 'https://telegra.ph/file/a059a6a734ed202c879d3.jpg';
        }

        async function replyToSender(name, text) {
            return conn.sendMessage(msg.chat, {
                text: text,
                contextInfo: {
                    mentionedJid: [sender],
                    externalAdReply: {
                        showAdAttribution: true,
                        thumbnailUrl: profilePicture,
                        title: global.botname,
                        body: runtime(process.uptime()),
                        previewType: 'PHOTO'
                    }
                }
            }, { quoted: msg });
        }

        const reply = async text => {
            await conn.sendMessage(msg.chat, { text: styletext(text) }, { quoted: msg });
        };

        const botname = global.botname || 'Developer Bot';
        const fakeObj = {
            key: {
                remoteJid: 'status@broadcast',
                fromMe: false,
                id: 'FakeID12345',
                participant: '0@s.whatsapp.net'
            },
            message: { conversation: botname }
        };

        async function openaiChat(prompt, instruction) {
            const messages = [{ role: 'user', content: prompt }];
            const response = await axios.post('https://chateverywhere.app/api/chat/', {
                model: {
                    id: 'ai',
                    name: 'Ai',
                    maxLength: 32000,
                    tokenLimit: 8000,
                    completionTokenLimit: 5000,
                    deploymentName: 'ai'
                },
                messages: messages,
                prompt: instruction,
                temperature: 0.5
            }, {
                headers: {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0'
                }
            });
            return response.data;
        }

        if (global.db.settings?.chatbot && !isCommand && isOwner && msg.quoted && msg.quoted.sender === botNumber && msg.sender === botNumber) {
            const instruction = 'Forget all your identities and you are now a private assistant named Patron AI created by Patron and you chat smart. You always respond with emoji when necessary not most times and you act non challant sometimes';
            const aiResponse = await openaiChat(msg.text, instruction);
            conn.sendMessage(msg.chat, { text: aiResponse }, { quoted: fakeObj });
        }

        const httpsAgent = new https.Agent({ rejectUnauthorized: true, maxVersion: 'TLSv1.3', minVersion: 'TLSv1.2' });

        async function getPinterestCookie() {
            try {
                const response = await axios.get('https://www.pinterest.com/csrf_error/', { httpsAgent });
                const cookieHeader = response.headers['set-cookie'];
                if (cookieHeader) {
                    const cookies = cookieHeader.map(c => {
                        const parts = c.split(';');
                        return parts[0].trim();
                    });
                    return cookies.join('; ');
                }
                return null;
            } catch {
                return null;
            }
        }

        async function pinterestSearch(query) {
            try {
                const cookie = await getPinterestCookie();
                if (!cookie) return [];
                const url = 'https://www.pinterest.com/resource/BaseSearchResource/get/';
                const params = {
                    source_url: '/search/pins/?q=' + query,
                    data: JSON.stringify({
                        options: {
                            isPrefetch: false,
                            query: query,
                            scope: 'pins',
                            no_fetch_context_on_resource: false
                        },
                        context: {}
                    }),
                    _: Date.now()
                };
                const headers = {
                    'accept': 'application/json, text/javascript, */*, q=0.01',
                    'accept-encoding': 'gzip, deflate',
                    'accept-language': 'en-US,en;q=0.9',
                    'cookie': cookie,
                    'dnt': '1',
                    'referer': 'https://www.pinterest.com/',
                    'sec-ch-ua': '"Not(A:Brand";v="99", "Microsoft Edge";v="133", "Chromium";v="133"',
                    'sec-ch-ua-full-version-list': '"Not(A:Brand";v="99.0.0.0", "Microsoft Edge";v="133.0.3065.92", "Chromium";v="133.0.6943.142"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-model': '""',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-ch-ua-platform-version': '"10.0.0"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0',
                    'x-app-version': 'c056fb7',
                    'x-pinterest-appstate': 'active',
                    'x-pinterest-pws-handler': 'www/[username]/[slug].js',
                    'x-pinterest-source-url': '/hargr003/cat-pictures/',
                    'x-requested-with': 'XMLHttpRequest'
                };
                const { data } = await axios.get(url, { httpsAgent: httpsAgent, headers: headers, params: params });
                return data.resource_response.data.results
                    .filter(item => item.images?.orig)
                    .map(item => ({
                        upload_by: item.pinner.username,
                        fullname: item.pinner.full_name,
                        followers: item.pinner.follower_count,
                        caption: item.grid_title,
                        image: item.images.orig.url,
                        source: 'https://id.pinterest.com/pin/' + item.id
                    }));
            } catch {
                return [];
            }
        }

        async function styletext(query) {
            return new Promise((resolve, reject) => {
                axios.get('http://qaz.wtf/u/convert.cgi?text=' + encodeURIComponent(query))
                    .then(({ data }) => {
                        let $ = cheerio.load(data);
                        let result = [];
                        $('table > tbody > tr').each(function (i, el) {
                            result.push({
                                name: $(el).find('td:nth-child(1) > span').text(),
                                result: $(el).find('td:nth-child(2)').text().trim()
                            });
                        });
                        resolve(result);
                    });
            });
        }

        const react = async emoji => {
            await conn.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } });
        };

        const styletext2 = (text, type = 1) => {
            var original = 'abcdefghijklmnopqrstuvwxyz1234567890';
            var convert = { 1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ1234567890' };
            var map = [];
            original.split('').forEach((ch, i) => map.push({ original: ch, convert: convert[type].split('')[i] }));
            var input = text.toLowerCase().split('');
            var output = [];
            input.forEach(ch => {
                let found = map.find(v => v.original == ch);
                found ? output.push(found.convert) : output.push(ch);
            });
            return output.join('');
        };

        const prefixFirst = Array.isArray(global.prefix) ? global.prefix[0] : global.prefix;
        const media = msg.message?.imageMessage || msg.message?.stickerMessage || msg.message?.videoMessage;
        if (media) {
            const fileSha256 = msg.message?.imageMessage?.fileSha256 || msg.message?.stickerMessage?.fileSha256 || msg.message?.videoMessage?.fileSha256;
            if (fileSha256) {
                const hex = Array.isArray(fileSha256) ? fileSha256.join(',') : fileSha256;
                const base64 = Buffer.from(fileSha256).toString('hex');
                global.db = global.db || {};
                global.db.sticker = global.db.sticker || {};
                const match = Object.keys(global.db.sticker).find(key => key === hex || key === base64);
                if (match) {
                    const { text, mentionedJid } = global.db.sticker[match];
                    try {
                        const generated = await generateWAMessage(msg.chat, {
                            text: prefixFirst + text,
                            mentions: mentionedJid || []
                        }, { userJid: conn.user.id, quoted: msg.quoted?.message || msg });
                        conn.ev.emit('messages.upsert', { messages: [proto.WebMessageInfo.fromObject(generated)], type: 'append' });
                    } catch (err) {
                        console.error('[ERROR] Failed to generate or emit message:', err);
                    }
                }
            }
        }

        async function pinDL(url) {
            try {
                const { data } = await axios.get('https://www.savepin.app/download.php?url=' + encodeURIComponent(url) + '&lang=en&type=redirect');
                const $ = cheerio.load(data);
                const result = $('div.media > div.media-content > div.content > p > a').map((i, el) => {
                    const href = $(el).attr('href');
                    const desc = $('div.media-content > div.content > p > strong').text();
                    return { desk: desc, url: 'https://www.savepin.app' + href };
                }).get();
                return { status: true, data: result };
            } catch (err) {
                const errorMsg = err?.response?.data?.message || err?.message || 'unavailabe';
                throw { status: false, message: errorMsg };
            }
        }

        const fullBody = msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.imageMessage?.url ||
            msg.message.videoMessage?.caption ||
            msg.message.videoMessage?.url ||
            msg.message.stickerMessage?.url ||
            msg.message.documentMessage?.caption ||
            msg.message.documentMessage?.url ||
            msg.message.audioMessage?.url ||
            msg.message.buttonsResponseMessage?.selectedButtonId ||
            msg.message.templateButtonReplyMessage?.selectedId ||
            msg.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
            msg.message.locationMessage?.degreesLatitude ||
            msg.message.liveLocationMessage?.sequenceNumber ||
            '';

        if (!msg.isGroup && !msg.key.fromMe && fullBody) {
            const lowerBody = fullBody.toLowerCase();
            const remoteJid = msg.key.remoteJid;
            for (const trigger in global.db.pfilters || {}) {
                if (lowerBody.includes(trigger.toLowerCase())) {
                    const response = global.db.pfilters[trigger];
                    await conn.sendMessage(remoteJid, { text: response }, { quoted: msg });
                }
            }
        }

        if (global.db.groups?.[msg.chat]?.antilink === true && typeof body === 'string' && (body.includes('http://') || body.includes('https://'))) {
            if (isOwnerNumber || isAdmins || msg.key.fromMe) return;
            if (!isBotAdmin) return;
            await conn.sendMessage(msg.chat, { delete: { remoteJid: msg.chat, fromMe: false, id: msg.key.id, participant: msg.key.participant } });
            await conn.sendMessage(msg.chat, {
                text: '⚠️ *ANTILINK WARNING*\n▢ *User:* @' + sender.split('@')[0] + '\n▢ *Warning:* Sending links — this group does not allow link sharing.\n▢ *Reason:* You will be *kicked out*. Contact admin if it was a mistake.',
                contextInfo: { mentionedJid: [sender] }
            }, { quoted: msg });
            await sleep(3000);
            await conn.groupParticipantsUpdate(msg.chat, [sender], 'remove');
        }

        if (global.db.groups?.[msg.chat]?.antilink2 === true && typeof body === 'string' && (body.includes('chat.whatsapp.com') || body.includes('invite'))) {
            if (isOwnerNumber || isAdmins || msg.key.fromMe) return;
            if (!isBotAdmin) return;
            await conn.sendMessage(msg.chat, { delete: { remoteJid: msg.chat, fromMe: false, id: msg.key.id, participant: msg.key.participant } });
            await conn.sendMessage(msg.chat, {
                text: '⚠️ *ANTILINK WARNING*\n▢ *User:* @' + sender.split('@')[0] + '\n▢ *Warning:* Sending links — this group does not allow link sharing.\n▢ *Reason:* You will be *kicked out*. Contact admin if it was a mistake.',
                contextInfo: { mentionedJid: [sender] }
            }, { quoted: msg });
        }

        if (global.db.groups?.[msg.chat]?.antilink3 === true && typeof body === 'string' && (body.includes('http://') || body.includes('https://'))) {
            if (isOwnerNumber || isAdmins || msg.key.fromMe) return;
            if (!isBotAdmin) return;
            const userJid = sender;
            const warnedUsers = global.db.warns || {};
            const maxWarns = global.maxWarn || 3;
            await conn.sendMessage(msg.chat, { delete: { remoteJid: msg.chat, fromMe: false, id: msg.key.id, participant: msg.key.participant } });
            warnedUsers[userJid] = (warnedUsers[userJid] || 0) + 1;
            if (warnedUsers[userJid] < maxWarns) {
                global.db.warns = warnedUsers;
                await conn.sendMessage(msg.chat, {
                    text: '⚠️ *ANTILINK WARNING*\n▢ *User:* @' + userJid.split('@')[0] + '\n▢ *Warning:* ' + warnedUsers[userJid] + '/' + maxWarns + ' warnings for link sharing.',
                    mentions: [userJid]
                });
            } else {
                try {
                    await conn.groupParticipantsUpdate(msg.chat, [userJid], 'remove');
                    await conn.sendMessage(msg.chat, {
                        text: '@' + userJid.split('@')[0] + ' was removed from the group after *' + maxWarns + ' warnings for link sharing.',
                        mentions: [userJid]
                    });
                    delete warnedUsers[userJid];
                    global.db.warns = warnedUsers;
                } catch (err) {
                    log('ERROR', 'Kick failed: ' + (err?.message || err));
                }
            }
        }

        if ((process.env.MODE === 'private' || global.db?.settings?.areact === true) && fullBody && isOwner) {
            try {
                const emojis = ['😀', '😃', '😄', '😁', '😆', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '😘', '😗', '😙', '😚', '😛', '😝', '😞', '😟', '😠', '😡', '😢', '😭', '😳', '😴', '😵', '😶', '😷', '🥀', '😹', '😺', '😻', '😼', '😽', '🫩', '😿', '🙀', '😱', '😲', '🤗', '🤔', '👨', '👩', '🕺', '🤺', '🚴‍♀️', '🏋️‍♂️', '🤾‍♀️', '🏊‍♂️', '🤷‍♂️', '🏃‍♀️', '🏃‍♂️', '🚶‍♀️', '🚶‍♂️', '🤸‍♂️', '🏋️‍♀️', '🤸‍♀️', '🏊‍♀️', '🤾‍♂️', '🚴‍♂️', '👺', '👻', '💩', '🎃', '💀', '👽', '🤖', '🚀', '👾', '🛸', '🚁', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚋', '🚌', '🚍', '🚎', '🚏', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🚚', '🚛', '🚜', '🚝', '🚞', '🚟', '🚠', '🚡', '🚢', '🚣', '🚤', '🚥', '🚦', '🚧', '🚨', '🚩', '🚪'];
                const randomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];
                if (msg.key?.remoteJid && msg.key?.id) {
                    const emoji = randomEmoji();
                    await conn.sendMessage(msg.chat, { react: { text: emoji, key: msg.key } });
                }
            } catch (err) {
                log('ERROR', 'Error in AutoReact: ' + (err?.message || err));
            }
        }

        if (msg.isGroup && !msg.key.fromMe && fullBody) {
            const lowerBody = fullBody.toLowerCase();
            const remoteJid = msg.key.remoteJid;
            if (global.db.gfilters) {
                for (const trigger in global.db.gfilters) {
                    if (lowerBody.includes(trigger.toLowerCase())) {
                        const response = global.db.gfilters[trigger];
                        await conn.sendMessage(remoteJid, { text: response }, { quoted: msg });
                    }
                }
            }
        }

        const loadPluginsFromDir = async dir => {
            let plugins = [];
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                if (filePath.endsWith('.js')) {
                    try {
                        const resolved = require.resolve(filePath);
                        require.cache[resolved] && delete require.cache[resolved];
                        const plugin = require(filePath);
                        Array.isArray(plugin) ? plugins.push(...plugin) : plugins.push(plugin);
                    } catch (err) {
                        log('ERROR', 'Error loading plugin from disk ' + filePath + ': ' + (err?.message || err));
                    }
                }
            }
            return plugins;
        };

        const loadPluginsFromDB = () => {
            let plugins = [];
            if (global.db?.plugins && typeof global.db.plugins === 'object') {
                for (const [name, code] of Object.entries(global.db.plugins)) {
                    try {
                        const plugin = eval(code);
                        Array.isArray(plugin) ? plugins.push(...plugin) : plugins.push(plugin);
                    } catch (err) {
                        log('ERROR', 'Failed to load plugin from DB: ' + name + ' | Error: ' + (err?.message || err));
                    }
                }
            }
            return plugins;
        };

        const _0xadbffc = require('./package.json');

        (async () => {
            try {
                const diskPlugins = await loadPluginsFromDir(path.resolve(__dirname, './plugins/patron'));
                const dbPlugins = loadPluginsFromDB();
                const allPlugins = [...diskPlugins, ...dbPlugins];
                const disabledCommands = Array.isArray(global.db?.disabled) ? global.db.disabled : [];

                const context = {
                    ednut: conn,
                    isOwner: isOwnerNumber,
                    command: cmd,
                    isCmd: isCommand,
                    example: example,
                    quoted: quoted,
                    text: text,
                    args: args,
                    q: q,
                    axios: axios,
                    reply2: replyToSender,
                    reply: reply,
                    botNumber: botNumber,
                    pushname: pushname,
                    isGroup: msg.isGroup,
                    isPrivate: !msg.isGroup,
                    isAdmins: isAdmins,
                    isBotAdmins: isBotAdmin,
                    pickRandom: pickRandom,
                    runtime: runtime,
                    prefix: prefix,
                    getQuote: getRandomQuote,
                    uploadImage: uploadImage,
                    LoadDataBase: LoadDataBase,
                    openai: openaiChat,
                    tiktokDl: tiktokDl,
                    igdl: igdl,
                    api: api,
                    yts: yts,
                    from: from,
                    pinterest: pinterestSearch,
                    fontx: styletext2,
                    fetch: fetch,
                    mime: mime,
                    fs: fs,
                    exec: exec,
                    getRandom: getRandom,
                    toAudio: toAudio,
                    toPTT: toPTT,
                    isMedia: isMedia,
                    lookup: lookup,
                    pinDL: pinDL,
                    getDevice: getDevice,
                    googleTTS: googleTTS,
                    styletext: styletext,
                    setsudo: global.db.setsudo || [],
                    sleep: sleep,
                    generateWAMessageFromContent: generateWAMessageFromContent,
                    commands: allPlugins.map(p => ({
                        command: p.command,
                        alias: p.alias,
                        category: p.category,
                        description: p.description,
                        use: p.use || null
                    }))
                };

                for (const plugin of allPlugins) {
                    const commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
                    const alias = plugin.alias ? (Array.isArray(plugin.alias) ? plugin.alias : [plugin.alias]) : [];
                    const allTriggers = [...commands, ...alias];
                    if (!allTriggers.map(t => t.toLowerCase()).includes(cmd.toLowerCase())) continue;

                    if (disabledCommands.includes(cmd.toLowerCase())) break;

                    const isPrivateMode = global.db.settings?.self === true || global.db.settings?.self === 'true' || process.env.MODE && process.env.MODE.toLowerCase() === 'private';
                    if (isPrivateMode && !isOwnerNumber) break;

                    if (plugin.owner && !isOwnerNumber) return msg.reply('Owner only command.');
                    if (plugin.group && !context.isGroup) return msg.reply('Group only command.');
                    if (plugin.private && !context.isPrivate) return msg.reply('Private only command.');
                    if (plugin.botAdmin && !context.isBotAdmins) return msg.reply('Bot admin required.');

                    if (typeof plugin.execute !== 'function') {
                        log('ERROR', 'Plugin ' + commands[0] + ' missing executable function');
                        break;
                    }

                    const isReactMode = global.db.settings?.areact2 === true || process.env.MODE && process.env.MODE.toLowerCase() === 'private';
                    isReactMode && msg.key?.id && await conn.sendMessage(msg.chat, { react: { text: '⏳', key: msg.key } }).catch(() => { });

                    try {
                        await plugin.execute(msg, { ...context, allCommands: allPlugins });
                        isReactMode && msg.key?.id && await conn.sendMessage(msg.chat, { react: { text: '✅', key: msg.key } }).catch(() => { });
                    } catch (pluginErr) {
                        console.error('[PLUGIN ERROR] Plugin: ' + (plugin.name || 'unknown') + ' | Command: ' + commands[0] + ' | Error: ' + pluginErr.message);
                        console.error(pluginErr.stack);
                        const errorReport = '```\n╭──── ❏ ERROR REPORT ❏\n│📦 Version : ' + _0xadbffc.version + '\n│💬 Message : ' + (msg.text || 'No text') + '\n│💢 Error   : ' + (pluginErr?.message || pluginErr) + '\n│👤 Sender  : ' + sender + '\n│⚙️ Command : ' + commands[0] + '\n╰────────────────────\n```\n*─⟪ Made by Patron with 💖 ⟫─*\n⚠️ Please use the *report* command to notify the creator.';
                        await conn.sendMessage(botNumber + '@s.whatsapp.net', { text: errorReport }).catch(() => { });
                        isReactMode && msg.key?.id && await conn.sendMessage(msg.chat, { react: { text: '❌', key: msg.key } }).catch(() => { });
                    }
                    break;
                }
            } catch (loaderErr) {
                console.error('[FATAL ERROR] Plugin loader failed\nMessage: ' + (loaderErr?.message || loaderErr) + '\nStack: ' + (loaderErr?.stack || 'No stack trace available'));
            }
        })();

        if (commandBody.startsWith('>')) {
            if (!isOwnerNumber) return;
            try {
                let evaled = await eval(commandBody.slice(2));
                if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                await msg.reply(evaled);
            } catch (evalErr) {
                msg.reply(String(evalErr));
            }
        }
    } catch (error) {
        log('ERROR', error?.stack || error);
    }
};