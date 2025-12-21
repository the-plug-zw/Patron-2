const os = require('os');
const moment = require('moment-timezone');
const { sizeFormatter } = require('human-readable');

// Helper function for small caps text
function smallCaps(text) {
    const mapping = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ',
        'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ',
        'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ',
        'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
    };
    
    return text.toLowerCase().split('').map(char => mapping[char] || char).join('');
}

// Format date with timezone
const welDate = moment.tz(global.timezone).format('DD/MM/YYYY');

// Size formatter
const formatp = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => literal + ' ' + symbol + 'B'
});

// Runtime formatter
function run(seconds) {
    seconds = Number(seconds);
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [days && days + 'd', hours && hours + 'h', minutes && minutes + 'm', secs && secs + 's']
        .filter(Boolean)
        .join(' ');
}

// Get time function
function getTime(format = 'HH:mm:ss', time) {
    return time ? moment(time).format(format) : moment.tz(global.timezone).format(format);
}

module.exports = {
    command: ['menu'],
    alias: ['allmenu'],
    description: 'Show bot menu command list',
    ban: true,
    gcban: true,
    
    execute: async (m, { ednut, commands, text }) => {
        // Get disabled commands
        const disabled = Array.isArray(global.db.disabled) ? 
            global.db.disabled.filter(Boolean).map(cmd => cmd.toLowerCase()) : [];
        
        // Get category filter from text
        const categoryFilter = text?.trim()?.split(' ')[0]?.toLowerCase();
        
        let totalCommands = 0;
        
        // Organize commands by category
        const categories = {
            'EnvManager': [], 'Info': [], 'Fun': [], 'Ai': [], 'Group': [], 
            'Owner': [], 'Other': [], 'Logo': [], 'Search': [], 'Converter': [], 
            'Maker': [], 'Game': [], 'Tool': [], 'Downloader': [], 'Wa': [], 
            'External': [], 'Nsfw': [], 'Settings': [], 'Privacy': []
        };
        
        // Populate categories
        commands.forEach(cmd => {
            const category = cmd.category || 'Other';
            const cmdArray = Array.isArray(cmd.command) ? cmd.command : [cmd.command];
            const isDisabled = cmdArray.some(c => c && disabled.includes(c.toLowerCase()));
            
            if (categories[category] && !isDisabled) {
                cmdArray.filter(Boolean).forEach(cmdName => {
                    categories[category].push(cmdName);
                });
                totalCommands += cmdArray.filter(Boolean).length;
            }
        });
        
        // Filter categories if requested
        const categoryKeys = Object.keys(categories);
        const filteredCategories = categoryFilter ? 
            categoryKeys.filter(key => typeof key === 'string' && key.toLowerCase() === categoryFilter) : 
            categoryKeys;
        
        const hasCommands = filteredCategories.some(key => categories[key].length > 0);
        
        // If filtered category doesn't exist or has no commands, return
        if (categoryFilter && (!filteredCategories.length || !hasCommands)) {
            return;
        }
        
        // Build menu header
        const userName = m.pushName || 'User';
        const memoryUsed = formatp(os.freemem(), os.totalmem());
        const uptime = run(process.uptime());
        const currentTime = getTime();
        
        let menu = '╔═━〔 *' + smallCaps(global.botname) + ' 〕━═╗\n' +
                  '│ 👤 ' + smallCaps('User') + ': ' + userName + '\n' +
                  '│ ⏳ ' + smallCaps('Ping') + ': ' + (Date.now() - (m.messageTimestamp * 1000)) + ' ms\n' +
                  '│ 📡 ' + smallCaps('Time') + ': ' + currentTime + '\n' +
                  '│ 📅 ' + smallCaps('Date') + ': ' + welDate + '\n' +
                  '│ 🧩 ' + smallCaps('Commands') + ': ' + totalCommands + '\n' +
                  '│ 💾 ' + smallCaps('Memory') + ': ' + memoryUsed + '\n' +
                  '│ ⏰ ' + smallCaps('Uptime') + ': ' + uptime + '\n' +
                  '╰──────────╯\n\n';
        
        // Category icons
        const categoryIcons = {
            'Envmanager': '🛠️', 'Info': 'ℹ️', 'Fun': '🎉', 'Ai': '🤖', 
            'Group': '👥', 'Owner': '👑', 'Other': '📦', 'Logo': '🎨', 
            'Search': '🔎', 'Converter': '🔄', 'Maker': '🖌️', 'Game': '🎮', 
            'Tool': '🛠️', 'Downloader': '⬇️', 'Wa': '📱', 'External': '🌐', 
            'Nsfw': '🔞', 'Settings': '⚙️', 'Privacy': '🔐'
        };
        
        // Filter out "Privacy" category from display
        const displayCategories = filteredCategories.filter(cat => cat !== 'Privacy');
        displayCategories.unshift('Privacy'); // Add Privacy at the beginning
        
        // Add categories to menu
        displayCategories.forEach(category => {
            if (categories[category].length > 0) {
                menu += '╭── ' + (categoryIcons[category] || '') + ' ' + smallCaps(category) + ' ──╮\n';
                
                // Sort and deduplicate commands
                const uniqueCommands = [...new Set(categories[category])].sort();
                
                uniqueCommands.forEach(cmd => {
                    menu += '│ • ' + global.prefix + smallCaps(cmd) + '\n';
                });
                
                menu += '╰──────────╯\n\n';
            }
        });
        
        await ednut.sendMessage(m.chat, {
            text: menu
        }, { quoted: m });
    }
};