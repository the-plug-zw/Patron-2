const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = [
    {
        'command': ['privacymenu', 'privacy'],
        'description': 'Privacy settings menu',
        'category': 'Privacy',
        
        async 'execute'(m, { ednut, from, sender, reply }) {
            await ednut.sendMessage(m.key.remoteJid, {
                'react': { 'text': '🔐', 'key': m.key }
            });
            
            try {
                const menuText = '\n╭━━〔 *Privacy Settings* 〕━━┈⊷\n' +
                               '┃◈╭─────────────·๏\n' +
                               '┃◈┃• blocklist - View blocked users\n' +
                               '┃◈┃• getbio - Get user\'s bio\n' +
                               '┃◈┃• setppall - Set profile pic Privacy\n' +
                               '┃◈┃• setonline - Set online Privacy\n' +
                               '┃◈┃• setpp - Change bot\'s profile pic\n' +
                               '┃◈┃• setmyname - Change bot\'s name\n' +
                               '┃◈┃• updatebio - Change bot\'s bio\n' +
                               '┃◈┃• groupsPrivacy - Set group add Privacy\n' +
                               '┃◈┃• getPrivacy - View current Privacy settings\n' +
                               '┃◈┃• getpp - Get user\'s profile picture\n' +
                               '┃◈┃\n' +
                               '┃◈┃*Options for Privacy commands:*\n' +
                               '┃◈┃• all - Everyone\n' +
                               '┃◈┃• contacts - My contacts only\n' +
                               '┃◈┃• contact_blacklist - Contacts except blocked\n' +
                               '┃◈┃• none - Nobody\n' +
                               '┃◈┃• match_last_seen - Match last seen\n' +
                               '┃◈└───────────┈⊷\n' +
                               '╰──────────────┈⊷\n' +
                               '*Note:* Most commands are owner-only.\n        ';
                
                await ednut.sendMessage(from, {
                    'image': { 'url': 'https://files.catbox.moe/e71nan.png' },
                    'caption': menuText,
                    'contextInfo': {
                        'mentionedJid': [m.sender],
                        'forwardingScore': 2,
                        'isForwarded': true,
                        'forwardedNewsletterMessageInfo': {
                            'newsletterJid': '120363303045895814@newsletter',
                            'newsletterName': 'Zed-Bot',
                            'serverMessageId': 143
                        }
                    }
                }, { 'quoted': m });
                
            } catch (err) {
                console.error(err);
                reply('❌ Error: ' + err.message);
            }
        }
    },
    
    {
        'command': ['setmyname'],
        'description': 'Set your WhatsApp display name.',
        'category': 'Privacy',
        
        async 'execute'(m, { ednut, isOwner, reply, args }) {
            if (!isOwner) return reply('🚫 Owner only');
            const name = args.join(' ');
            if (!name) return reply('❌ Please provide a display name.');
            
            try {
                await ednut.updateProfileName(name);
                reply('✅ Display name updated to: ' + name);
            } catch (err) {
                console.error(err);
                reply('❌ Failed to update display name: ' + err.message);
            }
        }
    },
    
    {
        'command': ['getbio'],
        'description': 'Get user\'s bio',
        'category': 'Privacy',
        
        async 'execute'(m, { ednut, args, reply }) {
            try {
                const userId = args[0] || m.key.remoteJid;
                const status = await ednut.fetchStatus?.(userId);
                if (!status) return reply('No bio found.');
                reply('User Bio:\n\n' + status.status);
            } catch (err) {
                console.error(err);
                reply('No bio found.');
            }
        }
    },
    
    {
        'command': ['setppall'],
        'description': 'Update Profile Picture Privacy',
        'category': 'Privacy',
        
        async 'execute'(m, { ednut, isOwner, args, reply }) {
            await ednut.sendMessage(m.key.remoteJid, {
                'react': { 'text': '🔐', 'key': m.key }
            });
            
            if (!isOwner) return reply('🚫 Owner only');
            
            try {
                const option = args[0] || 'all';
                const validOptions = ['all', 'contacts', 'contact_blacklist', 'none'];
                
                if (!validOptions.includes(option)) {
                    return reply('❌ Invalid option. Valid: all, contacts, contact_blacklist, none');
                }
                
                await ednut.updateProfilePicturePrivacy(option);
                reply('✅ Profile picture Privacy updated to: ' + option);
            } catch (err) {
                reply('❌ Error: ' + err.message);
            }
        }
    },
    
    {
        'command': ['setonline'],
        'description': 'Update Online Privacy',
        'category': 'Privacy',
        
        async 'execute'(m, { ednut, isOwner, args, reply }) {
            await ednut.sendMessage(m.key.remoteJid, {
                'react': { 'text': '🔐', 'key': m.key }
            });
            
            if (!isOwner) return reply('🚫 Owner only');
            
            try {
                const option = args[0] || 'all';
                const validOptions = ['all', 'match_last_seen'];
                
                if (!validOptions.includes(option)) {
                    return reply('❌ Invalid option. Valid: all, match_last_seen');
                }
                
                await ednut.updateOnlinePrivacy(option);
                reply('✅ Online Privacy updated to: ' + option);
            } catch (err) {
                reply('❌ Error: ' + err.message);
            }
        }
    },
    
    {
        'command': ['updatebio'],
        'description': 'Change bot\'s bio',
        'category': 'Privacy',
        
        async 'execute'(m, { ednut, isOwner, q, reply, from }) {
            if (!isOwner) return reply('🚫 Owner only');
            if (!q) return reply('❓ Enter the new bio');
            if (q.length > 139) return reply('❗ Character limit exceeded');
            
            await ednut.sendMessage(m.key.remoteJid, {
                'react': { 'text': '🥏', 'key': m.key }
            });
            
            try {
                await ednut.updateProfileStatus(q);
                await ednut.sendMessage(from, {
                    'text': '✔️ New Bio Added Successfully'
                }, { 'quoted': m });
            } catch (err) {
                reply('❌ Error: ' + err.message);
            }
        }
    },
    
    {
        'command': ['groupsPrivacy'],
        'description': 'Update Group Add Privacy',
        'category': 'Privacy',
        
        async 'execute'(m, { ednut, isOwner, args, reply }) {
            await ednut.sendMessage(m.key.remoteJid, {
                'react': { 'text': '🔐', 'key': m.key }
            });
            
            if (!isOwner) return reply('❌ You are not the owner!');
            
            try {
                const option = args[0] || 'all';
                const validOptions = ['all', 'contacts', 'contact_blacklist', 'none'];
                
                if (!validOptions.includes(option)) {
                    return reply('❌ Invalid option. Valid: all, contacts, contact_blacklist, none');
                }
                
                await ednut.updateGroupsAddPrivacy(option);
                reply('✅ Group add Privacy updated to: ' + option);
            } catch (err) {
                reply('❌ Error: ' + err.message);
            }
        }
    },
    
    {
        'command': ['getPrivacy'],
        'description': 'View current Privacy settings',
        'category': 'Privacy',
        
        async 'execute'(m, { ednut, isOwner, reply, from }) {
            if (!isOwner) return reply('🚫 Owner only');
            
            try {
                const privacy = await ednut.fetchPrivacySettings?.(true);
                if (!privacy) return reply('❌ Failed to fetch Privacy settings');
                
                const privacyText = '\n╭───「 𝙿𝚁𝙸𝚅𝙰𝙲𝚈 」───◆\n' +
                                  '│ ∘ Read Receipts: ' + privacy.readreceipts + '\n' +
                                  '│ ∾ Online: ' + privacy.online + '\n' +
                                  '│ ∾ Last Seen: ' + privacy.last + '\n' +
                                  '│ ∾ Status: ' + privacy.status + '\n' +
                                  '│ ∾ Group Privacy: ' + privacy.groupadd + '\n' +
                                  '│ ∾ Call Privacy: ' + privacy.calladd + '\n' +
                                  '╰────────────────────\n        ';
                
                await ednut.sendMessage(from, {
                    'text': privacyText
                }, { 'quoted': m });
            } catch (err) {
                reply('❌ Error: ' + err.message);
            }
        }
    },
    
    {
        'command': ['getpp'],
        'description': 'Fetch group profile picture',
        'category': 'Privacy',
        
        async 'execute'(m, { ednut, isGroup, reply }) {
            if (!isGroup) return reply('⚠️ Only works in groups');
            
            try {
                const profilePic = await ednut.profilePictureUrl(m.chat, 'full').catch(() => null);
                if (!profilePic) return reply('⚠️ No group profile picture found.');
                
                await ednut.sendMessage(m.chat, {
                    'image': { 'url': profilePic },
                    'caption': '🖼️ Group profile picture.'
                });
            } catch (err) {
                reply('❌ Error fetching group profile picture');
            }
        }
    }
];