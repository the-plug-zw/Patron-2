// downloader-youtube.js - YouTube downloader functionality
const yts = require('youtube-yts');
const axios = require('axios');

module.exports = [
  {
    command: ['yta'],
    alias: ['ytmp3', 'ytaudio'],
    description: 'Download YouTube audio (MP3)',
    category: 'Downloader',
    ban: false,
    gcban: false,
    execute: async (message, {
      ednut,
      text,
      reply
    }) => {
      if (!text) {
        return reply('❌ Please provide a YouTube video link.');
      }

      if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
        return reply('❌ Invalid YouTube link!');
      }

      try {
        await reply('⏳ Fetching MP3...');
        
        const apiUrl = 'https://api.zenzxz.my.id/api/downloader/ytmp3v2?url=' + 
          encodeURIComponent(text);
        
        const { data } = await axios.get(apiUrl);
        
        if (!data.success || !data.data?.download_url) {
          return reply('❌ Failed to fetch audio.');
        }

        const audioInfo = data.data;
        
        await ednut.sendMessage(message.chat, {
          'audio': {
            'url': audioInfo.download_url
          },
          'mimetype': 'audio/mpeg',
          'fileName': audioInfo.title + '.mp3'
        }, {
          'quoted': message
        });
        
      } catch (error) {
        console.log('yta error:', error.response?.data || error.message);
        reply('❌ An error occurred while downloading the audio.');
      }
    }
  },
  {
    command: ['ytv'],
    alias: ['ytmp4', 'ytvideo', 'mp4'],
    description: 'Download YouTube video as MP4',
    category: 'Downloader',
    ban: false,
    gcban: false,
    async execute(message, {
      ednut,
      text,
      reply
    }) {
      if (!text) {
        return reply('❌ Please provide a YouTube video link.');
      }

      if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
        return reply('❌ Invalid YouTube link!');
      }

      try {
        await reply('⏳ Fetching MP4 (360p)...');
        
        const apiUrl = 'https://api.zenzxz.my.id/api/downloader/ytmp4v2?url=' + 
          encodeURIComponent(text) + 
          '&resolution=360';
        
        const { data } = await axios.get(apiUrl);
        
        if (!data.success || !data.data?.download_url) {
          return reply('❌ Failed to fetch MP4 download link.');
        }

        const videoInfo = data.data;
        
        await ednut.sendMessage(message.chat, {
          'video': {
            'url': videoInfo.download_url
          },
          'mimetype': 'video/mp4',
          'caption': '🎬 *' + videoInfo.title + 
            '*\n📺 480p\n🕒 Duration: ' + videoInfo.duration + 's'
        }, {
          'quoted': message
        });
        
      } catch (error) {
        console.log('video error:', error.response?.data || error.message);
        reply('❌ An error occurred while downloading the video.');
      }
    }
  },
  {
    command: ['ytg'],
    alias: ['ytgrab'],
    description: 'Search and download YouTube video',
    category: 'Downloader',
    ban: false,
    gcban: false,
    async execute(message, {
      ednut,
      text,
      reply
    }) {
      if (!text) {
        return reply('❌ Please provide a video name to search.');
      }

      try {
        const searchResults = await yts(text);
        const video = searchResults.videos?.[0];
        
        if (!video) {
          return reply('❌ No video found.');
        }

        await reply('🔍 Found: *' + video.title + '*\n▶️ Fetching MP4 (360p)...');
        
        const videoUrl = video.url;
        const apiUrl = 'https://api.zenzxz.my.id/api/downloader/ytmp4v2?url=' + 
          encodeURIComponent(videoUrl) + 
          '&resolution=360';
        
        const { data } = await axios.get(apiUrl);
        
        if (!data.success || !data.data?.download_url) {
          return reply('❌ Failed to fetch video link.');
        }

        const videoInfo = data.data;
        
        await ednut.sendMessage(message.chat, {
          'video': {
            'url': videoInfo.download_url
          },
          'mimetype': 'video/mp4',
          'caption': '🎬 *' + videoInfo.title + 
            '*\n🕒 Duration: ' + videoInfo.duration + 's'
        }, {
          'quoted': message
        });
        
      } catch (error) {
        console.log('ytg error:', error.response?.data || error.message);
        reply('❌ An error occurred while downloading the video.');
      }
    }
  }
];