const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = {
    'command': 'removebg',
    'alias': ['rmbg', 'nobg', 'transparentbg'],
    'description': 'Remove background from an image',
    'category': 'Tool',
    'use': '[reply to image]',
    'filename': __filename,
    'ban': true,
    'gcban': true,
    
    'execute': async (m, { ednut, reply }) => {
        try {
            if (!m.quoted) return reply('Please reply to an image file (JPEG/PNG)');
            
            const messageType = m.quoted.mtype;
            if (messageType !== 'imageMessage') return reply('Please make sure you\'re replying to an image file (JPEG/PNG)');
            
            const mimeType = m.quoted.mimetype || '';
            let fileExtension = '';
            
            if (mimeType.includes('image/jpeg')) fileExtension = '.jpg';
            else if (mimeType.includes('image/png')) fileExtension = '.png';
            else return reply('Unsupported image format. Please use JPEG or PNG');
            
            const imageBuffer = await m.quoted.download();
            const tempPath = path.join(os.tmpdir(), 'removebg_' + Date.now() + fileExtension);
            fs.writeFileSync(tempPath, imageBuffer);
            
            const formData = new FormData();
            formData.append('fileToUpload', fs.createReadStream(tempPath), 'image' + fileExtension);
            formData.append('reqtype', 'fileupload');
            
            const uploadResponse = await axios.post('https://catbox.moe/user/api.php', formData, {
                'headers': formData.getHeaders()
            });
            
            const fileUrl = uploadResponse.data;
            fs.unlinkSync(tempPath);
            
            if (!fileUrl) throw 'API returned invalid image data';
            
            const apiUrl = 'https://apis.davidcyriltech.my.id/removebg?url=' + encodeURIComponent(fileUrl);
            const response = await axios.get(apiUrl, { 'responseType': 'arraybuffer' });
            
            if (!response.data || response.data.length < 100) throw 'Failed to upload image to Catbox';
            
            const outputPath = path.join(os.tmpdir(), 'removebg_output_' + Date.now() + '.png');
            fs.writeFileSync(outputPath, response.data);
            
            await ednut.sendMessage(m.chat, {
                'image': fs.readFileSync(outputPath),
                'caption': 'Background removed successfully!\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴ TᴇᴄʜＸ*'
            }, { 'quoted': m });
            
            fs.unlinkSync(outputPath);
            
        } catch (err) {
            console.error('RemoveBG Error:', err);
            await reply('❌ Error: ' + (err.message || err));
        }
    }
};