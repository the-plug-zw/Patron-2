const fs = require('fs');
const path = require('path');

const commands = JSON.parse(fs.readFileSync(path.join(__dirname, 'commands.json')));

const tests = {
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: []
};

// Group by file
const byFile = {};
for (const cmd of commands) {
    if (cmd.error) continue;
    if (!byFile[cmd.file]) byFile[cmd.file] = [];
    byFile[cmd.file].push(cmd);
}

// Test each command
for (const [file, cmds] of Object.entries(byFile)) {
    const filePath = path.join(__dirname, '../plugins/patron', file);

    if (!fs.existsSync(filePath)) {
        tests.failed++;
        tests.errors.push(`❌ FILE MISSING: ${file}`);
        continue;
    }

    try {
        delete require.cache[require.resolve(filePath)];
        const pluginModule = require(filePath);
        const pluginArray = Array.isArray(pluginModule) ? pluginModule : [pluginModule];
        for (let i = 0; i < pluginArray.length; i++) {
            const cmd = pluginArray[i];
            const cmdName = cmd.command?.[0] || 'unknown';
            const fullPath = `${file}[${i}]`;

            // Check required fields
            if (!cmd.command || cmd.command.length === 0) {
                tests.warnings++;
                tests.errors.push(`⚠️  ${fullPath}: Missing command field`);
                continue;
            }

            if (!cmd.description) {
                tests.warnings++;
                tests.errors.push(`⚠️  ${fullPath}(${cmdName}): Missing description`);
            }

            if (!cmd.category) {
                tests.warnings++;
                tests.errors.push(`⚠️  ${fullPath}(${cmdName}): Missing category`);
            }

            if (!cmd.execute || typeof cmd.execute !== 'function') {
                tests.failed++;
                tests.errors.push(`❌ ${fullPath}(${cmdName}): Missing or invalid execute function`);
                continue;
            }

            tests.passed++;
        }
    } catch (err) {
        tests.failed++;
        tests.errors.push(`❌ ${file}: ${err.message.split('\n')[0]}`);
    }
}
// Print results
console.log('\n' + '='.repeat(60));
console.log('COMMAND TEST RESULTS');
console.log('='.repeat(60));
console.log(`✅ Passed:   ${tests.passed}`);
console.log(`❌ Failed:   ${tests.failed}`);
console.log(`⚠️  Warnings: ${tests.warnings}`);
console.log('='.repeat(60));

if (tests.errors.length > 0 && tests.errors.length <= 50) {
    console.log('\nDETAILS:');
    tests.errors.forEach(err => console.log(err));
} else if (tests.errors.length > 50) {
    console.log('\nFIRST 50 ERRORS:');
    tests.errors.slice(0, 50).forEach(err => console.log(err));
    console.log(`\n... and ${tests.errors.length - 50} more errors`);
}

console.log('\n' + '='.repeat(60));
const total = tests.passed + tests.failed;
const passRate = total > 0 ? ((tests.passed / total) * 100).toFixed(1) : 0;
console.log(`Total Commands: ${commands.filter(c => !c.error).length}`);
console.log(`Pass Rate: ${passRate}%`);
console.log('='.repeat(60) + '\n');

process.exit(tests.failed > 0 ? 1 : 0);
