// downloader-social.js - Social media downloader functionality
const axios = require('axios');

module.exports = [
  {
    command: ['insta'],
    alias: ['instagram', 'ig', 'igdl'],
    description: 'Download Instagram media',
    category: 'Downloader',
    ban: false,
    gcban: false,
    execute: async (message, {
      ednut,
      text,
      reply
    }) => {
      if (!text) {
        return reply('❎ Please input an Instagram link.');
      }

      if (!text.includes('instagram.com')) {
        return reply('❎ Input a valid Instagram link!');
      }

      try {
        const apiUrl = 'https://delirius-apiofc.vercel.app/download/instagram?url=' + 
          encodeURIComponent(text);
        
        const { data } = await axios.get(apiUrl);
        
        if (!data || !data.status || !data.data || !data.data.length) {
          return reply('⚠️ Could not retrieve any media.');
        }

        reply('⏳ Downloading... Please wait 🚀\n\n📥 Found ' + 
          data.data.length + ' file(s)');
        
        for (let i = 0; i < data.data.length; i++) {
          let media = data.data[i];
          let caption = media.type === 'video' 
            ? '🎬 Video ' + (i + 1) + '/' + data.data.length
            : '📸 Image ' + (i + 1) + '/' + data.data.length;
          
          await ednut.sendMessage(message.chat, {
            [media.type === 'video' ? 'video' : 'image']: {
              'url': media.url
            },
            'caption': caption
          }, {
            'quoted': message
          });
        }
        
      } catch (error) {
        global.log('ERROR', 'Instagram downloader: ' + (error.message || error));
        reply('❎ Instagram download failed.');
      }
    }
  },
  {
    command: ['facebook2'],
    alias: ['fb2', 'fbvid2', 'fbvideo2'],
    description: 'Download Facebook media',
    category: 'Downloader',
    ban: false,
    gcban: false,
    execute: async (message, {
      ednut,
      axios,
      text,
      reply
    }) => {
      try {
        if (!text) {
          return reply('Please provide a Facebook video link.');
        }

        if (!/(facebook\.com|fb\.watch)/.test(text)) {
          return reply('Invalid Facebook link!');
        }

        const apiUrl = 'https://fb.bdbots.xyz/dl?url=' + encodeURIComponent(text);
        const { data } = await axios.get(apiUrl);
        
        if (data.status !== 'success' || !data.data || !data.data.length) {
          return reply('❌ Facebook download failed.');
        }

        const videoUrl = data.data.find(item => item.quality === 'HD')?.url || 
          data.data[0].url;
        
        const videoTitle = data.title || 'Facebook Video';
        
        await ednut.sendMessage(message.chat, {
          'video': {
            'url': videoUrl
          },
          'caption': '🎥 *' + videoTitle + '*\n' + global.footer
        }, {
          'quoted': message
        });
        
      } catch (error) {
        global.log('ERROR', 'Facebook downloader failed: ' + error.message);
        reply('❌ Facebook download failed.');
      }
    }
  },
  {
    command: ['tiktok'],
    alias: ['tt', 'ttvid'],
    description: 'Download TikTok video',
    category: 'Downloader',
    ban: true,
    execute: async (message, {
      ednut,
      api,
      text,
      reply
    }) => {
      if (!text) {
        return reply('Please input a TikTok link.');
      }

      if (!text.includes('tiktok.com') && !text.includes('vm.tiktok.com')) {
        return reply('Invalid TikTok link!');
      }

      try {
        let result = await api.tiktok(text);
        let footer = global.footer;
        
        if (result.images && result.images.length > 0) {
          for (let imageUrl of result.images) {
            await ednut.sendMessage(message.chat, {
              'image': {
                'url': imageUrl
              },
              'caption': footer
            }, {
              'quoted': message
            });
          }
        } else {
          await ednut.sendMessage(message.chat, {
            'video': {
              'url': result.video
            },
            'mimetype': 'video/mp4',
            'caption': footer
          }, {
            'quoted': message
          });
        }
        
      } catch (error) {
        global.log('ERROR', 'TikTok downloader: ' + (error.message || error));
        reply('TikTok download failed.');
      }
    }
  },
  {
    command: ['tiktokmp3'],
    alias: ['ttmp3', 'tiktoksound'],
    description: 'Download TikTok audio',
    category: 'Downloader',
    ban: false,
    gcban: false,
    execute: async (message, {
      ednut,
      tiktokDl,
      text,
      reply
    }) => {
      if (!text) {
        return reply('Please input a TikTok link.');
      }

      if (!text.startsWith('https://')) {
        return reply('Invalid TikTok link.');
      }

      try {
        let result = await tiktokDl(text);
        
        if (!result?.status) {
          return reply('Audio not found.');
        }

        await ednut.sendMessage(message.chat, {
          'audio': {
            'url': result.music_info.url
          },
          'mimetype': 'audio/mpeg'
        }, {
          'quoted': message
        });
        
      } catch (error) {
        global.log('ERROR', 'TikTok MP3: ' + (error.message || error));
        reply('TikTok audio download failed.');
      }
    }
  },
  {
    command: ['shortlink-dl'],
    description: 'Download media from a shortened link',
    category: 'Downloader',
    ban: false,
    gcban: false,
    execute: async (message, {
      ednut,
      fetch,
      text,
      isUrl,
      reply
    }) => {
      if (!text) {
        return reply('Please input a URL.');
      }

      if (!isUrl(text)) {
        return reply('Invalid URL.');
      }

      try {
        let response = await fetch(
          'https://moneyblink.com/st/?api=524de9dbd18357810a9e6b76810ace32d81a7d5f&url=' + text
        );
        
        let data = await response.json();
        
        await ednut.sendMessage(message.chat, {
          'text': data.url
        }, {
          'quoted': message
        });
        
      } catch (error) {
        global.log('ERROR', 'Shortlink-DL: ' + (error.message || error));
        reply('Failed to process shortlink.');
      }
    }
  }
];