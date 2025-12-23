const { smsg } = require('../myfunc');

module.exports = function setupStatusListener(client, store) {
    client.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const message = messages[0];
            
            // Skip if no message or message is from bot itself
            if (!message?.message || message.key.fromMe) return;
            
            // Process message with helper
            const m = smsg(client, message, store);
            
            // Check if it's a status update and auto-like is enabled
            if (m.key?.remoteJid === 'status@broadcast' && 
                global.db?.settings?.autolike === true) {
                
                // List of random emojis for reactions
                const emojiList = [
                    '❤️', '💛', '💚', '💙', '💜', '🖤', '💖', '💘', '💝', '💞', '💟', '💌',
                    '🔥', '✨', '💯', '🎉', '🥳', '🤩', '😎', '😍', '🥰', '😘', '😇', '🤍',
                    '🤎', '😺', '😸', '😹', '😻', '😼', '🙀', '😿', '😾', '🎈', '🌸', '🌼',
                    '🌻', '🌹', '💐', '🚀', '✈️', '🚁', '🚂', '🚗', '🚕', '🚙', '🚌', '🚎',
                    '🏎️', '🏍️', '🛵', '🚲', '🛴', '⚡', '💥', '💫', '🌟', '⭐', '☀️', '🌙',
                    '🌈', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🎯', '🎳', '🎮',
                    '🎰', '🎲', '🎭', '🎨', '🎵', '🎶', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸'
                ];
                
                // Pick a random emoji
                const randomEmoji = emojiList[
                    Math.floor(Math.random() * emojiList.length)
                ];
                
                // Get bot's JID and status sender's JID
                const botJid = await client.decodeJid(client.user.id);
                const validJids = [m.key.remoteJid, botJid].filter(Boolean);
                
                // React to the status with random emoji
                await client.sendMessage(
                    m.key.remoteJid,
                    {
                        react: {
                            text: randomEmoji,
                            key: m.key
                        }
                    },
                    { statusJidList: validJids }
                );
                return;
            }
            
        } catch (error) {
            console.error('Error in Status Listener:', error);
        }
    });
};