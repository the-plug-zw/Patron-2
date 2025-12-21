const fs = require('fs');
const { delay } = require('@whiskeysockets/baileys');
const pkg = require('../../package.json');
const getLatestGitHubVersion = require('../getversion');

// File for storing announcement status
const announceFile = './announce.json';

// Variable to store the connection update handler
let onConnectionUpdate;

/**
 * Load announcement status from file
 */
function loadAnnounce() {
    try {
        // Create file if it doesn't exist
        if (!fs.existsSync(announceFile)) {
            fs.writeFileSync(announceFile, JSON.stringify({ announced: false }, null, 2));
        }
        // Read and parse the file
        return JSON.parse(fs.readFileSync(announceFile, 'utf-8'));
    } catch (error) {
        return { announced: false };
    }
}

/**
 * Save announcement status to file
 */
function saveAnnounce(data) {
    try {
        fs.writeFileSync(announceFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Failed to save announce.json:', error);
    }
}

module.exports = function handleConnectionUpdate(client, restartFunction) {
    // Remove previous connection update listener if exists
    if (onConnectionUpdate) {
        client.ev.off('connection.update', onConnectionUpdate);
    }

    // Create new connection update handler
    onConnectionUpdate = async (update) => {
        const { connection, lastDisconnect } = update;
        let announceData = loadAnnounce();

        // Handle "connecting" state
        if (connection === 'connecting') {
            const reconnectCount = global.db.reconnect || 0;
            const logMessage = reconnectCount === 0 
                ? '[0] Connecting to WhatsApp...'
                : `[!] Reconnecting (${reconnectCount}/${process.env.MAX_RESTART})...`;
            
            console.log(reconnectCount === 0 ? 'INFO' : 'WARN', logMessage);
            
            if (reconnectCount === 0) {
                console.log('INFO', `[0] Patron Version: v${pkg.version}`);
            }
        }

        // Handle "open" (connected) state
        if (connection === 'open') {
            const userId = client.user.id.split(':')[0];
            console.log('INFO', `[0] Connected to: ${userId}`);
            
            // Reset reconnect counter
            global.db.reconnect = 0;

            // Load plugins if not already loaded
            if (!global.db.loadedPlugins) {
                try {
                    console.log('INFO', '[0] Installing plugins...');
                    
                    // Load all .js files from plugins directory
                    const pluginFiles = fs.readdirSync('./plugins/patron')
                        .filter(file => file.endsWith('.js'));
                    
                    for (const file of pluginFiles) {
                        try {
                            require(`../../plugins/patron/${file}`);
                        } catch (error) {
                            console.error('ERROR', `[x] Failed to load plugin ${file}: ${error.message}`);
                        }
                    }
                    
                    console.log('INFO', '[0] Plugins installed.');
                    global.db.loadedPlugins = true;
                } catch (error) {
                    console.error('ERROR', `[x] Plugin setup failed: ${error.message}`);
                }
            }

            // Send connection announcement if enabled and not already sent
            if (process.env.START_MSG === 'true' && !announceData.announced) {
                const latestVersion = await getLatestGitHubVersion();
                const versionStatus = latestVersion 
                    ? (latestVersion !== pkg.version 
                        ? ` (⚠️ New version v${latestVersion} available)`
                        : ' (✅ Up to date)')
                    : ' (⚠️ Unable to check updates)';

                await client.sendMessage(`${userId}@s.whatsapp.net`, {
                    text: `╔═══《 🚀 *𝗣𝗮𝘁𝗿𝗼𝗻-𝗠𝗗 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱* 🚹 》═══╗  

✨ *𝗛𝗲𝘆 𝗕𝗼𝘀𝘀!*  
*System online — ready for action ⚡*

╭─〔 ⚙️ *𝗤𝘂𝗶𝗰𝗸 𝗔𝗰𝗰𝗲𝘀𝘀 𝗣𝗮𝗻𝗲𝗹* 〕  
│ 🧠 *Check out?* → *.patron* to see full bot info  
│ 📜 *All Commands?* → Type *.list* to browse features  
╰───────────────────╯  

╭─〔 📌 *𝗦𝘆𝘀𝘁𝗲𝗺 𝗗𝗮𝘁𝗮* 〕  
│ 🔹 *Prefix:* ${global.prefix}  
│ 🔹 *Version:* v${pkg.version}${versionStatus}  
│ 🔹 *Telegram:* https://t.me/patrontechhub  
╰───────────────────╯  

⚡ *𝗡𝗼𝘁 𝗥𝗲𝘀𝗽𝗼𝗻𝗱𝗶𝗻𝗴?*  
*1️⃣ Fresh session → ${global.reconnect}*

*2️⃣ Update session ID*  
*3️⃣ Restart host 🚀*

⏳ *𝗚𝗿𝗼𝘂𝗽 𝗡𝗼𝘁𝗶𝗰𝗲:*  
*Replies in groups may take a few moments — stay cool 😎*

╚═══《 👑 *𝗣𝗮𝘁𝗿𝗼𝗻 𝗧𝗲𝗰𝗵* 🚹 》═══╝`
                });

                // Mark as announced and save
                announceData.announced = true;
                saveAnnounce(announceData);
            }
        }

        // Handle "close" (disconnected) state
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            
            // Increment reconnect counter
            global.db.reconnect = (global.db.reconnect || 0) + 1;

            // Handle specific error codes
            if (statusCode === 401) {
                console.error('ERROR', '[x] Logged out: Invalid session (401). Exiting...');
                return;
            }

            // Check max reconnect attempts
            const maxRestart = Number(process.env.MAX_RESTART || 3);
            if (global.db.reconnect >= maxRestart) {
                console.error('ERROR', 
                    `[x] Max reconnect attempts reached (${global.db.reconnect}/${maxRestart})`
                );
                global.db.reconnect = 0;
                process.exit(1);
            }

            // Log disconnection and schedule reconnect
            console.warn('WARN', 
                `[!] Disconnected (${statusCode || 'unknown'}), retrying... (${global.db.reconnect}/${maxRestart})`
            );
            
            // Schedule reconnect after delay
            setTimeout(() => restartFunction(), 2000);
        }
    };

    // Register the connection update handler
    client.ev.on('connection.update', onConnectionUpdate);
};