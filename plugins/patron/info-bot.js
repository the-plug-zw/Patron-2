module.exports = [
    {
        command: ['ping'],
        description: 'Check bot latency',
        category: 'Info',
        ban: true,
        gcban: true,
        
        execute: async (m, { ednut }) => {
            let start = Date.now();
            let sent = await ednut.sendMessage(m.chat, {
                text: '_checking response..._'
            });
            let latency = Date.now() - start;
            
            await ednut.sendMessage(m.chat, {
                text: '*Pong!* ' + latency + 'ms',
                edit: {
                    remoteJid: m.chat,
                    id: sent.key.id
                }
            });
        }
    },
    {
        command: ['uptime'],
        alias: ['runtime'],
        description: 'Check bot runtime',
        category: 'Info',
        ban: true,
        gcban: true,
        
        execute: async (m, { ednut, runtime, reply }) => {
            let message = global.botname + ' has been active for ' + runtime(process.uptime());
            await reply(message);
        }
    },
    {
        command: ['test'],
        alias: ['bot'],
        description: 'Test command',
        category: 'Info',
        ban: true,
        gcban: true,
        
        execute: async (m, { text, reply2 }) => {
            if (!text) return reply2('*Active 🤖*');
        }
    }
];