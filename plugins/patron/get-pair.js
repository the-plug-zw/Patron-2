// get-pair.js
// Cleaned and deobfuscated version

const fetch = require('node-fetch');

module.exports = [
    {
        'command': ['pair'],
        'alias': ['getpair', 'clonebot'],
        'description': 'Generate a pairing code',
        'category': 'Other',
        'use': '<phone_number>',
        'filename': __filename,
        async execute(message, { ednut, q, reply, from, prefix }) {
            try {
                if (!q) return await reply('*Example -* ' + prefix + 'pair 23475822XX');
                
                const phoneNumber = q.replace(/\D/g, '');
                if (phoneNumber.startsWith('0')) {
                    return await reply('❗Please use your country code (e.g., 234) instead of starting with 0.');
                }
                
                const formattedNumber = '+' + phoneNumber;
                const response = await fetch('https://patron-pairing.onrender.com/pair?phone=' + formattedNumber);
                const data = await response.json();
                
                if (!data || !data.code) {
                    return await reply('❌ Failed to retrieve pairing code. Please check the phone number and try again.');
                }
                
                const pairingCode = data.code;
                const instruction = '```\n> *Zed-Bot PAIR COMPLETED*```';
                
                await ednut.sendMessage(message.chat, {
                    'text': instruction + '\n\n*Your pairing code is:* ' + pairingCode
                }, { 'quoted': message });
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                await ednut.sendMessage(message.chat, {
                    'text': '' + pairingCode
                }, { 'quoted': message });
            } catch (error) {
                console.error(error);
                await reply('⚠️ An error occurred. Please try again later.');
            }
        }
    }
];