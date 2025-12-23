const axios = require('axios');

module.exports = [{
    'command': ['quote'],
    'description': 'Get a random inspiring quote.',
    'category': 'Fun',
    'filename': __filename,
    'ban': true,
    'gcban': true,
    
    async 'execute'(m, { ednut, reply }) {
        try {
            const response = await axios.get('https://zenquotes.io/api/random');
            const { q: quote, a: author } = response.data[0];
            
            const quoteText = '💬 *"' + quote + '"\n- ' + author + '*\n\n> *QUOTES BY Zed-Bot*';
            
            await ednut.sendMessage(m.chat, {
                'text': quoteText
            }, { 'quoted': m });
            
        } catch (err) {
            console.error('Error fetching quote:', err);
            reply('⚠️ Couldn\'t fetch quote. Check your internet or logs.');
        }
    }
}];