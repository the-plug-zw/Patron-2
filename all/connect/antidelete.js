const { proto, getContentType } = require('@whiskeysockets/baileys');
const util = require('../myfunc');

module.exports = function setupAntidelete(client, options) {
    const cachedMessages = new Set();
    const messageCache = new Map();
    const maxCacheSize = 80;

    // Cache messages for later retrieval
    const cacheMessage = (remoteJid, message) => {
        if (!remoteJid || !message || !message.key?.id) return;

        let chatCache = messageCache.get(remoteJid);
        if (!chatCache) {
            chatCache = new Map();
            messageCache.set(remoteJid, chatCache);
        }

        // Update cache
        if (chatCache.has(message.key.id)) {
            chatCache.delete(message.key.id);
        }
        chatCache.set(message.key.id, message);

        // Maintain cache size limit
        while (chatCache.size > maxCacheSize) {
            const firstKey = chatCache.keys().next().value;
            chatCache.delete(firstKey);
        }
    };

    // Cache new messages
    client.ev.on('messages.upsert', async ({ messages }) => {
        try {
            for (const message of messages) {
                if (message?.key?.id && message?.message) {
                    cacheMessage(message.key.remoteJid, message);
                }
            }
        } catch (error) {
            // Silent fail
        }
    });

    // Handle message deletions
    client.ev.on('messages.upsert', async ({ messages }) => {
        for (const message of messages) {
            try {
                const protocolMsg = message?.message?.protocolMessage;
                if (!protocolMsg) continue;

                // Skip if not a revocation message
                if (protocolMsg.type !== proto.Message.ProtocolMessage.Type.REVOKE) {
                    continue;
                }

                const messageKey = protocolMsg.key;
                const remoteJid = messageKey.remoteJid;
                const messageId = messageKey.id;

                if (!remoteJid || !messageId) continue;

                // Prevent duplicate processing
                if (cachedMessages.has(messageId)) continue;
                cachedMessages.add(messageId);

                // Clean up after 10 seconds
                setTimeout(() => cachedMessages.delete(messageId), 10 * 1000);

                // Check if antidelete is enabled
                const hasDbSettings = !!global?.db?.settings && typeof global.db.settings === 'object';
                const parseBool = (value) => {
                    if (!value) return false;
                    return /^(1|true|yes)$/i.test(String(value).trim());
                };

                const envAntidelete = parseBool(process.env.ANTIDELETE || process.env.antidelete);
                let isAntideleteEnabled = false;

                if (hasDbSettings && Object.prototype.hasOwnProperty.call(global.db.settings, 'antidelete')) {
                    isAntideleteEnabled = Boolean(global.db.settings.antidelete);
                } else {
                    isAntideleteEnabled = envAntidelete;
                }

                // Warn if no configuration found
                if ((!hasDbSettings || !Object.prototype.hasOwnProperty.call(global.db.settings || {}, 'antidelete')) && !global._antidelete_warned) {
                    global._antidelete_warned = true;
                }

                if (!isAntideleteEnabled) continue;

                // Check if sender is the bot itself
                const botJid = (client.decodeJid && client.decodeJid(client.user?.id)) || (client.user && client.user.id);
                if (messageKey.participant && botJid?.includes(messageKey.participant.split('@')[0])) {
                    continue;
                }

                // Try to get deleted message from custom handler
                let deletedMessage = null;
                if (typeof options.loadMessage === 'function') {
                    try {
                        deletedMessage = await options.loadMessage(remoteJid, messageId, client);
                    } catch {
                        deletedMessage = null;
                    }
                }

                // Try to get from cache if not found
                if (!deletedMessage) {
                    const chatCache = messageCache.get(remoteJid);
                    deletedMessage = chatCache?.get(messageId);
                }

                // Try other chat caches
                if (!deletedMessage) {
                    for (const [, cache] of messageCache.entries()) {
                        if (cache.has(messageId)) {
                            deletedMessage = cache.get(messageId);
                            break;
                        }
                    }
                }

                if (!deletedMessage) continue;

                // Generate message details
                const msgDetails = util.smsg(client, deletedMessage, options);
                const senderId = msgDetails.sender?.split('@')[0] || messageKey.participant?.split('@')[0] || 'unknown';

                let chatName;
                try {
                    chatName = client.getName ? await client.getName(remoteJid) : remoteJid;
                } catch {
                    chatName = remoteJid;
                }

                const isGroup = remoteJid.endsWith('@g.us');
                const displayName = isGroup ? `${chatName} group` : chatName;

                const caption = `🛰️ *[DATA RESTORED]*  
> _Intercepted Deleted Transmission_  
━━━━━━━━━━━━━━━━━━  
👤 *Sender:* @${senderId}  
💬 *Chat:* ${displayName}`;

                const sendToJid = botJid;

                // Handle media messages
                if (msgDetails.msg?.url) {
                    try {
                        const mediaBuffer = await client.downloadMediaMessage(msgDetails.msg);
                        const mediaType = getContentType(deletedMessage.message) || getContentType(msgDetails.message || {});

                        // Send based on media type
                        if (/image/i.test(mediaType)) {
                            await client.sendMessage(sendToJid, { image: mediaBuffer });
                        } else if (/video/i.test(mediaType)) {
                            await client.sendMessage(sendToJid, { video: mediaBuffer });
                        } else if (/audio/i.test(mediaType)) {
                            await client.sendMessage(sendToJid, { 
                                audio: mediaBuffer, 
                                mimetype: 'audio/mp4', 
                                ptt: false 
                            });
                        } else if (/sticker/i.test(mediaType)) {
                            await client.sendMessage(sendToJid, { sticker: mediaBuffer });
                        } else {
                            await client.sendMessage(sendToJid, { 
                                document: mediaBuffer, 
                                fileName: 'restored.bin', 
                                mimetype: msgDetails.msg.mimetype || 'application/octet-stream' 
                            });
                        }

                        await client.sendMessage(sendToJid, {
                            text: caption + '\n⚙️ *Media Recovered Successfully.*',
                            mentions: [msgDetails.sender]
                        });
                    } catch (error) {
                        await client.sendMessage(sendToJid, {
                            text: caption + '\n⚠️ *Deleted media could not be recovered.*',
                            mentions: [msgDetails.sender]
                        });
                    }
                } else {
                    // Handle text messages
                    const textContent = msgDetails.text || 
                                      msgDetails.caption || 
                                      msgDetails.msg?.text || 
                                      msgDetails.msg?.caption || 
                                      '[No text content]';

                    await client.sendMessage(sendToJid, {
                        text: caption + '\n🧠 *Recovered Message:*  \n' + textContent,
                        mentions: [msgDetails.sender]
                    });
                }
            } catch (error) {
                console.error('Antidelete processing error:', error);
            }
        }
    });
};