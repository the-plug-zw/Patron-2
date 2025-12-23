const { smsg } = require('../myfunc');
const QuickLRU = require('quick-lru').default;

// Cache for handled messages to prevent duplicates
const handledMessages = new QuickLRU({ maxSize: 1000 });

module.exports = function handleMessages(client, store) {
    // Remove any existing message listeners to avoid duplicates
    client.ev.removeAllListeners('messages.upsert');
    
    // Listen for new messages
    client.ev.on('messages.upsert', async (messageData) => {
        try {
            const message = messageData.messages?.[0];
            if (!message?.key) return;
            
            const messageId = message.key.id;
            
            // Check if message already handled
            if (!messageId || handledMessages.has(messageId)) {
                return;
            }
            
            // Mark message as handled
            handledMessages.set(messageId, true);
            
            // Extract ephemeral message if present
            message.message = message.message?.ephemeralMessage?.message || message.message;
            
            const chatJid = message.key.remoteJid || '';
            const isFromMe = message.key.fromMe;
            const isGroup = chatJid.endsWith('@g.us');
            
            // Extract message text content
            const textContent = message.message?.conversation || 
                              message.message?.extendedTextMessage?.text || 
                              message.message?.imageMessage?.caption || 
                              message.message?.videoMessage?.caption || '';
            
            // Skip if no text content in groups
            if (!textContent && isGroup) return;
            
            // Process message with helper
            const m = smsg(client, message, store);
            
            // Handle status updates (broadcast messages)
            if (chatJid === 'status@broadcast') {
                const shouldAutoRead = process.env.STATUS === 'true' || 
                                      global.db.settings?.autoread === true;
                
                if (shouldAutoRead) {
                    await client.readMessages([message.key]).catch(() => {});
                }
                return;
            }
            
            // Auto-read messages if enabled
            if (process.env.autoread === 'true' || 
                global.db.settings?.autoread === true) {
                client.readMessages([message.key]).catch(() => {});
            }
            
            // Auto-typing indicator if enabled
            if (!isFromMe && global.db.settings?.autotyping === true) {
                client.sendPresenceUpdate('composing', chatJid).catch(() => {});
            }
            
            // Auto-recording indicator if enabled
            if (!isFromMe && global.db.settings?.autorecording === true) {
                client.sendPresenceUpdate('recording', chatJid).catch(() => {});
            }
            
            // Online presence if enabled
            if (!isFromMe) {
                const shouldShowOnline = process.env.ONLINE === 'true' || 
                                        global.db.settings?.autoread === true;
                
                client.sendPresenceUpdate(
                    shouldShowOnline ? 'available' : 'unavailable', 
                    chatJid
                ).catch(() => {});
            }
            
            // Route to appropriate handler
            if (isGroup) {
                // Group messages - handle immediately
                setImmediate(() => {
                    require('../../handler')(client, m, messageData, message, store);
                });
            } else {
                // Private messages - handle directly
                require('../../handler')(client, m, messageData, message, store);
            }
            
        } catch (error) {
            // Only log errors if client is connected
            if (!client.user?.id) return;
            
            console.error('Message Handler Error:', error.stack || error.message);
        }
    });
};