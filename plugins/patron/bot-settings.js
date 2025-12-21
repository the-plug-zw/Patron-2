module.exports = [{
    command: ['autoread', 'readsw', 'typing', 'online', 'status'],
    description: 'Change bot fake settings',
    category: 'Settings',
    ban: true,
    gcban: true,
    owner: true,
    
    async execute(m, { text, command, isOwner, reply }) {
        try {
            // Settings configuration
            const settingsConfig = {
                'read': {
                    key: 'autoread',
                    name: 'Read'
                },
                'recording': {
                    key: 'autorecording',
                    name: 'Recording'
                },
                'typing': {
                    key: 'autotyping',
                    name: 'Typing'
                },
                'online': {
                    key: 'ONLINE',
                    name: 'Online'
                },
                'status': {
                    key: 'STATUS',
                    name: 'Status'
                }
            };
            
            // Get setting info based on command
            const settingInfo = settingsConfig[command];
            const settingKey = settingInfo.key;
            
            // Get current value with environment variable fallback
            const currentValue = global.db.settings?.[settingKey] ?? 
                                process.env[settingKey] === 'true';
            
            // Handle 'on' action
            if (text === 'on') {
                if (currentValue) {
                    return reply(`_${settingInfo.name} is already ON_`);
                }
                
                // Enable setting
                global.db.settings[settingKey] = true;
                return reply(`_${settingInfo.name} has been turned ON_`);
            }
            
            // Handle 'off' action
            if (text === 'off') {
                if (!currentValue) {
                    return reply(`_${settingInfo.name} is already OFF_`);
                }
                
                // Disable setting
                global.db.settings[settingKey] = false;
                return reply(`_${settingInfo.name} has been turned OFF_`);
            }
            
            // Invalid action
            return reply(`_Usage: .${command} on/off_`);
            
        } catch (error) {
            console.error('Error in settings command:', error);
            return reply('❌ An error occurred while processing your command.');
        }
    }
}];