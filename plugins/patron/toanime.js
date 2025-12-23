const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const colorifyai = {
    'baseHeaders': {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        'sec-ch-ua-mobile': '?1',
        'theme-version': '83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
        'fp': 'TepQNTen0uDhLJ1z3LD/u+tD90vX7RDQpiPcqGy521zeTvgS6h/JUcLY0pFJUoDQ',
        'origin': 'https://colorifyai.art',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://colorifyai.art/',
        'accept-language': 'en-SG,en;q=0.9,id-ID;q=0.8,id;q=0.7,en-US;q=0.6',
        'priority': 'u=1, i'
    },
    'baseUrl': 'https://api.colorifyai.art',
    'imageBaseUrl': 'https://temp.colorifyai.art',
    
    async 'uploadImage'(imagePath) {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(imagePath));
        formData.append('fn_name', 'demo-auto-coloring');
        formData.append('request_from', '10');
        formData.append('origin_from', 'toanime');
        
        const {data} = await axios.post(this.baseUrl + '/aitools/upload-img', formData, {
            'headers': {
                ...this.baseHeaders,
                ...formData.getHeaders(),
                'fp1': 'ce5c3d02ca3f6126691dc3f031bf8696',
                'x-code': Date.now().toString(),
                'x-guide': 'o6Mwa5XX5Un1ErcZHeaPw/Vx9akkKttB1H5u+IyolDFz4IZQaNmueXYbgLo93OFc'
            }
        });
        return data;
    },
    
    async 'createTask'(imageId, prompt = '(masterpiece), best quality', ghibliStyle = true) {
        const lora = ghibliStyle ? ['ghibli_style_offset:0.8'] : [];
        const {data} = await axios.post(this.baseUrl + '/aitools/of/create', {
            'fn_name': 'demo-auto-coloring',
            'call_type': 3,
            'input': {
                'source_image': imageId,
                'prompt': prompt,
                'request_from': 10,
                'lora': lora
            },
            'request_from': 10,
            'origin_from': 'toanime'
        }, {
            'headers': {
                ...this.baseHeaders,
                'Content-Type': 'application/json',
                'fp1': 'pqRqSazlVNrkwA0D4OH9Q9+VNfnQidPWxDZkHLohBzg7CRVY8Z4DuMSnl1LldC8I',
                'x-code': Date.now().toString(),
                'x-guide': 'gspNs'
            }
        });
        return data;
    },
    
    async 'checkStatus'(taskId) {
        const {data} = await axios.post(this.baseUrl + '/aitools/of/check-status', {
            'task_id': taskId,
            'fn_name': 'demo-auto-coloring',
            'call_type': 3,
            'request_from': 10,
            'origin_from': 'toanime'
        }, {
            'headers': {
                ...this.baseHeaders,
                'Content-Type': 'application/json',
                'fp1': 'qLTaK9uy0jedbN7EO3gSm0zgKF+5OTZ5UL3BleB1ksqhkteHSWqpnZBSCIHo9finX7Qlz4I8oAFEB1wyClNgwlbbuzuEGBezjibch0EUhhrRUW8OSLInN5+DrOouCj2ppoq2YM90NLfKdqCazLKx17gm6ykG3YOYSpQDBGETDAM=',
                'x-code': Date.now().toString(),
                'x-guide': 'Vtn8hbYI0x1w6BpTTkxrU1qK4Y/LPcOA2JNUSS6+UFk4uRXPLIL3x+ws40hmnqhSy1l4bxjM61KMRfaENnIsSJ7YCOlyKlL3/gvBQPVbBZi02c89yStvrnCvpRblyCy/vnX8ifY6rrhJJAJ2kdgw0pa5SZKOEA7UaDCdaroELzg='
            }
        });
        return data;
    },
    
    'getImageUrl'(imagePath) {
        return this.imageBaseUrl + '/' + imagePath;
    },
    
    async 'create'(imagePath, prompt = '(masterpiece), best quality', ghibliStyle = true, maxAttempts = 30) {
        const uploadResult = await this.uploadImage(imagePath);
        if (uploadResult.code !== 200) throw new Error('Upload failed: ' + uploadResult.message);
        
        const imageId = uploadResult.data.img_id;
        const taskResult = await this.createTask(imageId, prompt, ghibliStyle);
        if (taskResult.code !== 200) throw new Error('Task creation failed: ' + taskResult.message);
        
        const taskId = taskResult.data.task_id;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            const status = await this.checkStatus(taskId);
            if (status.code !== 200) throw new Error('Status check failed: ' + status.message);
            
            if (status.data.status === 2) {
                const resultImage = status.data.result_image;
                return {
                    'success': true,
                    'imageUrl': this.getImageUrl(resultImage),
                    'imagePath': resultImage,
                    'taskId': taskId,
                    'ghibliStyle': ghibliStyle
                };
            }
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        throw new Error('Task timeout - maximum attempts reached');
    }
};

module.exports = [
    {
        'command': ['toanime'],
        'alias': [],
        'description': 'Convert image to anime style',
        'category': 'AI',
        'use': '(reply to image)',
        'execute': async (m, { ednut }) => {
            try {
                const isQuoted = m.quoted ? m.quoted : m;
                const mimeType = (isQuoted.message || isQuoted).mimetype || '';
                
                if (!mimeType.startsWith('image/')) {
                    return m.reply('❎ Reply to an image.');
                }
                
                m.reply('⏳ Processing anime style...');
                const imageBuffer = await isQuoted.download();
                const tempPath = './tmp/' + Date.now() + '.jpg';
                fs.writeFileSync(tempPath, imageBuffer);
                
                const result = await colorifyai.create(tempPath, '(masterpiece), best quality', false);
                fs.unlinkSync(tempPath);
                
                await ednut.sendMessage(m.chat, {
                    'image': { 'url': result.imageUrl }
                }, { 'quoted': m });
                
            } catch (err) {
                m.reply('❎ Error: ' + err.message);
            }
        }
    },
    {
        'command': ['toghibli'],
        'alias': [],
        'description': 'Convert image to Ghibli style',
        'category': 'AI',
        'use': '(reply to image)',
        'execute': async (m, { ednut }) => {
            try {
                const isQuoted = m.quoted ? m.quoted : m;
                const mimeType = (isQuoted.message || isQuoted).mimetype || '';
                
                if (!mimeType.startsWith('image/')) {
                    return m.reply('❎ Reply to an image.');
                }
                
                m.reply('⏳ Processing Ghibli style...');
                const imageBuffer = await isQuoted.download();
                const tempPath = './tmp/' + Date.now() + '.jpg';
                fs.writeFileSync(tempPath, imageBuffer);
                
                const result = await colorifyai.create(tempPath, '(masterpiece), best quality', true);
                fs.unlinkSync(tempPath);
                
                await ednut.sendMessage(m.chat, {
                    'image': { 'url': result.imageUrl }
                }, { 'quoted': m });
                
            } catch (err) {
                m.reply('❎ Error: ' + err.message);
            }
        }
    }
];