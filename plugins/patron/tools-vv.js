module.exports = {
    'command': ['vv'],
    'alias': ['retrieve', 'readviewonce'],
    'description': 'Resend view-once image/video/audio to the current chat',
    'category': 'Tool',
    async execute(message, { ednut: client, msg: msg, prefix: prefix, command: command }) {
        try {
            if (!message.quoted) {
                return message.reply('*Reply to an image, video, or audio with the caption *' + (prefix + command) + '*');
            }
            
            let mediaType = (message.quoted.msg || message.quoted).mimetype || '';
            
            if (/image/.test(mediaType)) {
                let imageBuffer = await message.quoted.download();
                await client.sendMessage(message.chat, {
                    'image': imageBuffer,
                    'caption': ''
                }, {
                    'quoted': message
                });
            } else if (/video/.test(mediaType)) {
                let videoBuffer = await message.quoted.download();
                await client.sendMessage(message.chat, {
                    'video': videoBuffer,
                    'caption': ''
                }, {
                    'quoted': message
                });
            } else if (/audio/.test(mediaType)) {
                let audioBuffer = await message.quoted.download();
                await client.sendMessage(message.chat, {
                    'audio': audioBuffer,
                    'mimetype': 'audio/mpeg',
                    'ptt': true
                }, {
                    'quoted': message
                });
            } else {
                message.reply('❌ Unsupported media type!\nReply to an image, video, or audio with *' + (prefix + command) + '*');
            }
            
        } catch (error) {
            console.error('Error processing media:', error);
            message.reply('❌ Failed to process media. Please try again.');
        }
    }
};