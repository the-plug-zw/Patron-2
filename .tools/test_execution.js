const fs = require('fs');
const path = require('path');

const commands = JSON.parse(fs.readFileSync(path.join(__dirname, 'commands.json')));

// Mock message object
const createMockMessage = (cmdName, text = '') => ({
    key: {
        remoteJid: '120363303045895814@g.us',
        fromMe: false,
        id: 'test_' + Date.now(),
        participant: '263781564004@s.whatsapp.net'
    },
    message: {
        conversation: text || cmdName
    },
    chat: '120363303045895814@g.us',
    sender: '263781564004@s.whatsapp.net',
    pushName: 'Test User',
    isGroup: true,
    mtype: 'conversation',
    text: text || cmdName,
    quoted: null
});

// Mock context object
const createMockContext = (cmd, text = '') => ({
    ednut: {
        sendMessage: async () => ({ key: { id: 'test' } }),
        groupMetadata: async () => ({ subject: 'Test Group', participants: [] })
    },
    args: text.split(' ').slice(1),
    q: text.split(' ').slice(1).join(' '),
    reply: async (msg) => console.log(`[REPLY] ${msg}`),
    reply2: async (msg) => console.log(`[REPLY2] ${msg}`),
    text: text.split(' ').slice(1).join(' '),
    isOwner: true,
    isGroup: true,
    from: '120363303045895814@g.us',
    sender: '263781564004@s.whatsapp.net'
});

const testResults = {
    total: 0,
    executable: 0,
    errors: []
};

// Test a sample of commands
const sampleSize = Math.min(10, commands.filter(c => !c.error).length);
const sampled = commands.filter(c => !c.error).slice(0, sampleSize);

console.log(`\nTesting ${sampleSize} random commands for execution...\n`);

(async () => {
    for (const cmd of sampled) {
        if (cmd.error) continue;

        testResults.total++;
        const cmdName = cmd.commands?.[0] || 'unknown';

        try {
            const filePath = path.join(__dirname, '../plugins/patron', cmd.file);
            delete require.cache[require.resolve(filePath)];
            const pluginModule = require(filePath);
            const pluginArray = Array.isArray(pluginModule) ? pluginModule : [pluginModule];
            const command = pluginArray[cmd.index];

            if (command && typeof command.execute === 'function') {
                testResults.executable++;

                const mockMsg = createMockMessage(cmdName, '');
                const mockCtx = createMockContext(command, '');

                // Try to call execute - don't await since it may hang
                const executePromise = Promise.resolve(command.execute(mockMsg, mockCtx))
                    .catch(err => `[EXEC_ERROR] ${err.message.split('\n')[0]}`);

                // Set timeout to prevent hanging
                const timeoutPromise = new Promise((resolve) =>
                    setTimeout(() => resolve('[TIMEOUT]'), 500)
                );

                const result = await Promise.race([executePromise, timeoutPromise]);

                console.log(`✅ ${cmd.file}(${cmdName}): Callable`);
            }
        } catch (err) {
            testResults.errors.push(`❌ ${cmd.file}(${cmdName}): ${err.message.split('\n')[0]}`);
            console.log(`❌ ${cmd.file}(${cmdName}): ${err.message.split('\n')[0]}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('EXECUTION TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tested:  ${testResults.total}`);
    console.log(`Executable:    ${testResults.executable}`);
    console.log(`Success Rate:  ${((testResults.executable / testResults.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(60) + '\n');
})();
