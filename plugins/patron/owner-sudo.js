const protectedKey = 'setsudo';

function loadSudoList() {
    return Array.isArray(global.db?.[protectedKey]) ? global.db[protectedKey] : [];
}

function saveSudoList(sudoList) {
    global.db[protectedKey] = sudoList;
}

module.exports = [
    {
        command: 'setsudo',
        alias: ['addsudo'],
        description: 'Add a number as sudo',
        category: 'Owner',
        ban: true,
        gcban: true,
        owner: true,
        execute: async (message, { text, ednut }) => {
            const sudoList = loadSudoList();
            const targetUser = message.mentionedJid?.[0] ||
                (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : '') ||
                message.quoted?.sender;

            if (!targetUser) {
                return message.reply('Provide a number with @tag, reply, or 234XXXXXXXXXX format.');
            }

            if (sudoList.includes(targetUser)) {
                return await ednut.sendMessage(message.chat, {
                    text: 'User @' + targetUser.split('@')[0] + ' is already a sudo.',
                    mentions: [targetUser]
                });
            }

            sudoList.push(targetUser);
            saveSudoList(sudoList);
            await ednut.sendMessage(message.chat, {
                text: 'Added @' + targetUser.split('@')[0] + ' as sudo.',
                mentions: [targetUser]
            });
        }
    },
    {
        command: 'delsudo',
        alias: ['removesudo'],
        description: 'Remove a sudo number',
        category: 'Owner',
        ban: true,
        gcban: true,
        owner: true,
        execute: async (message, { text, ednut }) => {
            const sudoList = loadSudoList();
            const targetUser = message.mentionedJid?.[0] ||
                (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : '') ||
                message.quoted?.sender;

            if (!targetUser) {
                return message.reply('Provide a number with @tag, reply, or 234XXXXXXXXXX format.');
            }

            if (!sudoList.includes(targetUser)) {
                return await ednut.sendMessage(message.chat, {
                    text: 'User @' + targetUser.split('@')[0] + ' is not a sudo.',
                    mentions: [targetUser]
                });
            }

            sudoList.splice(sudoList.indexOf(targetUser), 1);
            saveSudoList(sudoList);
            await ednut.sendMessage(message.chat, {
                text: 'Removed @' + targetUser.split('@')[0] + ' from sudo.',
                mentions: [targetUser]
            });
        }
    },
    {
        command: 'getsudo',
        alias: ['listsudo'],
        description: 'List all sudo numbers',
        category: 'Owner',
        ban: true,
        gcban: true,
        owner: true,
        execute: async (message, { ednut }) => {
            const sudoList = loadSudoList();
            
            if (!sudoList || sudoList.length === 0) {
                return await ednut.sendMessage(message.chat, {
                    text: 'No sudo numbers configured.'
                }, { quoted: message });
            }

            const sudoText = '*Current Sudo Numbers:*\n\n' +
                sudoList.map(user => '• @' + user.split('@')[0]).join('\n');
            
            await ednut.sendMessage(message.chat, {
                text: sudoText,
                mentions: sudoList
            }, { quoted: message });
        }
    }
];