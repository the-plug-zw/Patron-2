// downloader-file.js - File downloader for MediaFire and GitHub
const fetch = require('node-fetch');

module.exports = [
  {
    command: ['mediafire'],
    alias: ['mf'],
    description: 'Download MediaFire file from a link',
    category: 'Downloader',
    ban: false,
    gcban: false,
    execute: async (message, {
      ednut,
      fetch,
      text,
      reply
    }) => {
      try {
        if (!text) {
          return reply('📎 Please input a MediaFire link.');
        }

        if (!text.includes('https://')) {
          return reply('🔗 Please input a valid MediaFire link.');
        }

        const response = await fetch(
          'https://archive.lick.eu.org/api/download/mediafire?url=' + 
          encodeURIComponent(text)
        );
        
        const data = await response.json();
        
        if (!data || !data.status || !data.result?.download_link) {
          return reply('❌ Failed to retrieve MediaFire content.');
        }

        const result = data.result;
        const fileName = result.title || 'Unknown';
        const mimeType = result.mime_type?.startsWith('/') 
          ? result.mime_type 
          : 'application/' + (result.mime_type || 'zip');
        
        const caption = 
          '*📦 MediaFire Downloader*\n\n' +
          '*Title:* ' + result.title + '\n' +
          '*Size:* ' + result.size + '\n' +
          '*Type:* ' + result.mime_type + '\n' +
          '*Uploaded:* ' + result.upload_date;
        
        await ednut.sendMessage(message.chat, {
          'document': {
            'url': result.download_link
          },
          'fileName': fileName,
          'mimetype': mimeType,
          'caption': caption + '\n\n' + global.footer
        }, {
          'quoted': message
        });

      } catch (error) {
        reply('❌ Failed to download MediaFire file.');
        if (global.log) {
          global.log('ERROR', 'MediaFire Plugin: ' + error.message);
        }
      }
    }
  },
  {
    command: ['gitclone'],
    description: 'Clone a GitHub repository from URL',
    category: 'Downloader',
    ban: false,
    gcban: false,
    execute: async (message, {
      ednut,
      args,
      reply
    }) => {
      try {
        if (!args[0]) {
          return reply('Input a GitHub repository URL.');
        }

        const githubRegex = /(?:https|git)(?:\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
        
        if (!githubRegex.test(args[0])) {
          return reply('Invalid GitHub URL.');
        }

        const fetch = require('node-fetch');
        let [, username, repo] = args[0].match(githubRegex);
        repo = repo.replace(/.git$/, '');
        
        const zipUrl = 'https://api.github.com/repos/' + username + '/' + repo + '/zipball';
        
        const response = await fetch(zipUrl, {
          'method': 'HEAD'
        });
        
        if (!response.ok) {
          throw 'Repository not found or inaccessible';
        }

        let filename = response.headers.get('content-disposition')
          ?.match(/attachment; filename=(.*)/);
        
        if (!filename) {
          throw 'Could not determine filename';
        }

        let actualFilename = filename[1];
        
        await ednut.sendMessage(message.chat, {
          'document': {
            'url': zipUrl
          },
          'mimetype': 'application/zip',
          'fileName': actualFilename
        }, {
          'quoted': message
        });

      } catch (error) {
        global.log('ERROR', 'gitclone command failed: ' + (error.message || error));
        reply('Failed to clone GitHub repository.');
      }
    }
  }
];