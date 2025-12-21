// emotions-tool.js - Animated emotion/emoji commands
module.exports = [
  {
    command: ['happy'],
    description: 'Displays a dynamic edit msg for fun.',
    category: 'Fun',
    filename: __filename,
    async execute(message, { ednut, reply, from }) {
      try {
        const sentMessage = await ednut.sendMessage(from, { 'text': '😂' });
        const happyEmojis = [
          '😃', '😄', '😁', '😊', '😎', '🥳', '😸', '😹', '🌞', '🌈',
          '😃', '😄', '😁', '😊', '😎', '🥳', '😸', '😹', '🌞', '🌈',
          '😃', '😄', '😁', '😊'
        ];
        
        for (const emoji of happyEmojis) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await ednut.relayMessage(from, {
            'protocolMessage': {
              'key': sentMessage.key,
              'type': 14, // Edit message type
              'editedMessage': { 'conversation': emoji }
            }
          }, {});
        }
      } catch (error) {
        console.log(error);
        reply('❌ *Error!* ' + error.message);
      }
    }
  },
  {
    command: ['heart'],
    description: 'Displays a dynamic edit msg for fun.',
    category: 'Fun',
    filename: __filename,
    async execute(message, { ednut, reply, from }) {
      try {
        const sentMessage = await ednut.sendMessage(from, { 'text': '🧡' });
        const heartEmojis = [
          '💖', '💗', '💕', '🚹', '💛', '💚', '🖤', '💙', ' 💞',
          '💝🩶', '🤍', '🤎', '❤️‍🔥', '💞', '💓', '💘', '💝', '♥️', '💟',
          '❤️‍🩹', '❤️'
        ];
        
        for (const emoji of heartEmojis) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await ednut.relayMessage(from, {
            'protocolMessage': {
              'key': sentMessage.key,
              'type': 14,
              'editedMessage': { 'conversation': emoji }
            }
          }, {});
        }
      } catch (error) {
        console.log(error);
        reply('❌ *Error!* ' + error.message);
      }
    }
  },
  {
    command: ['angry'],
    description: 'Displays a dynamic edit msg for fun.',
    category: 'Fun',
    filename: __filename,
    async execute(message, { ednut, reply, from }) {
      try {
        const sentMessage = await ednut.sendMessage(from, { 'text': '👽' });
        const angryEmojis = [
          '😡', '😠', '🤬', '😤', '😾',
          '😡', '😠', '🤬', '😤', '😾'
        ];
        
        for (const emoji of angryEmojis) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await ednut.relayMessage(from, {
            'protocolMessage': {
              'key': sentMessage.key,
              'type': 14,
              'editedMessage': { 'conversation': emoji }
            }
          }, {});
        }
      } catch (error) {
        console.log(error);
        reply('❌ *Error!* ' + error.message);
      }
    }
  },
  {
    command: ['sad'],
    description: 'Displays a dynamic edit msg for fun.',
    category: 'Fun',
    filename: __filename,
    async execute(message, { ednut, reply, from }) {
      try {
        const sentMessage = await ednut.sendMessage(from, { 'text': '😔' });
        const sadEmojis = [
          '🥺', '😟', '😕', '😖', '😫', '🙁', '😩', '😥', '😓', '😪',
          '😢', '😔', '😞', '😭', '💔', '😭', '😿'
        ];
        
        for (const emoji of sadEmojis) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await ednut.relayMessage(from, {
            'protocolMessage': {
              'key': sentMessage.key,
              'type': 14,
              'editedMessage': { 'conversation': emoji }
            }
          }, {});
        }
      } catch (error) {
        console.log(error);
        reply('❌ *Error!* ' + error.message);
      }
    }
  },
  {
    command: ['shy'],
    description: 'Displays a dynamic edit msg for fun.',
    category: 'Fun',
    filename: __filename,
    async execute(message, { ednut, reply, from }) {
      try {
        const sentMessage = await ednut.sendMessage(from, { 'text': '🧐' });
        const shyEmojis = [
          '😳', '😊', '😶', '🙈', '🙊',
          '😳', '😊', '😶', '🙈', '🙊'
        ];
        
        for (const emoji of shyEmojis) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await ednut.relayMessage(from, {
            'protocolMessage': {
              'key': sentMessage.key,
              'type': 14,
              'editedMessage': { 'conversation': emoji }
            }
          }, {});
        }
      } catch (error) {
        console.log(error);
        reply('❌ *Error!* ' + error.message);
      }
    }
  },
  {
    command: ['moon'],
    description: 'Displays a dynamic edit msg for fun.',
    category: 'Fun',
    filename: __filename,
    async execute(message, { ednut, reply, from }) {
      try {
        const sentMessage = await ednut.sendMessage(from, { 'text': '🌝' });
        const moonEmojis = [
          '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖',
          '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖',
          '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖',
          '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖',
          '🌝🌚'
        ];
        
        for (const emoji of moonEmojis) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await ednut.relayMessage(from, {
            'protocolMessage': {
              'key': sentMessage.key,
              'type': 14,
              'editedMessage': { 'conversation': emoji }
            }
          }, {});
        }
      } catch (error) {
        console.log(error);
        reply('❌ *Error!* ' + error.message);
      }
    }
  },
  {
    command: ['confused'],
    description: 'Displays a dynamic edit msg for fun.',
    category: 'Fun',
    filename: __filename,
    async execute(message, { ednut, reply, from }) {
      try {
        const sentMessage = await ednut.sendMessage(from, { 'text': '🤔' });
        const confusedEmojis = [
          '😕', '😟', '😵', '🤔', '😖', '😲', '😦', '🤷',
          '🤷‍♀️', '🤷‍♂️'
        ];
        
        for (const emoji of confusedEmojis) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await ednut.relayMessage(from, {
            'protocolMessage': {
              'key': sentMessage.key,
              'type': 14,
              'editedMessage': { 'conversation': emoji }
            }
          }, {});
        }
      } catch (error) {
        console.log(error);
        reply('❌ *Error!* ' + error.message);
      }
    }
  },
  {
    command: ['hot'],
    description: 'Displays a dynamic edit msg for fun.',
    category: 'Fun',
    filename: __filename,
    async execute(message, { ednut, reply, from }) {
      try {
        const sentMessage = await ednut.sendMessage(from, { 'text': '💋' });
        const hotEmojis = [
          '🥵', '❤️', '💋', '😫', '🤤', '😋', '🥵', '🥶',
          '🙊', '😻', '🙈', '💋', '🫂', '🫀', '👅', '👄', '💋'
        ];
        
        for (const emoji of hotEmojis) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await ednut.relayMessage(from, {
            'protocolMessage': {
              'key': sentMessage.key,
              'type': 14,
              'editedMessage': { 'conversation': emoji }
            }
          }, {});
        }
      } catch (error) {
        console.log(error);
        reply('❌ *Error!* ' + error.message);
      }
    }
  }
];