// convert-url.js - URL conversion functionality
module.exports = [
  {
    command: ['tourl'],
    alias: ['url'],
    description: 'Upload media to URL',
    category: 'Converter',
    ban: false,
    gcban: false,
    execute: async (message, {
      ednut,
      reply,
      uploadImage
    }) => {
      try {
        const quotedMessage = message.quoted || message;
        const mimeType = (quotedMessage.msg || quotedMessage).mimetype || '';
        
        if (!mimeType) {
          return reply('No media found');
        }
        
        const mediaBuffer = await quotedMessage.download();
        const url = await uploadImage(mediaBuffer);
        
        reply(url);
        
      } catch (error) {
        global.log('ERROR', 'url command failed: ' + (error.message || error));
        reply('Failed to upload media.');
      }
    }
  },
  {
    command: ['shorturl'],
    alias: ['shorten', 'tinyurl', 'shortlink'],
    description: 'Shorten a URL',
    category: 'Converter',
    ban: false,
    gcban: false,
    execute: async (message, {
      ednut,
      text,
      axios,
      reply
    }) => {
      try {
        if (!text) {
          return reply('Enter a URL');
        }
        
        if (!text.startsWith('https://')) {
          return reply('Please input a valid link');
        }
        
        const response = await axios.get(
          'https://tinyurl.com/api-create.php?url=' + 
          encodeURIComponent(text)
        );
        
        reply(response.data.toString());
        
      } catch (error) {
        global.log('ERROR', 'shorturl command failed: ' + (error.message || error));
        reply('Failed to shorten the link.');
      }
    }
  }
];