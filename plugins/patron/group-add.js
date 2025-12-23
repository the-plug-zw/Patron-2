// group-add.js
// Cleaned and deobfuscated version

module.exports = [
    {
        'command': ['add'],
        'alias': ['a'],
        'description': 'Adds a member to the group',
        'category': 'Group',
        'group': true,
        'execute': async (message, { ednut, from, q, isGroup, isOwner, isBotAdmins, reply }) => {
            try {
                if (!isGroup) return reply('❌ This command can only be used in groups.');
                if (!isOwner) return reply('❌ Only the bot owner can use this command.');
                if (!isBotAdmins) return reply('❌ I need to be an admin to use this command.');
                
                if (!q) return reply('❌ Please provide a number with country code\nExample: .add 2348133742');
                
                const number = q.replace(/[^0-9]/g, '');
                if (number.length < 10) return reply('❌ Invalid number. Please use format: countrycode + number\nExample: .add 2348133742');
                if (number.startsWith('0')) return reply('❌ Don\'t use 0 at start. Use country code instead\nExample: .add 2348133742');
                
                const userJid = number + '@s.whatsapp.net';
                const result = await ednut.groupParticipantsUpdate(from, [userJid], 'add');
                
                if (!result || !result[0]) return reply('❌ Failed to add member. Check the number format.');
                
                switch (result[0].status) {
                    case '200':
                        return reply('✅ Successfully added +' + number, { 'mentions': [userJid] });
                    case '403':
                    case '408':
                        try {
                            const inviteCode = await ednut.groupInviteCode(from);
                            const inviteLink = 'https://chat.whatsapp.com/' + inviteCode;
                            
                            await ednut.sendMessage(userJid, {
                                'text': 'Hello! You were invited to join our group but your privacy settings prevent direct adds.\n\nHere\'s the group invite link:\n' + inviteLink
                            });
                            
                            return reply('📨 User has restricted adds. Sent the group link to +' + number + ' in DM.', { 'mentions': [userJid] });
                        } catch {
                            return reply('❌ User has restricted adds. Failed to send group link.');
                        }
                    case '409':
                        return reply('❌ The user is already in the group');
                    case '500':
                        return reply('❌ Group is full or reached participant limit');
                    default:
                        return reply('❌ Failed to add user. Make sure the number is correct.');
                }
            } catch {
                return reply('❌ Failed to add user.');
            }
        }
    }
];