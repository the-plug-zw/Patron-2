const axios = require('axios');
const fetch = require('node-fetch');

module.exports = [
    {
        'command': ['joke'],
        'alias': [],
        'description': 'Get a random joke',
        'category': 'Fun',
        'use': '.joke',
        'filename': __filename,
        'ban': true,
        'gcban': true,
        'execute': async (message, { ednut: client, reply: replyFunc }) => {
            const chatId = message.chat;
            try {
                const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
                const jokeData = response.data;
                
                if (!jokeData || !jokeData.setup || !jokeData.punchline) {
                    return replyFunc('❌ Failed to fetch a joke. Please try again.');
                }
                
                const jokeText = `🤣 *Here's a random joke for you!* 🤣\n\n*${jokeData.setup}*\n\n*${jokeData.punchline}*\n\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴTᴇᴄʜＸ* 🚹`;
                return replyFunc(jokeText);
                
            } catch (error) {
                console.error('Error in joke command:', error);
                return replyFunc('⚠️ An error occurred while fetching the joke. Please try again.');
            }
        }
    },
    {
        'command': ['flirt'],
        'alias': ['masom', 'pickup'],
        'description': 'Get a random flirt or pickup line.',
        'category': 'Fun',
        'use': '.flirt',
        'ban': true,
        'gcban': true,
        'filename': __filename,
        'execute': async (message, { ednut: client, reply: replyFunc }) => {
            const chatId = message.chat;
            try {
                const apiKey = 'shizo';
                const apiUrl = 'https://shizoapi.onrender.com/api/texts/flirt?apikey=' + apiKey;
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                    throw new Error('API request failed with status ' + await response.text());
                }
                
                const data = await response.json();
                if (!data.result) {
                    throw new Error('Invalid response from API.');
                }
                
                const flirtText = '' + data.result;
                await client.sendMessage(chatId, {
                    'text': flirtText,
                    'mentions': [message.sender]
                }, {
                    'quoted': message
                });
                
            } catch (error) {
                console.error('Error in flirt command:', error);
                replyFunc('Sorry, something went wrong while fetching the flirt line. Please try again later.');
            }
        }
    },
    {
        'command': ['truth'],
        'alias': ['t'],
        'description': 'Get a random truth question from the API.',
        'category': 'Fun',
        'use': '.truth',
        'ban': true,
        'gcban': true,
        'filename': __filename,
        'execute': async (message, { ednut: client, reply: replyFunc }) => {
            const chatId = message.chat;
            try {
                const apiKey = 'shizo';
                const response = await fetch('https://shizoapi.onrender.com/api/texts/truth?apikey=' + apiKey);
                
                if (!response.ok) {
                    throw new Error('API request failed with status ' + response.status);
                }
                
                const data = await response.json();
                if (!data.result) {
                    throw new Error('Invalid API response: No \'result\' field found.');
                }
                
                await client.sendMessage(chatId, {
                    'text': '' + data.result,
                    'mentions': [message.sender]
                }, {
                    'quoted': message
                });
                
            } catch (error) {
                console.error('Error in truth command:', error);
                replyFunc('Sorry, something went wrong while fetching the truth question. Please try again later.');
            }
        }
    },
    {
        'command': ['dare'],
        'alias': ['d'],
        'description': 'Get a random dare from the API.',
        'category': 'Fun',
        'use': '.dare',
        'filename': __filename,
        'ban': true,
        'gcban': true,
        'execute': async (message, { ednut: client, reply: replyFunc }) => {
            const chatId = message.chat;
            try {
                const apiKey = 'shizo';
                const response = await fetch('https://shizoapi.onrender.com/api/texts/dare?apikey=' + apiKey);
                
                if (!response.ok) {
                    throw new Error('API request failed with status ' + response.status);
                }
                
                const data = await response.json();
                if (!data.result) {
                    throw new Error('Invalid response from API.');
                }
                
                await client.sendMessage(chatId, {
                    'text': '' + data.result,
                    'mentions': [message.sender]
                }, {
                    'quoted': message
                });
                
            } catch (error) {
                console.error('Error in dare command:', error);
                replyFunc('Sorry, something went wrong while fetching the dare. Please try again later.');
            }
        }
    },
    {
        'command': ['fact'],
        'alias': [],
        'description': 'Get a random fun fact',
        'category': 'Fun',
        'use': '.fact',
        'filename': __filename,
        'ban': true,
        'gcban': true,
        'execute': async (message, { ednut: client, reply: replyFunc }) => {
            const chatId = message.chat;
            try {
                const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
                const factText = response.data.text;
                
                if (!factText) {
                    return replyFunc('❌ Failed to fetch a fun fact. Please try again.');
                }
                
                const factMessage = '🧠 *Random Fun Fact* 🧠\n\n' + factText + '\n\nIsn\'t that interesting? 😄\n\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ 🎩-Hxcker-263-🎩*';
                return replyFunc(factMessage);
                
            } catch (error) {
                console.error('❌ Error in fact command:', error);
                return replyFunc('⚠️ An error occurred while fetching a fun fact. Please try again later.');
            }
        }
    },
    {
        'command': ['pickupline'],
        'alias': ['pickupline'],
        'description': 'Get a random pickup line from the API.',
        'category': 'Fun',
        'use': '.pickupline',
        'filename': __filename,
        'ban': true,
        'gcban': true,
        'execute': async (message, { ednut: client, reply: replyFunc }) => {
            const chatId = message.chat;
            try {
                const response = await fetch('https://api.popcat.xyz/pickuplines');
                
                if (!response.ok) {
                    throw new Error('API request failed with status ' + response.status);
                }
                
                const data = await response.json();
                const pickupLine = '*Here\'s a pickup line for you:*\n\n"' + data.pickupline + '"\n\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴTᴇᴄʜＸ* 🚹';
                await client.sendMessage(chatId, {
                    'text': pickupLine
                }, {
                    'quoted': message
                });
                
            } catch (error) {
                console.error('Error in pickupline command:', error);
                replyFunc('Sorry, something went wrong while fetching the pickup line. Please try again later.');
            }
        }
    },
    {
        'command': ['character'],
        'alias': ['char'],
        'description': 'Check the character of a mentioned user.',
        'category': 'Fun',
        'use': '<@mention>',
        'filename': __filename,
        'ban': true,
        'gcban': true,
        'execute': async (message, { ednut: client, isGroup: isGroup, reply: replyFunc }) => {
            const chatId = message.chat;
            try {
                if (!isGroup) {
                    return replyFunc('This command can only be used in groups.');
                }
                
                const mentionedUser = message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
                
                if (!mentionedUser) {
                    return replyFunc('Please mention a user whose character you want to check.');
                }
                
                const characters = [
                    'Grumpy', 'Generous', 'Obedient', 'Helpful', 'Brilliant', 'Hot', 'Sigma', 'Kind',
                    'Pervert', 'Good', 'Cool', 'Patient', 'Cute', 'Sexy', 'Overconfident', 'Gorgeous'
                ];
                
                const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
                const characterText = `Character of @${mentionedUser.split('@')[0]} is *${randomCharacter}* 🔥⚡`;
                
                await client.sendMessage(chatId, {
                    'text': characterText,
                    'mentions': [mentionedUser]
                }, {
                    'quoted': message
                });
                
            } catch (error) {
                console.error('Error in character command:', error);
                replyFunc('An error occurred while processing the command. Please try again.');
            }
        }
    },
    {
        'command': ['repeat'],
        'alias': ['rp', 'rpm'],
        'description': 'Repeat a message a specified number of times.',
        'category': 'Fun',
        'use': '<count>,<message>',
        'filename': __filename,
        'ban': true,
        'gcban': true,
        'execute': async (message, { reply: replyFunc, args: args }) => {
            try {
                if (!args[0]) {
                    return replyFunc('❎ Please provide a message to repeat.');
                }
                
                const [countStr, ...messageParts] = args.join(' ').split(',');
                const count = parseInt(countStr.trim());
                const text = messageParts.join(',').trim();
                
                if (isNaN(count) || count <= 0 || count > 300) {
                    return replyFunc('❎ Please specify a valid number between 1 and 300.');
                }
                
                if (!text) {
                    return replyFunc('❎ Please provide a message to repeat.');
                }
                
                const repeatedText = Array(count).fill(text).join('\n');
                replyFunc('🔄 Repeated ' + count + ' times:\n\n' + repeatedText);
                
            } catch (error) {
                console.error('❌ Error in repeat command:', error);
                replyFunc('❎ An error occurred while processing your request.');
            }
        }
    }
];