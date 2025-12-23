const PDFDocument = require('pdfkit');
const { Buffer } = require('buffer');

module.exports = [
    {
        'command': ['topdf'],
        'alias': ['pdf'],
        'use': '<text>',
        'description': 'Convert provided text to a PDF file.',
        'category': 'Tool',
        'ban': true,
        'gcban': true,
        'execute': async (message, { ednut: client, q: text, reply: replyFunc, from: chatId }) => {
            try {
                if (!text) {
                    return replyFunc('Please provide the text you want to convert to PDF.\n*Example:* `.topdf Pakistan ZindaBad 🇵🇰`');
                }
                
                const pdfDoc = new PDFDocument();
                let pdfChunks = [];
                
                pdfDoc.on('data', pdfChunks.push.bind(pdfChunks));
                pdfDoc.on('end', async () => {
                    const pdfBuffer = Buffer.concat(pdfChunks);
                    await client.sendMessage(chatId, {
                        'document': pdfBuffer,
                        'mimetype': 'application/pdf',
                        'fileName': 'ZedTech.pdf',
                        'caption': '*📄 PDF created successfully!*\n\n> © Created By 🎩-Hxcker-263-🎩'
                    }, {
                        'quoted': message
                    });
                });
                
                pdfDoc.text(text);
                pdfDoc.end();
                
            } catch (error) {
                console.error('error', 'topdf error:', error);
                replyFunc('❌ Error: ' + error.message);
            }
        }
    }
];