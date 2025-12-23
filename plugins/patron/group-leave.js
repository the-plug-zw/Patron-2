module.exports = [{
    command: ['leave'],
    alias: ['left', 'leftgc', 'leavegc'],
    description: 'Leave the group',
    category: 'Owner',
    filename: __filename,
    
    async execute(m, { ednut, from, isGroup, isOwner, reply }) {
        try {
            // Check if command is used in a group
            if (!isGroup) {
                return reply('❌ This command can only be used *in groups*.');
            }
            
            // Check if user is the bot owner
            if (!isOwner) {
                return reply('❌ Only the *bot owner* can use this command.');
            }
            
            // Get group data
            const groupData = await ednut.decodeJid(ednut.user.id);
            
            // Send leaving message
            await reply('👋 Leaving group...');
            
            // Wait for 1.5 seconds
            await sleep(1500);
            
            // Leave the group with error handling
            await ednut.groupLeave(from).catch(error => {
                // Ignore specific errors
                if (
                    error.message === 'item-not-found' ||
                    error.message === 'forbidden' ||
                    error.status === 403 ||
                    error.status === 404
                ) {
                    return;
                }
                
                console.error('Leave error:', error);
                throw error;
            });
            
        } catch (error) {
            console.error('Leave error:', error);
            reply('❌ Error: ' + error.message);
        }
    }
}];

// Helper function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}