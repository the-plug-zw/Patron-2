const axios = require('axios');

const HEROKU_API_KEY = process.env.HEROKU_API_KEY;
const HEROKU_APP_NAME = process.env.HEROKU_APP_NAME;

async function herokuSetVar(key, value) {
    await axios.patch(
        'https://api.heroku.com/apps/' + HEROKU_APP_NAME + '/config-vars',
        { [key]: value },
        {
            headers: {
                'Authorization': 'Bearer ' + HEROKU_API_KEY,
                'Accept': 'application/vnd.heroku+json; version=3',
                'Content-Type': 'application/json'
            }
        }
    );
}

async function herokuDelVar(key) {
    await axios.patch(
        'https://api.heroku.com/apps/' + HEROKU_APP_NAME + '/config-vars',
        { [key]: null },
        {
            headers: {
                'Authorization': 'Bearer ' + HEROKU_API_KEY,
                'Accept': 'application/vnd.heroku+json; version=3',
                'Content-Type': 'application/json'
            }
        }
    );
}

async function herokuGetVars() {
    const response = await axios.get(
        'https://api.heroku.com/apps/' + HEROKU_APP_NAME + '/config-vars',
        {
            headers: {
                'Authorization': 'Bearer ' + HEROKU_API_KEY,
                'Accept': 'application/vnd.heroku+json; version=3'
            }
        }
    );
    return response.data;
}

module.exports = [
    {
        command: ['setvar'],
        description: 'Set environment variable (Heroku only)',
        category: 'External',
        owner: true,
        execute: async (message, { text, reply: reply2 }) => {
            // Add reply method if not available
            if (!message.reply && typeof reply2 === 'function') {
                message.reply = reply2;
            }

            const [key, ...valueParts] = text ? text.split('=') : [];
            const value = valueParts.join('=').trim();

            if (!key || !value) {
                if (message.reply) return message.reply('Usage: setvar KEY=value');
                return;
            }

            if (!HEROKU_API_KEY || !HEROKU_APP_NAME) {
                return message.reply('Heroku API credentials not set.');
            }

            try {
                await herokuSetVar(key.trim(), value);
                message.reply('Set `' + key.trim() + '` on Heroku.');
            } catch {
                message.reply('Failed to set variable on Heroku.');
            }
        }
    },
    {
        command: ['getvar'],
        alias: ['listvar'],
        description: 'List environment variables (Heroku only)',
        category: 'External',
        owner: true,
        execute: async (message) => {
            if (!HEROKU_API_KEY || !HEROKU_APP_NAME) {
                return message.reply('Heroku API credentials not set.');
            }

            try {
                const variables = await herokuGetVars();
                const varList = Object.entries(variables)
                    .map(([key, value]) => key + '=' + value)
                    .join('\n');
                message.reply(varList || 'No Heroku vars found.');
            } catch {
                message.reply('Failed to get variables from Heroku.');
            }
        }
    },
    {
        command: ['delvar'],
        description: 'Delete environment variable (Heroku only)',
        category: 'External',
        owner: true,
        execute: async (message, { text }) => {
            const key = text.trim();
            if (!key) return message.reply('Usage: delvar KEY');

            if (!HEROKU_API_KEY || !HEROKU_APP_NAME) {
                return message.reply('Heroku API credentials not set.');
            }

            try {
                await herokuDelVar(key);
                message.reply('Deleted *' + key + ' from Heroku.');
            } catch {
                message.reply('Failed to delete variable from Heroku.');
            }
        }
    }
];