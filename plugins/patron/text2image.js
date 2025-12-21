const axios = require('axios');
const cheerio = require('cheerio');

async function txttoimage(prompt) {
    const encodedPrompt = 'prompt=' + encodeURIComponent(prompt);
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://www.texttoimage.org'
    };
    
    const response = await axios.post('https://www.texttoimage.org/generate', encodedPrompt, { 'headers': headers });
    const redirectUrl = 'https://www.texttoimage.org' + response.data.url;
    
    const pageResponse = await axios.get(redirectUrl);
    const $ = cheerio.load(pageResponse.data);
    const imageUrl = $('a[data-lightbox="image-set"] img').attr('src');
    
    return 'https://www.texttoimage.org' + imageUrl;
}

module.exports = [{
    'command': ['txt2img'],
    'alias': ['text2image'],
    'description': 'Generate an image based on your text prompt',
    'category': 'Ai',
    'filename': __filename,
    'use': '<text-prompt>',
    'ban': true,
    'gcban': true,
    
    async 'execute'(m, { ednut, text, reply }) {
        if (!text) return reply('*Example:* .txt2img Cute Anime Girl');
        
        try {
            const imageUrl = await txttoimage(text);
            await ednut.sendMessage(m.chat, {
                'image': { 'url': imageUrl }
            }, { 'quoted': m });
            
        } catch (err) {
            reply('❌ Error: ' + err.message);
        }
    }
}];