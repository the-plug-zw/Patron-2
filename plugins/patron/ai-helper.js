module.exports = [
    {
        command: ['groq'],
        description: 'Ask Groq Compound Beta Mini AI',
        category: 'Ai',
        ban: true,
        gcban: true,
        execute: async (message, { ednut, axios, reply }) => {
            try {
                const query = message.text.split(' ').slice(1).join(' ');
                if (!query) {
                    return reply('📝 Please provide a query for Groq AI.');
                }
                
                const apiUrl = `https://archive.lick.eu.org/api/ai/groq-compound-beta-mini?text=${encodeURIComponent(query)}`;
                const response = await axios.get(apiUrl);
                const result = response.data?.result?.trim();
                
                if (!result) {
                    return reply('❌ Failed to contact Groq AI.');
                }
                
                await ednut.sendMessage(message.chat, { text: result }, { quoted: message });
            } catch (error) {
                global.log('ERROR', 'groq failed: ' + (error.message || error));
                reply('⚠️ Unexpected response from Groq AI.');
            }
        }
    },
    {
        command: ['deepseek'],
        description: 'Ask Deepseek R1 AI',
        category: 'Ai',
        ban: true,
        gcban: true,
        execute: async (message, { ednut, axios, reply }) => {
            try {
                const query = message.text.split(' ').slice(1).join(' ');
                if (!query) {
                    return reply('📝 Please provide a query for Deepseek R1.');
                }
                
                const apiUrl = `https://archive.lick.eu.org/api/ai/groq-deepseek-r1-distill-llama-70b?text=${encodeURIComponent(query)}`;
                const response = await axios.get(apiUrl);
                const result = response.data?.message?.trim();
                
                if (!result) {
                    return reply('❌ Failed to contact Deepseek R1.');
                }
                
                await ednut.sendMessage(message.chat, { text: result }, { quoted: message });
            } catch (error) {
                global.log('ERROR', 'deepseek failed: ' + (error.message || error));
                reply('⚠️ Unexpected response from Deepseek R1.');
            }
        }
    }
];