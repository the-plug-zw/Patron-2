const axios = require('axios');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { Sequelize, DataTypes } = require('sequelize');

module.exports = {
    'command': 'update',
    'alias': ['upgrade', 'patronupdate'],
    'description': 'Update the bot to the latest version.',
    'category': 'Owner',
    'filename': __filename,
    
    async 'execute'(m, { ednut, reply, isOwner }) {
        if (!isOwner) return reply('*📛 This command is restricted to owners only.*');
        
        await ednut.sendMessage(m.chat, {
            'react': { 'text': '🔄', 'key': m.key }
        });
        
        const formatMessage = (text, emoji) => '*📛 ' + text + ' 卄 ' + emoji + '*';
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        
        const db = new Sequelize({
            'dialect': 'sqlite',
            'storage': path.join(__dirname, 'update.db'),
            'logging': false
        });
        
        const UpdateInfo = db.define('UpdateInfo', {
            'id': {
                'type': DataTypes.INTEGER,
                'primaryKey': true,
                'autoIncrement': false,
                'defaultValue': 1
            },
            'commitHash': {
                'type': DataTypes.STRING,
                'allowNull': false
            }
        }, {
            'tableName': 'update_info',
            'timestamps': false
        });
        
        await UpdateInfo.sync();
        
        async function getCurrentHash() {
            const record = await UpdateInfo.findByPk(1);
            return record ? record.commitHash : 'unknown';
        }
        
        async function updateHash(hash) {
            let record = await UpdateInfo.findByPk(1);
            if (!record) {
                record = await UpdateInfo.create({ 'id': 1, 'commitHash': hash });
            } else {
                record.commitHash = hash;
                await record.save();
            }
        }
        
        try {
            await reply(formatMessage('Checking Zed-Bot', '🔍'));
            
            const { data: commitData } = await axios.get('https://api.github.com/repos/hacker263/Zed-Bot3/commits/main');
            const currentHash = await getCurrentHash();
            
            if (currentHash === commitData.sha) {
                return reply(formatMessage('Already latest version', '✅'));
            }
            
            await reply(formatMessage('Updating Zed-Bot', '⚡'));
            
            const botDir = path.join(__dirname, '..', '..');
            const zipPath = path.join(botDir, 'update_temp.zip');
            const extractPath = path.join(botDir, 'temp_update');
            
            fs.writeFileSync(zipPath, (await axios.get('https://github.com/hacker263/Zed-Bot3/archive/main.zip', {
                'responseType': 'arraybuffer'
            })).data);
            
            new AdmZip(zipPath).extractAllTo(extractPath, true);
            copyFolderSync(path.join(extractPath, 'Zed-Bot3-main'), botDir);
            
            await updateHash(commitData.sha);
            fs.unlinkSync(zipPath);
            fs.rmSync(extractPath, { 'recursive': true });
            
            await reply(formatMessage('Updated! Restarting now...', '🔄'));
            await delay(1000);
            process.exit(0);
            
        } catch (err) {
            console.error('Update error:', err);
            reply(formatMessage('Update failed', '❌'));
        }
    }
};

function copyFolderSync(source, target) {
    if (!fs.existsSync(source)) return;
    
    fs.existsSync(target) || fs.mkdirSync(target, { 'recursive': true });
    
    fs.readdirSync(source).forEach(item => {
        const sourcePath = path.join(source, item);
        const targetPath = path.join(target, item);
        const ignoreFiles = ['config.js', 'app.json', '.env'];
        const isNodeModules = item.startsWith('node_modules');
        
        if (ignoreFiles.includes(item) || isNodeModules) return;
        
        fs.lstatSync(sourcePath).isDirectory() 
            ? copyFolderSync(sourcePath, targetPath)
            : fs.copyFileSync(sourcePath, targetPath);
    });
}