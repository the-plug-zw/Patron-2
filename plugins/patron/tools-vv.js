module.exports = {
    'command': ['vv'],
    'alias': ['retrieve', 'readviewonce'],
    'description': 'Resend view-once image/video/audio to the current chat',
    'category': 'Tool',
    async execute(message, { ednut: client, msg: msg, prefix: prefix, command: command, reply: reply2 }) {
        // Add reply method if not available
        if (!message.reply && typeof reply2 === 'function') {
            message.reply = reply2;
        }

        try {
            if (!message.quoted) {
                if (message.reply) return message.reply('*Reply to an image, video, or audio with the caption *' + (prefix + command) + '*');
                return;
            }

            let mediaType = (message.quoted.msg || message.quoted).mimetype || '';
            let mediaBuffer = await message.quoted.download ? await message.quoted.download() : null;

            if (!mediaBuffer) {
                if (message.reply) return message.reply('❌ Failed to download media. Please try again.');
                return;
            }

            if (/image/.test(mediaType)) {
                await client.sendMessage(message.chat, {
                    'image': mediaBuffer,
                    'caption': ''
                }, {
                    'quoted': message
                });
            } else if (/video/.test(mediaType)) {
                await client.sendMessage(message.chat, {
                    'video': mediaBuffer,
                    'caption': ''
                }, {
                    'quoted': message
                });
            } else if (/audio/.test(mediaType)) {
                await client.sendMessage(message.chat, {
                    'audio': mediaBuffer,
                    'mimetype': 'audio/mpeg',
                    'ptt': true
                }, {
                    'quoted': message
                });
            } else {
                if (message.reply) message.reply('❌ Unsupported media type!\nReply to an image, video, or audio with *' + (prefix + command) + '*');
            }

        } catch (error) {
            console.error('Error processing media:', error);
            if (message.reply) message.reply('❌ Failed to process media. Please try again.');
        }
    }
};