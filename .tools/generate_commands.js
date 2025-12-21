const fs = require('fs');
const path = require('path');

const pluginDir = path.join(__dirname, '../plugins/patron');
const commands = [];

const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'));

for (const file of files) {
    const filePath = path.join(pluginDir, file);
    try {
        const plugin = require(filePath);
        const pluginArray = Array.isArray(plugin) ? plugin : [plugin];

        for (let i = 0; i < pluginArray.length; i++) {
            const cmd = pluginArray[i];
            if (cmd.command && Array.isArray(cmd.command)) {
                commands.push({
                    file: file,
                    index: i,
                    commands: cmd.command,
                    alias: cmd.alias || [],
                    category: cmd.category || 'General',
                    description: cmd.description || '',
                    use: cmd.use || '',
                    hasExecute: typeof cmd.execute === 'function'
                });
            }
        }
    } catch (err) {
        commands.push({
            file: file,
            error: err.message
        });
    }
}

fs.writeFileSync(path.join(__dirname, 'commands.json'), JSON.stringify(commands, null, 2));
console.log(`Generated ${commands.filter(c => !c.error).length} commands`);
