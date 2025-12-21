module.exports = [{
    command: ['owner'],
    description: 'Get owner contact',
    category: 'Info',
    ban: true,
    gcban: true,
    execute: async (message, { ednut }) => {
        await ednut.sendContact(message.chat, [global.owner], global.ownername);
    }
}];