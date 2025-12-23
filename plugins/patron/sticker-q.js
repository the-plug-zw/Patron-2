const axios = require('axios');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { getBuffer } = require('../../lib/myfunc.js');

module.exports = [{
    'command': ['quote'],
    'alias': ['q', 'qc'],
    'description': 'Makes a sticker from quoted text or inline text.',
    'category': 'Tool',
    'use': '<reply to any message or write text>',
    'filename': __filename,
    
    async 'execute'(m, { ednut, from, isOwner, q, quoted, body, reply }) {
        try {
            if (!isOwner) return reply('*❌ Only the bot owner can use this command.*');
            
            const text = m.quoted?.['text'] || m.quoted?.['conversation'] || q;
            if (!text) return reply('_❌ Provide or reply to a message with text._');
            
            const senderId = m.quoted?.['sender'] || m.sender;
            const profilePic = await ednut.profilePictureUrl(senderId, 'FULL')
                .catch(() => 'https://files.catbox.moe/wpi099.png');
            
            const senderName = m.pushName || await ednut.getName(senderId);
            
            const quoteData = {
                'type': 'quote',
                'format': 'png',
                'backgroundColor': '#FFFFFF',
                'width': 512,
                'height': 512,
                'scale': 3,
                'messages': [{
                    'avatar': true,
                    'from': {
                        'first_name': senderName,
                        'language_code': 'en',
                        'name': senderName,
                        'photo': { 'url': profilePic }
                    },
                    'text': text,
                    'replyMessage': {}
                }]
            };
            
            const quoteResponse = await axios.post('https://bot.lyo.su/quote/generate', quoteData);
            const imageBuffer = await getBuffer('data:image/png;base64,' + quoteResponse.data.result.image);
            
            const sticker = new Sticker(imageBuffer, {
                'pack': global.packname || 'ᴘᴀᴛʀᴏɴᴍᴅ 🚹',
                'author': senderName,
                'type': StickerTypes.FULL,
                'quality': 75
            });
            
            const stickerBuffer = await sticker.toBuffer();
            await ednut.sendMessage(m.chat, {
                'sticker': stickerBuffer
            }, { 'quoted': m });
            
        } catch (err) {
            console.error('Quotely error:', err);
            return reply('❌ *Quotely Error:* ' + err.message);
        }
    }
}];