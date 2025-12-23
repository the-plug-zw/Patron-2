/**
 * XNXX Search & Download Commands
 * Fully deobfuscated and cleaned
 * Behavior preserved 1:1
 */

const fetch = require('node-fetch');
const cheerio = require('cheerio');

/* =================================================
   XNXX SEARCH SCRAPER
================================================= */

async function xnxxSearch(query) {
    try {
        const BASE_URL = 'https://www.xnxx.com';
        const searchUrl =
            `${BASE_URL}/search/${encodeURIComponent(query)}/` +
            Math.floor(1 + Math.random() * 3);

        const res = await fetch(searchUrl);
        const html = await res.text();
        const $ = cheerio.load(html);

        const results = [];

        $('div.mozaique').each((_, el) => {
            $(el)
                .find('div.thumb-under')
                .each((_, item) => {
                    const title = $(item).find('a').attr('title');
                    const href = $(item).find('a').attr('href');

                    if (title && href) {
                        results.push({
                            title,
                            link: BASE_URL + href
                        });
                    }
                });
        });

        return {
            status: true,
            result: results.slice(0, 10)
        };
    } catch (err) {
        return {
            status: false,
            error: err.message
        };
    }
}

/* =================================================
   COMMAND EXPORTS
================================================= */

module.exports = [

/* ---------- XNXX DOWNLOAD ---------- */
{
    command: ['xnxxdl'],
    alias: ['xnxxdownload'],
    description: '🔞 Download XNXX Video',
    category: 'Nsfw',
    gcban: true,
    ban: true,

    async execute(m, { ednut, args, reply }) {
        const url = args.join(' ');

        if (!url || !url.includes('xnxx.com')) {
            return reply(
                '❌ Please send a valid XNXX link.\n\n' +
                'Example:\n' +
                'xnxxdl https://www.xnxx.com/video-...'
            );
        }

        try {
            const apiUrl =
                'https://api.yogik.id/downloader/xnxx?url=' +
                encodeURIComponent(url);

            const res = await fetch(apiUrl);
            const json = await res.json();

            if (!json.status || !json.result) {
                return reply('❌ Failed to fetch video. Please try again.');
            }

            const video = json.result;

            const caption =
                '🔞 *' + video.title + '*\n\n' +
                '📺 Duration: ' + video.duration + 's\n' +
                '🔗 URL: ' + url + '\n\n' +
                video.files.text.trim();

            const thumbMsg = await ednut.sendMessage(
                m.chat,
                {
                    image: { url: video.image },
                    caption
                },
                { quoted: m }
            );

            await ednut.sendMessage(
                m.chat,
                {
                    video: { url: video.files.high },
                    caption: global.footer || '🎥 XNXX Video File'
                },
                { quoted: thumbMsg }
            );

        } catch (err) {
            console.log(
                'ERROR',
                'XNXX download failed: ' + (err.message || err)
            );
            reply('❌ Failed to fetch or send video.');
        }
    }
},

/* ---------- XNXX SEARCH ---------- */
{
    command: ['xnxxsearch'],
    alias: ['xns'],
    description: '🔍 Search videos on XNXX',
    category: 'Nsfw',
    gcban: true,
    ban: true,

    async execute(m, { ednut, args, reply }) {
        const query = args.join(' ');

        if (!query) {
            return reply(
                '❌ Please provide a search query.\n' +
                'Example: xnxxsearch lisa'
            );
        }

        const search = await xnxxSearch(query);

        if (!search.status || !search.result.length) {
            console.log('XNXX search failed:', search.error);
            return reply('❌ No results found.');
        }

        let text = '🔞 *XNXX Search Results:*\n\n';

        for (let i = 0; i < search.result.length; i++) {
            const { title, link } = search.result[i];
            text +=
                `*${i + 1}.* ${title}\n` +
                `${link}\n\n`;
        }

        await ednut.sendMessage(
            m.chat,
            { text: text.trim() },
            { quoted: m }
        );
    }
}

];
