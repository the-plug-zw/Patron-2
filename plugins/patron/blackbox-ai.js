const axios = require('axios');

module.exports = [
    {
        command: ['blackbox'],
        alias: ['askbb', 'blackboxai'],
        description: 'Ask Blackbox AI a question',
        category: 'Ai',
        filename: __filename,
        
        async execute(m, { text, reply }) {
            try {
                // Check if query is provided
                if (!text) {
                    return reply('❌ Please provide a query!\n\nExample: .blackbox hello');
                }
                
                // Show processing message
                await reply('⏳ Asking Blackbox AI...');
                
                // API endpoint
                const apiUrl = 'https://ab-blackboxai.abrahamdw882.workers.dev/?q=' + encodeURIComponent(text);
                
                // Make API request
                const { data } = await axios.get(apiUrl, { timeout: 10000 });
                
                // Extract response text
                let responseText;
                
                if (typeof data === 'string' && data.trim()) {
                    responseText = data;
                } else if (data?.content && data.content.trim()) {
                    responseText = data.content;
                } else {
                    responseText = '⚠️ No valid response from Blackbox AI.';
                }
                
                // Send response
                await reply(responseText);
                
            } catch (error) {
                console.error('Blackbox command error:', error.message || error);
                await reply('❌ Error fetching response from Blackbox AI.');
            }
        }
    }
];