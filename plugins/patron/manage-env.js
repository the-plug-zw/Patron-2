const fs = require('fs');
const path = require('path');

function updateEnv(key, value) {
    const envPath = path.resolve(__dirname, '../../.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    if (new RegExp('^' + key + '=', 'm').test(envContent)) {
        envContent = envContent.replace(new RegExp('^' + key + '=.*', 'm'), key + '=' + value);
    } else {
        envContent += '\n' + key + '=' + value;
    }

    fs.writeFileSync(envPath, envContent);
    process.env[key] = value;
}

const allowedKeysInfo = {
    'OWNER_NUMBER': 'Your WhatsApp number in international format, e.g., 2348012345678',
    'BOT_NAME': "The bot's display name, e.g., Zed - Bot",
    'OWNER_NAME': 'Your name or display name, e.g., Hxcker-263',
    'PACK_NAME': 'Sticker pack name, e.g., MyPack',
    'PREFIX': 'Command prefix, choose from: ., !, ?, /, ,, *, +',
    'WARN': 'Maximum number of warnings allowed, e.g., 3 or 4'
};

const allowedKeys = Object.keys(allowedKeysInfo);
const allowedPrefixes = ['.', '!', '?', '/', ',', '*', '+'];

module.exports = [
    {
        command: ['setenv'],
        alias: ['updateenv'],
        description: 'Update bot settings',
        category: 'EnvManager',
        use: '<key> <value>',
        filename: __filename,
        async execute(message, { q, reply, isOwner }) {
            if (!isOwner) {
                return reply('❌ Only the bot owner can use this command.');
            }

            if (!q) {
                let helpText = '❌ Usage: setenv <key> <value>\n✅ Allowed keys:\n';
                allowedKeys.forEach(key => {
                    helpText += '• ' + key + ': ' + allowedKeysInfo[key] + '\n';
                });
                helpText += '\nExample: .setenv BOT_NAME ᴘᴀᴛʀᴏɴ ᴍᴅ';
                return reply(helpText);
            }

            const [keyInput, ...valueParts] = q.split(' ');
            let value = valueParts.join(' ').trim();
            const key = keyInput.toUpperCase();

            if (!key || !value) {
                let helpText = '❌ Usage: setenv <key> <value>\n✅ Allowed keys:\n';
                allowedKeys.forEach(key => {
                    helpText += '• ' + key + ': ' + allowedKeysInfo[key] + '\n';
                });
                helpText += '\nExample: .setenv BOT_NAME ᴘᴀᴛʀᴏɴ ᴍᴅ';
                return reply(helpText);
            }

            if (!allowedKeys.includes(key)) {
                return reply('❌ Key not allowed. Allowed keys: ' + allowedKeys.join(', '));
            }

            if (key === 'OWNER_NUMBER') {
                value = value.replace(/^\+/, '');
                if (!/^\d+$/.test(value)) {
                    return reply('❌ Invalid number format. Please enter digits only, e.g., 2348012345678');
                }
            }

            if (key === 'PREFIX' && !allowedPrefixes.includes(value)) {
                return reply('❌ Invalid prefix. Allowed values: ' + allowedPrefixes.join(' '));
            }

            updateEnv(key, value);
            await reply('✅ ' + key + ' updated to: ' + value + '\n♻️ Restarting bot...');
            process.exit(0);
        }
    },
    {
        command: ['envinfo'],
        alias: ['getenv', 'showenv'],
        description: 'Show current bot settings',
        category: 'EnvManager',
        filename: __filename,
        async execute(message, { reply }) {
            const envInfo = `
🌍 *Environment Config*
──────────────────────────
👑 OWNER_NUMBER: ${process.env.OWNER_NUMBER || 'Not set'}
🤖 BOT_NAME: ${process.env.BOT_NAME || 'Not set'}
🙍 OWNER_NAME: ${process.env.OWNER_NAME || 'Not set'}
📦 PACK_NAME: ${process.env.PACK_NAME || 'Not set'}
📌 PREFIX: ${process.env.PREFIX || 'Not set'}
⚠️ WARN: ${process.env.WARN || 'Not set'}
──────────────────────────
            `.trim();

            await reply(envInfo);
        }
    }
];