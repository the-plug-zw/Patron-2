const fetch = require('node-fetch');

module.exports = [
    {
        'command': ['ttsearch'],
        'alias': ['tiktoksearch'],
        'description': 'Search or download TikTok video',
        'category': 'Downloader',
        'use': '<query or TikTok link>',
        'filename': __filename,
        'ban': true,
        'gcban': true,
        'execute': async (message, { ednut: client, q: query, reply: replyFunc }) => {
            const chatId = message.chat;
            
            if (!query) {
                return replyFunc('❌ Please provide a keyword or TikTok link.\nExample: .ttsearch black clover OR .ttsearch https://vm.tiktok.com/ZSSt82qWA/');
            }
            
            try {
                const apiUrl = 'https://delirius-apiofc.vercel.app/search/tiktoksearch?query=' + encodeURIComponent(query);
                const response = await fetch(apiUrl);
                const data = await response.json();
                
                if (!data.result || !data.meta.success) {
                    return replyFunc('⚠️ No TikTok videos found.');
                }
                
                const video = data.result[0];
                const caption = (
                    '\n🎬 *' + (video.title || 'No Title') + 
                    '*\n👤 Author: @' + video.author.username + ' (' + video.author.nickname + ')' +
                    '\n▶️ Views: ' + video.play + 
                    '\n🎵 Music: ' + video.music.title + 
                    '\n❤️ Likes: ' + video.like + 
                    '\n💬 Comments: ' + video.coment + 
                    '\n🔗 ' + video.url + 
                    '\n\n© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴTᴇᴄʜＸ'
                ).trim();
                
                await client.sendMessage(chatId, {
                    'video': { 'url': video.hd },
                    'caption': caption,
                    'mimetype': 'video/mp4'
                }, {
                    'quoted': message
                });
                
            } catch (error) {
                console.error('TikTok API error:', error);
                replyFunc('❌ Failed to fetch TikTok video. Try again later.');
            }
        }
    }
];