const axios = require('axios');

module.exports = [
    {
        'command': ['tempnum'],
        'alias': ['fakenumber', 'getnumber'],
        'description': 'Get temporary numbers & OTP instructions',
        'category': 'Tool',
        'use': '<country-code>',
        'ban': true,
        'gcban': true,
        'execute': async (message, { ednut: client, args: args, reply: replyFunc }) => {
            try {
                if (!args || args.length < 1) {
                    return replyFunc('❌ Usage: .tempnum <country-code>\nExample: .tempnum us\n\n📦 Use .otpbox <number> to check OTPs');
                }
                
                const countryCode = args[0].toLowerCase();
                const { data } = await axios.get('https://api.vreden.my.id/api/tools/fakenumber/listnumber?id=' + countryCode, {
                    'timeout': 10000,
                    'validateStatus': status => status === 200
                });
                
                if (!data?.result || !Array.isArray(data.result)) {
                    console.error('Invalid API structure:', data);
                    return replyFunc('⚠ Invalid API response format\nTry .tempnum us');
                }
                
                if (data.result.length === 0) {
                    return replyFunc(`📭 No numbers available for *${countryCode.toUpperCase()}*\nTry another country code!\n\nUse .otpbox <number> after selection`);
                }
                
                const numbers = data.result.slice(0, 25);
                const numberList = numbers.map((number, index) => 
                    String(index + 1).padStart(2, ' ') + '. ' + number.number
                ).join('\n');
                
                replyFunc(
                    `╭──「 📱 TEMPORARY NUMBERS 」\n` +
                    `│ Country: ${countryCode.toUpperCase()}\n` +
                    `│ Numbers Found: ${numbers.length}\n` +
                    `│\n` + numberList + '\n' +
                    `╰──「 📌 Use .tempnum to get numbers 」`
                );
                
            } catch (error) {
                console.error('API Error:', error);
                replyFunc(error.code === 'ECONNABORTED' 
                    ? '⏳ Timeout: API took too long\nTry smaller country codes like \'us\', \'gb\''
                    : '⚠ Error: ' + error.message + '\n\nUsage: .otpbox +9231034481xx');
            }
        }
    },
    {
        'command': ['templist'],
        'alias': ['tempcountries', 'fakenumlist'],
        'description': 'Show list of countries with temp numbers',
        'category': 'Tool',
        'use': '.templist',
        'execute': async (message, { ednut: client, reply: replyFunc }) => {
            try {
                const { data } = await axios.get('https://api.vreden.my.id/api/tools/fakenumber/country');
                
                if (!data || !data.result) {
                    return replyFunc('❌ Couldn\'t fetch country list.');
                }
                
                const countryList = data.result.map((country, index) => 
                    '*' + (index + 1) + '.* ' + country.title + ' `(' + country.id + ')`'
                ).join('\n');
                
                replyFunc(`🌍 Total Available Countries: ${data.result.length}\n\n${countryList}`);
                
            } catch (error) {
                console.error('TEMP LIST ERROR:', error);
                replyFunc('❌ Failed to fetch temporary number country list.');
            }
        }
    },
    {
        'command': ['otpbox'],
        'alias': ['otpcheck', 'checkotp'],
        'description': 'Check OTP messages for temporary number',
        'category': 'Tool',
        'use': '<full-number>',
        'execute': async (message, { ednut: client, args: args, reply: replyFunc }) => {
            try {
                if (!args[0] || !args[0].startsWith('+')) {
                    return replyFunc('❌ Usage: .otpbox <full-number>\nExample: .otpbox +9231034481xx');
                }
                
                const phoneNumber = args[0].trim();
                const { data } = await axios.get('https://api.vreden.my.id/api/tools/fakenumber/message?nomor=' + encodeURIComponent(phoneNumber), {
                    'timeout': 10000,
                    'validateStatus': status => status === 200
                });
                
                if (!data?.result || !Array.isArray(data.result)) {
                    return replyFunc('⚠️ No OTP messages found for this number');
                }
                
                const messages = data.result.map(message => {
                    const code = message.content.match(/\b\d{4,8}\b/g);
                    const otpCode = code ? code[0] : 'Unknown';
                    return '┌ *From:* ' + (message.from || 'Unknown') + 
                           '\n│ *Code:* ' + otpCode + 
                           '\n│ *Time:* ' + (message.time_wib || message.timestamp) + 
                           '\n└ *Message:* ' + message.content.substring(0, 50) + 
                           (message.content.length > 50 ? '...' : '');
                }).join('\n\n');
                
                replyFunc(
                    `╭──「 🔑 OTP MESSAGES 」\n` +
                    `│ Number: ${phoneNumber}\n` +
                    `│ Messages Found: ${data.result.length}\n` +
                    `│\n` + messages + '\n' +
                    `╰──「 📦 : .otpbox <number> 」\n_Example: .otpbox +1234567890_`
                );
                
            } catch (error) {
                console.error('OTP Check Error:', error);
                replyFunc(error.code === 'ECONNABORTED' 
                    ? '⌛ OTP check timed out. Try again later' 
                    : '⚠ Error: ' + (error.response?.data?.error || error.message) + '\n\nUse format: .tempnum <country-code>');
            }
        }
    }
];