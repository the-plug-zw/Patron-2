const axios = require('axios');

async function ssweb(url, { width = 1280, height = 720, full_page = false, device_scale = 1 } = {}) {
    try {
        if (!url.startsWith('http')) {
            throw new Error('Invalid url');
        }
        
        if (isNaN(width) || isNaN(height) || isNaN(device_scale)) {
            throw new Error('Width, height, and scale must be a number');
        }
        
        if (typeof full_page !== 'boolean') {
            throw new Error('Full page must be a boolean');
        }
        
        const { data } = await axios.post('https://gcp.imagy.app/screenshot/createscreenshot', {
            'url': url,
            'browserWidth': parseInt(width),
            'browserHeight': parseInt(height),
            'fullPage': full_page,
            'deviceScaleFactor': parseInt(device_scale),
            'format': 'png'
        }, {
            'headers': {
                'content-type': 'application/json',
                'referer': 'https://imagy.app/full-page-screenshot-taker/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
            }
        });
        
        return data.fileUrl;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = [
    {
        'command': ['ssweb'],
        'alias': ['screenshot', 'webss'],
        'description': 'Take a screenshot of a webpage',
        'category': 'Converter',
        async execute(message, { ednut: client, args: args, reply: replyFunc }) {
            if (!args[0]) {
                return replyFunc('📸 Example: .ssweb https://shorturl.zenzxz.my.id');
            }
            
            try {
                replyFunc('⏳ Taking screenshot, please wait...');
                const screenshotUrl = await ssweb(args[0]);
                await client.sendMessage(message.chat, {
                    'image': { 'url': screenshotUrl },
                    'caption': '✅ Screenshot taken successfully!'
                }, {
                    'quoted': message
                });
            } catch (error) {
                replyFunc('❌ Error: ' + error.message);
            }
        }
    }
];