const fs = require('fs');
const path = require('path');

// Data directory
const dataDir = path.join(__dirname, '../../storage');

// Ensure directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Bank data file path
const bankDataPath = path.join(dataDir, 'bank-data.json');

/**
 * Load bank information from file
 */
function loadBankInfo() {
    try {
        if (fs.existsSync(bankDataPath)) {
            const fileData = fs.readFileSync(bankDataPath, 'utf8');
            return JSON.parse(fileData);
        } else {
            // Create default bank info
            const defaultBankInfo = {
                bankName: '',
                holderName: '',
                accountNumber: ''
            };
            fs.writeFileSync(bankDataPath, JSON.stringify(defaultBankInfo, null, 2));
            return defaultBankInfo;
        }
    } catch (error) {
        console.error('Error loading bank data:', error);
        return { bankName: '', holderName: '', accountNumber: '' };
    }
}

/**
 * Save bank information to file
 */
function saveBankInfo(bankData) {
    try {
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving bank data:', error);
        return false;
    }
}

// Load bank info at startup
let bankInfo = loadBankInfo();

module.exports = [
    {
        command: ['set-bank'],
        alias: ['setbank'],
        description: 'Set bank account information',
        category: 'Owner',
        
        async execute(m, { text, isOwner, reply }) {
            try {
                // Owner only command
                if (!isOwner) {
                    return reply('📛 This command is restricted to owners only.');
                }
                
                // Check if text is provided
                const input = text?.trim();
                if (!input) {
                    return reply(
                        '❌ *Invalid Format!*\n\n' +
                        'Use:\n' +
                        '`.set-bank Shinnon | EcoCash | 0123456789`'
                    );
                }
                
                // Parse input format: Holder | Bank | Account
                const parts = text.split('|').map(part => part.trim());
                
                if (parts.length !== 3) {
                    return reply(
                        '❌ *Invalid Format!*\n\n' +
                        'Use:\n' +
                        '`.setaza Jane Doe | GTBank | 0123456789`'
                    );
                }
                
                let [holderName, bankName, accountNumber] = parts;
                
                // Format names
                holderName = holderName.toUpperCase();
                bankName = bankName.toUpperCase();
                
                // Validate account number (must be numeric)
                if (!/^\d+$/.test(accountNumber)) {
                    return reply(
                        '❌ Account number must be numeric.\n' +
                        'Example:\n' +
                        '`.set-bank Shinnon | EcoCash | 0781564004`'
                    );
                }
                
                // Update bank info
                bankInfo = {
                    holderName,
                    bankName,
                    accountNumber
                };
                
                // Save to file
                if (!saveBankInfo(bankInfo)) {
                    return reply('❌ Error saving bank information. Please try again.');
                }
                
                // Success response
                return reply(
                    '🏦 *BANK DETAILS SAVED*\n\n' +
                    `🚹 *${bankInfo.holderName}*\n` +
                    `🔢 *${bankInfo.accountNumber}*\n` +
                    `🏦 *${bankInfo.bankName}*\n\n` +
                    '*SEND SCREENSHOT AFTER PAYMENT*'
                );
                
            } catch (error) {
                console.error('Set bank info error:', error);
                return reply('❌ An error occurred while setting bank info.');
            }
        }
    },
    
    {
        command: ['aza'],
        alias: ['bank'],
        description: 'Get bank account information',
        category: 'Info',
        
        async execute(m, { reply }) {
            try {
                // Reload bank info
                bankInfo = loadBankInfo();
                
                // Check if bank info is set
                if (!bankInfo.bankName || !bankInfo.holderName || !bankInfo.accountNumber) {
                    return reply(
                        '❌ Bank info not set yet.\n' +
                        'Use `.setaza Holder | Bank | Account` first.'
                    );
                }
                
                // Display bank info
                return reply(
                    '🏦 *BANK DETAILS*\n\n' +
                    `🚹 *${bankInfo.holderName}*\n` +
                    `🔢 *${bankInfo.accountNumber}*\n` +
                    `🏦 *${bankInfo.bankName}*\n\n` +
                    'Use .aza to view this information.'
                );
                
            } catch (error) {
                console.error('Get bank info error:', error);
                return reply('❌ An error occurred while fetching bank info.');
            }
        }
    },
    
    {
        command: ['clearaza'],
        alias: ['resetbank'],
        description: 'Clear saved bank account information',
        category: 'Owner',
        
        async execute(m, { isOwner, reply }) {
            try {
                // Owner only command
                if (!isOwner) {
                    return reply('📛 This command is restricted to owners only.');
                }
                
                // Delete bank data file if exists
                if (fs.existsSync(bankDataPath)) {
                    fs.unlinkSync(bankDataPath);
                }
                
                // Reset bank info
                bankInfo = {
                    bankName: '',
                    holderName: '',
                    accountNumber: ''
                };
                
                // Save empty info
                saveBankInfo(bankInfo);
                
                return reply('✅ Bank information has been cleared.');
                
            } catch (error) {
                console.error('Clear bank info error:', error);
                return reply('❌ An error occurred while clearing bank info.');
            }
        }
    }
];