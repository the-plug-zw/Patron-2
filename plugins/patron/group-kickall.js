// group-kickall.js
// Cleaned and deobfuscated version

module.exports = [
    {
        'command': ['kickall', 'removemembers', 'endgc', 'endgroup'],
        'description': 'Remove all non-admin members from the group.',
        'category': 'Group',
        'filename': __filename,
        async execute(message, { ednut, from, isGroup, groupMetadata, groupAdmins, isBotAdmins, reply, sender }) {
            try {
                if (!isGroup) return reply('❌ This command can only be used in groups.');
                if (!isBotAdmins) return reply('❌ I need to be an admin to execute this command.');
                
                const botOwner = await ednut.decodeJid(ednut.user.id);
                if (sender !== botOwner) return reply('❌ Only the bot owner can use this command.');
                
                const participants = groupMetadata.participants;
                const nonAdmins = participants.filter(p => 
                    !groupAdmins.some(admin => admin.id === p.id) && p.id !== botOwner
                );
                
                if (nonAdmins.length === 0) return reply('✅ No non-admin members to remove.');
                
                reply('🔄 Starting mass removal: ' + nonAdmins.length + ' members');
                
                let successCount = 0, failCount = 0;
                
                for (let i = 0; i < nonAdmins.length; i++) {
                    try {
                        const delay = Math.floor(Math.random() * 2000) + 1000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                        
                        await ednut.groupParticipantsUpdate(from, [nonAdmins[i].id], 'remove');
                        successCount++;
                        
                        if (successCount % 5 === 0) {
                            await reply('Progress: ' + successCount + '/' + nonAdmins.length + ' members removed...');
                        }
                    } catch (error) {
                        console.error('❌ Failed to remove ' + nonAdmins[i].id + ':', error);
                        failCount++;
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }
                }
                
                await reply('✅ Operation Complete!\n• Successfully removed: ' + successCount + '\n• Failed: ' + failCount);
                await new Promise(resolve => setTimeout(resolve, 3000));
                await ednut.groupLeave(from);
            } catch (error) {
                console.error('❌ Error during mass removal:', error);
                reply('❌ An error occurred during the operation.');
            }
        }
    },
    {
        'command': ['removeadmins', 'kickadmins', 'deladmins', 'kickall3'],
        'description': 'Remove all admin members from the group, excluding the bot and bot owner.',
        'category': 'Group',
        'filename': __filename,
        async execute(message, { ednut, from, isGroup, groupMetadata, groupAdmins, isBotAdmins, reply, sender }) {
            try {
                if (!isGroup) return reply('❌ This command can only be used in groups.');
                if (!isBotAdmins) return reply('❌ I need to be an admin to execute this command.');
                
                const botOwner = await ednut.decodeJid(ednut.user.id);
                if (sender !== botOwner) return reply('❌ Only the bot owner can use this command.');
                
                const participants = groupMetadata.participants;
                const adminIds = groupAdmins.map(admin => admin.id);
                const adminsToRemove = participants.filter(p => 
                    adminIds.includes(p.id) && p.id !== botOwner
                );
                
                if (adminsToRemove.length === 0) return reply('✅ No admins to remove (excluding bot and bot owner).');
                
                reply('🔄 Removing ' + adminsToRemove.length + ' admin members...');
                
                for (let admin of adminsToRemove) {
                    try {
                        await ednut.groupParticipantsUpdate(from, [admin.id], 'remove');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    } catch (error) {
                        console.error('❌ Failed to remove ' + admin.id + ':', error);
                    }
                }
                
                reply('✅ Successfully removed all admin members (excluding bot and bot owner).');
            } catch (error) {
                console.error('❌ Error removing admins:', error);
                reply('❌ An error occurred while trying to remove admins.');
            }
        }
    }
];