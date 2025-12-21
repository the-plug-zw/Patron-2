module.exports = [
    {
        command: ['list'],
        description: 'List all available commands',
        category: 'Info',
        ban: true,
        gcban: true,
        
        execute: async (m, { ednut, commands, fontx }) => {
            let commandList = [];
            
            commands.forEach(cmd => {
                if (cmd.command && cmd.description) {
                    const mainCommand = global.prefix + cmd.command[0];
                    const aliases = cmd.alias ? 
                        '(Aliases: ' + cmd.alias.map(alias => global.prefix + alias).join(', ') + ')' : '';
                    
                    commandList.push(
                        '─────────────────\n' +
                        '🎯 *' + mainCommand.toUpperCase() + '* ' + aliases + '\n' +
                        '📂 Category: ' + cmd.category + '\n' +
                        '📝 Description: ' + cmd.description + '\n' +
                        (cmd.use ? '💡 Usage: ' + global.prefix + cmd.command[0] + ' ' + cmd.use + '\n' : '')
                    );
                }
            });
            
            const result = '🛠️ *Bot Commands List* 🛠️\n\n' + 
                          commandList.join('\n') + 
                          '\n─────────────────';
            
            ednut.sendMessage(m.chat, {
                text: fontx(result)
            }, { quoted: m });
        }
    },
    {
        command: ['help'],
        description: 'Show info about a specific command',
        category: 'Info',
        ban: true,
        gcban: true,
        
        execute: async (m, { ednut, commands, fontx, text, reply }) => {
            const chat = m.chat;
            
            // If no specific command is requested, show all commands
            if (!text || text.toLowerCase() === 'menu') {
                let commandList = [];
                
                commands.forEach(cmd => {
                    if (cmd.command && cmd.description) {
                        const mainCommand = global.prefix + cmd.command[0];
                        const aliases = cmd.alias ? 
                            '(Aliases: ' + cmd.alias.map(alias => global.prefix + alias).join(', ') + ')' : '';
                        
                        commandList.push(
                            '─────────────────\n' +
                            '🎯 *' + mainCommand.toUpperCase() + '* ' + aliases + '\n' +
                            '📂 Category: ' + cmd.category + '\n' +
                            '📝 Description: ' + cmd.description + '\n' +
                            (cmd.use ? '💡 Usage: ' + global.prefix + cmd.command[0] + ' ' + cmd.use + '\n' : '')
                        );
                    }
                });
                
                const result = '🛠️ *Bot Commands List* 🛠️\n\n' + 
                              commandList.join('\n') + 
                              '\n─────────────────';
                
                return ednut.sendMessage(chat, {
                    text: fontx(result)
                }, { quoted: m });
            }
            
            // Find specific command
            const command = commands.find(cmd => 
                cmd.command.includes(text.toLowerCase()) || 
                (cmd.alias && cmd.alias.includes(text.toLowerCase()))
            );
            
            if (!command) return reply('❌ Command "' + text + '" not found');
            
            const mainCommand = global.prefix + command.command[0];
            const aliases = command.alias ? 
                '(Aliases: ' + command.alias.map(alias => global.prefix + alias).join(', ') + ')' : '';
            
            const result = 
                '─────────────────\n' +
                '🎯 *' + mainCommand.toUpperCase() + '* ' + aliases + '\n' +
                '📂 Category: ' + command.category + '\n' +
                '📝 Description: ' + command.description + '\n' +
                (command.use ? '💡 Usage: ' + global.prefix + command.command[0] + ' ' + command.use + '\n' : '') +
                '─────────────────';
            
            return ednut.sendMessage(chat, {
                text: fontx(result)
            }, { quoted: m });
        }
    }
];