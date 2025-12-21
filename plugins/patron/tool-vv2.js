module.exports = {
    'command': ['vv2'],
    'alias': ['retrieve2', 'readviewonce2'],
    'description': 'Resend view-once image/video/audio to the sender (owner-only)',
    'category': 'Owner',
    async execute(message, { ednut: client, msg: msg, prefix: prefix, command: command, isOwner: isOwner }) {
        try {
            if (!isOwner) {
                return message.reply(msg.sender);
            }
            
            if (!message.quoted) {
                return message.reply('*Reply to an image, video, or audio with the caption *' + (prefix + command) + '*');
            }
            
            let mediaType = (message.quoted.msg || message.quoted).mimetype || '';
            let mediaOptions = {};
            let mediaBuffer = await message.quoted.download();
            
            if (/image/.test(mediaType)) {
                mediaOptions = { 'image': mediaBuffer, 'caption': '' };
            } else if (/video/.test(mediaType)) {
                mediaOptions = { 'video': mediaBuffer, 'caption': '' };
            } else if (/audio/.test(mediaType)) {
                mediaOptions = { 'audio': mediaBuffer, 'mimetype': 'audio/mpeg', 'ptt': true };
            } else {
                return message.reply('❌ Unsupported media type!\nReply to an image, video, or audio with *' + (prefix + command) + '*');
            }
            
            await client.sendMessage(message.sender, mediaOptions, { 'quoted': message });
            
        } catch (error) {
            console.error('Error processing media:', error);
            message.reply('❌ Failed to process media. Please try again.');
        }
    }
};