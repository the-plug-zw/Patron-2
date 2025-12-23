const moduleExports = [
    {
        'command': ['gfilter'],
        'alias': ['addgfilter'],
        'description': 'Add a global filter',
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
                
                if (!global.db.gfilters) {
                    global.db.gfilters = {};
                }
                
                global.db.gfilters[trigger] = response;
                
                message.reply(`_Gfilter added: ${trigger} -> ${response}_`);
                
            } catch (error) {
                console.error('Error in gfilter command:', error);
                await message.reply('❌ Error: ' + (error.message || error));
            }
        }
    },
    {
        'command': ['listgfilter'],
        'alias': ['gfilters'],
        'description': 'List all global filters',
        'category': 'Wa',
        'ban': true,
        'gcban': true,
        'owner': true,
        'execute': async (message, { ednut: client, text: textContent, isOwner: isOwner, example: example, LoadDataBase: LoadDataBase, isGroup: isGroup }) => {
            try {
                if (!global.db.gfilters || !Object.keys(global.db.gfilters).length) {
                    return message.reply('_No gfilters set_');
                }
                
                const filterList = Object.keys(global.db.gfilters)
                    .map(trigger => `${trigger} -> ${global.db.gfilters[trigger]}`)
                    .join('\n');
                
                message.reply(`_Gfilters_:\n${filterList}`);
                
            } catch (error) {
                console.error('Error in listgfilter command:', error);
                await message.reply('❌ Error: ' + (error.message || error));
            }
        }
    },
    {
        'command': ['removegfilter'],
        'alias': ['deletegfilter', 'delgfilter'],
        'description': 'Delete a global filter',
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
                
                if (!global.db.gfilters || !global.db.gfilters[trigger]) {
                    return message.reply('_Gfilter not found_');
                }
                
                delete global.db.gfilters[trigger];
                
                message.reply(`_Gfilter removed: ${trigger}_`);
                
            } catch (error) {
                console.error('Error in removegfilter command:', error);
                await message.reply('❌ Error: ' + (error.message || error));
            }
        }
    }
];

module.exports = moduleExports;