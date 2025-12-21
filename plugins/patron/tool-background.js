const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = {
    'command': 'removebg',
    'alias': ['nobg', 'rmbg', 'transparentbg'],
    'description': 'Remove background from an image',
    'category': 'tool',
    'use': '[reply to image]',
    'filename': __filename,
    'ban': false,
    'gcban': false,
    
    'execute': async (message, { ednut: client, reply: replyFunc }) => {
        try {
            if (!message.quoted) {
                return replyFunc('Please reply to an image file (JPEG/PNG)');
            }
            
            const messageType = message.quoted.type;
            
            if (messageType === 'imageMessage') {
                return replyFunc('Please make sure you\'re replying to an image file (JPEG/PNG)');
            }
            
            const fileExtension = message.quoted.mimetype || '';
            const fileBuffer = await message.quoted.download();
            
            let fileExtensionType = '';
            
            if (fileExtension.includes('image/jpeg')) {
                fileExtensionType = '.jpg';
            } else if (fileExtension.includes('image/png')) {
                fileExtensionType = '.png';
            } else {
                return replyFunc('Unsupported image format. Please use JPEG or PNG');
            }
            
            const inputFilePath = path.join(
                os.tmpdir(),
                'removebg_' + Date.now() + fileExtensionType
            );
            
            fs.writeFileSync(inputFilePath, fileBuffer);
            
            const formData = new FormData();
            formData.append(
                'fileToUpload',
                fs.createReadStream(inputFilePath),
                'image' + fileExtensionType
            );
            formData.append('reqtype', 'fileupload');
            
            const uploadResponse = await axios.post(
                'https://catbox.moe/user/api.php',
                formData,
                { 'headers': formData.getHeaders() }
            );
            
            const uploadedImageUrl = uploadResponse.data;
            fs.unlinkSync(inputFilePath);
            
            if (!uploadedImageUrl) {
                throw 'API returned invalid image data';
            }
            
            const removeBgApiUrl = 
                'https://apis.davidcyriltech.my.id/removebg?url=' + 
                encodeURIComponent(uploadedImageUrl);
            
            const removeBgResponse = await axios.get(
                removeBgApiUrl,
                { 'responseType': 'arraybuffer' }
            );
            
            if (!removeBgResponse.data || removeBgResponse.data.length < 100) {
                throw 'RemoveBG Error:';
            }
            
            const outputFilePath = path.join(
                os.tmpdir(),
                'removebg_output_' + Date.now() + '.png'
            );
            
            fs.writeFileSync(outputFilePath, removeBgResponse.data);
            
            await client.sendMessage(
                message.chat,
                {
                    'image': fs.readFileSync(outputFilePath),
                    'caption': 'Background removed successfully!\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴ TᴇᴄʜＸ*'
                },
                { 'quoted': message }
            );
            
            fs.unlinkSync(outputFilePath);
            
        } catch (error) {
            console.error('❌ Error:', error);
            await replyFunc('❌ Error: ' + (error.message || error));
        }
    }
};