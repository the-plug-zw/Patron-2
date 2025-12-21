const { getGroupAdmins } = require('./helpers'); // Assuming this is imported

module.exports = function setupAntiMention(client) {
    const protectedUsers = ['2348133729715@s.whatsapp.net', '2348025532222@s.whatsapp.net'];
    
    // Helper function for delay
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    client.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const message = messages[0];
            if (!message?.message || message.key?.fromMe) return;
            
            const chatJid = message.key.remoteJid || message.chat || '';
            const isGroup = chatJid.endsWith('@g.us');
            const sender = isGroup 
                ? message.key.participant || message.participant 
                : message.key.remoteJid;
            
            // Get bot's JID
            const botJid = client.decodeJid(client.user.id);
            
            // List of protected users (can't be mentioned/mentioned by)
            const sudoUsers = Array.isArray(global.db.sudo) ? global.db.sudo : [];
            const protectedList = [
                botJid,
                global.owner,           // Bot owner
                ...sudoUsers,           // Sudo users from database
                global.superadmin,      // Super admin
                ...protectedUsers       // Hardcoded protected numbers
            ].map(user => user.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
             .filter(user => user !== sender);
            
            // Get group metadata if in a group
            let groupMetadata = null;
            let participants = [];
            let adminList = [];
            
            if (isGroup) {
                try {
                    groupMetadata = await client.groupMetadata(chatJid);
                    participants = groupMetadata.participants || [];
                    adminList = participants
                        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                        .map(p => p.id);
                } catch {
                    groupMetadata = null;
                }
            }
            
            const isBotAdmin = adminList.includes(botJid);
            const isSenderAdmin = adminList.includes(sender);
            
            // Check if anti-mention is enabled for this chat
            const groupSettings = global.db.groups?.[chatJid];
            if (!groupSettings) return;
            
            // Check if message has mentions
            const messageType = Object.keys(message.message)[0];
            if (!['messageContextInfo', 'contextInfo'].includes(messageType)) return;
            
            const contextInfo = message.message[messageType]?.contextInfo || {};
            const mentionedJids = contextInfo.mentionedJid || [];
            
            // Skip if mentioned users are protected or message is from bot
            if (protectedList.some(user => mentionedJids.includes(user)) || 
                message.key.fromMe) {
                return;
            }
            
            // Skip if not in group or bot is not admin
            if (isGroup && !isBotAdmin) return;
            
            // Level 1: Immediate kick
            if (groupSettings.antimention1) {
                // Delete the offending message
                await client.sendMessage(chatJid, {
                    delete: {
                        remoteJid: chatJid,
                        fromMe: false,
                        id: message.key.id,
                        participant: message.key.participant
                    }
                });
                
                // Warn the user
                await client.sendMessage(chatJid, {
                    text: `🚷 Mention detected @${sender.split('@')[0]} — you will be *kicked out*.`,
                    mentions: [sender]
                }, { quoted: message });
                
                // Wait a bit before kicking
                await delay(3000);
                
                // Kick the user
                await client.groupParticipantsUpdate(chatJid, [sender], 'remove');
                return;
            }
            
            // Level 2: Delete message with warning
            if (groupSettings.antimention2) {
                await client.sendMessage(chatJid, {
                    delete: {
                        remoteJid: chatJid,
                        fromMe: false,
                        id: message.key.id,
                        participant: message.key.participant
                    }
                });
                
                await client.sendMessage(chatJid, {
                    text: `🚫 Mention detected @${sender.split('@')[0]} — mentions are not allowed here.`,
                    mentions: [sender]
                }, { quoted: message });
                return;
            }
            
            // Level 3: Warning system with kick after X warnings
            if (groupSettings.antimention3) {
                const warnings = global.db.warnings || {};
                const maxWarnings = global.warnings || 3;
                
                // Delete the offending message
                await client.sendMessage(chatJid, {
                    delete: {
                        remoteJid: chatJid,
                        fromMe: false,
                        id: message.key.id,
                        participant: message.key.participant
                    }
                });
                
                // Increment warning count
                warnings[sender] = (warnings[sender] || 0) + 1;
                
                // Check if max warnings reached
                if (warnings[sender] < maxWarnings) {
                    // Store warnings
                    global.db.warnings = warnings;
                    
                    // Send warning message
                    await client.sendMessage(chatJid, {
                        text: `⚠️ *ANTIMENTION WARNING*\n` +
                              `▢ *User:* @${sender.split('@')[0]}\n` +
                              `▢ *Warning:* ${warnings[sender]}/${maxWarnings}\n` +
                              `▢ *Reason:* Sending mentions`,
                        mentions: [sender]
                    });
                } else {
                    try {
                        // Kick the user
                        await client.groupParticipantsUpdate(chatJid, [sender], 'remove');
                        
                        // Notify about the kick
                        await client.sendMessage(chatJid, {
                            text: `@${sender.split('@')[0]} was removed from the group after *${maxWarnings} warnings for mentions.`,
                            mentions: [sender]
                        });
                        
                        // Reset warnings for this user
                        delete warnings[sender];
                        global.db.warnings = warnings;
                    } catch (error) {
                        console.error('ERROR: Kick failed:', error?.message || error);
                    }
                }
                return;
            }
            
        } catch (error) {
            console.error('Anti-mention listener error:', error);
        }
    });
};

// Helper function to get group admins
function getGroupAdmins(participants) {
    return participants
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id);
}