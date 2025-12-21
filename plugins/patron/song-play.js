const yts = require('youtube-yts');
const fetch = require('node-fetch');

module.exports = [{
    'command': ['song'],
    'alias': ['play', 'music', 'ytplay'],
    'description': 'Search and download YouTube audio',
    'category': 'Downloader',
    'filename': __filename,
    
    async 'execute'(m, { ednut, text, reply }) {
        try {
            if (!text) return reply('❌ Please enter the song name.');
            
            const searchResults = await yts(text);
            const video = searchResults.videos[0];
            
            if (!video) return reply('❌ No video found.');
            
            await reply('🎶 Fetching *' + video.title + ' ...');
            
            const apiUrl = 'https://api.zenzxz.my.id/api/downloader/ytmp3v2?url=' + encodeURIComponent(video.url);
            const response = await fetch(apiUrl);
            
            if (!response.ok) return reply('❌ Failed to fetch download link.');
            
            const data = await response.json();
            
            if (!data.status || !data.data?.download_url) {
                return reply('❌ Failed to fetch download link.');
            }
            
            const downloadUrl = data.data.download_url;
            
            await ednut.sendMessage(m.chat, {
                'audio': { 'url': downloadUrl },
                'mimetype': 'audio/mpeg',
                'fileName': data.data.title + '.mp3'
            }, { 'quoted': m });
            
        } catch (err) {
            reply('❌ Error: ' + err.message);
        }
    }
}];