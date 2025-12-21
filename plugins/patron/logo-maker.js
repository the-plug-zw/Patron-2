/**
 * EPHOTO360 / LOGO COMMANDS
 * Fully deobfuscated & cleaned
 * Logic preserved 1:1
 */

const axios = require('axios');

const API_WRAPPER = 'https://api-pink-venom.vercel.app/api/logo?url=';

/* =================================================
   Helper
================================================= */

async function generateLogo(ednut, chat, effectUrl, text) {
    const { data } = await axios.get(
        API_WRAPPER +
        encodeURIComponent(effectUrl) +
        '&name=' +
        encodeURIComponent(text)
    );

    return ednut.sendMessage(chat, {
        image: { url: data.result.download_url }
    });
}

async function generateText(ednut, chat, effectUrl, text) {
    const { data } = await axios.get(
        API_WRAPPER +
        encodeURIComponent(effectUrl) +
        '&text=' +
        encodeURIComponent(text)
    );

    return ednut.sendMessage(chat, {
        image: { url: data.result.download_url }
    });
}

/* =================================================
   COMMANDS
================================================= */

module.exports = [

/* ---------- DRAGON BALL ---------- */
{
    command: ['dragonball'],
    description: 'Create a Dragon Ball-style text effect',
    category: 'Ai',
    filename: __filename,

    async execute(m, { ednut, q, reply, from }) {
        if (!q) return reply('❌ Please provide text. Example: .dragonball Patron');
        try {
            await generateLogo(
                ednut,
                from,
                'https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html',
                q
            );
        } catch {
            reply('⚠️ Failed to generate logo.');
        }
    }
},

/* ---------- DEADPOOL ---------- */
{
    command: ['deadpool'],
    description: 'Create a Deadpool-style text effect',
    category: 'Ai',
    filename: __filename,

    async execute(m, { ednut, q, reply, from }) {
        if (!q) return reply('❌ Please provide text. Example: .deadpool Patron');
        try {
            await generateLogo(
                ednut,
                from,
                'https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html',
                q
            );
        } catch {
            reply('⚠️ Failed to generate logo.');
        }
    }
},

/* ---------- NARUTO ---------- */
{
    command: ['naruto'],
    description: 'Create a Naruto-style logo',
    category: 'Ai',
    filename: __filename,

    async execute(m, { ednut, q, reply, from }) {
        if (!q) return reply('❌ Please provide text. Example: .naruto Patron');
        try {
            await generateLogo(
                ednut,
                from,
                'https://en.ephoto360.com/create-naruto-logo-style-text-effects-online-808.html',
                q
            );
        } catch {
            reply('⚠️ Failed to generate logo.');
        }
    }
},

/* ---------- PORNHUB ---------- */
{
    command: ['pornhub'],
    description: 'Create a Pornhub-style logo',
    category: 'Ai',
    filename: __filename,

    async execute(m, { ednut, q, reply, from }) {
        if (!q.includes('|')) {
            return reply('❌ Provide text in format: text1|text2');
        }

        const [text1, text2] = q.split('|');

        try {
            const { data } = await axios.get(
                API_WRAPPER +
                encodeURIComponent('https://en.ephoto360.com/pornhub-style-logo-maker-online-free-502.html') +
                '&text1=' + encodeURIComponent(text1) +
                '&text2=' + encodeURIComponent(text2)
            );

            await ednut.sendMessage(from, {
                image: { url: data.result.download_url }
            });
        } catch {
            reply('⚠️ Failed to generate logo.');
        }
    }
},

/* ---------- FUTURISTIC ---------- */
{
    command: ['futuristic'],
    description: 'Create a futuristic text effect',
    category: 'Ai',
    filename: __filename,

    async execute(m, { ednut, q, reply, from }) {
        if (!q) return reply('❌ Please provide text. Example: .futuristic Patron');
        try {
            await generateLogo(
                ednut,
                from,
                'https://en.ephoto360.com/create-a-futuristic-technology-neon-light-text-effect-418.html',
                q
            );
        } catch {
            reply('⚠️ Failed to generate logo.');
        }
    }
},

/* ---------- CLOUDS ---------- */
{
    command: ['clouds'],
    description: 'Create a Cloud text effect',
    category: 'Ai',
    filename: __filename,

    async execute(m, { ednut, q, reply, from }) {
        if (!q) return reply('❌ Please provide text. Example: .clouds Patron');
        try {
            await generateLogo(
                ednut,
                from,
                'https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html',
                q
            );
        } catch {
            reply('⚠️ Failed to generate logo.');
        }
    }
},

/* ---------- ZODIAC ---------- */
{
    command: ['zodiac'],
    description: 'Create Zodiac text effect',
    category: 'Ai',
    filename: __filename,

    async execute(m, { ednut, q, reply, from }) {
        if (!q) return reply('❌ Please provide text. Example: .zodiac Patron');
        try {
            await generateLogo(
                ednut,
                from,
                'https://en.ephoto360.com/create-zodiac-sign-text-effect-online-619.html',
                q
            );
        } catch {
            reply('⚠️ Failed to generate logo.');
        }
    }
},

/* ---------- SAND ---------- */
{
    command: ['sand'],
    description: 'Create Sand text effect',
    category: 'Ai',
    filename: __filename,

    async execute(m, { ednut, q, reply, from }) {
        if (!q) return reply('❌ Please provide text. Example: .sand Patron');
        try {
            await generateLogo(
                ednut,
                from,
                'https://en.ephoto360.com/write-in-sand-summer-beach-online-free-412.html',
                q
            );
        } catch {
            reply('⚠️ Failed to generate logo.');
        }
    }
},

/* ---------- BIRTHDAY ---------- */
{
    command: ['birthday'],
    description: 'Create Birthday text effect',
    category: 'Ai',
    filename: __filename,

    async execute(m, { ednut, q, reply, from }) {
        if (!q) return reply('❌ Please provide a name. Example: .birthday Patron');
        try {
            await generateLogo(
                ednut,
                from,
                'https://en.ephoto360.com/beautiful-3d-foil-balloon-effects-for-holidays-and-birthday-803.html',
                q
            );
        } catch {
            reply('⚠️ Failed to generate Birthday logo.');
        }
    }
}

];
