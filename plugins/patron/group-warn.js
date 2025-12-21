module.exports = [
    {
        command: ['warn'],
        description: 'Warn a user in group chat',
        category: 'Group',
        ban: true,
        gcban: true,
        group: true,
        
        execute: async (m, { ednut, isAdmins, isOwner, isBotAdmins, text, sleep, reply }) => {
            const maxWarns = global.warn || 3;
            
            if (!(isAdmins || isOwner)) return reply(msg.admin);
            if (!isBotAdmins) return reply(msg.BotAdmin);
            
            const user = m.mentionedJid?.[0] || m.quoted?.sender;
            if (!user) return reply('Tag or reply to someone to warn.');
            
            const warnDB = global.db.warn ??= {};
            if (!warnDB[user]) warnDB[user] = 0;
            
            const reason = text?.replace(/@\d+/g, '').trim() || 'No reason';
            
            if (warnDB[user] < maxWarns) {
                warnDB[user]++;
                
                await ednut.sendMessage(m.chat, {
                    text: '*WARNING*\n\nUser: @' + user.split('@')[0] + '\nTotal Warnings: ' + warnDB[user] + '/' + maxWarns + '\nReason: ' + reason,
                    mentions: [user]
                });
                
                await ednut.sendMessage(m.chat, { delete: m.key });
                
                if (warnDB[user] >= maxWarns) {
                    await ednut.sendMessage(m.chat, {
                        text: '@' + user.split('@')[0] + ' has reached *' + maxWarns + ' warnings and will be removed.',
                        mentions: [user]
                    });
                    
                    await sleep(3000);
                    await ednut.groupParticipantsUpdate(m.chat, [user], 'remove');
                    delete warnDB[user];
                }
            }
        }
    },
    {
        command: ['delwarn'],
        alias: ['removewarn', 'delwarns', 'remwarn'],
        description: 'Reduce warning count of a user',
        category: 'Group',
        ban: true,
        gcban: true,
        group: true,
        
        execute: async (m, { ednut, isAdmins, isOwner, isBotAdmins, reply }) => {
            if (!isBotAdmins) return reply(msg.BotAdmin);
            if (!(isAdmins || isOwner)) return reply(msg.admin);
            
            const user = m.mentionedJid?.[0] || m.quoted?.sender;
            if (!user) return reply('Tag or reply to someone to reduce warning.');
            
            const warnDB = global.db.warn ??= {};
            if (!warnDB[user]) return reply('User has no warnings.');
            
            if (warnDB[user] > 0) {
                warnDB[user]--;
                await ednut.sendMessage(m.chat, {
                    text: 'Warning Removed\nUser: @' + user.split('@')[0] + '\nTotal Warnings: ' + warnDB[user],
                    mentions: [user]
                });
            } else {
                reply('User has no warnings.');
            }
        }
    },
    {
        command: ['resetwarn'],
        description: 'Reset warning count for a user',
        category: 'Group',
        ban: true,
        gcban: true,
        group: true,
        
        execute: async (m, { ednut, isAdmins, isOwner, isBotAdmins, text, reply }) => {
            if (!isBotAdmins) return reply(msg.BotAdmin);
            if (!(isAdmins || isOwner)) return reply(msg.admin);
            
            const user = m.mentionedJid?.[0] || m.quoted?.sender || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false);
            if (!user) return reply('*Tag, reply or provide number to reset warning.*');
            
            const warnDB = global.db.warn ??= {};
            warnDB[user] = 0;
            
            await ednut.sendMessage(m.chat, {
                text: 'Warnings for @' + user.split('@')[0] + ' have been reset.',
                mentions: [user]
            });
        }
    }
];