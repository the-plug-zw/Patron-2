const fs = require('fs');

module.exports = [
    {
        command: ['save'],
        alias: ['sv', 'send'],
        description: 'Download and forward a quoted message (text, media, sticker, doc)',
        category: 'Info',
        ban: false,
        gcban: false,
        execute: async (message, { ednut, botNumber, isOwner, isGroup, reply }) => {
            if (!isOwner) return;
            
            const quotedMessage = message.quotedMessage?.message;
            if (!quotedMessage) {
                return reply('Reply to a message or media to download and save.');
            }

            if (quotedMessage.conversation) {
                return ednut.sendMessage(botNumber, { text: quotedMessage.conversation }, { quoted: message });
            }

            if (quotedMessage.imageMessage) {
                const caption = quotedMessage.imageMessage.caption || '';
                const mediaPath = await ednut.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
                return ednut.sendMessage(botNumber, { image: { url: mediaPath }, caption: caption }, { quoted: message });
            }

            if (quotedMessage.audioMessage) {
                const mediaPath = await ednut.downloadAndSaveMediaMessage(quotedMessage.audioMessage);
                return ednut.sendMessage(botNumber, { audio: { url: mediaPath }, mimetype: 'audio/mpeg' }, { quoted: message });
            }

            if (quotedMessage.videoMessage) {
                const caption = quotedMessage.videoMessage.caption || '';
                const mediaPath = await ednut.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
                return ednut.sendMessage(botNumber, { video: { url: mediaPath }, caption: caption }, { quoted: message });
            }

            if (quotedMessage.stickerMessage) {
                const mediaPath = await ednut.downloadAndSaveMediaMessage(quotedMessage.stickerMessage);
                return ednut.sendMessage(botNumber, { sticker: { url: mediaPath } }, { quoted: message });
            }

            if (quotedMessage.documentMessage) {
                const mediaPath = await ednut.downloadAndSaveMediaMessage(quotedMessage.documentMessage);
                const fileName = quotedMessage.documentMessage.fileName || 'application/zip';
                return ednut.sendMessage(botNumber, {
                    document: { url: mediaPath },
                    mimetype: 'application/zip',
                    fileName: fileName
                }, { quoted: message });
            }

            return reply('Unsupported message type.');
        }
    },
    {
        command: ['setpp'],
        description: 'Set bot profile picture (reply to image)',
        category: 'Owner',
        ban: false,
        gcban: false,
        owner: true,
        execute: async (message, { ednut, reply, isOwner, mime, quoted, prefix, command, isGroup }) => {
            if (!quoted) return reply('Reply to an image to set as profile picture.');
            if (!/image/.test(mime)) return reply('Send/Reply image with caption *' + prefix + command + '*');
            if (/webp/.test(mime)) return reply('Sticker format not allowed. Send regular image.');

            try {
                const mediaPath = await ednut.downloadAndSaveMediaMessage(quoted);
                await ednut.updateProfilePicture(ednut.user.id, { url: mediaPath });
                fs.unlinkSync(mediaPath);
            } catch (error) {
                reply('Failed to update profile picture.');
            }
        }
    },
    {
        command: ['delpp'],
        description: 'Remove bot profile picture',
        category: 'Owner',
        ban: false,
        gcban: false,
        owner: true,
        execute: async (message, { ednut, isOwner, isGroup, reply }) => {
            try {
                await ednut.removeProfilePicture(ednut.user.id);
                reply('Profile picture removed.');
            } catch (error) {
                reply('Failed to remove profile picture.');
            }
        }
    }
];