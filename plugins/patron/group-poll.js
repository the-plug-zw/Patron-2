module.exports = [{
    command: ['poll'],
    description: 'Create a poll with a question and options in the group.',
    category: 'group',
    filename: __filename,
    
    async execute(m, { ednut, from, isGroup, body, reply, prefix }) {
        try {
            if (!isGroup) return reply('❌ This command can only be used in groups.');
            
            let [question, options] = body.split(';');
            if (!question || !options) return reply('Usage: ' + prefix + 'poll question;option1,option2,option3...');
            
            let optionsArray = options.split(',')
                .map(opt => opt.trim())
                .filter(opt => opt !== '');
            
            if (optionsArray.length < 2) return reply('❌ Please provide at least *two options* for the poll.');
            
            await ednut.sendMessage(from, {
                poll: {
                    name: question.trim(),
                    values: optionsArray,
                    selectableCount: 1,
                    toAnnouncementGroup: true
                }
            }, { quoted: m });
            
        } catch (error) {
            console.error('Poll command error:', error);
            reply('❌ An error occurred.\n\n_Error:_ ' + error.message);
        }
    }
}];