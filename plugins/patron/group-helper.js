// group-helper.js
// Cleaned and deobfuscated version

module.exports = [
    {
        'command': ['hidetag'],
        'alias': ['ht'],
        'description': 'Mention everyone with quoted text or media only',
        'category': 'Group',
        'ban': true,
        'gcban': true,
        'group': true,
        'execute': async (message, { ednut, isOwner, reply }) => {
            try {
                if (!isOwner) return reply(msg.owner);
                
                const groupData = await ednut.groupMetadata(message.chat);
                const participants = groupData.participants.map(p => p.id);
                const quotedMsg = message.msg?.quotedMessage;
                
                if (!quotedMsg) return reply('*Reply to a message to tag everyone.*');
                
                let sendOptions = { 'quoted': message, 'mentions': participants };
                
                if (quotedMsg.conversation) {
                    return ednut.sendMessage(message.chat, {
                        'text': quotedMsg.conversation,
                        ...sendOptions
                    });
                }
                
                if (quotedMsg.imageMessage) {
                    const caption = quotedMsg.imageMessage.caption || '';
                    const media = await ednut.downloadAndSaveMediaMessage(quotedMsg.imageMessage);
                    return ednut.sendMessage(message.chat, {
                        'image': { 'url': media },
                        'caption': caption,
                        ...sendOptions
                    });
                }
                
                if (quotedMsg.audioMessage) {
                    const media = await ednut.downloadAndSaveMediaMessage(quotedMsg.audioMessage);
                    return ednut.sendMessage(message.chat, {
                        'audio': { 'url': media },
                        'mimetype': 'audio/mpeg',
                        ...sendOptions
                    });
                }
                
                if (quotedMsg.videoMessage) {
                    const caption = quotedMsg.videoMessage.caption || '';
                    const media = await ednut.downloadAndSaveMediaMessage(quotedMsg.videoMessage);
                    return ednut.sendMessage(message.chat, {
                        'video': { 'url': media },
                        'caption': caption,
                        ...sendOptions
                    });
                }
                
                if (quotedMsg.stickerMessage) {
                    const media = await ednut.downloadAndSaveMediaMessage(quotedMsg.stickerMessage);
                    return ednut.sendMessage(message.chat, {
                        'sticker': { 'url': media },
                        ...sendOptions
                    });
                }
                
                if (quotedMsg.documentMessage) {
                    const media = await ednut.downloadAndSaveMediaMessage(quotedMsg.documentMessage);
                    const fileName = quotedMsg.documentMessage.fileName || 'file';
                    return ednut.sendMessage(message.chat, {
                        'document': { 'url': media },
                        'mimetype': quotedMsg.documentMessage.mimetype || 'application/octet-stream',
                        'fileName': fileName,
                        ...sendOptions
                    });
                }
                
                return reply('Unsupported message type.');
            } catch (error) {
                reply('Failed to tag everyone.');
                global.log?.('ERROR', 'hidetag error: ' + (error.message || error));
            }
        }
    },
    {
        'command': ['tagadmin'],
        'alias': ['listadmin', 'admin'],
        'description': 'Mention all group admins',
        'category': 'Group',
        'ban': true,
        'gcban': true,
        'group': true,
        'execute': async (message, { ednut, isOwner, reply }) => {
            try {
                if (!isOwner) return reply(msg.owner);
                
                const groupData = await ednut.groupMetadata(message.chat);
                const admins = groupData.participants.filter(p => p.admin);
                const adminIds = admins.map(admin => admin.id);
                const adminList = admins.map((admin, index) => 
                    index + 1 + '. @' + admin.id.split('@')[0]).join('\n');
                
                await ednut.sendMessage(message.chat, {
                    'text': 'Group Admins:\n' + adminList,
                    'mentions': adminIds
                }, { 'quoted': message });
            } catch (error) {
                reply('Failed to tag admins.');
                global.log?.('ERROR', 'tagadmin error: ' + (error.message || error));
            }
        }
    },
    {
        'command': ['revoke'],
        'alias': ['resetlink'],
        'description': 'Reset the group invite link',
        'category': 'Group',
        'ban': true,
        'gcban': true,
        'group': true,
        'execute': async (message, { ednut, isAdmins, isOwner, isBotAdmins, reply }) => {
            try {
                if (!(isAdmins || isOwner)) return reply(msg.admin);
                if (!isBotAdmins) return reply(msg.BotAdmin);
                
                await ednut.groupRevokeInvite(message.chat);
                reply('Group link has been reset.');
            } catch (error) {
                reply('Failed to reset link.');
                global.log?.('ERROR', 'revoke error: ' + (error.message || error));
            }
        }
    },
    {
        'command': ['grouplink'],
        'alias': ['invite', 'gclink'],
        'description': 'Get current group invite link',
        'category': 'Group',
        'ban': true,
        'gcban': true,
        'group': true,
        'execute': async (message, { ednut, isAdmins, isOwner, isBotAdmins, reply }) => {
            try {
                if (!(isAdmins || isOwner)) return reply(msg.admin);
                if (!isBotAdmins) return reply(msg.BotAdmin);
                
                const inviteCode = await ednut.groupInviteCode(message.chat);
                await ednut.sendMessage(message.chat, {
                    'text': 'https://chat.whatsapp.com/' + inviteCode
                }, { 'quoted': message });
            } catch (error) {
                reply('Failed to fetch invite link.');
                global.log?.('ERROR', 'invite error: ' + (error.message || error));
            }
        }
    },
    {
        'command': ['tag'],
        'description': 'Tag all members with message or media',
        'category': 'Group',
        'filename': __filename,
        async execute(message, { ednut, q, from, isGroup, isOwner, reply }) {
            try {
                await ednut.sendMessage(from, { 'react': { 'text': '🔊', 'key': message.key } });
                await ednut.sendMessage(from, { 'delete': message.key }).catch(() => {});
                
                const isUrl = (text) => {
                    return /https?:\/\/(www\.)?[\w\-@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([\w\-@:%_\+.~#?&//=]*)/.test(text);
                };
                
                if (!isGroup) return reply('❌ This command can only be used in groups.');
                if (!isOwner) return reply('*📛 This command is restricted to owners only.*');
                
                const groupData = await ednut.groupMetadata(from);
                const participants = groupData.participants || [];
                const mentionOptions = { 'mentions': participants.map(p => p.jid || p.id) };
                
                if (!q && !message.quoted) {
                    return reply('❌ Please provide a message or reply to a message to tag all members.');
                }
                
                if (message.quoted) {
                    const msgType = message.quoted.mtype || '';
                    
                    if (msgType === 'extendedTextMessage') {
                        return await ednut.sendMessage(from, {
                            'text': message.quoted.text || '📨 Message',
                            ...mentionOptions
                        }, { 'quoted': message });
                    }
                    
                    if (['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(msgType)) {
                        try {
                            const mediaBuffer = await message.quoted.download?.();
                            if (!mediaBuffer) return reply('❌ Failed to download the quoted media.');
                            
                            let mediaOptions;
                            switch (msgType) {
                                case 'imageMessage':
                                    mediaOptions = {
                                        'image': mediaBuffer,
                                        'caption': message.quoted.text || '📷 Image',
                                        ...mentionOptions
                                    };
                                    break;
                                case 'videoMessage':
                                    mediaOptions = {
                                        'video': mediaBuffer,
                                        'caption': message.quoted.text || '🎥 Video',
                                        'gifPlayback': message.quoted.message?.videoMessage?.gifPlayback || false,
                                        ...mentionOptions
                                    };
                                    break;
                                case 'audioMessage':
                                    mediaOptions = {
                                        'audio': mediaBuffer,
                                        'mimetype': 'audio/mp4',
                                        'ptt': message.quoted.message?.audioMessage?.ptt || false,
                                        ...mentionOptions
                                    };
                                    break;
                                case 'stickerMessage':
                                    mediaOptions = {
                                        'sticker': mediaBuffer,
                                        ...mentionOptions
                                    };
                                    break;
                                case 'documentMessage':
                                    mediaOptions = {
                                        'document': mediaBuffer,
                                        'mimetype': message.quoted.message?.documentMessage?.mimetype || 'application/octet-stream',
                                        'fileName': message.quoted.message?.documentMessage?.fileName || 'file',
                                        'caption': message.quoted.text || '',
                                        ...mentionOptions
                                    };
                                    break;
                            }
                            
                            if (mediaOptions) {
                                return await ednut.sendMessage(from, mediaOptions, { 'quoted': message });
                            }
                        } catch (mediaError) {
                            console.error('Media download/send error:', mediaError);
                            return reply('❌ Failed to process the media. Sending as text instead.');
                        }
                    }
                    
                    return await ednut.sendMessage(from, {
                        'text': message.quoted.text || '❌ No message content found.',
                        ...mentionOptions
                    }, { 'quoted': message });
                }
                
                if (q) {
                    if (isUrl(q)) {
                        return await ednut.sendMessage(from, {
                            'text': q,
                            ...mentionOptions
                        }, { 'quoted': message });
                    }
                    
                    await ednut.sendMessage(from, {
                        'text': q,
                        ...mentionOptions
                    }, { 'quoted': message });
                }
            } catch (error) {
                console.error(error);
                reply('❌ *Error Occurred !!*\n\n' + error.message);
            }
        }
    },
    {
        'command': ['tagall'],
        'description': 'Mention all group members with optional message',
        'category': 'Group',
        'ban': true,
        'gcban': true,
        'group': true,
        'execute': async (message, { ednut, isOwner, reply }) => {
            try {
                if (!isOwner) return reply(msg.owner);
                
                const groupData = await ednut.groupMetadata(message.chat);
                const participants = groupData.participants;
                const mentions = participants.map(p => p.id);
                
                const tagMessage = message.text.replace(/^[.,]?(tagall)/i, '').trim() || 'Message: ';
                let finalMessage = '*「 Tag All 」*\n\n' + tagMessage + '\n\n';
                
                for (const participant of participants) {
                    finalMessage += '@' + participant.id.split('@')[0] + '\n';
                }
                
                await ednut.sendMessage(message.chat, {
                    'text': finalMessage,
                    'mentions': mentions
                });
                await ednut.sendMessage(message.chat, { 'delete': message.key });
            } catch (error) {
                reply('Failed to tag all.');
                global.log?.('ERROR', 'tagall error: ' + (error.message || error));
            }
        }
    }
];