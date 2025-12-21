module.exports = [
    {
        'command': ['report'],
        'alias': ['ask', 'request', 'bug'],
        'description': 'Report a bug or request a feature',
        'category': 'Tool',
        'use': '<message>',
        async execute(message, { ednut: client, args: args, fontx: fontx, reply: replyFunc, isOwner: isOwner }) {
            try {
                const prefix = Array.isArray(global.prefix) ? global.prefix[0] : global.prefix;
                
                if (!args.length) {
                    return replyFunc(`Example: ${prefix}report Play command is not working`);
                }
                
                const ownerNumber = '263781564004';
                const ownerJid = ownerNumber + '@s.whatsapp.net';
                const senderJid = message.sender;
                
                const reportText = 
                    '*| REQUEST/BUG |*\n\n' +
                    '*User*: @' + senderJid.split('@')[0] + '\n' +
                    '*Request/Bug*: ' + args.join(' ');
                
                const successMessage = 'ʜɪ, ʏᴏᴜʀ ʀᴇǫᴜᴇꜱᴛ ʜᴀꜱ ʙᴇᴇɴ ꜰᴏʀᴡᴀʀᴅᴇᴅ ᴛᴏ ᴛʜᴇ ᴏᴡɴᴇʀ. ᴘʟᴇᴀꜱᴇ ᴡᴀɪᴛ...';
                
                await client.sendMessage(ownerJid, {
                    'text': reportText,
                    'mentions': [senderJid]
                }, {
                    'quoted': message
                });
                
                replyFunc(successMessage);
                
            } catch (error) {
                console.error('error', '[REPORT COMMAND ERROR]:', error);
                replyFunc('⚠️ An error occurred while processing your report.');
            }
        }
    }
];