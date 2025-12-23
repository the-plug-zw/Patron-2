// creategc.js - Create group functionality
module.exports = [
  {
    command: ['newgc'],
    alias: ['creategc'],
    description: 'Create a new group with only the bot and the owner added.',
    category: 'Group',
    group: false,
    owner: true,
    ban: false,
    gcban: false,
    async execute(message, {
      ednut,
      args,
      isGroup,
      isOwner,
      reply
    }) {
      const sendReply = async (text) => {
        await ednut.sendMessage(message.chat, {
          'text': text
        }, {
          'quoted': message
        });
      };

      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      try {
        if (isGroup) {
          return sendReply('❌ This command can only be used in private chat with the bot.');
        }

        if (!isOwner) {
          return sendReply('❌ Only the bot owner can use this command.');
        }

        const groupName = args.trim();
        
        if (!groupName) {
          return sendReply('⚠️ Usage: .newgc <group_name>\n❌ Error: Group name cannot be empty.');
        }

        if (groupName.length > 25) {
          return sendReply('❌ Group name too long. Use less than 25 characters.');
        }

        // Create the group with the bot and the sender
        const group = await ednut.groupCreate(groupName, [message.sender]);
        
        await delay(3000);

        // Get the group invite code
        const inviteCode = await ednut.groupInviteCode(group.id).catch(error => {
          console.log('Error getting invite code:', error);
          return null;
        });

        const replyText = 
          '✅ Group created successfully!\n\n' +
          '🆔 Group name: ' + groupName + '\n' +
          '👑 Owner added: @' + message.sender.split('@')[0] + '\n' +
          (inviteCode ? '🔗 Invite link: https://chat.whatsapp.com/' + inviteCode : '⚠️ Could not generate invite link.');

        await sendReply(replyText);

      } catch (error) {
        console.error('Error in newgc:', error);
        
        if (error.message?.includes('Connection Closed') || error.message?.includes('Timed Out')) {
          await sendReply('❌ Connection error. Please try again after a few seconds.');
        } else {
          await sendReply('❌ Failed to create group. Please try again.');
        }
      }
    }
  }
];