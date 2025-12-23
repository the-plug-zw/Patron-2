module.exports = [{
    command: ['out'],
    alias: ['ck', '🦶'],
    description: 'Removes all members with specific country code from the group',
    category: 'admin',
    filename: __filename,
    
    async execute(m, { ednut, from, q, isGroup, isBotAdmins, reply, groupMetadata, isOwner }) {
        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
        
        try {
            if (!isGroup) return reply('❌ This command can only be used *in groups*.');
            if (!isOwner) return reply('❌ Only the *bot owner* can use this command.');
            if (!isBotAdmins) return reply('❌ I need to be an *admin* to use this command.');
            if (!q) return reply('❌ Please provide a country code. Example: .out 234');
            
            const countryCode = q.trim();
            if (!/^\d+$/.test(countryCode)) return reply('❌ Invalid country code. Please provide only numbers (e.g., 234 for +234 numbers).');
            
            const participants = groupMetadata?.participants || [];
            if (!participants.length) return reply('❌ Couldn\'t fetch group participants.');
            
            const targetUsers = participants.filter(user => 
                (user.jid || user.id)?.split('@')[0].startsWith(countryCode) && !user.admin
            );
            
            if (!targetUsers.length) return reply('❌ No members found with country code +' + countryCode);
            
            for (const user of targetUsers) {
                await ednut.groupParticipantsUpdate(from, [user.jid || user.id], 'remove');
                await sleep(1500);
            }
            
            reply('✅ Successfully removed ' + targetUsers.length + ' member(s) with country code +' + countryCode);
        } catch (error) {
            console.error('Out command error:', error);
            reply('❌ Failed to remove members. Error: ' + error.message);
        }
    }
}];