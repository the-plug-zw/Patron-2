// group-acceptall.js
// Cleaned and deobfuscated version

module.exports = [
    {
        'command': ['requestlist'],
        'description': 'Shows pending group join requests',
        'category': 'Group',
        'group': true,
        'execute': async (message, { ednut, isGroup, isAdmins, isBotAdmins, reply }) => {
            try {
                if (!isGroup) return reply('❌ This command can only be used in groups.');
                if (!isAdmins) return reply('❌ I need to be an admin to view join requests.');
                if (!isBotAdmins) return reply('❌ Only group admins can use this command.');
                
                const requests = await ednut.groupRequestParticipantsList(message.chat);
                if (!requests || requests.length === 0) return reply('ℹ️ No pending join requests.');
                
                let requestText = '📋 *Pending Join Requests (' + requests.length + ')*\n\n';
                requests.forEach((request, index) => {
                    requestText += (index + 1) + '. @' + request.jid.split('@')[0] + '\n';
                });
                
                return reply(requestText, { 'mentions': requests.map(r => r.jid) });
            } catch (error) {
                console.error('Request list error:', error);
                return reply('❌ Failed to fetch join requests.');
            }
        }
    },
    {
        'command': ['acceptall'],
        'alias': ['approve'],
        'description': 'Accepts all pending group join requests',
        'category': 'Group',
        'group': true,
        'execute': async (message, { ednut, isGroup, isAdmins, isBotAdmins, reply }) => {
            try {
                if (!isGroup) return reply('❌ This command can only be used in groups.');
                if (!isAdmins) return reply('❌ I need to be an admin to accept join requests.');
                if (!isBotAdmins) return reply('❌ Only group admins can use this command.');
                
                if (typeof ednut.groupRequestParticipantsList !== 'function') {
                    return reply('❌ Your Baileys version does not support join request listing. Please update the bot.');
                }
                
                const requests = await ednut.groupRequestParticipantsList(message.chat);
                if (!requests || requests.length === 0) return reply('ℹ️ No pending join requests to approve.');
                
                const jids = requests.map(r => r.jid).filter(jid => typeof jid === 'string' && jid.includes('@'));
                
                for (const jid of jids) {
                    try {
                        await ednut.groupRequestParticipantsUpdate(message.chat, [jid], 'approve');
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (error) {
                        console.error('[❌ ERROR] Failed to approve ' + jid + ':', error.message);
                    }
                }
                
                return reply('✅ Approved ' + jids.length + ' join request(s):\n\n' + 
                    jids.map(jid => '+' + jid.split('@')[0]).join('\n'));
            } catch (error) {
                console.error('[❌ ERROR] AcceptAll failed:', error);
                return reply('❌ Failed to accept join requests.\n\nError: ```' + (error?.message || error.stack) + '```');
            }
        }
    },
    {
        'command': ['rejectall'],
        'alias': ['unapprove', 'reject'],
        'description': 'Rejects all pending group join requests',
        'category': 'Group',
        'group': true,
        'execute': async (message, { ednut, isGroup, isAdmins, isBotAdmins, reply }) => {
            try {
                if (!isGroup) return reply('❌ This command can only be used in groups.');
                if (!isAdmins) return reply('❌ I need to be an admin to reject join requests.');
                if (!isBotAdmins) return reply('❌ Only group admins can use this command.');
                
                if (typeof ednut.groupRequestParticipantsList !== 'function') {
                    return reply('❌ Your Baileys version does not support join request listing. Please update the bot.');
                }
                
                const requests = await ednut.groupRequestParticipantsList(message.chat);
                if (!requests || requests.length === 0) return reply('ℹ️ No pending join requests to reject.');
                
                const jids = requests.map(r => r.jid).filter(jid => typeof jid === 'string' && jid.includes('@'));
                
                for (const jid of jids) {
                    try {
                        await ednut.groupRequestParticipantsUpdate(message.chat, [jid], 'reject');
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (error) {
                        console.error('[❌ ERROR] Failed to reject ' + jid + ':', error.message);
                    }
                }
                
                return reply('✅ Rejected ' + jids.length + ' join request(s):\n\n' + 
                    jids.map(jid => '+' + jid.split('@')[0]).join('\n'));
            } catch (error) {
                console.error('[❌ ERROR] RejectAll failed:', error);
                return reply('❌ Failed to reject join requests.\n\nError: ```' + (error?.message || error.stack) + '```');
            }
        }
    }
];