const axios = require('axios');

module.exports = [{
    command: ['npm'],
    alias: ['npmsearch', 'npmsearcher'],
    description: 'Search for a package on npm.',
    category: 'Tool',
    filename: __filename,
    use: '<package-name>',
    ban: false,
    gcban: false,
    execute: async (message, { ednut, args, reply }) => {
        try {
            if (!args || !args.length) {
                return reply('❎ Please provide the name of the npm package you want to search for.\nExample: .npm express');
            }

            const packageName = args.join(' ');
            const apiUrl = 'https://registry.npmjs.org/' + encodeURIComponent(packageName);
            const { data: packageData } = await axios.get(apiUrl);

            const latestVersion = packageData['dist-tags']?.latest || 'Unknown';
            const description = packageData.description || 'No description available.';
            const npmUrl = 'https://www.npmjs.com/package/' + packageName;
            const license = packageData.license || 'Not available';
            const repositoryUrl = packageData.repository?.url || 'Not available';

            const messageText = `
*Zed-Bot NPM SEARCH*

*🔰 NPM PACKAGE:* ${packageName}
*📄 DESCRIPTION:* ${description}
*🪪 LICENSE:* ${license}
*⏸️ LAST VERSION:* ${latestVersion}
*🪩 REPOSITORY:* ${repositoryUrl}
*🔗 NPM URL:* ${npmUrl}
`;

            await ednut.sendMessage(message.chat, { text: messageText }, { quoted: message });
        } catch (error) {
            console.error('NPM Command Error:', error);
            const errorLog = `
*❌ NPM Command Error Logs*

*Error Message:* ${error.message}
*Stack Trace:* ${error.stack || 'Not available'}
*Timestamp:* ${new Date().toISOString()}
`;
            await ednut.sendMessage(message.chat, { text: errorLog }, { quoted: message });
            reply('❎ An error occurred while fetching the npm package details.');
        }
    }
}];