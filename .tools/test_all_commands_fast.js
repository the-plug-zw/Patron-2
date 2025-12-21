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

const log = (color, ...args) => console.log((colors[color] || colors.reset), ...args, colors.reset);

// Test Results Storage
const results = {
    passed: [],
    failed: [],
    errors: [],
    skipped: []
};

// Mock context for command execution - MINIMAL
const mockContext = {
    ednut: null,
    isOwner: true,
    command: 'test',
    isCmd: true,
    example: (text) => `.test ${text}`,
    quoted: { message: { conversation: 'quoted' } },
    text: 'test',
    args: ['test'],
    q: 'test',
    axios: axios,
    reply2: async () => { },
    reply: async () => { },
    botNumber: '1234567890@s.whatsapp.net',
    pushname: 'Test User',
    isGroup: true,
    isPrivate: false,
    isAdmins: true,
    isBotAdmins: true,
    pickRandom: (arr) => arr ? arr[0] : null,
    runtime: (uptime) => '0h 0m 0s',
    prefix: ['.', '!'],
    fetch: fetch
};

// Load all plugins
function loadAllPlugins() {
    const plugins = [];
    const pluginsDir = path.resolve(__dirname, '../plugins/patron');

    if (fs.existsSync(pluginsDir)) {
        const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js')).sort();

        for (const file of files) {
            const filePath = path.join(pluginsDir, file);
            try {
                const resolved = require.resolve(filePath);
                if (require.cache[resolved]) delete require.cache[resolved];
                const plugin = require(filePath);

                if (Array.isArray(plugin)) {
                    plugins.push(...plugin.map((p, idx) => ({
                        ...p,
                        source: file,
                        index: idx
                    })));
                } else if (plugin && typeof plugin === 'object') {
                    plugins.push({ ...plugin, source: file, index: 0 });
                }
            } catch (err) {
                results.errors.push({
                    file: file,
                    error: err.message
                });
            }
        }
    }

    return plugins;
}

// Test a single command with STRICT timeout
async function testCommand(plugin, index, total) {
    const commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
    const cmd = commands[0];
    const source = plugin.source;
    const testKey = `${source}(${cmd})`;

    if (!plugin.command || typeof plugin.execute !== 'function') {
        results.failed.push({
            plugin: testKey,
            error: 'Invalid plugin structure',
            source: source
        });
        return;
    }

    // Create minimal message
    const testMsg = {
        key: { remoteJid: '123@g.us', id: 'test123', fromMe: false },
        chat: '123@g.us',
        sender: '1234@s.whatsapp.net',
        isGroup: true,
        text: 'test',
        pushName: 'Test User'
    };

    try {
        // Use Promise.race with aggressive timeout (2s)
        let completed = false;
        let error = null;

        const timeout = new Promise(resolve => {
            const timer = setTimeout(() => {
                if (!completed) {
                    error = 'Timeout (>2s)';
                    resolve();
                }
            }, 2000);

            // Don't keep the timer alive if test finishes
            timer.unref?.();
        });

        const execution = (async () => {
            try {
                await plugin.execute(testMsg, mockContext);
                completed = true;
                return true;
            } catch (err) {
                completed = true;
                error = err.message ? err.message.split('\n')[0] : String(err).substring(0, 60);
                throw err;
            }
        })();

        await Promise.race([execution, timeout]);

        if (error) {
            results.failed.push({
                plugin: testKey,
                error: error,
                source: source
            });
        } else if (!completed) {
            results.failed.push({
                plugin: testKey,
                error: 'Timeout (>2s)',
                source: source
            });
        } else {
            results.passed.push({
                plugin: testKey,
                source: source
            });
        }
    } catch (err) {
        results.failed.push({
            plugin: testKey,
            error: err.message ? err.message.split('\n')[0] : 'Error',
            source: source
        });
    }

    // Progress
    if (index % 20 === 0) {
        process.stdout.write(`\r  Progress: ${index}/${total} (${results.passed.length}✅ ${results.failed.length}❌)`);
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

    log('cyan', '🧪 Testing all commands (2s timeout per command)...\n');

    // Test each plugin sequentially
    for (let i = 0; i < allPlugins.length; i++) {
        await testCommand(allPlugins[i], i + 1, allPlugins.length);
    }

    console.log('\n\n'); // Clear progress line

    // Generate report
    log('blue', '='.repeat(70));
    log('blue', 'TEST RESULTS SUMMARY');
    log('blue', '='.repeat(70) + '\n');

    log('green', `✅ PASSED:   ${results.passed.length}`);
    log('red', `❌ FAILED:   ${results.failed.length}`);
    log('red', `💥 ERRORS:  ${results.errors.length}`);

    const passRate = allPlugins.length > 0
        ? ((results.passed.length / allPlugins.length) * 100).toFixed(1)
        : '0.0';

    log('cyan', `\n📊 Pass Rate: ${passRate}%\n`);

    // Failed commands
    if (results.failed.length > 0) {
        log('red', '\n' + '='.repeat(70));
        log('red', `❌ FAILED COMMANDS (${results.failed.length})`);
        log('red', '='.repeat(70) + '\n');

        results.failed.forEach((fail, idx) => {
            log('red', `${idx + 1}. ${fail.plugin}`);
            log('gray', `   Error: ${fail.error}`);
        });
    }

    // Plugin load errors
    if (results.errors.length > 0) {
        log('red', '\n' + '='.repeat(70));
        log('red', `💥 PLUGIN LOAD ERRORS (${results.errors.length})`);
        log('red', '='.repeat(70) + '\n');

        results.errors.forEach((err, idx) => {
            log('red', `${idx + 1}. ${err.file}`);
            log('gray', `   ${err.error}`);
        });
    }

    // Save detailed reports
    const reportDir = path.resolve(__dirname, '../.reports');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    // JSON Report
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalCommands: allPlugins.length,
            passed: results.passed.length,
            failed: results.failed.length,
            errors: results.errors.length,
            passRate: parseFloat(passRate)
        },
        details: {
            passed: results.passed.map(p => p.plugin),
            failed: results.failed,
            errors: results.errors
        }
    };

    const reportPath = path.join(reportDir, 'test_all_commands.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log('cyan', `\n📄 Detailed report: .reports/test_all_commands.json`);

    // CSV Report
    const csvPath = path.join(reportDir, 'test_all_commands.csv');
    let csv = 'Status,Plugin,Error\n';

    results.passed.forEach(p => {
        csv += `PASSED,"${p.plugin}",""\n`;
    });

    results.failed.forEach(f => {
        csv += `FAILED,"${f.plugin}","${(f.error || '').replace(/"/g, '""')}"\n`;
    });

    results.errors.forEach(e => {
        csv += `ERROR,"${e.file}","${(e.error || '').replace(/"/g, '""')}"\n`;
    });

    fs.writeFileSync(csvPath, csv);
    log('cyan', `📊 CSV report: .reports/test_all_commands.csv\n`);

    process.exit(results.failed.length > 0 || results.errors.length > 0 ? 1 : 0);
}

main().catch(err => {
    log('red', 'Fatal error:', err.message);
    process.exit(1);
});
