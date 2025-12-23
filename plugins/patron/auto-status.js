module.exports = [{
    command: ['autoreactstatus'],
    alias: ['statuslike', 'autolike'],
    description: 'Control how the bot reacts to statuses',
    category: 'Owner',
    
    async execute(m, { text, isOwner, reply }) {
        try {
            // Check if user is owner
            if (!isOwner) {
                return reply('📛 This command is restricted to owners only.');
            }
            
            // Extract and clean action from text
            const action = text?.toLowerCase()?.trim();
            
            // Show usage if no action provided
            if (!action) {
                return reply('Usage: .autoreactstatus <on/off>');
            }
            
            // Get current settings
            const { autolike } = global.db.settings || {};
            
            // Handle 'on' action
            if (action === 'on') {
                if (autolike) {
                    return reply('_AutoLike is already enabled._');
                }
                
                // Enable auto-like
                global.db.settings.autolike = true;
                return reply(
                    '_✅ AutoLike has been enabled. ' +
                    'The bot will now react to all statuses._'
                );
            }
            
            // Handle 'off' action
            if (action === 'off') {
                if (!autolike) {
                    return reply('_AutoLike is already turned off._');
                }
                
                // Disable auto-like
                global.db.settings.autolike = false;
                return reply(
                    '_❌ AutoLike has been disabled. ' +
                    'The bot will no longer react to statuses._'
                );
            }
            
            // Invalid action
            return reply('Invalid action. Use: on or off.');
            
        } catch (error) {
            console.error('Error in autoreactstatus command:', error);
            return reply('❌ An error occurred while processing your command.');
        }
    }
}];