const axios = require('axios');

module.exports = [
    {
        'command': ['readmore'],
        'description': 'Hide text using read more',
        'category': 'Tool',
        'ban': true,
        'gcban': true,
        'execute': async (message, { ednut: client, text: textContent }) => {
            try {
                const hiddenChar = String.fromCharCode(0x200e);
                const hiddenText = hiddenChar.repeat(4001);
                
                let [firstPart = '', secondPart = ''] = textContent.split('|');
                
                await client.sendMessage(message.chat, {
                    'text': firstPart + hiddenText + secondPart
                }, {
                    'quoted': message
                });
                
            } catch (error) {
                console.error('❌ Error:', error);
                await message.reply('❌ Error: ' + (error.message || error));
            }
        }
    },
    {
        'command': ['lyrics'],
        'description': 'Fetch song lyrics by title',
        'category': 'Tool',
        'ban': true,
        'gcban': true,
        'execute': async (message, { text: textContent, ednut: client, msg: msg, fetch: fetch }) => {
            try {
                const searchQuery = textContent.trim();
                
                if (!searchQuery) {
                    return message.reply('Please provide a song title');
                }
                
                let response = await fetch('https://api-versevibe.zone.id/versev2/lyrics?title=' + encodeURIComponent(searchQuery) + '&apikey=AbroCodesf9Dg7');
                let data = await response.json();
                
                if (!data?.lyrics) {
                    return message.reply('_Lyrics not found_');
                }
                
                message.reply(data.lyrics);
                
            } catch (error) {
                console.error('ERROR', 'lyrics plugin: ' + (error.message || error));
                message.reply('Error occurred while fetching lyrics.');
            }
        }
    },
    {
        'command': ['trackip'],
        'description': 'Track IP address information',
        'category': 'Tool',
        'ban': true,
        'gcban': true,
        'execute': async (message, { ednut: client, text: textContent, fetch: fetch }) => {
            try {
                if (!textContent) {
                    return message.reply('Example: 112.90.150.204');
                }
                
                let data = await fetch('https://ipwho.is/' + textContent)
                    .then(response => response.json());
                
                if (!data.success) {
                    throw new Error('IP ' + textContent + ' not found!');
                }
                
                const infoText = 
                    'IP: ' + data.ip + '\n' +
                    'Country: ' + data.country + '\n' +
                    'Region: ' + data.region + '\n' +
                    'City: ' + data.city + '\n' +
                    'Latitude: ' + data.latitude + '\n' +
                    'Longitude: ' + data.longitude + '\n' +
                    'Timezone: ' + data.timezone?.current_time + '\n' +
                    'ISP: ' + data.connection?.org + '\n' +
                    'ISP ID: ' + data.connection?.isp + ' (' + data.connection?.asn + ')';
                
                await client.sendMessage(message.chat, {
                    'location': {
                        'degreesLatitude': data.latitude,
                        'degreesLongitude': data.longitude
                    }
                }, {
                    'ephemeralExpiration': 604800
                });
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                message.reply(infoText);
                
            } catch (error) {
                console.error('ERROR', 'trackip plugin: ' + (error.message || error));
                message.reply('Error: Unable to retrieve data for IP ' + textContent);
            }
        }
    },
    {
        'command': ['tts'],
        'alias': ['say', 'gtts'],
        'description': 'Convert text to speech',
        'category': 'Converter',
        'ban': true,
        'gcban': true,
        'execute': async (message, { ednut: client, args: args, q: quotedText, googleTTS: googleTTS }) => {
            try {
                let voiceStyle = 'en-US';
                let isSlow = false;
                
                const styles = {
                    'male': 'en-US',
                    'female': 'en-US',
                    'deep': 'en-US',
                    'slow': 'slow',
                    'fast': 'en-US',
                    'ng': 'en-NG',
                    'au': 'en-AU',
                    'gb': 'en-GB',
                    'in': 'en-IN'
                };
                
                let textToConvert = args.length > 1 ? args.slice(1).join(' ') : quotedText;
                
                if (!textToConvert) {
                    return message.reply('Missing text. Usage: .tts [style] [text]. Available styles: male, female, deep, slow, fast, ng, au');
                }
                
                const style = args[0]?.toLowerCase();
                
                switch (style) {
                    case 'male':
                        voiceStyle = 'en-US';
                        break;
                    case 'female':
                        voiceStyle = 'en-US';
                        break;
                    case 'deep':
                        voiceStyle = 'en-US';
                        break;
                    case 'slow':
                        isSlow = true;
                        break;
                    case 'ng':
                        voiceStyle = 'en-NG';
                        break;
                    case 'au':
                        voiceStyle = 'en-AU';
                        break;
                }
                
                if (textToConvert.length > 200) {
                    return message.reply('Text must be under 200 characters.');
                }
                
                const audioUrl = googleTTS.getAudioUrl(textToConvert, {
                    'lang': voiceStyle,
                    'slow': isSlow,
                    'host': 'https://translate.google.com'
                });
                
                await client.sendMessage(message.chat, {
                    'audio': { 'url': audioUrl },
                    'mimetype': 'audio/mpeg',
                    'ptt': true
                }, {
                    'quoted': message
                });
                
            } catch (error) {
                console.error('ERROR', 'tts plugin: ' + (error.message || error));
                message.reply('Error occurred while converting text to speech.');
            }
        }
    },
    {
        'command': ['getdevice'],
        'alias': ['device', 'getdevice'],
        'description': 'Detect the device used by a quoted message',
        'category': 'Tool',
        'ban': true,
        'gcban': true,
        'execute': async (message, { ednut: client, getDevice: getDevice }) => {
            try {
                if (!message.quoted) {
                    return message.reply('Reply to a chat to get device info');
                }
                
                const deviceInfo = await getDevice(message.quoted.id);
                
                await client.sendMessage(message.chat, {
                    'text': '@' + message.quoted.sender.split('@')[0] + ' is using ' + deviceInfo,
                    'contextInfo': {
                        'mentionedJid': [message.quoted.sender]
                    }
                }, {
                    'quoted': message
                });
                
            } catch (error) {
                console.error('ERROR', 'device plugin: ' + (error.message || error));
                message.reply('Error occurred while fetching device info.');
            }
        }
    }
];