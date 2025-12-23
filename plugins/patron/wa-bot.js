module.exports = [
    {
        'command': ['setcmd'],
        'description': 'Set a hidden command for a sticker',
        'category': 'Wa',
        'ban': true,
        'gcban': true,
        'owner': true,
        'execute': async (message, { ednut: client, text: textContent, isOwner: isOwner, isGroup: isGroup }) => {
            global.db.sticker = global.db.sticker || {};
            
            if (!message.quoted || message.quoted.mtype !== 'stickerMessage') {
                return message.reply('Reply a sticker');
            }
            
            if (!message.quoted.fileSha256) {
                return message.reply('This sticker doesn\'t support fileSha256');
            }
            
            if (!textContent) {
                return message.reply('Provide a text');
            }
            
            let stickerHash = message.quoted.fileSha256.toString('hex');
            
            if (global.db.sticker[stickerHash] && global.db.sticker[stickerHash].locked) {
                return message.reply('You do not have permission to change this sticker command.');
            }
            
            global.db.sticker[stickerHash] = {
                'text': textContent,
                'mentionedJid': message.sender,
                'creator': message.sender,
                'at': +new Date(),
                'locked': false
            };
            
            message.reply('Success!');
            return;
        }
    },
    {
        'command': ['delcmd'],
        'description': 'Delete a command for a sticker',
        'category': 'Wa',
        'ban': true,
        'gcban': true,
        'owner': true,
        'execute': async (message, { ednut: client, text: textContent, isOwner: isOwner, isGroup: isGroup }) => {
            let stickerHash = textContent;
            
            if (message.quoted && message.quoted.fileSha256) {
                stickerHash = message.quoted.fileSha256.toString('hex');
            }
            
            if (!stickerHash) {
                return message.reply('Hash not found');
            }
            
            let stickerDb = global.db.sticker;
            
            if (stickerDb[stickerHash] && stickerDb[stickerHash].locked) {
                return message.reply('You dont have permission to delete this sticker command');
            }
            
            delete stickerDb[stickerHash];
            message.reply('Success!');
            return;
        }
    }
];