// convert-smeme.js - Sticker meme creation functionality
const fetch = require('node-fetch');
const FormData = require('form-data');
const fileType = require('file-type');
const WSF = require('wa-sticker-formatter');

module.exports = {
  command: ['smeme'],
  description: 'Create a sticker meme from an image and text',
  category: 'Converter',
  ban: false,
  gcban: false,
  execute: async (message, {
    text,
    ednut,
    reply
  }) => {
    try {
      const textParts = text.split('|');
      const topText = textParts[0]?.trim() || ' ';
      const bottomText = textParts[1]?.trim() || ' ';
      
      const quotedMessage = message.quoted || message;
      const mediaMime = (quotedMessage.mimetype || quotedMessage).mimetype || '';
      
      if (!mediaMime) {
        return reply('Reply to an image with:\n\nsmeme Top Text | Bottom Text');
      }
      
      if (!/image\/(jpe?g|png|webp)/.test(mediaMime)) {
        return reply('Unsupported image type: ' + mediaMime);
      }
      
      const mediaBuffer = await quotedMessage.download();
      
      if (!mediaBuffer) {
        throw new Error('Failed to download image');
      }
      
      // Upload image to temp file service
      const fileTypeInfo = await fileType.fromBuffer(mediaBuffer);
      if (!fileTypeInfo || !fileTypeInfo.ext) {
        throw new Error('Failed to detect file type');
      }
      
      const form = new FormData();
      form.append('file', mediaBuffer, `file.${fileTypeInfo.ext}`);
      
      const uploadResponse = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: form,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
      
      const uploadData = await uploadResponse.json();
      
      if (!uploadData?.data?.url) {
        throw new Error('Failed to upload image');
      }
      
      const urlMatch = /https?:\/\/tmpfiles\.org\/(.*)/.exec(uploadData.data.url);
      const imageUrl = 'https://tmpfiles.org/dl/' + urlMatch[1];
      
      // Create meme using memegen API
      const memeUrl = 'https://api.memegen.link/images/custom/' + 
        encodeURIComponent(bottomText) + '/' + 
        encodeURIComponent(topText) + '.png?background=' + 
        encodeURIComponent(imageUrl);
      
      // Create sticker from meme
      const sticker = await new WSF.Sticker(memeUrl, {
        type: 'full',
        pack: global.packname,
        author: global.author,
        categories: ['']
      }).build();
      
      if (sticker) {
        await ednut.sendFile(message.chat, sticker, 'meme.webp', 'text', message, {
          mimetype: 'image/webp'
        });
      } else {
        reply('Error processing sticker meme.');
      }
      
    } catch (error) {
      global.log('ERROR', 'Smeme command error: ' + (error.message || error));
      reply('Failed to create sticker');
    }
  }
};