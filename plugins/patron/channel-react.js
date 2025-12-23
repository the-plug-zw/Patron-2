module.exports = [{
    command: ['channel-react'],
    alias: ['chr', 'chreact', 'reactch', 'creact'],
    description: 'React to channel messages with stylized text',
    category: 'Owner',
    use: '<channel-link> <text>',
    filename: __filename,
    
    async execute(m, { ednut, args, isOwner, reply }) {
        try {
            // Character mapping for stylized reactions
            const charMap = {
                'a': '🅰',
                'b': '🅱',
                'c': '🅲',
                'd': '🅳',
                'e': '🅴',
                'f': '🅵',
                'g': '🅶',
                'h': '🅷',
                'i': '🅸',
                'j': '🅹',
                'k': '🅺',
                'l': '🅻',
                'm': '🅼',
                'n': '🅽',
                'o': '🅾',
                'p': '🅿',
                'q': '🆀',
                'r': '🆁',
                's': '🆂',
                't': '🆃',
                'u': '🆄',
                'v': '🆅',
                'w': '🆆',
                'x': '🆇',
                'y': '🆈',
                'z': '🆉',
                '0': '⓿',
                '1': '❶',
                '2': '❷',
                '3': '❸',
                '4': '❹',
                '5': '❺',
                '6': '❻',
                '7': '❼',
                '8': '❽',
                '9': '❾'
            };
            
            // Owner only command
            if (!isOwner) {
                return reply('⚠️ Owner only command');
            }
            
            // Check if arguments are provided
            if (!args[0]) {
                return reply('⚠️ Usage: .chr <channel-link> <text>');
            }
            
            // Extract channel link and text
            const [channelLink, ...textParts] = args;
            
            // Validate channel link format
            if (!channelLink.includes('whatsapp.com/channel/')) {
                return reply('⚠️ Invalid channel link format');
            }
            
            // Combine text parts
            const inputText = textParts.join(' ').toLowerCase();
            
            // Check if text is provided
            if (!inputText) {
                return reply('⚠️ Please provide text to convert');
            }
            
            // Convert text to stylized format
            const stylizedText = inputText
                .split('')
                .map(char => char === ' ' ? ' ' : (charMap[char] || char))
                .join('');
            
            // Parse channel IDs from link
            const linkParts = channelLink.split('/');
            const channelId = linkParts[4];
            const messageId = linkParts[5];
            
            // Validate IDs
            if (!channelId || !messageId) {
                return reply('⚠️ Invalid link - missing IDs');
            }
            
            // Get channel metadata
            const channelInfo = await ednut('invite', channelId);
            
            // Send reaction to channel message
            await ednut('newsletterReactMessage', channelInfo.id, messageId, stylizedText);
            
            // Success response
            return reply(
                '🟣───────── *Zed-Bot* ────────🟢\n' +
                '📌 *Success!* Reaction sent\n' +
                '📌 *Channel:* ' + channelInfo.name +
                '\n📌 *Reaction:* ' + stylizedText +
                '\n───────────────────────────────────\n' +
                '> *©️ 𝓟𝓪𝓽𝓻𝓸𝓷 𝓑𝓸𝓽 𝓣𝓮𝓻𝓶𝓲𝓷𝓪𝓵 🛰️*'
            );
            
        } catch (error) {
            console.error('Error in chr:', error);
            reply('⚠️ Error: ' + (error.message || 'Failed to send reaction'));
        }
    }
}];