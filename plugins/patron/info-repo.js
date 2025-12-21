const fetch = require('node-fetch');

module.exports = [
    {
        command: ['repo'],
        alias: ['sc', 'script', 'info'],
        description: 'Fetch GitHub repository information',
        category: 'Info',
        filename: __filename,

        async execute(m, { ednut, reply, from }) {
            const REPO_URL = 'https://github.com/hacker263/patron';
            const IMAGE_URL = 'https://files.catbox.moe/e71nan.png';
            const NEWSLETTER_JID = '120363303045895814@newsletter';
            const NEWSLETTER_NAME = 'Hxcker-263 Official';

            try {
                // Extract owner & repo from GitHub URL
                const [, owner, repo] = REPO_URL.match(/github\.com\/([^/]+)\/([^/]+)/);

                // Fetch repo info from GitHub API
                const response = await fetch(
                    `https://api.github.com/repos/${owner}/${repo}`
                );

                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status}`);
                }

                const data = await response.json();

                // Caption style 1 (detailed)
                const caption1 = `
╭───『 Zed-Bot REPO 』───⳹
│ 🌐 Use this link to get session id:
│ 👉 https://Zed-Bot.vercel.app
│ 🚀 Or use this bot .getpair 263xxxxxx
│ 📦 Repository: ${data.name}
│ 👑 Owner: ${data.owner.login}
│ ⭐ Stars: ${data.stargazers_count}
│ ⑂ Forks: ${data.forks_count}
│ 🔗 URL: ${data.html_url}/fork
│
│ 📝 Description:
│ ${data.description || 'No description'}
╰────────────────⳹
> *© powered by 🎩-Hxcker-263-🎩*
`;

                // Caption style 2 (compact)
                const caption2 = `
•——[ *GITHUB INFO* ]——•
├─ 🌐 Repo: ${data.name}
├─ 👤 Owner: ${data.owner.login}
├─ ⭐ ${data.stargazers_count} Stars
├─ ⑂ ${data.forks_count} Forks
├─ 🔗 ${data.html_url}
/fork
•——[ *Zed-Bot* ]——•
> *© powered by 🎩-Hxcker-263-🎩*
`;

                // Random caption selection
                const captions = [caption1, caption2];
                const caption = captions[
                    Math.floor(Math.random() * captions.length)
                ];

                // Send message
                await ednut.sendMessage(
                    from,
                    {
                        image: { url: IMAGE_URL },
                        caption,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            forwardingScore: 2,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: NEWSLETTER_JID,
                                newsletterName: NEWSLETTER_NAME,
                                serverMessageId: 143
                            }
                        }
                    },
                    { quoted: m }
                );

            } catch (error) {
                console.error('Repo command error:', error);
                return reply(`❌ Error: ${error.message}`);
            }
        }
    }
];
