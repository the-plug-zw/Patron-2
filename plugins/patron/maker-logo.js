const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Ensure global.log exists (fallback if not defined globally)
if (typeof global.log !== 'function') {
    global.log = (level, msg) => console.log(`[${level}]`, msg);
}

module.exports = [
    {
        command: ['wanted'],
        description: 'Create a wanted poster also reply to someone\'s message to use the profile picture',
        category: 'Logo',
        ban: true,
        gcban: true,
        execute: async (message, { ednut, uploadImage, reply }) => {
            try {
                if (!message.quoted) return reply('Reply to an image or someone\'s message to create a wanted poster.');

                let imageBuffer;
                if (message.quoted && message.quoted.mtype === 'imageMessage') {
                    imageBuffer = await ednut.downloadMediaMessage(message.quoted);
                } else {
                    let senderId = message.quoted ? message.quoted.sender : message.sender;
                    let profilePicUrl = await ednut.profilePictureUrl(senderId, 'image').catch(() => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png');
                    let response = await fetch(profilePicUrl);
                    imageBuffer = await response.arrayBuffer();
                    imageBuffer = Buffer.from(imageBuffer);
                }

                let uploadedUrl = await uploadImage(imageBuffer);
                let apiUrl = 'https://api.popcat.xyz/v2/wanted?image=' + uploadedUrl;
                await ednut.sendMessage(message.chat, { image: { url: apiUrl }, caption: '' + global.footer }, { quoted: message });
            } catch (error) {
                global.log('ERROR', 'wanted plugin: ' + (error.message || error));
            }
        }
    },
    {
        command: ['jail'],
        description: 'Create a jail poster also reply to someone\'s message to use the profile picture',
        category: 'Logo',
        ban: true,
        gcban: true,
        execute: async (message, { ednut, uploadImage, reply }) => {
            try {
                if (!message.quoted) return reply('Reply to an image or someone\'s message to create a jail poster.');

                let imageBuffer;
                if (message.quoted && message.quoted.mtype === 'imageMessage') {
                    imageBuffer = await ednut.downloadMediaMessage(message.quoted);
                } else {
                    let senderId = message.quoted ? message.quoted.sender : message.sender;
                    let profilePicUrl = await ednut.profilePictureUrl(senderId, 'image').catch(() => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png');
                    let response = await fetch(profilePicUrl);
                    imageBuffer = await response.arrayBuffer();
                    imageBuffer = Buffer.from(imageBuffer);
                }

                let uploadedUrl = await uploadImage(imageBuffer);
                let apiUrl = 'https://api.popcat.xyz/v2/jail?image=' + uploadedUrl;
                await ednut.sendMessage(message.chat, { image: { url: apiUrl }, caption: '' + global.footer }, { quoted: message });
            } catch (error) {
                global.log('ERROR', 'jail plugin: ' + (error.message || error));
            }
        }
    },
    {
        command: ['nokia'],
        description: 'Create a nokia poster also reply to someone\'s message to use the profile picture',
        category: 'Logo',
        ban: true,
        gcban: true,
        execute: async (message, { ednut, uploadImage, reply }) => {
            try {
                if (!message.quoted) return reply('Reply to an image or someone\'s message to create a nokia poster.');

                let imageBuffer;
                if (message.quoted && message.quoted.mtype === 'imageMessage') {
                    imageBuffer = await ednut.downloadMediaMessage(message.quoted);
                } else {
                    let senderId = message.quoted ? message.quoted.sender : message.sender;
                    let profilePicUrl = await ednut.profilePictureUrl(senderId, 'image').catch(() => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png');
                    let response = await fetch(profilePicUrl);
                    imageBuffer = await response.arrayBuffer();
                    imageBuffer = Buffer.from(imageBuffer);
                }

                let uploadedUrl = await uploadImage(imageBuffer);
                let apiUrl = 'https://api.popcat.xyz/v2/nokia?image=' + uploadedUrl;
                await ednut.sendMessage(message.chat, { image: { url: apiUrl }, caption: '' + global.footer }, { quoted: message });
            } catch (error) {
                global.log('ERROR', 'nokia plugin: ' + (error.message || error));
            }
        }
    },
    {
        command: ['gun'],
        description: 'Create a gun image poster also reply to someone\'s message to use the profile picture',
        category: 'Logo',
        ban: true,
        gcban: true,
        execute: async (message, { ednut, uploadImage, reply }) => {
            try {
                if (!message.quoted) return reply('Reply to an image or someone\'s message to create a gun poster.');

                let imageBuffer;
                let textArgs = message.text.split(' ').slice(1).join(' ');
                if (message.quoted && message.quoted.mtype === 'imageMessage') {
                    imageBuffer = await ednut.downloadMediaMessage(message.quoted);
                } else {
                    let senderId = message.quoted ? message.quoted.sender : message.sender;
                    let profilePicUrl = await ednut.profilePictureUrl(senderId, 'image').catch(() => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png');
                    let response = await fetch(profilePicUrl);
                    imageBuffer = await response.arrayBuffer();
                    imageBuffer = Buffer.from(imageBuffer);
                }

                let uploadedUrl = await uploadImage(imageBuffer);
                let apiUrl = 'https://api.popcat.xyz/v2/gun?image=' + uploadedUrl;
                await ednut.sendMessage(message.chat, { image: { url: apiUrl }, caption: '' + global.footer }, { quoted: message });
            } catch (error) {
                global.log('ERROR', 'gun plugin: ' + (error.message || error));
            }
        }
    },
    {
        command: ['ad'],
        description: 'Create an ad image also reply to someone\'s message to use the profile picture',
        category: 'Logo',
        ban: true,
        gcban: true,
        execute: async (message, { ednut, uploadImage, reply }) => {
            try {
                if (!message.quoted) return reply('Reply to an image or someone\'s message to create an ad.');

                let imageBuffer;
                if (message.quoted && message.quoted.mtype === 'imageMessage') {
                    imageBuffer = await ednut.downloadMediaMessage(message.quoted);
                } else {
                    let senderId = message.quoted ? message.quoted.sender : message.sender;
                    let profilePicUrl = await ednut.profilePictureUrl(senderId, 'image').catch(() => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png');
                    let response = await fetch(profilePicUrl);
                    imageBuffer = await response.arrayBuffer();
                    imageBuffer = Buffer.from(imageBuffer);
                }

                let uploadedUrl = await uploadImage(imageBuffer);
                let apiUrl = 'https://api.popcat.xyz/v2/ad?image=' + uploadedUrl;
                await ednut.sendMessage(message.chat, { image: { url: apiUrl }, caption: '' + global.footer }, { quoted: message });
            } catch (error) {
                global.log('ERROR', 'ad plugin: ' + (error.message || error));
            }
        }
    },
    {
        command: ['blur'],
        description: 'Create a blur image also reply to someone\'s message to use the profile picture',
        category: 'Logo',
        ban: true,
        gcban: true,
        execute: async (message, { ednut, uploadImage, reply }) => {
            try {
                if (!message.quoted) return reply('Reply to an image or someone\'s message to create a blur image.');

                let imageBuffer;
                if (message.quoted && message.quoted.mtype === 'imageMessage') {
                    imageBuffer = await ednut.downloadMediaMessage(message.quoted);
                } else {
                    let senderId = message.quoted ? message.quoted.sender : message.sender;
                    let profilePicUrl = await ednut.profilePictureUrl(senderId, 'image').catch(() => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png');
                    let response = await fetch(profilePicUrl);
                    imageBuffer = await response.arrayBuffer();
                    imageBuffer = Buffer.from(imageBuffer);
                }

                let uploadedUrl = await uploadImage(imageBuffer);
                let apiUrl = 'https://api.popcat.xyz/v2/blur?image=' + uploadedUrl;
                await ednut.sendMessage(message.chat, { image: { url: apiUrl }, caption: '' + global.footer }, { quoted: message });
            } catch (error) {
                global.log('ERROR', 'blur plugin: ' + (error.message || error));
            }
        }
    },
    {
        command: ['invert'],
        description: 'Create an invert image also reply to someone\'s message to use the profile picture',
        category: 'Logo',
        ban: true,
        gcban: true,
        execute: async (message, { ednut, uploadImage, reply }) => {
            try {
                if (!message.quoted) return reply('Reply to an image or someone\'s message to create an invert image.');

                let imageBuffer;
                if (message.quoted && message.quoted.mtype === 'imageMessage') {
                    imageBuffer = await ednut.downloadMediaMessage(message.quoted);
                } else {
                    let senderId = message.quoted ? message.quoted.sender : message.sender;
                    let profilePicUrl = await ednut.profilePictureUrl(senderId, 'image').catch(() => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png');
                    let response = await fetch(profilePicUrl);
                    imageBuffer = await response.arrayBuffer();
                    imageBuffer = Buffer.from(imageBuffer);
                }

                let uploadedUrl = await uploadImage(imageBuffer);
                let apiUrl = 'https://api.popcat.xyz/v2/invert?image=' + uploadedUrl;
                await ednut.sendMessage(message.chat, { image: { url: apiUrl }, caption: '' + global.footer }, { quoted: message });
            } catch (error) {
                global.log('ERROR', 'invert plugin: ' + (error.message || error));
            }
        }
    },
    {
        command: ['mnm'],
        description: 'Create an M&M\'s image also reply to someone\'s message to use the profile picture',
        category: 'Logo',
        ban: true,
        gcban: true,
        execute: async (message, { ednut, uploadImage, reply }) => {
            try {
                if (!message.quoted) return reply('Reply to an image or someone\'s message to create an M&M\'s image.');

                let imageBuffer;
                if (message.quoted && message.quoted.mtype === 'imageMessage') {
                    imageBuffer = await ednut.downloadMediaMessage(message.quoted);
                } else {
                    let senderId = message.quoted ? message.quoted.sender : message.sender;
                    let profilePicUrl = await ednut.profilePictureUrl(senderId, 'image').catch(() => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png');
                    let response = await fetch(profilePicUrl);
                    imageBuffer = await response.arrayBuffer();
                    imageBuffer = Buffer.from(imageBuffer);
                }

                let uploadedUrl = await uploadImage(imageBuffer);
                let apiUrl = 'https://api.popcat.xyz/v2/mnm?image=' + uploadedUrl;
                await ednut.sendMessage(message.chat, { image: { url: apiUrl }, caption: '' + global.footer }, { quoted: message });
            } catch (error) {
                global.log('ERROR', 'mnm plugin: ' + (error.message || error));
            }
        }
    },
    {
        command: ['caution'],
        description: 'Create a caution fake logo image',
        category: 'Logo',
        ban: true,
        gcban: true,
        execute: async (message, { ednut, reply }) => {
            try {
                let text = message.text.split(' ').slice(1).join(' ');
                if (!text) return reply('Please provide a text');

                let apiUrl = 'https://api.popcat.xyz/v2/caution?text=' + text;
                await ednut.sendMessage(message.chat, { image: { url: apiUrl }, caption: '' + global.footer, quoted: message });
            } catch (error) {
                global.log('ERROR', 'caution plugin: ' + (error.message || error));
            }
        }
    }
];