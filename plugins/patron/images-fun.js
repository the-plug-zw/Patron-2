const axios = require('axios');

module.exports = [
    {
        command: ['lolicon'],
        alias: ['imgloli'],
        description: 'Download anime lolicon images.',
        category: 'Fun',
        filename: __filename,
        
        async execute(m, { ednut, from, reply }) {
            try {
                let response = await axios.get('https://api.lolicon.app/setu/v2?num=1&r18=0&tag=lolicon');
                let caption = '🚹 Random Waifu image\n\n> *©ᴘᴏᴡᴇʀᴇᴅ ʙʏ Pᴀᴛʀᴏɴ TᴇᴄʜＸ 🚹*';
                await ednut.sendMessage(from, {
                    image: { url: response.data.data[0].urls.original },
                    caption: caption
                }, { quoted: m });
            } catch (error) {
                reply('I can\'t find this anime.');
                console.error(error);
            }
        }
    },
    {
        command: ['waifu2'],
        alias: ['imgwaifu2'],
        description: 'Download anime waifu images (NSFW).',
        category: 'Fun',
        filename: __filename,
        
        async execute(m, { ednut, from, reply }) {
            try {
                let response = await axios.get('https://api.waifu.pics/nsfw/waifu');
                let caption = 'RANDOM WAIFU IMAGE 👾\n\n\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ Pᴀᴛʀᴏɴ TᴇᴄʜＸ 🚹*';
                await ednut.sendMessage(from, {
                    image: { url: response.data.url },
                    caption: caption
                }, { quoted: m });
            } catch (error) {
                reply('I can\'t find this anime.');
                console.error(error);
            }
        }
    },
    {
        command: ['neko'],
        alias: ['imgneko'],
        description: 'Download anime neko images.',
        category: 'Fun',
        filename: __filename,
        
        async execute(m, { ednut, from, reply }) {
            try {
                let response = await axios.get('https://api.waifu.pics/nsfw/neko');
                let caption = '🚹 Random neko image\n\n> *©ᴘᴏᴡᴇʀᴇᴅ ʙʏ Pᴀᴛʀᴏɴ TᴇᴄʜＸ 🚹*';
                await ednut.sendMessage(from, {
                    image: { url: response.data.url },
                    caption: caption
                }, { quoted: m });
            } catch (error) {
                reply('I can\'t find this anime.');
                console.error(error);
            }
        }
    },
    {
        command: ['megumin'],
        alias: ['imgmegumin'],
        description: 'Download anime megumin images.',
        category: 'Fun',
        filename: __filename,
        
        async execute(m, { ednut, from, reply }) {
            try {
                let response = await axios.get('https://api.waifu.pics/sfw/megumin');
                let caption = '❤️‍🔥 Random megumin image\n\n> *©ᴘᴏᴡᴇʀᴇᴅ ʙʏ Pᴀᴛʀᴏɴ TᴇᴄʜＸ 🚹*';
                await ednut.sendMessage(from, {
                    image: { url: response.data.url },
                    caption: caption
                }, { quoted: m });
            } catch (error) {
                reply('I can\'t find this anime.');
                console.error(error);
            }
        }
    },
    {
        command: ['maid'],
        alias: ['imgmaid'],
        description: 'Download anime maid images.',
        category: 'Fun',
        filename: __filename,
        
        async execute(m, { ednut, from, reply }) {
            try {
                let response = await axios.get('https://api.waifu.im/search/?included_tags=maid');
                let caption = '😎 Random maid image\n\n> *©ᴘᴏᴡᴇʀᴇᴅ ʙʏ Pᴀᴛʀᴏɴ TᴇᴄʜＸ 🚹*';
                await ednut.sendMessage(from, {
                    image: { url: response.data.images[0].url },
                    caption: caption
                }, { quoted: m });
            } catch (error) {
                reply('I can\'t find this anime.');
                console.error(error);
            }
        }
    },
    {
        command: ['awoo'],
        alias: ['imgawoo'],
        description: 'Download anime awoo images.',
        category: 'Fun',
        filename: __filename,
        
        async execute(m, { ednut, from, reply }) {
            try {
                let response = await axios.get('https://api.waifu.pics/sfw/awoo');
                let caption = '😎 Random awoo image\n\n> *©ᴘᴏᴡᴇʀᴇᴅ ʙʏ Pᴀᴛʀᴏɴ TᴇᴄʜＸ 🚹*';
                await ednut.sendMessage(from, {
                    image: { url: response.data.url },
                    caption: caption
                }, { quoted: m });
            } catch (error) {
                reply('I can\'t find this anime.');
                console.error(error);
            }
        }
    },
    {
        command: ['animegirl'],
        alias: ['imganimegirl'],
        description: 'Fetch a random anime girl image.',
        category: 'Fun',
        filename: __filename,
        
        async execute(m, { ednut, from, reply }) {
            try {
                let response = await axios.get('https://api.waifu.pics/sfw/waifu');
                let caption = '*ANIME GIRL IMAGE* 🥳\n\n\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ Pᴀᴛʀᴏɴ TᴇᴄʜＸ 🚹*';
                await ednut.sendMessage(from, {
                    image: { url: response.data.url },
                    caption: caption
                }, { quoted: m });
            } catch (error) {
                reply('*Error Fetching Anime Girl image*: ' + error.message);
            }
        }
    },
    {
        command: ['garl'],
        alias: ['imggarl'],
        description: 'Download anime garl images.',
        category: 'Fun',
        filename: __filename,
        
        async execute(m, { ednut, from, reply }) {
            try {
                let response = await axios.get('https://api.waifu.pics/sfw/garl');
                let caption = '😎 Random Garl image\n\n> *©ᴘᴏᴡᴇʀᴇᴅ ʙʏ Pᴀᴛʀᴏɴ TᴇᴄʜＸ 🚹*';
                await ednut.sendMessage(from, {
                    image: { url: response.data.url },
                    caption: caption
                }, { quoted: m });
            } catch (error) {
                reply('*Error Fetching Anime Girl image*: ' + error.message);
            }
        }
    }
];