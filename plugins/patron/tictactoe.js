const scores = {};
const activeGames = {};
const activeListeners = {};
const gameMeta = {};

const getGameKey = (player1, player2) => [player1, player2].sort().join('-');

module.exports = [
    {
        'command': ['tictactoe'],
        'alias': ['ttt', 'xo'],
        'description': 'Start a Tic Tac Toe game in a group',
        'category': 'Game',
        'use': '<opponent-number>',
        'ban': true,
        'gcban': true,
        
        'execute': async (m, { ednut, args, reply }) => {
            const chatId = m.key.remoteJid;
            const isGroup = chatId.endsWith('@g.us');
            
            if (!isGroup) return reply('❌ This command can only be used in groups.');
            
            const senderId = m.key.participant || m.sender;
            const senderNumber = senderId.replace(/[^0-9]/g, '');
            
            let participants = [];
            try {
                const groupData = await ednut.groupMetadata(chatId);
                participants = groupData.participants.map(p => p.id);
            } catch (err) {
                participants = [senderId];
            }
            
            const opponentNumber = args.join('').replace(/[^0-9]/g, '');
            if (!opponentNumber) return reply('👥 Provide the opponent\'s WhatsApp number. Example: .ttt 2348012345678');
            if (opponentNumber.length < 10 || opponentNumber.length > 15) return reply('📱 Invalid number format. Use full WhatsApp number like 2348012345678');
            if (opponentNumber === senderNumber) return reply('❌ You can\'t play against yourself.');
            
            const opponentId = participants.find(id => id.includes(opponentNumber)) || opponentNumber + '@s.whatsapp.net';
            if (!opponentId) return reply('❌ The opponent is not in this group. Paste their *number*, not tag.');
            
            const gameKey = getGameKey(senderNumber, opponentNumber);
            if (activeGames[gameKey]) return reply('⚠️ A game is already ongoing between you two.');
            
            let board = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
            let currentPlayer = '❌';
            let moves = 0;
            
            const renderBoard = (turnPlayer) => {
                return ('🎮 *Tic Tac Toe*\n\n' +
                    board[0] + ' | ' + board[1] + ' | ' + board[2] + '\n' +
                    board[3] + ' | ' + board[4] + ' | ' + board[5] + '\n' +
                    board[6] + ' | ' + board[7] + ' | ' + board[8] + '\n\n' +
                    '👤 *Turn:* @' + turnPlayer + ' (' + currentPlayer + ')\n🗨️ Reply to this message with a number (1–9) to play.'
                ).trim();
            };
            
            const checkWin = () => {
                const winPatterns = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8],
                    [0, 3, 6], [1, 4, 7], [2, 5, 8],
                    [0, 4, 8], [2, 4, 6]
                ];
                return winPatterns.some(([a, b, c]) => 
                    board[a] === currentPlayer && board[b] === currentPlayer && board[c] === currentPlayer
                );
            };
            
            const gameMessage = await ednut.sendMessage(chatId, {
                'text': renderBoard(senderNumber),
                'mentions': [senderId, opponentId].filter(Boolean)
            }, { 'quoted': m });
            
            gameMeta[gameKey] = {
                'playerX': senderNumber,
                'playerO': opponentNumber,
                'jidX': senderId,
                'jidO': opponentId,
                'messageID': gameMessage.key.id
            };
            activeGames[gameKey] = true;
            
            const cleanup = (gameKey) => {
                if (activeListeners[gameKey]) {
                    ednut.ev.off('messages.upsert', activeListeners[gameKey]);
                }
                delete activeListeners[gameKey];
                delete activeGames[gameKey];
                delete gameMeta[gameKey];
            };
            
            const gameHandler = async (event) => {
                try {
                    const message = event.messages?.[0];
                    if (!message?.message || message.key.remoteJid !== chatId) return;
                    
                    const text = message.message.conversation || message.message.extendedTextMessage?.text || '';
                    if (!text.match(/^[1-9]$/)) return;
                    
                    const playerId = message.key.participant || message.key.remoteJid;
                    const playerNumber = playerId.replace(/[^0-9]/g, '');
                    const meta = gameMeta[gameKey];
                    
                    if (!meta) return;
                    
                    const currentTurnPlayer = currentPlayer === '❌' ? meta.playerX : meta.playerO;
                    if (playerNumber !== currentTurnPlayer) {
                        return ednut.sendMessage(chatId, {
                            'text': '⚠️ It\'s not your turn.',
                            'mentions': [(currentPlayer === '❌' ? meta.jidX : meta.jidO)].filter(Boolean)
                        }, { 'quoted': message });
                    }
                    
                    const position = parseInt(text);
                    const index = position - 1;
                    
                    if (['❌', '⭕'].includes(board[index])) {
                        return ednut.sendMessage(chatId, {
                            'text': '❎ That spot is already taken.'
                        }, { 'quoted': message });
                    }
                    
                    board[index] = currentPlayer;
                    moves++;
                    
                    if (checkWin()) {
                        scores[currentTurnPlayer] = (scores[currentTurnPlayer] || 0) + 1;
                        await ednut.sendMessage(chatId, {
                            'text': '🎉 *' + currentPlayer + ' wins!* @' + currentTurnPlayer + 
                                   '\n\n' + renderBoard(currentTurnPlayer) + 
                                   '\n\n🏆 *Scores:*\n@' + meta.playerX + ': ' + (scores[meta.playerX] || 0) + 
                                   '\n@' + meta.playerO + ': ' + (scores[meta.playerO] || 0),
                            'mentions': [meta.jidX, meta.jidO].filter(Boolean)
                        }, { 'quoted': message });
                        cleanup(gameKey);
                        return;
                    }
                    
                    if (moves >= 9) {
                        await ednut.sendMessage(chatId, {
                            'text': '🤝 *It\'s a draw!*\n\n' + renderBoard(currentTurnPlayer),
                            'mentions': [meta.jidX, meta.jidO].filter(Boolean)
                        }, { 'quoted': message });
                        cleanup(gameKey);
                        return;
                    }
                    
                    currentPlayer = currentPlayer === '❌' ? '⭕' : '❌';
                    const nextPlayer = currentPlayer === '❌' ? meta.playerX : meta.playerO;
                    
                    const newMessage = await ednut.sendMessage(chatId, {
                        'text': renderBoard(nextPlayer),
                        'mentions': [meta.jidX, meta.jidO].filter(Boolean)
                    }, { 'quoted': message });
                    
                    gameMeta[gameKey].messageID = newMessage.key.id;
                    
                } catch (err) {
                    console.error('[TicTacToe Handler Error]:', err);
                }
            };
            
            activeListeners[gameKey] = gameHandler;
            ednut.ev.on('messages.upsert', gameHandler);
        }
    },
    
    {
        'command': ['tttstop'],
        'description': 'Force stop any active Tic Tac Toe game',
        'category': 'Game',
        'ban': true,
        'gcban': true,
        
        'execute': async (m, { ednut, reply }) => {
            const playerId = m.key.participant || m.key.remoteJid;
            const playerNumber = playerId.replace(/[^0-9]/g, '');
            
            const gameKey = Object.keys(activeGames).find(key => key.includes(playerNumber));
            if (!gameKey) return reply('⚠️ You are not in any active game.');
            
            if (activeListeners[gameKey]) {
                ednut.ev.off('messages.upsert', activeListeners[gameKey]);
            }
            
            delete activeGames[gameKey];
            delete activeListeners[gameKey];
            delete gameMeta[gameKey];
            
            reply('🛑 Game has been stopped.');
        }
    }
];