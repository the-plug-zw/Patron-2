// group-admin.js
// Cleaned and deobfuscated version

module.exports = [
    {
        'command': ['promote'],
        'description': 'Promote a member to admin',
        'category': 'Group',
        'ban': true,
        'gcban': true,
        'group': true,
        'execute': async (message, { ednut, isAdmins, isOwner, isBotAdmins, text, reply }) => {
            try {
                if (!isBotAdmins) return reply(msg.BotAdmin);
                if (!(isAdmins || isOwner)) return reply(msg.admin);
                
                let target = message.mentionedJid[0] || 
                    (message.quoted ? message.quoted.sender : 
                    text.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
                
                if (!target) return reply('Please tag or reply to a user.');
                
                await ednut.groupParticipantsUpdate(message.chat, [target], 'promote');
                await ednut.sendMessage(message.chat, {
                    'text': '@' + target.split('@')[0] + ' has been promoted.',
                    'mentions': [target]
                });
                await ednut.sendMessage(message.chat, { 'delete': message.key });
            } catch (error) {
                reply('Unable to promote member.');
                if (global.log) global.log('ERROR', 'Promote Error: ' + (error.message || error));
            }
        }
    },
    {
        'command': ['demote'],
        'description': 'Demote a group admin',
        'category': 'Group',
        'ban': true,
        'gcban': true,
        'group': true,
        'execute': async (message, { ednut, isAdmins, isOwner, isBotAdmins, text, reply }) => {
            try {
                if (!isBotAdmins) return reply(msg.BotAdmin);
                if (!(isAdmins || isOwner)) return reply(msg.admin);
                
                let target = message.mentionedJid[0] || 
                    (message.quoted ? message.quoted.sender : 
                    text.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
                
                if (!target) return reply('Please tag or reply to a user.');
                
                await ednut.groupParticipantsUpdate(message.chat, [target], 'demote');
                await ednut.sendMessage(message.chat, {
                    'text': '@' + target.split('@')[0] + ' has been demoted.',
                    'mentions': [target]
                });
                await ednut.sendMessage(message.chat, { 'delete': message.key });
            } catch (error) {
                reply('Unable to demote member.');
                if (global.log) global.log('ERROR', 'Demote Error: ' + (error.message || error));
            }
        }
    },
    {
        'command': ['kick'],
        'alias': ['remove', 'k'],
        'description': 'Remove a user from the group',
        'category': 'Group',
        'ban': true,
        'gcban': true,
        'group': true,
        'execute': async (message, { ednut, isAdmins, isOwner, isBotAdmins, text, reply }) => {
            try {
                if (!isBotAdmins) return reply(msg.BotAdmin);
                if (!(isAdmins || isOwner)) return reply(msg.admin);
                
                let target = message.mentionedJid[0] || 
                    (message.quoted ? message.quoted.sender : 
                    (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false));
                
                if (!target) return reply('Tag or reply to a user to kick.');
                
                await ednut.groupParticipantsUpdate(message.chat, [target], 'remove');
                await ednut.sendMessage(message.chat, {
                    'text': '@' + target.split('@')[0] + ' has been removed from the group chat.',
                    'mentions': [target]
                });
                await ednut.sendMessage(message.chat, { 'delete': message.key });
            } catch (error) {
                reply('Unable to kick member.');
                if (global.log) global.log('ERROR', 'Kick Error: ' + (error.message || error));
            }
        }
    },
    {
        'command': ['mute'],
        'alias': ['close'],
        'description': 'Mute the group (only admins can send messages)',
        'category': 'Group',
        'ban': true,
        'gcban': true,
        'group': true,
        'execute': async (message, { ednut, isAdmins, isOwner, isBotAdmins, reply }) => {
            try {
                if (!isBotAdmins) return reply(msg.BotAdmin);
                if (!(isAdmins || isOwner)) return reply(msg.admin);
                
                const groupData = await ednut.groupMetadata(message.chat);
                !groupData.announcement 
                    ? (await ednut.groupSettingUpdate(message.chat, 'announcement'), 
                       reply('Group has been muted!'))
                    : reply('Group is already muted!');
            } catch (error) {
                reply('Failed to mute group.');
                if (global.log) global.log('ERROR', 'Mute Error: ' + (error.message || error));
            }
        }
    },
    {
        'command': ['unmute'],
        'alias': ['open'],
        'description': 'Unmute the group (everyone can send messages)',
        'category': 'Group',
        'ban': true,
        'gcban': true,
        'group': true,
        'execute': async (message, { ednut, isAdmins, isOwner, isBotAdmins, reply }) => {
            try {
                if (!isBotAdmins) return reply(msg.BotAdmin);
                if (!(isAdmins || isOwner)) return reply(msg.admin);
                
                const groupData = await ednut.groupMetadata(message.chat);
                groupData.announcement 
                    ? (await ednut.groupSettingUpdate(message.chat, 'not_announcement'), 
                       reply('Group has been opened!'))
                    : reply('Group is already open!');
            } catch (error) {
                reply('Failed to unmute group.');
                if (global.log) global.log('ERROR', 'Unmute Error: ' + (error.message || error));
            }
        }
    }
];