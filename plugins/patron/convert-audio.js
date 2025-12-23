// convert-audio.js - Cleaned version

const fs = require('fs');
const { exec } = require('child_process');

module.exports = [
  {
    command: ['toaudio'],
    alias: ['tomp3', 'toaud'],
    description: 'Convert sound to audio',
    category: 'Converter',
    ban: false,
    gcban: false,
    execute: async (message, {
      ednut,
      quoted,
      mime,
      toAudio,
      reply
    }) => {
      if (!quoted) return reply('Reply to a video or audio');
      
      if (!/video/.test(mime) && !/audio/.test(mime)) {
        return reply('Reply to a video or audio');
      }
      
      let mediaBuffer = await quoted.downloadAndSaveMediaMessage();
      let audioBuffer = await toAudio(mediaBuffer, 'mp3');
      
      await ednut.sendMessage(message.chat, {
        'audio': audioBuffer,
        'mimetype': 'audio/mpeg'
      }, {
        'quoted': message
      });
    }
  },
  
  {
    command: ['tovn'],
    alias: ['voicenote', 'toptt'],
    description: 'Convert sound to voice note',
    category: 'Converter',
    ban: false,
    gcban: false,
    execute: async (message, {
      ednut,
      quoted,
      mime,
      toPTT,
      reply
    }) => {
      if (!quoted) return reply('Reply to a video or audio');
      
      if (!/video/.test(mime) && !/audio/.test(mime)) {
        return reply('Reply to a video or audio');
      }
      
      let mediaBuffer = await quoted.download();
      let pttAudio = await toPTT(mediaBuffer, 'mp4');
      
      await ednut.sendMessage(message.chat, {
        'audio': pttAudio,
        'mimetype': 'audio/mpeg',
        'ptt': true
      }, {
        'quoted': message
      });
    }
  },
  
  {
    command: ['bass', 'blown', 'deep', 'earrape', 'fast', 'fat', 'nightcore', 'reverse', 'robot', 'slow', 'smooth', 'squirrel'],
    description: 'Apply audio effects',
    category: 'Converter',
    ban: false,
    gcban: false,
    execute: async (message, {
      ednut,
      quoted,
      mime,
      command,
      getRandom,
      fs,
      exec,
      reply
    }) => {
      if (!quoted) return reply('Reply to an audio');
      
      if (!/audio/.test(mime)) return reply('Reply to an audio');
      
      let effectFilter;
      
      // Determine which effect to apply based on the command
      if (/bass/.test(command)) {
        effectFilter = '-af equalizer=f=54:width_type=o:width=2:g=20';
      } else if (/blown/.test(command)) {
        effectFilter = '-af acrusher=.1:1:64:0:log';
      } else if (/deep/.test(command)) {
        effectFilter = '-filter:a "atempo=0.7,asetrate=44100"';
      } else if (/earrape/.test(command)) {
        effectFilter = '-af volume=12';
      } else if (/fast/.test(command)) {
        effectFilter = '-filter:a "atempo=1.6,asetrate=22100"';
      } else if (/fat/.test(command)) {
        effectFilter = '-filter:a "atempo=1.63,asetrate=44100"';
      } else if (/nightcore/.test(command)) {
        effectFilter = '-filter:a atempo=1.06,asetrate=44100*1.25';
      } else if (/reverse/.test(command)) {
        effectFilter = '-filter_complex "areverse"';
      } else if (/robot/.test(command)) {
        effectFilter = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"';
      } else if (/slow/.test(command)) {
        effectFilter = '-filter:a "atempo=0.5,asetrate=65100"';
      } else if (/smooth/.test(command)) {
        effectFilter = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"';
      } else if (/squirrel/.test(command)) {
        effectFilter = '-af atempo=4/4,asetrate=44500*2/3';
      }
      
      let mediaPath = await ednut.download(quoted);
      let outputPath = getRandom('.mp3');
      
      // Execute FFmpeg command to apply the effect
      exec(`ffmpeg -i ${mediaPath} ${effectFilter} ${outputPath}`, (error, stdout, stderr) => {
        fs.unlinkSync(mediaPath);
        
        if (error) return reply(error);
        
        let audioBuffer = fs.readFileSync(outputPath);
        
        ednut.sendMessage(message.chat, {
          'audio': audioBuffer,
          'mimetype': 'audio/mpeg'
        }, {
          'quoted': message
        });
        
        fs.unlinkSync(outputPath);
      });
    }
  }
];