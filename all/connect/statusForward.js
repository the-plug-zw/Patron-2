module.exports = function setupStatusForward(client) {
    client.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const message = messages[0];
            
            // Skip if no message or message is from self
            if (!message?.key || message.key.fromMe) return;
            
            // Extract text content from message
            const textContent = (message.message?.conversation || 
                                message.message?.extendedTextMessage?.text || '')
                                .toLowerCase()
                                .trim();
            
            // Check if it's a status update
            const isStatusMessage = message.key.remoteJid === 'status@broadcast' || 
                                   message.message?.extendedTextMessage?.contextInfo?.remoteJid === 'status@broadcast';
            
            // Commands that trigger status forwarding
            const forwardCommands = ['send', 'give', 'share', 'forward', 'snd'];
            const isForwardCommand = forwardCommands.some(cmd => textContent.includes(cmd));
            
            // Return if not a status or not a forward command
            if (!isStatusMessage || !isForwardCommand) return;
            
            // Get the quoted status message
            const quotedStatus = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedStatus) return;
            
            // Forward the status to the current chat
            await client.sendMessage(
                message.key.remoteJid,
                {
                    forward: {
                        key: {
                            remoteJid: 'status@broadcast',
                            id: message.message.extendedTextMessage.contextInfo.stanzaId
                        },
                        message: quotedStatus
                    }
                },
                { quoted: message }
            );
            
        } catch (error) {
            console.error('Error forwarding status:', error);
        }
    });
};