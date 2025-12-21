// external-disable.js
// Cleaned and deobfuscated version

const protectedCommands = ['disable', 'enable', 'listdisabled', 'menu'];

// Helper functions
function loadDisabled() {
    return Array.isArray(global.db?.disabled) ? global.db.disabled : [];
}

function saveDisabled(disabledArray) {
    if (global.db) {
        global.db.disabled = disabledArray;
    }
}

// Command modules
module.exports = [
    {
        'command': ['disable'],
        'description': 'Disable a command (by name or alias)',
        'category': 'External',
        'ban': true,
        'gcban': true,
        'owner': true,
        'execute': async (message, { args, allCommands, reply }) => {
            const cmdName = args[0]?.toLowerCase();
            
            if (!cmdName) {
                return reply('Please specify a command to disable.');
            }
            
            // Check if command is protected
            if (protectedCommands.includes(cmdName)) {
                return reply(`The *${cmdName}* command is protected and cannot be disabled.`);
            }
            
            // Get all available commands and aliases
            const allCommandNames = allCommands
                .flatMap(cmd => Array.isArray(cmd.command) ? cmd.command : [cmd.command])
                .concat(allCommands.flatMap(cmd => 
                    Array.isArray(cmd.alias) ? cmd.alias : (cmd.alias ? [cmd.alias] : [])
                ))
                .map(name => name.toLowerCase());
            
            // Check if command exists
            if (!allCommandNames.includes(cmdName)) {
                return reply(`Command *${cmdName}* not found in the command list.`);
            }
            
            const disabledList = loadDisabled();
            
            // Check if already disabled
            if (disabledList.includes(cmdName)) {
                return reply(`Command *${cmdName}* is already disabled.`);
            }
            
            // Add to disabled list and save
            disabledList.push(cmdName);
            saveDisabled(disabledList);
            
            reply(`Command *${cmdName}* has been disabled.`);
        }
    },
    {
        'command': ['enable'],
        'description': 'Enable a previously disabled command',
        'category': 'External',
        'ban': true,
        'gcban': true,
        'owner': true,
        'execute': async (message, { args, reply }) => {
            const cmdName = args[0]?.toLowerCase();
            
            if (!cmdName) {
                return reply('Please specify a command to enable.');
            }
            
            let disabledList = loadDisabled();
            
            // Check if command is in disabled list
            if (!disabledList.includes(cmdName)) {
                return reply(`Command *${cmdName}* is not currently disabled.`);
            }
            
            // Remove from disabled list and save
            disabledList = disabledList.filter(item => item !== cmdName);
            saveDisabled(disabledList);
            
            reply(`Command *${cmdName}* has been enabled.`);
        }
    },
    {
        'command': ['listdisabled'],
        'description': 'List all disabled commands',
        'category': 'External',
        'ban': true,
        'gcban': true,
        'owner': true,
        'execute': async ({ reply }) => {
            const disabledList = loadDisabled();
            
            if (disabledList.length === 0) {
                return reply('No commands are currently disabled.');
            }
            
            const listText = disabledList.map(cmd => `- ${cmd}`).join('\n');
            reply(`*Disabled commands:*\n${listText}`);
        }
    }
];