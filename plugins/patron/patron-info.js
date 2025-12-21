module.exports = [{
    'command': ['patron-info'],
    'alias': ['patroninfo', 'patron', 'manual'],
    'description': 'Information on how to use the bot.',
    'category': 'Info',
    'filename': __filename,
    
    async 'execute'(m, { ednut, from, reply }) {
        try {
            const prefix = global.prefix;
            const ownerNumber = '+263781564004';
            const ownerName = '🎩-Hxcker-263-🎩';
            const vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:' + ownerName + 
                         '\nTEL;type=CELL;type=VOICE;waid=' + ownerNumber.replace('+', '') + 
                         ':' + ownerNumber + '\nEND:VCARD';
            
            const infoText = '🔹 *Welcome to Patron Bot!* 🔹\n*(Please read everything carefully)*\n\n' +
                            '📌 *Getting Started*\n' +
                            '1️⃣ Use *' + prefix + 'list* → Get all available commands with descriptions.\n' +
                            '2️⃣ Use *' + prefix + 'help <command>* → Learn how a specific command works.\n' +
                            '3️⃣ Use *' + prefix + 'report <command>* → Report issues or broken commands.\n' +
                            '4️⃣ Use *' + prefix + 'request <feature>* → Suggest new commands or features.\n' +
                            '5️⃣ Visit: *https://Zed-Bot.vercel.app/plugins* → Explore extra plugins. Use *' + 
                            prefix + 'install <link>* to apply.\n' +
                            '6️⃣ Reach out to the bot owner for any inquiries.\n' +
                            '7️⃣ Use *' + prefix + 'getpair* → Connect your number to the bot for a session ID.\n' +
                            '8️⃣ *Configuration Commands*\n' +
                            '- *setenv* → Change bot settings if you are using a hosting panel.\n' +
                            '- *setvar* → Change bot settings if you are deploying on Heroku.\n\n' +
                            '🔄 *Updates*\n' +
                            '9️⃣ Use *' + prefix + 'update* → Update the bot.\n\n' +
                            '🎭 *Reactions*\n' +
                            '🔟 Use *' + prefix + 'areact off/cmd/all* → Control bot reactions.\n' +
                            '   - off → Disable all reactions\n' +
                            '   - cmd → React only when a command is used\n' +
                            '   - all → React to every message\n\n' +
                            '💡 *Tips*\n' +
                            '- Share the bot with friends.\n' +
                            '- Join our support channel to stay updated on new features.\n\n' +
                            '🌐 *Website & Resources*\n' +
                            '- Visit: https://Zed-Bot.vercel.app → Learn more and get session IDs.\n' +
                            '- Report issues using *' + prefix + 'report <command>*.\n\n' +
                            '📰 *Join our Channel* for announcements:\n' +
                            '🔗 https://whatsapp.com/channel/0029Val0s0rIt5rsIDPCoD2q';
            
            await ednut.sendMessage(from, { 'text': infoText });
            await ednut.sendMessage(from, {
                'contacts': {
                    'displayName': ownerName,
                    'contacts': [{ 'vcard': vcard }]
                }
            });
            
        } catch (err) {
            console.error('Error in patron command:', err);
            await ednut.sendMessage(from, {
                'text': '❌ Something went wrong while retrieving the information.'
            });
        }
    }
}];