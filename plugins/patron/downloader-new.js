// downloader-new.js - Additional downloader functionality (Spotify, Capcut, Twitter/X)
const axios = require('axios');

module.exports = [
  {
    command: ['spotify'],
    alias: ['spot', 'spplay'],
    description: 'Download and play a song from Spotify',
    category: 'Downloader',
    filename: __filename,
    async execute(message, {
      ednut,
      text,
      reply
    }) {
      try {
        if (!text) {
          return reply('❌ Please provide a Spotify song name to search.');
        }

        await reply('⏳ Searching on Spotify...\n🎵 Query: *' + text + '*');
        
        const searchUrl = 'https://delirius-apiofc.vercel.app/search/spotify?q=' + 
          encodeURIComponent(text) + '&limit=1';
        
        const { data } = await axios.get(searchUrl);
        
        if (!data.status || !data.data?.length) {
          return reply('❌ No results found on Spotify.');
        }

        const song = data.data[0];
        const songUrl = song.url;
        
        await reply('📥 Found: *' + song.title + '* by *' + song.artist + '*\n▶️ Downloading...');
        
        const downloadUrl = 'https://delirius-apiofc.vercel.app/download/spotifydl?url=' + 
          encodeURIComponent(songUrl);
        
        const { data: downloadData } = await axios.get(downloadUrl);
        
        if (!downloadData.status || !downloadData.data?.url) {
          return reply('❌ Failed to download song.');
        }

        const audioUrl = downloadData.data.url;
        
        await ednut.sendMessage(message.chat, {
          'audio': {
            'url': audioUrl
          },
          'mimetype': 'audio/mpeg',
          'fileName': downloadData.data.title + ' - ' + downloadData.data.author + '.mp3',
          'ptt': false
        }, {
          'quoted': message
        });
        
      } catch (error) {
        await reply('⚠️ Error: ' + (error.message || error));
      }
    }
  },
  {
    command: ['capcut'],
    description: 'Download Capcut video by URL',
    category: 'Downloader',
    ban: true,
    gcban: true,
    async execute(message, {
      ednut,
      text,
      reply
    }) {
      try {
        if (!text || !/^https?:\/\/.*capcut\.com/.test(text)) {
          return reply('❌ Please provide a valid Capcut template URL.');
        }

        const fetch = require('node-fetch');
        const response = await fetch(
          'https://api.yogik.id/downloader/capcut?url=' + 
          encodeURIComponent(text)
        );
        
        const data = await response.json();
        
        if (!data.status || !data.result?.videoUrl) {
          return reply('❌ Failed to fetch Capcut video.');
        }

        await ednut.sendMessage(message.chat, {
          'video': {
            'url': data.result.videoUrl
          },
          'caption': global.footer
        }, {
          'quoted': message
        });
        
      } catch (error) {
        global.log('ERROR', 'Capcut plugin failed: ' + (error.message || error));
        reply('❌ Error occurred while processing the Capcut link.');
      }
    }
  },
  {
    command: ['twitter'],
    alias: ['x'],
    description: 'Download Twitter/X video',
    category: 'Downloader',
    ban: true,
    gcban: true,
    async execute(message, {
      ednut,
      text,
      fetch,
      reply
    }) {
      if (!text || !text.includes('twitter.com') && !text.includes('x.com')) {
        return reply('❌ Please send a valid Twitter/X link.');
      }

      try {
        const response = await fetch(
          'https://archive.lick.eu.org/api/download/twitterx?url=' + 
          encodeURIComponent(text)
        );
        
        const data = await response.json();
        
        if (!data.status || !data.result?.downloads?.length) {
          return reply('❌ No valid video found.');
        }

        const videoData = data.result.downloads.find(item => 
          item.quality.includes('MP4')
        ) || data.result.downloads[0];
        
        if (!videoData.url) {
          return reply('❌ No valid video found.');
        }

        await ednut.sendMessage(message.chat, {
          'video': {
            'url': videoData.url
          },
          'caption': global.footer
        }, {
          'quoted': message
        });
        
      } catch (error) {
        global.log('ERROR', 'Twitter plugin failed: ' + (error.message || error));
        reply('❌ An error occurred while processing the Twitter link.');
      }
    }
  }
];