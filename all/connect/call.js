const { delay } = require('@whiskeysockets/baileys');

// Track handled calls to prevent duplicate processing
const handledCalls = new Set();

module.exports = function callHandler(client) {
    const CALL_EVENT = 'call';
    
    // Remove any existing call listeners to avoid duplicates
    client.ev.removeAllListeners(CALL_EVENT);
    
    // Listen for incoming calls
    client.ev.on(CALL_EVENT, async (callData) => {
        try {
            const call = callData?.[0];
            if (!call) return;
            
            const callerId = call.from;
            const callId = call.id;
            const status = call.status;
            
            // Validate call data and check if already handled
            if (!callerId || !callId || handledCalls.has(callId)) {
                return;
            }
            
            // Mark call as handled to prevent duplicate processing
            handledCalls.add(callId);
            
            // Clean up after 10 seconds to prevent memory leaks
            setTimeout(() => handledCalls.delete(callId), 10000);
            
            // Determine anti-call action based on configuration
            let antiCallAction = null;
            
            // Priority: DB settings > global anticall > environment variable
            if (global.db.settings?.anticall) {
                antiCallAction = global.db.settings.anticall;
            } else if (global.db.anticall?.action) {
                antiCallAction = 'reject'; // Default action
            } else if (process.env.CALL?.toLowerCase()) {
                antiCallAction = process.env.CALL.toLowerCase();
            }
            
            if (!antiCallAction) return;
            
            // Create notification message based on action
            const notificationMessage = antiCallAction === 'block' 
                ? `@${callerId.split('@')[0]} called and was *blocked*`
                : `@${callerId.split('@')[0]} called and the call was *rejected*`;
            
            // Notify bot owner about the call
            await client.sendMessage(client.user.id, {
                text: notificationMessage,
                mentions: [callerId]
            });
            
            // Reject the call
            await client.rejectCall(callId, callerId);
            
            // Block the caller if configured
            if (antiCallAction === 'block') {
                await delay(1000); // Small delay before blocking
                await client.updateBlockStatus(callerId, 'block');
            }
            
        } catch (error) {
            console.error('ERROR', 'Call Handler: ' + (error.stack || error.message));
        }
    });
};