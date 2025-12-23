module.exports = [
    {
        'command': ['send-invite'],
        'alias': ['sendinvite'],
        'description': 'Invite a user to the group via link',
        'category': 'Group',
        'use': '<phone number>',
        'filename': __filename,
        
        async 'execute'(m, { ednut, from, text, isGroup, isBotAdmins, isAdmins, reply }) {
            try {
                if (!isGroup) return reply('❌ This command can only be used *in a group chat*.');
                if (!isAdmins) return reply('❌ Only group admins can use this command.');
                if (!isBotAdmins) return reply('❌ I need to be *admin* in this group to generate invite links.');
                if (!text) return reply('❌ *Please enter the number you want to invite.*\n\n📌 *Example:*\n*.sendinvite 234813XXXXXXX*\n\n💡 Use *.invite* to get the group link manually.');
                
                let phoneNumber = text.replace(/\D/g, '');
                if (phoneNumber.length < 8) return reply('⚠️ *Enter a valid number with country code.*');
                
                let [user] = await ednut.onWhatsApp(phoneNumber + '@s.whatsapp.net');
                if (!user?.exists) return reply('❌ This number is not registered on WhatsApp.');
                
                let inviteCode = await ednut.groupInviteCode(from);
                let inviteLink = 'https://chat.whatsapp.com/' + inviteCode;
                
                await ednut.sendMessage(phoneNumber + '@s.whatsapp.net', {
                    'text': '📩 *GROUP INVITATION*\n\n👤 *Sender:* @' + m.sender.split('@')[0] + '\n\n💬 *Group ID:* ' + from + '\n\n🔗 *Invite Link:* ' + inviteLink,
                    'mentions': [m.sender]
                }).catch(err => {
                    console.error('DM failed:', err);
                    return reply('❌ Could not send DM. Maybe the user has privacy settings enabled.');
                });
                
                reply('✅ *Group invite link has been sent successfully!*');
                
            } catch (err) {
                console.error('Error in sendinvite command:', err);
                reply('⚠️ *Error:* ' + (err?.message || err));
            }
        }
    }
];