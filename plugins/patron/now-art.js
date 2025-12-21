const crypto = require('crypto');
const axios = require('axios');
const { alias } = require('yargs');

async function nowchat(prompt) {
    const timestamp = Date.now().toString();
    const secretKey = 'dfaugf098ad0g98-idfaugf098ad0g98-iduoafiunoa-f09a8s098a09ea-a0s8g-asd8g0a9d--gasdga8d0g8a0dg80a9sd8g0a9d8gduoafiunoa-f09adfaugf098ad0g98-iduoafiunoa-f09a8s098a09ea-a0s8g-asd8g0a9d--gasdga8d0g8a0dg80a9sd8g0a9d8g8s098a09ea-a0s8g-asd8g0a9d--gasdga8d0g8a0dg80a9sd8g0a9d8g';
    const signature = crypto.createHmac('sha512', secretKey)
        .update(timestamp)
        .digest('base64');
    const requestData = JSON.stringify({ content: prompt });
    const requestConfig = {
        method: 'POST',
        url: 'http://aichat.nowtechai.com/now/v1/ai',
        headers: {
            'User-Agent': 'Ktor client',
            'Connection': 'Keep-Alive',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'Content-Type': 'application/json',
            'Key': signature,
            'TimeStamps': timestamp,
            'Accept-Charset': 'UTF-8'
        },
        data: requestData,
        responseType: 'stream'
    };

    return new Promise((resolve, reject) => {
        axios(requestConfig)
            .then(response => {
                let fullResponse = '';
                response.data.on('data', chunk => {
                    const lines = chunk.toString().split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                            try {
                                const parsed = JSON.parse(line.slice('data: '.length));
                                const content = parsed?.choices?.[0]?.delta?.content;
                                if (content) fullResponse += content;
                            } catch { }
                        }
                    }
                });
                response.data.on('end', () => resolve(fullResponse.trim()));
                response.data.on('error', reject);
            })
            .catch(reject);
    });
}

async function nowart(prompt) {
    const response = await axios.get(
        'http://art.nowtechai.com/art?name=' + encodeURIComponent(prompt),
        {
            headers: {
                'User-Agent': 'okhttp/5.0.0-alpha.9',
                'Connection': 'Keep-Alive',
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip',
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
}

module.exports = [
    {
        command: ['nowchat'],
        alias: ['nowai', 'asknow'],
        description: 'Ask NowTech AI a question',
        category: 'Ai',
        filename: __filename,
        ban: true,
        gcban: true,
        execute: async (message, { ednut, args, reply }) => {
            const prompt = args.join(' ').trim();
            if (!prompt) return reply('❌ What do you want to ask?');

            try {
                const response = await nowchat(prompt);
                reply(response);
            } catch (error) {
                reply('❌ An error occurred: ' + error.message);
            }
        }
    },
    {
        command: ['nowimg'],
        alias: ['nowart', 'nowartimg'],
        description: 'Generate AI image using NowTech Art',
        category: 'Ai',
        filename: __filename,
        ban: true,
        gcban: true,
        execute: async (message, { ednut, args, reply }) => {
            const prompt = args.join(' ').trim();
            if (!prompt) return reply('❌ Please provide a prompt.');

            try {
                const result = await nowart(prompt);
                const images = result.data.slice(0, 5);
                for (const image of images) {
                    await ednut.sendMessage(message.chat, { image: { url: image.img_url } }, { quoted: message });
                }
            } catch (error) {
                reply('❌ An error occurred: ' + error.message);
            }
        }
    }
];