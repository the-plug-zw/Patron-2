const yts = require('youtube-yts');

module.exports = [
    {
        'command': 'ytsearch',
        'alias': ['yts'],
        'description': 'Search YouTube and return the top 5 results',
        'category': 'Downloader',
        'filename': __filename,
        async execute(message, { text: query, reply: replyFunc }) {
            try {
                if (!query) {
                    return replyFunc('❌ Please provide a search query.\n\nExample: .ytsearch lo-fi beats');
                }
                
                const searchResults = await yts(query);
                
                if (!searchResults || !searchResults.videos || searchResults.videos.length === 0) {
                    return replyFunc('⚠️ No results found.');
                }
                
                const topResults = searchResults.videos.slice(0, 5);
                let resultText = `🎵 Top 5 results for "${query}":\n\n`;
                
                topResults.forEach((video, index) => {
                    resultText += `${index + 1}. ${video.title}\n`;
                    resultText += `🔗 Link: ${video.url}\n`;
                    resultText += `👀 Views: ${video.views.toLocaleString()}\n`;
                    resultText += `⏱ Duration: ${video.timestamp}\n\n`;
                });
                
                message.reply(resultText);
                
            } catch (error) {
                console.error('error', error);
                replyFunc('❌ An error occurred while searching YouTube.');
            }
        }
    }
];