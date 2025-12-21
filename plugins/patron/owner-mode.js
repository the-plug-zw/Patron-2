module.exports = [
    {
        'command': ['mode'],
        'description': 'Change bot mode: public/private',
        'category': 'Owner',
        'ban': true,
        'gcban': true,
        'owner': true,
        'execute': async (message, { prefix: prefix, isOwner: isOwner, isGroup: isGroup }) => {
            let args = message.text.split(' ').slice(1);
            const modeOption = args[0]?.toLowerCase();
            
            if (!modeOption) {
                return message.reply(`Example: ${prefix}mode public/private`);
            }
            
            switch (modeOption) {
                case 'public':
                    if (!global.db.settings.mode) {
                        return message.reply('_Bot mode is already Public!_');
                    }
                    global.db.settings.mode = false;
                    message.reply('_Bot mode changed to Public!_');
                    break;
                    
                case 'private':
                    if (global.db.settings.mode) {
                        return message.reply('_Bot mode is already Private!_');
                    }
                    global.db.settings.mode = true;
                    message.reply('_Bot mode changed to Private!_');
                    break;
                    
                default:
                    message.reply('Invalid option! Use one of: public/private');
            }
        }
    },
    {
        'command': ['areact'],
        'alias': ['areact2'],
        'description': 'Auto react mode: cmd/all/off',
        'category': 'Owner',
        'ban': true,
        'gcban': true,
        'owner': true,
        'execute': async (message, { prefix: prefix, isGroup: isGroup, isOwner: isOwner }) => {
            let args = message.text.split(' ').slice(1);
            const reactOption = args[0]?.toLowerCase();
            
            if (!reactOption) {
                return message.reply(`Example: ${prefix}areact all/cmd/off`);
            }
            
            switch (reactOption) {
                case 'all':
                    if (global.db.settings.autoreact === 'all') {
                        return message.reply('Auto react for all messages is already enabled.');
                    }
                    global.db.settings.autoreact = 'all';
                    message.reply('Auto react to all messages enabled.');
                    break;
                    
                case 'cmd':
                    if (global.db.settings.autoreact === 'cmd') {
                        return message.reply('Auto react for bot commands is already enabled.');
                    }
                    global.db.settings.autoreact = 'cmd';
                    message.reply('Auto react to bot command messages enabled.');
                    break;
                    
                case 'off':
                    if (!global.db.settings.autoreact) {
                        return message.reply('Auto react is already disabled.');
                    }
                    global.db.settings.autoreact = false;
                    message.reply('Auto react disabled.');
                    break;
                    
                default:
                    message.reply('Invalid option! Use one of: all/cmd/off');
            }
        }
    }
];