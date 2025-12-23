// group-info.js
// Cleaned and deobfuscated version

module.exports = [
    {
        'command': ['ginfo'],
        'alias': ['groupinfo'],
        'description': 'Get group information',
        'category': 'Group',
        'group': true,
        'execute': async (message, { ednut, from, isGroup, isAdmins, isBotAdmins, reply }) => {
            try {
                if (!isGroup) return reply('❌ This command can only be used in groups.');
                if (!isAdmins) return reply('❌ Only group admins can use this command.');
                if (!isBotAdmins) return reply('❌ I need to be an admin to get group info.');
                
                const defaultPics = [
                    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
                    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
                    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png'
                ];
                
                let groupPic;
                try {
                    groupPic = await ednut.profilePictureUrl(from, 'image');
                } catch {
                    groupPic = defaultPics[Math.floor(Math.random() * defaultPics.length)];
                }
                
                const groupData = await ednut.groupMetadata(from);
                const participants = groupData.participants || [];
                const admins = participants.filter(p => p.admin);
                const adminList = admins.map((admin, index) => 
                    index + 1 + '. @' + admin.id.split('@')[0]).join('\n');
                const owner = groupData.owner;
                
                const caption = 
                    '*「 Group Information 」*\n\n*' + 
                    groupData.subject + 
                    '*\n\n*Group Jid* - ' + 
                    groupData.id + 
                    '\n*Group Creator* - ' + 
                    owner.split('@')[0] + 
                    '\n*Group Description* - ' + 
                    (groupData.desc?.toString() || 'undefined') + 
                    '\n*Participant Count* - ' + 
                    participants.length + 
                    '\n\n*Group Admins* -\n' + 
                    adminList + '\n';
                
                await ednut.sendMessage(from, {
                    'image': { 'url': groupPic },
                    'caption': caption,
                    'mentions': admins.map(admin => admin.id)
                });
            } catch (error) {
                console.error('Error in ginfo:', error);
                return reply('❌ *Error Occurred!!*\n\n' + error);
            }
        }
    }
];