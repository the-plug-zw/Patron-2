const { fetchJson } = require('../../lib/myfunc.js');

module.exports = [{
    'command': ['fetch'],
    'alias': ['api'],
    'description': 'Fetch data from a provided URL or API',
    'category': 'Tool',
    'filename': __filename,

    async 'execute'(m, { ednut, from, quoted, body, args, reply }) {
        // Safety check for ednut
        if (!ednut || typeof ednut.sendMessage !== 'function') {
            if (reply) reply('❌ Connection not available');
            return;
        }
        try {
            await ednut.sendMessage(m.key.remoteJid, {
                'react': { 'text': '🌐', 'key': m.key }
            });

            const url = args.join(' ').trim();
            if (!url) return reply('❌ Please provide a valid URL or query.');
            if (!/^https?:\/\//.test(url)) return reply('❌ URL must start with http:// or https://.');

            const fetchedData = await fetchJson(url);
            const formattedData = JSON.stringify(fetchedData, null, 2);

            await ednut.sendMessage(from, {
                'text': '🔍 *Fetched Data*:\n```' + formattedData.slice(0, 2048) + '```',
                'contextInfo': {
                    'mentionedJid': [m.sender],
                    'forwardingScore': 2,
                    'isForwarded': true,
                    'forwardingSourceMessage': 'Your Data Request'
                }
            }, { 'quoted': m });

        } catch (err) {
            console.error('Error in fetch command:', err);
            reply('❌ An error occurred:\n' + err.message);
        }
    }
}];