// downloader-pin.js - Pinterest downloader functionality
module.exports = [
  {
    command: ['img'],
    alias: ['pinterest'],
    description: 'Download Pinterest images from a search query (e.g. "img cat 5")',
    category: 'Downloader',
    ban: false,
    gcban: false,
    execute: async (message, {
      ednut,
      pinterest,
      text,
      reply
    }) => {
      try {
        if (!text) {
          return reply('Please provide a search query.');
        }

        let [query, countStr] = text.split(' ');
        let limit = 3; // Default limit
        
        if (text.includes(' ')) {
          const lastWord = text.trim().split(' ').pop();
          !isNaN(lastWord) 
            ? (limit = parseInt(lastWord), query = text.trim().split(' ').slice(0, -1).join(' '))
            : query = text;
        }

        const results = await pinterest(query);
        
        if (!results.length) {
          return reply('No results found for *' + query + '*.');
        }

        const maxResults = Math.min(results.length, limit);
        
        for (let i = 0; i < maxResults; i++) {
          const image = results[i];
          
          await ednut.sendMessage(message.chat, {
            'image': {
              'url': image.url
            },
            'caption': global.footer
          }, {
            'quoted': message
          });
          
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        global.log('ERROR', 'img command failed: ' + (error.message || error));
        reply('An error occurred while fetching Pinterest images.');
      }
    }
  },
  {
    command: ['pindl'],
    alias: ['pin', 'pinterestdl'],
    description: 'Download Pinterest media from a pin URL',
    category: 'Downloader',
    ban: false,
    gcban: false,
    execute: async (message, {
      ednut,
      pinDL,
      lookup,
      text,
      reply
    }) => {
      try {
        if (!text) {
          return reply('Enter a valid URL\n\nExample: ' + global.prefix + 'pindl https://pin.it/xxxxxxx');
        }

        const mediaData = await pinDL(text);
        
        if (!mediaData?.data?.length) {
          return reply('No media found for this link.');
        }

        for (let media of mediaData.data) {
          const mediaType = lookup(media.url);
          
          await ednut.sendMessage(message.chat, {
            [mediaType.split('/')[0]]: {
              'url': media.url
            },
            'caption': global.footer
          }, {
            'quoted': message
          });
        }
        
      } catch (error) {
        global.log('ERROR', 'pindl command failed: ' + (error.message || error));
        reply('Failed to download from Pinterest.');
      }
    }
  }
];