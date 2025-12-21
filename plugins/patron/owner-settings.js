const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = [
    {
        command: ['clear'],
        description: 'Clear chat for bot account (owner only)',
        category: 'Owner',
        ban: true,
        gcban: true,
        owner: true,
        async execute(message, { ednut, isOwner, reply }) {
            if (!isOwner) {
                return reply('❌ Only the bot owners can use this command.');
            }

            try {
                const chatId = message.chat;
                const messageData = async (chatId) => message;
                const lastMessage = await messageData(chatId);

                if (!lastMessage?.key || !lastMessage?.messageTimestamp) {
                    console.warn('⚠️ Cannot clear: missing key or timestamp.');
                    return;
                }

                await ednut.chatModify({
                    delete: true,
                    lastMessages: [{
                        key: lastMessage.key,
                        messageTimestamp: lastMessage.messageTimestamp
                    }]
                }, chatId);

                await sleep(1500);
                reply('✅ Chat cleared from bot account.');
            } catch (error) {
                reply('❌ Failed to clear chat:\n\n' + (error.message || error.toString()));
            }
        }
    }
];