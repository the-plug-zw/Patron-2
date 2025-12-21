// downloader-apk.js - APK downloader from Aptoide
const fetch = require('node-fetch');
const fs = require('fs');
const { writeFileSync, unlinkSync } = require('fs');
const { join } = require('path');

// Aptoide API functions
const aptoide = {
  search: async (query) => {
    const response = await fetch(
      'https://ws75.aptoide.com/api/7/apps/search?query=' + 
      encodeURIComponent(query) + 
      '&limit=10'
    );
    
    const data = await response.json();
    
    return data?.datalist?.list?.map(item => ({
      'name': item.name,
      'size': item.size,
      'version': item.file?.vername,
      'id': item.id,
      'download': item.file?.downloads || 'N/A'
    })) || [];
  },
  
  download: async (id) => {
    const response = await fetch(
      'https://ws75.aptoide.com/api/7/app/get/?id=' + id + '&limit=1'
    );
    
    const data = await response.json();
    const app = data?.datalist?.list?.[0];
    
    return {
      'img': app.icon,
      'developer': app.store?.name,
      'appname': app.name,
      'link': app.file?.path
    };
  }
};

// File download utility
async function downloadFile(url) {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to download: ' + response.statusText);
  }
  
  return Buffer.from(await response.arrayBuffer());
}

module.exports = [
  {
    command: ['apk'],
    description: 'Search and download APK from Aptoide',
    category: 'Downloader',
    async execute(message, {
      ednut,
      text,
      reply
    }) {
      const prefix = '.'; // Assuming prefix is defined somewhere
      
      if (!text) {
        return reply('Enter app name\n\nExample:\n' + prefix + 'apk whatsapp');
      }
      
      // Initialize download tracking
      ednut.apk = ednut.apk || {};
      
      // Check if the input is a number (for downloading specific app)
      if (text.length <= 2 && !isNaN(text) && message.sender in ednut.apk) {
        const userData = ednut.apk[message.sender];
        
        // Clear any existing timeout
        if (userData.timeout) {
          clearTimeout(userData.timeout);
        }
        
        delete ednut.apk[message.sender];
        
        // Check if already downloading
        if (userData.downloading) {
          return reply('You are already downloading an app!');
        }
        
        try {
          userData.downloading = true;
          
          // Get app details
          const appInfo = await aptoide.download(userData.search[text - 1].id);
          
          // Prepare caption
          const caption = 
            '⚡ *App Name:* ' + appInfo.appname + '\n' +
            '*Developer:* ' + appInfo.developer + 
            '\n\n_Wait while the app is being sent..._';
          
          // Send app image
          const sentMessage = await ednut.sendFile(
            message.chat,
            appInfo.img,
            appInfo.appname + '.jpg',
            caption,
            message
          );
          
          // Download APK file
          const apkBuffer = await downloadFile(appInfo.link);
          const filePath = join(__dirname, appInfo.appname + '.apk');
          
          // Save temporarily
          writeFileSync(filePath, apkBuffer);
          
          // Send APK file
          await ednut.sendMessage(message.chat, {
            'document': {
              'url': filePath
            },
            'fileName': appInfo.appname + '.apk',
            'mimetype': 'application/vnd.android.package-archive'
          }, {
            'quoted': sentMessage
          });
          
          // Clean up
          try {
            unlinkSync(filePath);
          } catch (error) {
            console.warn('Could not delete ' + filePath + ':', error.message);
          }
          
        } catch (error) {
          reply('❌ Failed to download the APK.');
          console.error('APK Download Error:', error.message);
        } finally {
          userData.downloading = false;
        }
        
      } else {
        // Search for apps
        const results = await aptoide.search(text);
        
        if (!results.length) {
          return reply('❌ No results found.');
        }
        
        // Format search results
        const resultText = results.map((app, index) => 
          (index + 1) + '. ' + app.name + 
          '\n• Version: ' + app.version + 
          '\n• Size: ' + app.size + 
          '\n• Download: ' + app.download + 
          '\n• ID: ' + app.id
        ).join('\n\n');
        
        const searchInfo = 
          '_Reply with a number to download the app (1 - ' + 
          results.length + ')_\n\n' +
          'Example: *' + prefix + 'apk 2*';
        
        reply(searchInfo + '\n\n' + resultText);
        
        // Store search results for this user
        ednut.apk[message.sender] = {
          search: results,
          downloading: false,
          timeout: setTimeout(() => {
            delete ednut.apk[message.sender];
          }, 300000) // 5 minutes timeout
        };
      }
    }
  }
];