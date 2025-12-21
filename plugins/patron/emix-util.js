// emix-util.js - Emoji mixing functionality
const axios = require('axios');
const { getBuffer } = require('../../lib/myfunc.js');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

module.exports = [
  {
    command: ['emix'],
    description: 'Combine two emojis into a sticker.',
    category: 'Fun',
    filename: __filename,
    use: '😂,🙂',
    async execute(message, { ednut, q, reply, mek }) {
      try {
        // React to the message
        await ednut.sendMessage(message.chat.remoteJid, {
          'react': {
            'text': '😃',
            'key': message.chat
          }
        });

        if (!q.includes(',')) {
          return reply('❌ *Usage:* .emix 😂,🙂\n_Send two emojis separated by a comma._');
        }

        let [emoji1, emoji2] = q.split(',').map(item => item.trim());
        
        if (!emoji1 || !emoji2) {
          return reply('Invalid emoji input. Please provide two emojis.');
        }

        const emixUrl = await fetchEmix(emoji1, emoji2);
        
        if (!emixUrl) {
          return reply('❌ Could not generate emoji mix.');
        }

        const emojiBuffer = await getBuffer(emixUrl);
        const sticker = new Sticker(emojiBuffer, {
          'pack': 'PATRON-MD',
          'author': 'emoji',
          'type': StickerTypes.FULL,
          'categories': ['🤩', '🎉'],
          'quality': 75,
          'background': 'transparent'
        });
        
        const stickerBuffer = await sticker.toBuffer();
        
        await ednut.sendMessage(mek.chat, {
          'sticker': stickerBuffer
        }, {
          'quoted': mek
        });

      } catch (error) {
        console.error('Error in .emix command:', error.message);
        reply('❌ Could not generate emoji mix: ' + error.message);
      }
    }
  }
];

async function fetchEmix(emoji1, emoji2) {
  try {
    if (!emoji1 || !emoji2) {
      throw new Error('Invalid emoji input.');
    }

    const apiUrl = 'https://levanter.onrender.com/emix?q=' + 
      encodeURIComponent(emoji1) + ',' + 
      encodeURIComponent(emoji2);
    
    const response = await axios.get(apiUrl);
    
    if (response.data && response.data.result) {
      return response.data.result;
    } else {
      throw new Error('No valid image found.');
    }
    
  } catch (error) {
    console.error('Error fetching emoji mix:', error.message);
    throw new Error('Failed to fetch emoji mix.');
  }
}