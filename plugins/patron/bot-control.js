module.exports = [
    {
        command: ['antidelete'],
        alias: ['anti-delete', 'delete'],
        description: 'Enable or disable message deletion protection',
        category: 'Settings',
        ban: true,
        gcban: true,
        owner: true,
        
        async execute(m, { args, isOwner, reply }) {
            try {
                // Get action from args
                const action = args[0]?.toLowerCase();
                const currentSetting = global.db.settings?.antidelete ?? false;
                
                // Handle 'on' action
                if (action === 'on') {
                    if (currentSetting) {
                        return reply('_Antidelete is already enabled._');
                    }
                    
                    // Enable antidelete
                    global.db.settings.antidelete = true;
                    return reply('_Antidelete has been enabled._');
                }
                
                // Handle 'off' action
                if (action === 'off') {
                    if (!currentSetting) {
                        return reply('_Antidelete is already disabled._');
                    }
                    
                    // Disable antidelete
                    global.db.settings.antidelete = false;
                    return reply('_Antidelete has been disabled._');
                }
                
                // Invalid action
                return reply('Usage: antidelete on/off');
                
            } catch (error) {
                console.error('Error in antidelete command:', error);
                return reply('❌ An error occurred while processing your command.');
            }
        }
    },
    
    {
        command: ['anticall'],
        alias: ['call', 'anti-delete'],
        description: 'Control how the bot handles incoming calls',
        category: 'Settings',
        ban: true,
        gcban: true,
        
        async execute(m, { text, isOwner, reply }) {
            try {
                // Owner only command
                if (!isOwner) {
                    return reply('📛 This command is restricted to owners only.');
                }
                
                // Get action from text
                const action = text?.toLowerCase()?.trim();
                
                if (!action) {
                    return reply('Usage: .anticall <reject/block/off>');
                }
                
                // Get current settings
                const { anticall, anticall2 } = global.db.settings || {};
                
                // Handle 'reject' action (reject calls only)
                if (action === 'reject') {
                    if (anticall) {
                        return reply('_Call rejection is already enabled._');
                    }
                    
                    // Enable reject, disable block
                    global.db.settings.anticall = true;
                    global.db.settings.anticall2 = false;
                    return reply('_✅ Call rejection has been enabled._');
                }
                
                // Handle 'block' action (reject and block callers)
                if (action === 'block') {
                    if (anticall2) {
                        return reply('_Call blocking is already enabled._');
                    }
                    
                    // Enable block, disable reject
                    global.db.settings.anticall2 = true;
                    global.db.settings.anticall = false;
                    return reply('_✅ Call blocking has been enabled._');
                }
                
                // Handle 'off' action (disable both)
                if (action === 'off') {
                    if (!anticall && !anticall2) {
                        return reply('_Anticall is already turned off._');
                    }
                    
                    // Disable both
                    global.db.settings.anticall = false;
                    global.db.settings.anticall2 = false;
                    return reply('_❌ Anticall has been turned off._');
                }
                
                // Invalid action
                return reply('Invalid action. Use: reject, block, or off.');
                
            } catch (error) {
                console.error('Error in anticall command:', error);
                return reply('❌ An error occurred while processing your command.');
            }
        }
    }
];