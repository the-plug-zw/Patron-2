const fs = require('fs').promises;
const { sleep } = require('../../all/myfunc');

module.exports = [{
    'command': ['savecontact'],
    'alias': ['svcontact', 'exportcontact'],
    'description': 'Save and Export Group Contacts as VCF',
    'category': 'Group',
    'filename': __filename,
    
    async 'execute'(m, { ednut, from, groupMetadata, reply, isGroup, isOwner }) {
        await ednut.sendMessage(m.key.remoteJid, {
            'react': { 'text': '📤', 'key': m.key }
        });
        
        try {
            if (!isGroup) return reply('❌ This command can only be used in groups.');
            if (!isOwner) return reply('❌ This command is only for the Owner.');
            
            let groupData = groupMetadata || await ednut.groupMetadata(from);
            let participants = groupData.participants || [];
            
            if (!participants.length) return reply('❌ Could not fetch group participants.');
            
            let uniqueNumbers = new Set();
            let contacts = [];
            
            const botContacts = [
                { 'phoneNumber': '2348133729715', 'name': 'ᴘᴀᴛʀᴏɴ 🚹' },
                { 'phoneNumber': '2348025533222', 'name': 'ᴘᴀᴛʀᴏɴ 2' }
            ];
            
            for (let participant of participants) {
                if (!participant.jid) continue;
                let number = participant.jid.split('@')[0];
                
                if (!uniqueNumbers.has(number)) {
                    uniqueNumbers.add(number);
                    let name = participant.name || participant.notify || participant.pushName || participant.id || '+' + number;
                    contacts.push({
                        'name': '🚹 ' + name,
                        'phoneNumber': number
                    });
                }
            }
            
            for (let contact of botContacts) {
                if (!uniqueNumbers.has(contact.phoneNumber)) {
                    uniqueNumbers.add(contact.phoneNumber);
                    contacts.push({
                        'name': '🚹 ' + contact.name,
                        'phoneNumber': contact.phoneNumber
                    });
                }
            }
            
            let totalContacts = contacts.length;
            if (totalContacts === 0) return reply('❌ No contacts found.');
            
            await reply('*Saved ' + totalContacts + ' contacts. Generating file...*');
            
            let vcfContent = contacts.map((contact, index) => 
                'BEGIN:VCARD\nVERSION:3.0\nFN:[' + (index + 1) + '] ' + contact.name + 
                '\nTEL;type=CELL;type=VOICE;waid=' + contact.phoneNumber + ':' + contact.phoneNumber + 
                '\nEND:VCARD'
            ).join('\n');
            
            await fs.mkdir('./temp', { 'recursive': true });
            let filePath = './temp/PATRON-MD.vcf';
            await fs.writeFile(filePath, vcfContent, 'utf8');
            
            await sleep(2000);
            await ednut.sendMessage(from, {
                'document': await fs.readFile(filePath),
                'mimetype': 'text/x-vcard',
                'fileName': 'PATRON-MD.vcf',
                'caption': 'GROUP: *' + groupData.subject + '*\nMEMBERS: *' + participants.length + 
                          '*\nTOTAL CONTACTS: *' + totalContacts + '*'
            }, { 'quoted': m });
            
            await fs.unlink(filePath);
            
        } catch (err) {
            console.error('Error saving contacts:', err);
            reply('⚠️ Failed to save contacts. Please try again.');
        }
    }
}];