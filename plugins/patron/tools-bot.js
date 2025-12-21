const translate = require('translate-google-api');

module.exports = [
    {
        'command': 'translate',
        'alias': ['trt'],
        'description': 'Translate text into another language',
        'category': 'Tool',
        'ban': true,
        'gcban': true,
        'execute': async (message, { text: textContent, args: args, ednut: client, example: example }) => {
            try {
                let targetLanguage = 'en';
                let textToTranslate;
                
                if (!textContent && !message.quoted) {
                    return message.reply(example('en good night'));
                }
                
                if (textContent && !message.quoted) {
                    if (args.length < 2) {
                        return message.reply(example('en good night'));
                    }
                    targetLanguage = args[0];
                    textToTranslate = textContent.split(' ').slice(1).join(' ');
                } else {
                    if (message.quoted && message.quoted.text) {
                        if (!args[0]) {
                            return message.reply(example('en good night'));
                        }
                        targetLanguage = args[0];
                        textToTranslate = message.quoted.text;
                    } else {
                        return message.reply(example('en good night'));
                    }
                }
                
                try {
                    const translation = await translate(textToTranslate, { 'to': targetLanguage });
                    message.reply(translation[0]);
                } catch (translateError) {
                    console.error('translate fallback:', 'translate plugin: ' + (translateError.message || translateError));
                    try {
                        const fallbackTranslation = await translate(textToTranslate, { 'to': 'en' });
                        message.reply(fallbackTranslation[0]);
                    } catch (fallbackError) {
                        console.error('translate fallback:', 'translate plugin: ' + (fallbackError.message || fallbackError));
                        message.reply('Failed to translate the text.');
                    }
                }
                
            } catch (error) {
                console.error('translate fallback:', 'translate plugin: ' + (error.message || error));
                message.reply('Failed to translate the text.');
            }
        }
    },
    {
        'command': ['dictionary'],
        'alias': ['define', 'meaning'],
        'description': 'Get the definition of an English word',
        'category': 'Tool',
        'ban': true,
        'gcban': true,
        'execute': async (message, { text: textContent, ednut: client, fetch: fetch }) => {
            try {
                const word = textContent.trim();
                
                if (!word) {
                    return message.reply('Please provide a word to define.');
                }
                
                const response = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word));
                
                if (!response.ok) {
                    return message.reply('Word not found or invalid.');
                }
                
                const data = await response.json();
                const wordData = data[0];
                
                let definitionText = `*Definition of "${wordData.word}"*\n`;
                
                const pronunciation = wordData.phonetics?.find(phonetic => phonetic.text) || {};
                if (pronunciation.text) {
                    definitionText += `Pronunciation: _${pronunciation.text}_\n`;
                }
                
                wordData.meanings.slice(0, 2).forEach((meaning, meaningIndex) => {
                    definitionText += `\n${meaningIndex + 1}. *${meaning.partOfSpeech}*\n`;
                    meaning.definitions.slice(0, 2).forEach(definition => {
                        definitionText += `- ${definition.definition}\n`;
                        if (definition.example) {
                            definitionText += `  _e.g._ "${definition.example}"\n`;
                        }
                    });
                });
                
                const synonyms = wordData.meanings.flatMap(m => m.synonyms).filter(Boolean);
                const antonyms = wordData.meanings.flatMap(m => m.antonyms).filter(Boolean);
                
                if (synonyms.length) {
                    definitionText += '\nSynonyms: ' + [...new Set(synonyms)].slice(0, 5).join(', ');
                }
                
                if (antonyms.length) {
                    definitionText += '\nAntonyms: ' + [...new Set(antonyms)].slice(0, 5).join(', ');
                }
                
                await client.sendMessage(message.chat, {
                    'text': definitionText.trim()
                }, {
                    'quoted': message
                });
                
                const audioUrl = wordData.phonetics?.find(phonetic => phonetic.audio)?.audio;
                if (audioUrl) {
                    await client.sendMessage(message.chat, {
                        'audio': { 'url': audioUrl },
                        'mimetype': 'audio/mp4',
                        'ptt': true
                    }, {
                        'quoted': message
                    });
                }
                
            } catch (error) {
                console.error('translate fallback:', 'dictionary plugin: ' + (error.message || error));
                message.reply('Failed to fetch definition.');
            }
        }
    },
    {
        'command': 'pfp',
        'alias': ['getpp', 'pp'],
        'description': 'Get profile picture of a user',
        'category': 'Privacy',
        'ban': true,
        'gcban': true,
        'execute': async (message, { ednut: client, text: textContent, reply: replyFunc }) => {
            try {
                let userId = message.mentioned?.[0] || 
                    (message.quoted ? message.quoted.sender : 
                    textContent ? textContent.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
                
                if (!userId) {
                    return replyFunc('❎ Please mention a user, reply to their message, or enter their number.');
                }
                
                let profilePicUrl;
                try {
                    profilePicUrl = await client.profilePictureUrl(userId, 'image');
                } catch {
                    profilePicUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60';
                }
                
                await client.sendMessage(message.chat, {
                    'image': { 'url': profilePicUrl },
                    'caption': 'Profile picture of @' + userId.split('@')[0],
                    'contextInfo': {
                        'mentionedJid': [userId]
                    }
                }, {
                    'quoted': message
                });
                
            } catch (error) {
                console.error('ERROR', 'pfp plugin: ' + (error.message || error));
                replyFunc('Failed to fetch profile picture.');
            }
        }
    },
    {
        'command': 'weather',
        'alias': ['forecast'],
        'description': 'Get weather info for a location',
        'category': 'Tool',
        'ban': true,
        'gcban': true,
        'execute': async (message, { text: location, ednut: client, example: example, axios: axios }) => {
            try {
                if (!location) {
                    return message.reply(example('London'));
                }
                
                let response = await axios.get('https://api.openweathermap.org/data/2.5/weather?q=' + location + '&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273&language=en');
                let weatherData = response.data;
                
                let weatherText = '🌍 *Weather Report* 🌍\n\n';
                weatherText += `📍 *Location:* ${weatherData.name}, ${weatherData.sys.country}\n`;
                weatherText += `🗺️ *Coordinates:* ${weatherData.coord.lat}, ${weatherData.coord.lon}\n\n`;
                weatherText += `🌤️ *Condition:* ${weatherData.weather[0].main}\n`;
                weatherText += `📝 *Description:* ${weatherData.weather[0].description}\n\n`;
                weatherText += `🌡️ *Temperature:* ${weatherData.main.temp}°C\n`;
                weatherText += `🤔 *Feels Like:* ${weatherData.main.feels_like}°C\n`;
                weatherText += `💧 *Humidity:* ${weatherData.main.humidity}%\n`;
                weatherText += `🌀 *Wind Speed:* ${weatherData.wind.speed} m/s\n`;
                weatherText += `⏲️ *Pressure:* ${weatherData.main.pressure} hPa\n\n`;
                weatherText += `> *© Powered By 🎩-Hxcker-263-🎩*`;
                
                await client.sendMessage(message.chat, {
                    'text': weatherText
                }, {
                    'quoted': message
                });
                
            } catch (error) {
                console.error('ERROR', 'weather plugin: ' + (error.message || error));
                message.reply('❌ Failed to fetch weather data. Please check the location and try again.');
            }
        }
    },
    {
        'command': 'fancy',
        'alias': ['styletext'],
        'description': 'Convert text to fancy styles',
        'category': 'Tool',
        'ban': true,
        'gcban': true,
        'execute': async (message, { text: textContent, ednut: client, prefix: prefix, example: example, styletext: styletext }) => {
            try {
                if (!textContent) {
                    return message.reply(example('fancy 2 hello'));
                }
                
                let parts = textContent.split(' ');
                let styleNumber = parseInt(parts[0]);
                let text = textContent.replace(parts[0], '').trim();
                
                if (isNaN(styleNumber) || !text) {
                    let styles = await styletext(textContent);
                    let styleList = `fancy 2 hello\n\nStyles for: ${textContent}\n\n`;
                    
                    for (let i = 0; i < styles.length; i++) {
                        styleList += `${i + 1}. ${styles[i].name} : ${styles[i].result}\n\n`;
                    }
                    
                    return message.reply(styleList);
                }
                
                let styles = await styletext(text);
                return styleNumber && styles[styleNumber - 1] 
                    ? message.reply(styles[styleNumber - 1].result) 
                    : message.reply('Invalid style number.');
                
            } catch (error) {
                console.error('ERROR', 'fancy plugin: ' + (error.message || error));
                message.reply('Failed to convert text.');
            }
        }
    }
];