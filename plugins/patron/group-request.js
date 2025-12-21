module.exports = [
    {
        command: ['request'],
        description: 'Check pending group join requests',
        category: 'Group',
        group: true,
        
        execute: async (m, { ednut, isBotAdmins, isAdmins, isOwner, reply }) => {
            try {
                if (!isBotAdmins) return reply(msg.BotAdmin);
                if (!(isAdmins || isOwner)) return reply(msg.admin);
                
                const requests = await ednut.groupRequestParticipantsList(m.chat);
                if (!requests || requests.length === 0) return ednut.sendMessage(m.chat, { text: 'No pending join requests.' }, { quoted: m });
                
                let message = '° Join Request List:\n';
                requests.forEach((req, index) => {
                    const { jid, request_method, request_time } = req;
                    const time = new Date(parseInt(request_time) * 1000).toLocaleString();
                    message += '\nNo. ' + (index + 1);
                    message += '\nJID: ' + jid;
                    message += '\nMethod: ' + request_method;
                    message += '\nTime: ' + time + '\n';
                });
                
                await ednut.sendMessage(m.chat, { text: message }, { quoted: m });
            } catch (error) {
                reply('Failed to fetch requests.');
                global.log?.('ERROR', 'request error: ' + (error.message || error));
            }
        }
    },
    {
        command: ['approve'],
        description: 'Approve all pending group join requests',
        category: 'Group',
        group: true,
        
        execute: async (m, { ednut, isBotAdmins, isAdmins, isOwner, reply }) => {
            try {
                if (!isBotAdmins) return reply(msg.BotAdmin);
                if (!(isAdmins || isOwner)) return reply(msg.admin);
                
                const requests = await ednut.groupRequestParticipantsList(m.chat);
                if (!requests || requests.length === 0) return reply('No pending participants.');
                
                let approved = [], message = 'Approved users:\n\n';
                for (const req of requests) {
                    try {
                        await ednut.groupRequestParticipantsUpdate(m.chat, [req.jid], 'approve');
                        message += '@' + req.jid.split('@')[0] + '\n';
                        approved.push(req.jid);
                    } catch {}
                }
                
                await ednut.sendMessage(m.chat, { text: message, mentions: approved });
            } catch (error) {
                reply('Failed to approve.');
                global.log?.('ERROR', 'approve error: ' + (error.message || error));
            }
        }
    },
    {
        command: ['reject'],
        description: 'Reject a specific user or all pending join requests',
        category: 'Group',
        group: true,
        botAdmin: true,
        admin: true,
        
        execute: async (m, { ednut, isBotAdmins, isAdmins, isOwner, text, reply }) => {
            try {
                if (!isBotAdmins) return reply(msg.BotAdmin);
                if (!(isAdmins || isOwner)) return reply(msg.admin);
                
                const input = text.trim();
                if (input) {
                    const userJid = input.includes('@') ? input : input.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                    try {
                        await ednut.groupRequestParticipantsUpdate(m.chat, [userJid], 'reject');
                        return reply('Rejected: @' + userJid.split('@')[0], { mentions: [userJid] });
                    } catch (error) {
                        return reply('Failed to reject user or user not in pending list.');
                    }
                }
                
                const requests = await ednut.groupRequestParticipantsList(m.chat);
                if (!requests || requests.length === 0) return reply('No pending join requests.');
                
                let rejected = [], message = 'Rejected users:\n\n';
                for (const req of requests) {
                    try {
                        await ednut.groupRequestParticipantsUpdate(m.chat, [req.jid], 'reject');
                        message += '@' + req.jid.split('@')[0] + '\n';
                        rejected.push(req.jid);
                    } catch {}
                }
                
                await ednut.sendMessage(m.chat, { text: message, mentions: rejected });
            } catch (error) {
                reply('Failed to reject.');
                global.log?.('ERROR', 'reject error: ' + (error.message || error));
            }
        }
    }
];