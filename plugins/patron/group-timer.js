module.exports = [
    {
        command: ['opentime'],
        alias: ['gopen'],
        description: 'Schedule group to open after specific time',
        category: 'Group',
        filename: __filename,
        
        async execute(m, { ednut, q, from, isGroup, isOwner, isAdmins, isBotAdmins, reply }) {
            if (!isGroup) return reply('❌ This command can only be used in groups.');
            if (!isAdmins) return reply('❌ Only admins can use this command.');
            if (!isBotAdmins) return reply('❌ I need to be admin to manage group settings.');
            if (!q) return reply('⏳ Usage: .opentime 2 mins | .opentime 1 hour');
            
            const match = q.match(/(\d+)\s*(min|mins|minute|minutes|hour|hours)/i);
            if (!match) return reply('❌ Invalid format. Example: `.opentime 2 mins` or `.opentime 1 hour`');
            
            const timeValue = parseInt(match[1]);
            const timeUnit = match[2].toLowerCase();
            let delay = 0;
            
            if (timeUnit.startsWith('min')) delay = timeValue * 60 * 1000;
            if (timeUnit.startsWith('hour')) delay = timeValue * 60 * 60 * 1000;
            
            if (delay > 12 * 60 * 60 * 1000) return reply('❌ Maximum allowed time is 12 hours.');
            
            reply('✅ Group will be *opened* in ' + timeValue + ' ' + timeUnit + '...');
            
            setTimeout(async () => {
                try {
                    await ednut.groupSettingUpdate(from, 'not_announcement');
                    await ednut.sendMessage(from, {
                        text: '🔓 The group is now *open* for all members to chat!'
                    });
                } catch (error) {
                    console.error(error);
                    reply('❌ Failed to open group.');
                }
            }, delay);
        }
    },
    {
        command: ['closetime'],
        alias: ['gclose'],
        description: 'Schedule group to close after specific time',
        category: 'Group',
        filename: __filename,
        
        async execute(m, { ednut, q, from, isGroup, isOwner, isAdmins, isBotAdmins, reply }) {
            if (!isGroup) return reply('❌ This command can only be used in groups.');
            if (!isAdmins) return reply('❌ Only admins can use this command.');
            if (!isBotAdmins) return reply('❌ I need to be admin to manage group settings.');
            if (!q) return reply('⏳ Usage: .closetime 2 mins | .closetime 1 hour');
            
            const match = q.match(/(\d+)\s*(min|mins|minute|minutes|hour|hours)/i);
            if (!match) return reply('❌ Invalid format. Example: `.closetime 2 mins` or `.closetime 1 hour`');
            
            const timeValue = parseInt(match[1]);
            const timeUnit = match[2].toLowerCase();
            let delay = 0;
            
            if (timeUnit.startsWith('min')) delay = timeValue * 60 * 1000;
            if (timeUnit.startsWith('hour')) delay = timeValue * 60 * 60 * 1000;
            
            if (delay > 12 * 60 * 60 * 1000) return reply('❌ Maximum allowed time is 12 hours.');
            
            reply('✅ Group will be *closed* in ' + timeValue + ' ' + timeUnit + '...');
            
            setTimeout(async () => {
                try {
                    await ednut.groupSettingUpdate(from, 'announcement');
                    await ednut.sendMessage(from, {
                        text: '🔒 The group is now *closed* (only admins can send messages).'
                    });
                } catch (error) {
                    console.error(error);
                    reply('❌ Failed to close group.');
                }
            }, delay);
        }
    }
];