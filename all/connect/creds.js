/**
 * Refreshes the 'creds.update' event listener on the socket.
 * This ensures that old listeners are removed before adding a new one,
 * preventing duplicate event triggers.
 * * @param {Object} sock - The Baileys socket instance
 * @param {Object} _unused_config - Unused configuration parameter
 * @param {Function} saveCreds - The callback function to handle credential saves
 */
module.exports = (sock, _unused_config, saveCreds) => {
    // Unbind existing listener if it exists to avoid memory leaks/double-firing
    sock.ev.off('creds.update', saveCreds);
    
    // Bind the fresh listener
    sock.ev.on('creds.update', saveCreds);
};
