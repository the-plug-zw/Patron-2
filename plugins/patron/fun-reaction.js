// fun-reaction.js
// Cleaned and deobfuscated version

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

ffmpeg.setFfmpegPath(ffmpegPath);

const TMP_DIR = path.resolve(__dirname, '../../tmp/store');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

const NEX_APIKEY = 'd0634e61e8789b051e';

async function fetchGifBufferFromUrl(url) {
    const response = await axios.get(url, { 'responseType': 'arraybuffer', 'timeout': 20000 });
    return Buffer.from(response.data);
}

async function fetchGifFromApiEndpoint(endpoint) {
    try {
        const response = await axios.get(endpoint, { 'responseType': 'json', 'timeout': 10000 });
        if (response && response.data && response.data.url) {
            return await fetchGifBufferFromUrl(response.data.url);
        }
    } catch { }

    try {
        const response = await axios.get(endpoint, { 'responseType': 'arraybuffer', 'timeout': 20000 });
        return Buffer.from(response.data);
    } catch (error) {
        throw new Error('Failed to fetch GIF from API endpoint: ' + (error.message || error));
    }
}

async function gifToVideoBuffer(gifBuffer) {
    const randomId = Crypto.randomBytes(6).toString('hex');
    const gifPath = path.join(TMP_DIR, randomId + '.gif');
    const videoPath = path.join(TMP_DIR, randomId + '.mp4');

    try {
        fs.writeFileSync(gifPath, gifBuffer);

        await new Promise((resolve, reject) => {
            ffmpeg(gifPath)
                .outputOptions(['-pix_fmt yuv420p', '-movflags faststart', '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2'])
                .on('error', error => reject(error))
                .on('end', () => resolve())
                .save(videoPath);
        });

        const videoBuffer = fs.readFileSync(videoPath);
        return videoBuffer;
    } finally {
        try {
            if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
        } catch { }

        try {
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        } catch { }
    }
}

async function sendReaction(message, context, reactionType, pastTense, emoji = '') {
    const { ednut, reply } = context;

    // Safety check - if ednut is not available, skip sending
    if (!ednut || typeof ednut.sendMessage !== 'function') {
        return;
    }

    try {
        const apiUrl = 'https://api.nexoracle.com/reactions-pack/' + reactionType + '?apikey=' + NEX_APIKEY;
        const senderTag = '@' + message.sender.split('@')[0];
        const quotedSender = message.quoted ? message.quoted.sender : null;
        const quotedTag = quotedSender ? '@' + quotedSender.split('@')[0] : null;

        const caption = quotedTag
            ? (senderTag + ' ' + pastTense + ' ' + quotedTag + ' ' + emoji).trim()
            : (senderTag + ' is ' + pastTense.replace(/ed$|ing$/, '') + ' the air ' + emoji).trim();

        const gifBuffer = await fetchGifFromApiEndpoint(apiUrl);
        const videoBuffer = await gifToVideoBuffer(gifBuffer);

        await ednut.sendMessage(message.chat, {
            'video': videoBuffer,
            'caption': caption,
            'gifPlayback': true,
            'mentions': quotedTag ? [message.sender, quotedSender] : [message.sender]
        }, { 'quoted': message });
    } catch (error) {
        try {
            reply('❌ Failed to send reaction.');
        } catch { }

        if (typeof global.log === 'function') {
            global.log('ERROR', reactionType + ' error: ' + (error.message || error));
        } else {
            console.error(reactionType + ' error:', error);
        }
    }
}

module.exports = [
    {
        'command': ['bite'],
        'description': 'Bite someone',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'bite', 'bit', '🦈');
        }
    },
    {
        'command': ['bully'],
        'description': 'Bully someone',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'bully', 'bullied', '😈');
        }
    },
    {
        'command': ['blush'],
        'description': 'Blush reaction',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'blush', 'blushed', '😊');
        }
    },
    {
        'command': ['cringe'],
        'description': 'Cringe reaction',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'cringe', 'cringed', '😬');
        }
    },
    {
        'command': ['cry'],
        'description': 'Cry reaction',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'cry', 'cried', '😭');
        }
    },
    {
        'command': ['cuddle'],
        'description': 'Cuddle someone',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'cuddle', 'cuddled', '🤗');
        }
    },
    {
        'command': ['dance'],
        'description': 'Dance reaction',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'dance', 'danced', '💃');
        }
    },
    {
        'command': ['hug'],
        'description': 'Hug someone',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'hug', 'hugged', '🫂');
        }
    },
    {
        'command': ['happy'],
        'description': 'Happy reaction',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'happy', 'is happy with', '😄');
        }
    },
    {
        'command': ['highfive'],
        'description': 'Highfive someone',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'highfive', 'highfived', '✋');
        }
    },
    {
        'command': ['kill'],
        'description': 'Kill someone (reaction)',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'kill', 'killed', '💀');
        }
    },
    {
        'command': ['kiss'],
        'description': 'Kiss someone',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'kiss', 'kissed', '💋');
        }
    },
    {
        'command': ['lick'],
        'description': 'Lick someone',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'lick', 'licked', '👅');
        }
    },
    {
        'command': ['poke'],
        'description': 'Poke someone',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'poke', 'poked', '👉');
        }
    },
    {
        'command': ['pat'],
        'description': 'Pat someone',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'pat', 'patted', '🤝');
        }
    },
    {
        'command': ['smug'],
        'description': 'Smug reaction',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'smug', 'is smug at', '😏');
        }
    },
    {
        'command': ['slap'],
        'description': 'Slap someone',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'slap', 'slapped', '👋');
        }
    },
    {
        'command': ['smile'],
        'description': 'Smile reaction',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'smile', 'smiled at', '🙂');
        }
    },
    {
        'command': ['wink'],
        'description': 'Wink at someone',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'wink', 'winked at', '😉');
        }
    },
    {
        'command': ['wave'],
        'description': 'Wave at someone',
        'category': 'Fun',
        'ban': true,
        'gcban': true,
        async execute(message, context) {
            await sendReaction(message, context, 'wave', 'waved at', '👋');
        }
    }
];