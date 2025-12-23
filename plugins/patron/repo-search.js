const axios = require('axios');

module.exports = [{
    'command': ['searchrepo'],
    'alias': ['srepo'],
    'description': 'Fetch information about a GitHub repository.',
    'category': 'Other',
    'filename': __filename,
    'use': '<owner/repo>',
    'ban': true,
    'gcban': true,
    
    async 'execute'(m, { ednut, args, reply }) {
        try {
            if (!args || args.length === 0) return reply('❌ Please provide a GitHub repository in the format 📌 `owner/repo`.');
            
            const query = args.join(' ');
            const apiUrl = 'https://api.github.com/repos/' + query;
            const { data: repoData } = await axios.get(apiUrl);
            
            let responseText = '📁 *GitHub Repository Info* 📁\n\n';
            responseText += '📌 *Name*: ' + repoData.name + '\n';
            responseText += '🔗 *URL*: ' + repoData.html_url + '\n';
            responseText += '📝 *Description*: ' + (repoData.description || 'No description') + '\n';
            responseText += '⭐ *Stars*: ' + repoData.stargazers_count + '\n';
            responseText += '🍴 *Forks*: ' + repoData.forks_count + '\n';
            responseText += '👤 *Owner*: ' + repoData.owner.login + '\n';
            responseText += '📅 *Created At*: ' + new Date(repoData.created_at).toLocaleDateString() + '\n';
            responseText += '\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴTᴇᴄʨＸ* 🚹';
            
            await ednut.sendMessage(m.chat, {
                'text': responseText
            }, { 'quoted': m });
            
        } catch (err) {
            console.error('GitHub API Error:', err);
            reply('❌ Error fetching repository data: ' + (err.response?.data?.message || err.message));
        }
    }
}];