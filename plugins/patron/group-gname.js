// group-gname.js
// Cleaned and deobfuscated version

module.exports = {
    'command': ['gname'],
    'alias': ['upgname', 'updategname'],
    'description': 'Change the group name.',
    'category': 'Group',
    'filename': __filename,
    'use': '<new_name>',
    async execute(message, { ednut, from, isGroup, isAdmins, isBotAdmins, args, q, reply }) {
        try {
            if (!isGroup) return reply('❌ This command can only be used in groups.');
            if (!isAdmins) return reply('❌ Only group admins can use this command.');
            if (!isBotAdmins) return reply('❌ I need to be an admin to update the group name.');
            if (!q) return reply('❌ Please provide a new group name.');
            
            await ednut.groupUpdateSubject(from, q);
            reply('✅ Group name has been updated to: *' + q + '*');
        } catch (error) {
            console.error('[updategname] Error updating group name:', error);
            reply('❌ Failed to update the group name. Please try again.');
        }
    }
};