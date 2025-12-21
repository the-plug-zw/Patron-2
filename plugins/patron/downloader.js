// downloader.js - Social media video downloader (Facebook, Instagram, TikTok)
const axios = require('axios');
const cheerio = require('cheerio');

// Main downloader function
async function downloader(platform, url, { ednut, mek, from, reply }) {
  try {
    if (!url) {
      return reply('❌ Please provide a link.\nExample:\n.' + platform + ' <url>');
    }

    const siteUrl = 'https://instatiktok.com/';
    const params = new URLSearchParams();
    
    params.append('url', url);
    params.append('platform', platform);
    params.append('siteurl', siteUrl);

    const response = await axios.post(
      siteUrl + 'api',
      params.toString(),
      {
        'headers': {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin': siteUrl,
          'Referer': siteUrl,
          'User-Agent': 'Mozilla/5.0',
          'X-Requested-With': 'XMLHttpRequest'
        }
      }
    );

    const html = response?.data?.html;
    
    if (!html || response?.data?.status !== 'success') {
      return reply('❌ Failed to fetch data from server.');
    }

    const $ = cheerio.load(html);
    const mediaLinks = [];

    // Extract media links
    $('a.btn[href^="http"]').each((index, element) => {
      const link = $(element).attr('href');
      if (link && !mediaLinks.includes(link)) {
        mediaLinks.push(link);
      }
    });

    if (mediaLinks.length === 0) {
      return reply('❌ No media links found.');
    }

    let downloadLink;
    
    if (platform === 'tiktok') {
      downloadLink = mediaLinks;
    } else {
      if (platform === 'instagram') {
        downloadLink = mediaLinks.find(link => /hdplay/.test(link)) || mediaLinks[0];
      } else if (platform === 'facebook') {
        downloadLink = mediaLinks.at(-1);
      }
    }

    if (!downloadLink) {
      return reply('❌ Could not retrieve download link.');
    }

    const footer = '\n\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴTᴇᴄʜＸ* 🚹';

    // Handle multiple links (for TikTok)
    if (Array.isArray(downloadLink)) {
      for (const link of downloadLink) {
        const mediaBuffer = await axios.get(link, {
          'responseType': 'arraybuffer'
        }).then(res => res.data);
        
        await ednut.sendMessage(from, {
          'image': mediaBuffer,
          'caption': '📥 Instagram Downloader' + footer
        }, {
          'quoted': mek
        });
      }
    } else {
      // Handle single link
      const mediaBuffer = await axios.get(downloadLink, {
        'responseType': 'arraybuffer'
      }).then(res => res.data);
      
      const isVideo = downloadLink.includes('.mp4');
      const caption = '📥 *' + platform.toUpperCase() + ' Download Successful!*' + footer;
      
      await ednut.sendMessage(
        from,
        isVideo 
          ? { 'video': mediaBuffer, 'caption': caption }
          : { 'image': mediaBuffer, 'caption': caption },
        { 'quoted': mek }
      );
    }

  } catch (error) {
    console.error(error);
    reply('❌ An error occurred.\n\n' + (error.message || error));
  }
}

module.exports = [
  {
    command: ['facebook'],
    alias: ['fb', 'fbvid', 'fbvideo'],
    description: 'Download Facebook videos',
    category: 'Downloader',
    filename: __filename,
    async execute(message, { ednut, q, reply, from }) {
      await downloader('facebook', q, {
        'ednut': ednut,
        'mek': message,
        'from': from,
        'reply': reply
      });
    }
  },
  {
    command: ['instagram'],
    alias: ['ig', 'ig2'],
    description: 'Download Instagram photos/videos',
    category: 'Downloader',
    filename: __filename,
    async execute(message, { ednut, q, reply, from }) {
      await downloader('instagram', q, {
        'ednut': ednut,
        'mek': message,
        'from': from,
        'reply': reply
      });
    }
  },
  {
    command: ['tiktok2'],
    alias: ['tt2'],
    description: 'Download TikTok videos',
    category: 'Downloader',
    filename: __filename,
    async execute(message, { ednut, q, reply, from }) {
      await downloader('tiktok', q, {
        'ednut': ednut,
        'mek': message,
        'from': from,
        'reply': reply
      });
    }
  }
];