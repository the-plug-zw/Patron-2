module.exports = [
    {
        'command': ['addpfilter'],
        'alias': ['pfilter'],
        'description': 'Add a private chat filter',
        'category': 'Wa',
        'ban': true,
        'gcban': true,
        'owner': true,
        'execute': async (message, { ednut: client, text: textContent, isOwner: isOwner, example: example, LoadDataBase: LoadDataBase, isGroup: isGroup }) => {
            try {
                const parts = textContent.split('"');
                
                if (parts.length < 4) {
                    return message.reply(example('"trigger" "response"'));
                }
                
                const trigger = parts[1].toLowerCase();
                const response = parts[3];
                
                if (!global.db.pfilters) {
                    global.db.pfilters = {};
                }
                
                global.db.pfilters[trigger] = response;
                
                message.reply(`_pFilter added: ${trigger} -> ${response}_`);
                
            } catch (error) {
                console.error('Error in addpfilter command:', error);
                await message.reply('❌ Error: ' + (error.message || error));
            }
        }
    },
    {
        'command': ['listpfilter'],
        'alias': ['pfilters'],
        'description': 'List all private chat filters',
        'category': 'Wa',
        'ban': true,
        'gcban': true,
        'owner': true,
        'execute': async (message, { ednut: client, isOwner: isOwner, example: example, LoadDataBase: LoadDataBase, isGroup: isGroup }) => {
            try {
                if (!global.db.pfilters || !Object.keys(global.db.pfilters).length) {
                    return message.reply('No filters set');
                }
                
                const filterList = Object.keys(global.db.pfilters)
                    .map(trigger => `${trigger} -> ${global.db.pfilters[trigger]}`)
                    .join('\n');
                
                message.reply(`_pFilters_:\n${filterList}`);
                
            } catch (error) {
                console.error('Error in listpfilter command:', error);
                await message.reply('❌ Error: ' + (error.message || error));
            }
        }
    },
    {
        'command': ['deletepfilter'],
        'alias': ['removepfilter', 'delpfilter'],
        'description': 'Delete a private chat filter',
        'category': 'Wa',
        'ban': true,
        'gcban': true,
        'owner': true,
        'execute': async (message, { ednut: client, text: textContent, isOwner: isOwner, example: example, LoadDataBase: LoadDataBase, isGroup: isGroup }) => {
            try {
                const parts = textContent.split('"');
                
                if (parts.length < 2) {
                    return message.reply(example('"trigger"'));
                }
                
                const trigger = parts[1].toLowerCase();
                
                if (!global.db.pfilters || !global.db.pfilters[trigger]) {
                    return message.reply('_pFilter not found_');
                }
                
                delete global.db.pfilters[trigger];
                
                message.reply(`_pFilter removed: ${trigger}_`);
                
            } catch (error) {
                console.error('Error in deletepfilter command:', error);
                await message.reply('❌ Error: ' + (error.message || error));
            }
        }
    }
];