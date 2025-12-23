module.exports = [
    {
        command: ['block'],
        alias: ['blk'],
        description: 'Block a user (reply/tag/number)',
        category: 'Privacy',
        ban: false,
        gcban: false,
        execute: async (message, { ednut, text, isOwner, isGroup, reply }) => {
            if (message.isGroup) return reply(msg.baileys);
            if (!isOwner) return reply(msg.owner);
            
            const target = !message.isGroup ? message.chat :
                message.mentionedJid?.[0] ?
                    message.mentionedJid[0] :
                    message.quoted ?
                        message.quoted.sender :
                        text ?
                            text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' :
                            null;
            
            if (!target) return reply('Please reply, tag, or input a valid number to block.');
            
            await ednut.updateBlockStatus(target, 'block');
            const successMessage = 'Successfully blocked @' + target.split('@')[0];
            
            message.isGroup ?
                await ednut.sendMessage(message.chat, { text: successMessage, mentions: [target] }, { quoted: message }) :
                reply(successMessage);
        }
    },
    {
        command: ['unblock'],
        alias: ['ublk'],
        description: 'Unblock a user (reply/tag/number)',
        category: 'Privacy',
        ban: false,
        gcban: false,
        execute: async (message, { ednut, text, isOwner, isGroup, reply }) => {
            if (message.isGroup) return reply(msg.baileys);
            if (!isOwner) return reply(msg.owner);
            
            const target = !message.isGroup ? message.chat :
                message.mentionedJid?.[0] ?
                    message.mentionedJid[0] :
                    message.quoted ?
                        message.quoted.sender :
                        text ?
                            text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' :
                            null;
            
            if (!target) return reply('Please reply, tag, or input a valid number to unblock.');
            
            await ednut.updateBlockStatus(target, 'unblock');
            const successMessage = 'Successfully unblocked @' + target.split('@')[0];
            
            message.isGroup ?
                await ednut.sendMessage(message.chat, { text: successMessage, mentions: [target] }, { quoted: message }) :
                reply(successMessage);
        }
    },
    {
        command: ['listblock'],
        alias: ['blocklist'],
        description: 'List all blocked contacts',
        category: 'Privacy',
        ban: true,
        gcban: true,
        async execute(message, { ednut, isOwner, reply }) {
            try {
                if (!isOwner) return reply('*Only the owner can use this command.*');
                
                const blockedList = await ednut.fetchBlocklist();
                if (!blockedList || blockedList.length === 0) return reply('No blocked users found.');
                
                const validBlocks = blockedList.filter(item => typeof item === 'string' && item.includes('@'));
                const blockItems = validBlocks.map((block, index) =>
                    '📵 ' + (index + 1) + '. @' + block.split('@')[0]
                ).join('\n');
                
                const result = (`
🛑 *Blocked Contacts List* 🛑

*Total Blocked:* ${validBlocks.length}

${blockItems}

─────────────
                `).trim();
                
                await reply(result);
            } catch (error) {
                return reply('❌ Failed to fetch blocked contacts.');
            }
        }
    },
    {
        command: ['listgroup'],
        alias: ['listgc'],
        description: 'List all joined group chats',
        category: 'Owner',
        ban: false,
        gcban: false,
        execute: async (message, { ednut, isOwner, isGroup, reply }) => {
            if (message.isGroup) return reply(msg.baileys);
            if (!isOwner) return reply(msg.owner);
            
            const chats = await ednut.groupFetchAllParticipating();
            const groups = Object.values(chats);
            let result = 'List of all groups:\n\nTotal: ' + groups.length + '\n';
            
            for (const group of groups) {
                result += `
-----------------------------
ID: ${group.id}
Name: ${group.subject}
Members: ${group.participants.length}
Status: ${group.announce ? 'Closed' : 'Open'}
Owner: ${group.subjectOwner ? group.subjectOwner.split('@')[0] : 'Unknown'}
`;
            }
            
            return reply(result);
        }
    }
];