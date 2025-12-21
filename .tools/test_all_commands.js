#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

const log = (color, ...args) => console.log(colors[color] || colors.reset, ...args, colors.reset);

// Test Results Storage
const results = {
    passed: [],
    failed: [],
    errors: [],
    warnings: [],
    skipped: []
};

// Mock context for command execution
const mockContext = {
    conn: { decodeJid: (id) => id },
    msg: {
        key: { remoteJid: '123@g.us', id: 'test123', fromMe: false, participant: '1234@s.whatsapp.net' },
        chat: '123@g.us',
        sender: '1234@s.whatsapp.net',
        isGroup: true,
        text: 'test',
        quoted: { message: { conversation: 'quoted text' } },
        pushName: 'Test User'
    },
    isOwner: true,
    command: 'test',
    isCmd: true,
    example: (text) => `.test ${text}`,
    quoted: { message: { conversation: 'quoted' } },
    text: 'test argument',
    args: ['test', 'argument'],
    q: 'test argument',
    axios: axios,
    reply2: async (msg) => `[REPLY] ${msg}`,
    reply: async (msg) => `[REPLY] ${msg}`,
    botNumber: '1234567890@s.whatsapp.net',
    pushname: 'Test User',
    isGroup: true,
    isPrivate: false,
    isAdmins: true,
    isBotAdmins: true,
    pickRandom: (arr) => arr[Math.floor(Math.random() * arr.length)],
    runtime: (uptime) => '0h 0m 0s',
    prefix: ['.', '!'],
    getQuote: async () => 'Test quote',
    uploadImage: async () => 'image_url',
    openai: async () => ({ message: { content: [{ type: 'text', text: 'AI response' }] } }),
    tiktokDl: async () => ({ status: true, data: [{ url: 'video_url' }] }),
    yts: { search: async () => ({ all: [{ url: 'video_url', title: 'Test' }] }) },
    from: '123@g.us',
    pinterest: async () => [{ image: 'img_url' }],
    fontx: (text) => text,
    fetch: fetch,
    mime: { getExtension: () => 'jpg' },
    fs: fs,
    exec: (cmd, cb) => cb(null, 'exec output'),
    getRandom: (arr) => arr[Math.floor(Math.random() * arr.length)],
    toAudio: async () => Buffer.from('audio'),
    toPTT: async () => Buffer.from('ptt'),
    isMedia: false,
    lookup: (addr, cb) => cb(null, ['127.0.0.1']),
    pinDL: async () => ({ status: true, data: [] }),
    getDevice: () => 'device_info',
    googleTTS: async () => Buffer.from('audio'),
    styletext: async () => [{ result: 'styled text' }],
    setsudo: [],
    sleep: async (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    generateWAMessageFromContent: () => ({}),
    commands: []
};

// Load all plugins
function loadAllPlugins() {
    const plugins = [];
    const pluginsDir = path.resolve(__dirname, '../plugins/patron');

    if (fs.existsSync(pluginsDir)) {
        const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));

        for (const file of files) {
            const filePath = path.join(pluginsDir, file);
            try {
                const resolved = require.resolve(filePath);
                if (require.cache[resolved]) delete require.cache[resolved];
                const plugin = require(filePath);

                if (Array.isArray(plugin)) {
                    plugins.push(...plugin.map(p => ({ ...p, source: file })));
                } else if (plugin && typeof plugin === 'object') {
                    plugins.push({ ...plugin, source: file });
                }
            } catch (err) {
                results.errors.push({
                    file: file,
                    error: `Failed to load: ${err.message}`
                });
            }
        }
    }

    return plugins;
}

// Test a single command
async function testCommand(plugin, index, total) {
    const commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
    const cmd = commands[0];
    const source = plugin.source || 'unknown';
    const testKey = `${source}(${cmd})`;

    try {
        // Validate plugin structure
        if (!plugin.command) {
            results.skipped.push({ plugin: testKey, reason: 'No command property' });
            return;
        }

        if (typeof plugin.execute !== 'function') {
            results.failed.push({
                plugin: testKey,
                error: 'Execute function is not a function',
                type: 'Structure Error'
            });
            return;
        }

        // Create test message based on plugin requirements
        const testMsg = { ...mockContext.msg };
        const testCtx = { ...mockContext };

        // Adjust context for specific command types
        if (plugin.owner) testCtx.isOwner = true;
        if (plugin.group) testCtx.isGroup = true;
        if (plugin.private) testCtx.isGroup = false;
        if (plugin.botAdmin) testCtx.isBotAdmins = true;

        // Set a timeout for command execution
        let completed = false;
        let result = null;
        let error = null;

        const timeout = new Promise((resolve) => {
            setTimeout(() => {
                if (!completed) {
                    error = 'Timeout (>5s)';
                    resolve();
                }
            }, 5000);
        });

        const execution = (async () => {
            try {
                result = await plugin.execute(testMsg, testCtx);
                completed = true;
            } catch (err) {
                error = err.message || String(err);
                completed = true;
            }
        })();

        await Promise.race([execution, timeout]);

        if (error) {
            results.failed.push({
                plugin: testKey,
                error: error,
                command: cmd,
                source: source
            });
            log('red', `  ❌ ${testKey}: ${error}`);
        } else {
            results.passed.push({
                plugin: testKey,
                command: cmd,
                source: source,
                description: plugin.description || 'No description'
            });
            log('green', `  ✅ ${testKey}`);
        }
    } catch (err) {
        results.errors.push({
            plugin: testKey,
            error: err.message || String(err)
        });
        log('red', `  💥 ${testKey}: ${err.message}`);
    }

    // Progress indicator
    if (index % 10 === 0) {
        process.stdout.write(`\r  Progress: ${index}/${total}`);
    }
}

// Main execution
async function main() {
    console.clear();
    log('blue', '\n' + '='.repeat(70));
    log('blue', 'COMPREHENSIVE COMMAND EXECUTION TEST');
    log('blue', '='.repeat(70) + '\n');

    log('cyan', '📦 Loading all plugins...');
    const allPlugins = loadAllPlugins();
    log('cyan', `✅ Loaded ${allPlugins.length} commands\n`);

    log('cyan', '🧪 Testing all commands...\n');

    // Test each plugin
    for (let i = 0; i < allPlugins.length; i++) {
        await testCommand(allPlugins[i], i + 1, allPlugins.length);
    }

    console.log('\n'); // Clear progress line

    // Generate detailed report
    log('blue', '\n' + '='.repeat(70));
    log('blue', 'TEST RESULTS SUMMARY');
    log('blue', '='.repeat(70) + '\n');

    log('green', `✅ PASSED:   ${results.passed.length}`);
    log('red', `❌ FAILED:   ${results.failed.length}`);
    log('yellow', `⚠️  SKIPPED: ${results.skipped.length}`);
    log('red', `💥 ERRORS:  ${results.errors.length}`);

    const passRate = allPlugins.length > 0
        ? ((results.passed.length / allPlugins.length) * 100).toFixed(1)
        : '0.0';

    log('cyan', `\n📊 Pass Rate: ${passRate}%\n`);

    // Detailed failure report
    if (results.failed.length > 0) {
        log('red', '\n' + '='.repeat(70));
        log('red', 'FAILED COMMANDS - DETAILS FOR FIXING');
        log('red', '='.repeat(70) + '\n');

        results.failed.forEach((fail, idx) => {
            log('red', `${idx + 1}. ${fail.plugin}`);
            log('gray', `   Source: ${fail.source}`);
            log('gray', `   Command: ${fail.command}`);
            log('red', `   Error: ${fail.error}`);
            console.log();
        });
    }

    // Errors report
    if (results.errors.length > 0) {
        log('red', '\n' + '='.repeat(70));
        log('red', 'PLUGIN LOADING ERRORS');
        log('red', '='.repeat(70) + '\n');

        results.errors.forEach((err, idx) => {
            log('red', `${idx + 1}. ${err.plugin || err.file}`);
            log('red', `   ${err.error}`);
            console.log();
        });
    }

    // Skipped report
    if (results.skipped.length > 0) {
        log('yellow', '\n' + '='.repeat(70));
        log('yellow', 'SKIPPED COMMANDS');
        log('yellow', '='.repeat(70) + '\n');

        results.skipped.forEach((skip, idx) => {
            log('yellow', `${idx + 1}. ${skip.plugin}`);
            log('gray', `   Reason: ${skip.reason}`);
            console.log();
        });
    }

    // Summary statistics
    log('blue', '\n' + '='.repeat(70));
    log('blue', 'SUMMARY STATISTICS');
    log('blue', '='.repeat(70) + '\n');

    log('cyan', `Total Commands Tested: ${allPlugins.length}`);
    log('green', `Working Commands:     ${results.passed.length}`);
    log('red', `Broken Commands:      ${results.failed.length}`);
    log('yellow', `Skipped Commands:     ${results.skipped.length}`);
    log('red', `Plugin Load Errors:   ${results.errors.length}`);
    console.log();

    // Generate detailed JSON report for analysis
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalCommands: allPlugins.length,
            passed: results.passed.length,
            failed: results.failed.length,
            skipped: results.skipped.length,
            errors: results.errors.length,
            passRate: parseFloat(passRate)
        },
        details: {
            passed: results.passed,
            failed: results.failed,
            skipped: results.skipped,
            errors: results.errors
        }
    };

    // Save detailed report
    const reportPath = path.resolve(__dirname, '../.reports/test_all_commands.json');
    const reportDir = path.dirname(reportPath);

    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log('cyan', `\n📄 Detailed report saved to: .reports/test_all_commands.json`);

    // Generate CSV for spreadsheet analysis
    const csvPath = path.resolve(__dirname, '../.reports/test_all_commands.csv');
    let csv = 'Status,Plugin,Source,Command,Description,Error\n';

    results.passed.forEach(p => {
        csv += `PASSED,"${p.plugin}","${p.source}","${p.command}","${(p.description || '').replace(/"/g, '""')}",""\n`;
    });

    results.failed.forEach(f => {
        csv += `FAILED,"${f.plugin}","${f.source}","${f.command}","","${(f.error || '').replace(/"/g, '""')}"\n`;
    });

    results.skipped.forEach(s => {
        csv += `SKIPPED,"${s.plugin}","","","","${(s.reason || '').replace(/"/g, '""')}"\n`;
    });

    results.errors.forEach(e => {
        csv += `ERROR,"${e.plugin || e.file}","","","","${(e.error || '').replace(/"/g, '""')}"\n`;
    });

    fs.writeFileSync(csvPath, csv);
    log('cyan', `📊 CSV report saved to: .reports/test_all_commands.csv\n`);

    // Exit with appropriate code
    process.exit(results.failed.length > 0 || results.errors.length > 0 ? 1 : 0);
}

main().catch(err => {
    log('red', 'Fatal error:', err.message);
    process.exit(1);
});
