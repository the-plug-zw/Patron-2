// external-plugin.js
// Cleaned and deobfuscated version

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const DataBase = require('../../lib/database.js');

global.db = global.db || new DataBase(process.env.DATABASE_URL);

module.exports = {
    'command': ['install'],
    'description': 'Install a plugin from a raw GitHub URL',
    'category': 'External',
    'owner': true,
    'execute': async (message, { text, reply }) => {
        const githubRawUrl = 'https://raw.githubusercontent.com/';
        
        if (!text || !text.startsWith(githubRawUrl)) {
            return reply('Please provide a valid raw GitHub URL.\n\nExample:\ninstall https://raw.githubusercontent.com/user/repo/branch/path/plugin.js');
        }
        
        try {
            const response = await axios.get(text);
            const pluginContent = response.data;
            const fileName = text.split('/').pop();
            
            if (!fileName.endsWith('.js')) {
                return reply('Invalid file type. Only `.js` plugins are allowed.');
            }
            
            const pluginDir = path.resolve(__dirname, '../../plugins/patron');
            if (!fs.existsSync(pluginDir)) {
                fs.mkdirSync(pluginDir, { recursive: true });
            }
            
            const filePath = path.join(pluginDir, fileName);
            
            // Save to database
            global.db.plugins = global.db.plugins || {};
            global.db.plugins[fileName] = pluginContent;
            
            // Save to file system
            fs.writeFileSync(filePath, pluginContent, 'utf8');
            
            // Save database
            if (typeof global.db.save === 'function') {
                await global.db.save(global.db);
            }
            
            try {
                // Clear cache and require the plugin
                delete require.cache[require.resolve(filePath)];
                require(filePath);
                
                reply('✅ Plugin *' + fileName + '* installed and loaded.');
                global.log('INFO', 'Plugin installed: ' + fileName);
            } catch (loadError) {
                reply('⚠️ Plugin *' + fileName + '* saved, but failed to load. Check console.');
                global.log('ERROR', 'Plugin load error: ' + loadError.message);
            }
        } catch (error) {
            global.log('ERROR', 'Plugin install failed: ' + error.message);
            reply('❌ Failed to install plugin. Invalid URL or network error.');
        }
    }
};