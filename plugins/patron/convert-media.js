// convert-media.js - Media conversion functionality
const fs = require('fs');
const { exec } = require('child_process');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

module.exports = [
  {
    command: ['take'],
    alias: ['steal', 'stickertake', 'wm'],
    description: 'Steal a sticker with custom pack and author',
    category: 'Converter',
    ban: false,
    gcban: false,
    execute: async (message, {
      ednut,
      args,
      quoted,
      mime,
      fs,
      isOwner,
      reply
    }) => {
      try {
        if (!isOwner) {
          return reply('❌ Only the bot owner can use this command.');
        }

        if (!quoted) {
          return reply('Reply to a sticker');
        }

        if (!/webp/.test(mime)) {
          return reply('Reply to a sticker only');
        }

        const generateRandomName = (ext) => '' + Math.floor(Math.random() * 10000) + ext;
        
        let argsSplit = args.split(' ').join('|');
        let parts = argsSplit.split('|');
        
        let packName = parts[0] ? parts[0] : message.pushName;
        let authorName = typeof parts[1] !== 'undefined' ? parts[1] : '';

        let mediaPath = await ednut.downloadAndSaveMediaMessage(quoted);
        
        let sticker = new Sticker(mediaPath, {
          'pack': packName,
          'author': authorName,
          'type': StickerTypes.FULL,
          'categories': ['🤩', '🎉'],
          'id': '12345',
          'quality': 70,
          'background': '#FFFFFF00'
        });
        
        let outputName = generateRandomName('.webp');
        let outputPath = await sticker.toFile(outputName);
        let stickerBuffer = fs.readFileSync(outputPath);
        
        await ednut.sendMessage(message.chat, {
          'sticker': stickerBuffer
        }, {
          'quoted': message
        });
        
        fs.unlinkSync(outputName);
        fs.unlinkSync(mediaPath);
        
      } catch (error) {
        global.log('ERROR', 'Take command failed: ' + (error.message || error));
        reply('Failed to steal sticker.');
      }
    }
  },
  {
    command: ['toimg'],
    alias: ['toimage'],
    description: 'Convert sticker to image',
    category: 'Converter',
    ban: false,
    gcban: false,
    execute: async (message, {
      ednut,
      quoted,
      mime,
      fs,
      exec,
      reply
    }) => {
      try {
        if (!quoted) {
          return reply('Reply to a sticker');
        }

        if (!/webp/.test(mime)) {
          return reply('Reply to a sticker');
        }

        let mediaPath = await ednut.downloadAndSaveMediaMessage(quoted);
        let outputPath = 'converted.png';
        
        exec(`ffmpeg -i ${mediaPath} ${outputPath}`, (error) => {
          fs.unlinkSync(mediaPath);
          
          if (error) {
            global.log('ERROR', 'toimg ffmpeg error: ' + (error.message || error));
            return reply('Conversion failed.');
          }
          
          let imageBuffer = fs.readFileSync(outputPath);
          
          ednut.sendMessage(message.chat, {
            'image': imageBuffer
          }, {
            'quoted': message
          });
          
          fs.unlinkSync(outputPath);
        });
        
      } catch (error) {
        global.log('ERROR', 'toimg command failed: ' + (error.message || error));
        reply('Failed to convert sticker.');
      }
    }
  },
  {
    command: ['sticker'],
    alias: ['stik', 's'],
    description: 'Create a sticker from image or video',
    category: 'Converter',
    ban: false,
    gcban: false,
    async execute(message, {
      ednut,
      args,
      quoted,
      mime,
      fs,
      isOwner,
      reply
    }) {
      try {
        if (!isOwner) {
          return reply('❌ Only the bot owner can use this command.');
        }

        if (!quoted) {
          return reply('Reply to an image or video');
        }

        if (!/image|video/.test(mime)) {
          return reply('Reply to an image or video');
        }

        const generateRandomName = (ext) => '' + Math.floor(Math.random() * 10000) + ext;
        
        let argsSplit = args.split(' ').join('|');
        let parts = argsSplit.split('|');
        
        let packName = parts[0] ? parts[0] : global.packname;
        let authorName = parts[0] !== 'undefined' ? parts[1] : global.author;
        
        let mediaPath = await ednut.downloadAndSaveMediaMessage(quoted);
        
        let sticker = new Sticker(mediaPath, {
          'pack': packName,
          'author': authorName,
          'type': StickerTypes.FULL,
          'categories': ['🤩', '🎉'],
          'id': '12345',
          'quality': 70,
          'background': '#FFFFFF00'
        });
        
        let outputName = generateRandomName('.webp');
        let outputPath = await sticker.toFile(outputName);
        let stickerBuffer = fs.readFileSync(outputPath);
        
        await ednut.sendMessage(message.chat, {
          'sticker': stickerBuffer
        }, {
          'quoted': message
        });
        
        fs.unlinkSync(outputName);
        fs.unlinkSync(mediaPath);
        
      } catch (error) {
        global.log('ERROR', 'Sticker command failed: ' + (error.message || error));
        reply('Failed to create sticker.');
      }
    }
  }
];