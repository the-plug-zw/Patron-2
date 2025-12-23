const moment = require('moment-timezone');

// Track processed group events to prevent duplicates
const handledGroupEvents = new Set();
const DEFAULT_PROFILE_PICTURE = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

// Store the event handler reference
let onGroupParticipantsUpdate;

module.exports = function setupGroupParticipantsUpdate(client) {
    // Remove existing listener if it exists
    if (onGroupParticipantsUpdate) {
        client.ev.off('group-participants.update', onGroupParticipantsUpdate);
    }

    // Create new event handler
    onGroupParticipantsUpdate = async (event) => {
        try {
            const groupId = event.id;
            const participants = event.participants || [];
            const action = event.action;
            
            // Create unique event ID to prevent duplicate processing
            const eventId = `${groupId}-${action}-${participants.join(',')}`;
            
            if (handledGroupEvents.has(eventId)) return;
            
            // Track and auto-clean event after 10 seconds
            handledGroupEvents.add(eventId);
            setTimeout(() => handledGroupEvents.delete(eventId), 10000);
            
            // Get group metadata
            let groupMetadata;
            try {
                groupMetadata = await client.groupMetadata(groupId);
            } catch (error) {
                // Handle specific errors
                if (error?.message?.includes('forbidden') || 
                    error?.output?.statusCode === 403) {
                    // Bot doesn't have permission to access this group
                    return;
                }
                console.error('Failed to get group metadata:', error);
                return;
            }
            
            const groupName = groupMetadata.subject;
            const groupDescription = groupMetadata.desc || 'No description.';
            const currentTime = moment().tz('Africa/Lagos').format('HH:mm:ss');
            const currentDate = moment().tz('Africa/Lagos').format('DD/MM/YYYY');
            const participantCount = participants.length;
            const totalMembers = groupMetadata.participants.length;
            
            // Get group settings with fallbacks
            const groupSettings = global.db.groups?.[groupId] || {};
            const welcomeMessage = groupSettings.welcome || 
                                 process.env.WELCOME_MSG || 
                                 'true';
            const goodbyeMessage = groupSettings.goodbye || 
                                  process.env.GOODBYE_MSG || 
                                  'true';
            
            // Process each participant in the event
            for (const participantId of participants) {
                let profilePicture = DEFAULT_PROFILE_PICTURE;
                
                // Try to get participant's profile picture
                try {
                    profilePicture = await client.profilePictureUrl(participantId, 'image');
                } catch (error) {
                    // Use default picture if unable to get
                }
                
                // Get participant's name
                const participantName = await client.getName(participantId);
                const participantMention = '@' + participantId.split('@')[0];
                
                // Template replacement function
                const applyTemplates = (text) => {
                    return text
                        .replace(/@user/gi, participantMention)
                        .replace(/@name/gi, participantName)
                        .replace(/@group/gi, groupName)
                        .replace(/@desc/gi, groupDescription)
                        .replace(/@date/gi, currentDate)
                        .replace(/@time/gi, currentTime)
                        .replace(/@count/gi, participantCount.toString())
                        .replace(/@total/gi, totalMembers.toString());
                };
                
                // Handle join events
                if (action === 'add' && welcomeMessage !== 'false') {
                    let welcomeText = groupSettings.setwelcome || 
                                     process.env.WELCOME || 
                                     '👋 Hello @user, welcome to *@group*!\n@desc\nJoined: @time on @date';
                    
                    // Check if message includes profile picture
                    const includesProfilePic = welcomeText.includes('@pp');
                    
                    // Remove @pp placeholder if present
                    welcomeText = welcomeText.replace(/@pp/gi, '').trim();
                    
                    const formattedMessage = applyTemplates(welcomeText);
                    
                    // Send welcome message
                    await client.sendMessage(groupId, includesProfilePic ? {
                        image: { url: profilePicture },
                        caption: formattedMessage,
                        mentions: [participantId]
                    } : {
                        text: formattedMessage,
                        mentions: [participantId]
                    });
                }
                
                // Handle leave events
                if (action === 'remove' && goodbyeMessage !== 'false') {
                    let goodbyeText = groupSettings.setgoodbye || 
                                     process.env.GOODBYE || 
                                     '👋 @user left *@group*';
                    
                    // Check if message includes profile picture
                    const includesProfilePic = goodbyeText.includes('@pp');
                    
                    // Remove @pp placeholder if present
                    goodbyeText = goodbyeText.replace(/@pp/gi, '').trim();
                    
                    const formattedMessage = applyTemplates(goodbyeText);
                    
                    // Send goodbye message
                    await client.sendMessage(groupId, includesProfilePic ? {
                        image: { url: profilePicture },
                        caption: formattedMessage,
                        mentions: [participantId]
                    } : {
                        text: formattedMessage,
                        mentions: [participantId]
                    });
                }
                
                // Handle promotion/demotion announcements
                if (groupSettings.events) {
                    const adminName = event.author 
                        ? await client.getName(event.author) 
                        : 'unknown';
                    
                    const adminMention = event.author 
                        ? '@' + event.author.split('@')[0] 
                        : 'unknown';
                    
                    if (action === 'promote') {
                        await client.sendMessage(groupId, {
                            text: `${participantMention} (${participantName}) was promoted by ${adminMention} (${adminName})`,
                            mentions: [participantId, event.author]
                        });
                    } else if (action === 'demote') {
                        await client.sendMessage(groupId, {
                            text: `${participantMention} (${participantName}) was demoted by ${adminMention} (${adminName})`,
                            mentions: [participantId, event.author]
                        });
                    }
                }
            }
            
        } catch (error) {
            console.error('Group update handler error:', error);
        }
    };
    
    // Register the event handler
    client.ev.on('group-participants.update', onGroupParticipantsUpdate);
};