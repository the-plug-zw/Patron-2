module.exports = [
    {
        command: ['broadcast'],
        alias: ['bc'],
        description: 'Broadcast text or media to all groups',
        category: 'Owner',
        ban: true,
        gcban: true,
        owner: true,
        execute: async (message, { ednut, text, isOwner, msg, sleep, isGroup, reply }) => {
            try {
                let messageData = {};
                
                if (message.quoted && message.quoted.mimetype) {
                    const mimeType = message.quoted.mimetype;
                    const mediaBuffer = await message.quoted.download();
                    
                    if (/image/.test(mimeType)) {
                        messageData = { image: mediaBuffer, caption: text || message.quoted.caption || '' };
                    } else if (/video/.test(mimeType)) {
                        messageData = { video: mediaBuffer, caption: text || message.quoted.caption || '' };
                    } else if (/audio/.test(mimeType)) {
                        messageData = {
                            audio: mediaBuffer,
                            mimetype: 'audio/mpeg',
                            filename: 'music.mp3',
                            ptt: true,
                            contextInfo: {
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '',
                                    serverMessageId: 101,
                                    newsletterName: 'broadcast: ' + (text || message.quoted.caption || '')
                                }
                            }
                        };
                    } else if (/sticker/.test(mimeType)) {
                        messageData = { sticker: mediaBuffer };
                    }
                } else {
                    messageData = { text: text || (message.quoted ? message.quoted.caption : '') };
                }

                if (messageData.caption) {
                    messageData.text = messageData.caption;
                    delete messageData.caption;
                }

                if (!messageData.text && !messageData.image && !messageData.video && !messageData.audio && !messageData.sticker) {
                    return reply('No text or media provided.');
                }

                const chats = await ednut.groupFetchAllParticipating();
                const groupIds = Object.entries(chats).map(([id, chat]) => chat.id);

                reply('Sending broadcast to ' + groupIds.length + ' group(s). Estimated time: ' + (groupIds.length * 1.5) + ' seconds.');

                for (const groupId of groupIds) {
                    await sleep(5000);
                    await ednut.sendMessage(groupId, messageData, { quoted: message });
                }

                reply('_Broadcast sent to ' + groupIds.length + ' group(s) successfully._');
            } catch (error) {
                global.log('ERROR', 'broadcast plugin: ' + (error.message || error));
                reply('Error occurred while sending broadcast.');
            }
        }
    },
    {
        command: ['logout'],
        description: 'Logout bot from all devices',
        category: 'Owner',
        ban: true,
        gcban: true,
        owner: true,
        execute: async (message, { ednut, isOwner, msg, sleep, isGroup, reply }) => {
            try {
                reply('Logging out all devices...');
                await sleep(4000);
                await ednut.logout();
            } catch (error) {
                global.log('ERROR', 'logout plugin: ' + (error.message || error));
                reply('Error occurred while logging out.');
            }
        }
    }
];