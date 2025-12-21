const axios = require('axios');

module.exports = [
    {
        command: ['gpt4'],
        alias: ['gpt', 'ai', 'chatgpt', 'bing'],
        description: 'Ask AI a question using GPT-4',
        category: 'Ai',
        async execute(message, { args, q, reply }) {
            try {
                const prompt = q?.trim() || args.join(' ').trim();
                if (!prompt) {
                    return reply('❓ Please provide a message for the AI.\n\nExample: `.ai Hello, how are you?`');
                }
                
                const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(prompt)}`;
                const { data } = await axios.get(apiUrl);
                
                if (!data || !data.data) {
                    return reply('⚠️ AI failed to respond. Please try again later.');
                }
                
                await reply(`🤖 *AI Response:*\n\n${data.message}`);
            } catch (error) {
                console.log('Error in AI command:', error);
                reply('❌ An error occurred while communicating with the AI.');
            }
        }
    },
    {
        command: ['metallama'],
        alias: ['meta', 'llama'],
        description: 'Ask Meta LLaMA AI a question',
        category: 'Ai',
        async execute(message, { args, reply }) {
            const prompt = args.join(' ').trim();
            if (!prompt) {
                return reply('🦙 Please ask something like `.meta what is consciousness?`');
            }
            
            try {
                const apiUrl = `https://archive.lick.eu.org/api/ai/groq-meta-llama-llama-4-scout-17b-16e-instruct?text=${encodeURIComponent(prompt)}`;
                const response = await fetch(apiUrl);
                const result = await response.json();
                
                if (!result?.status || !result?.message) {
                    return reply('❌ Meta LLaMA AI couldn\'t generate a response.');
                }
                
                await reply(`🦙 *Meta LLaMA says:*\n\n${result.message.trim()}\n\n— *🎩-Hxcker-263-🎩*`);
            } catch (error) {
                console.log('Meta LLaMA Error:', error);
                reply('❌ An error occurred while contacting Meta LLaMA AI.');
            }
        }
    },
    {
        command: ['askpatron'],
        alias: ['patronai'],
        description: 'Ask the Patron AI chatbot a question',
        category: 'Ai',
        async execute(message, { args, reply }) {
            const prompt = args.join(' ').trim();
            if (!prompt) {
                return reply('❌ Please provide a prompt!\n\nExample:');
            }
            
            try {
                const encodedPrompt = encodeURIComponent(prompt);
                const personalityPrompt = encodeURIComponent(
                    '\n        Speak like someone who radiates presence — calm, confident, and quietly powerful. \n        You are at the pinnacle, a king among all, but never loud about it. And always still answer the questions.\n        Your words carry weight, and your replies should feel magnetic, subtle, and unshakably dominant. \n        Be human, but not ordinary. Let your tone reflect someone who is never fazed, never explaining too much, and never seeking approval. \n        If someone questions your reply, respond like someone whose authority is beyond doubt — "you question me?" kind of tone, but with calm charisma. \n        Keep responses short, smooth, and impactful.\n        '
                );
                
                const apiUrl = `https://api.siputzx.my.id/api/ai/bard?query=${encodedPrompt}&logic=${personalityPrompt}`;
                const response = await fetch(apiUrl);
                const result = await response.json();
                
                if (!result?.status || !result?.result) {
                    return reply('❌ Patron AI couldn\'t generate a response. Please try again.');
                }
                
                const formattedResponse = `╭───『 𝗣𝗮𝘁𝗿𝗼𝗻-𝗔𝗜 』───⳹\n│\n│ ${result.result}\n│\n╰────────────────⳹`;
                await reply(formattedResponse);
            } catch (error) {
                console.log('PatronAI Error:', error);
                reply('❌ An error occurred while contacting Patron AI.');
            }
        }
    },
    {
        command: ['grok'],
        alias: ['grokai', 'askgrok'],
        description: 'Ask AI a question using Grok AI',
        category: 'Ai',
        async execute(message, { args, q, prefix, command, reply }) {
            const prompt = q?.trim() || args.join(' ').trim();
            if (!prompt) {
                return reply(`🤖 Please ask something like \`.patronai What is philosophy?\`${prefix}${command} how are you?`);
            }
            
            try {
                const apiUrl = `https://archive.lick.eu.org/api/ai/gpt-4-logic?text=${encodeURIComponent(prompt)}`;
                const { data } = await axios.get(apiUrl);
                
                if (data.status && data.data) {
                    await reply(data.data);
                } else {
                    await reply('❌ Failed to get a response from the AI.');
                }
            } catch (error) {
                console.log('Grok AI error:', error);
                reply('⚠️ Error in this command.');
            }
        }
    }
];