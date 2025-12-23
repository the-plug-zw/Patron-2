# 𝗣𝗔𝗧𝗥𝗢𝗡-𝗠𝗗 𝗕𝗢𝗧

<p align="center">
  <img src="https://files.catbox.moe/e71nan.png" height="300" alt="Zed-Bot Logo" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Orbitron&weight=600&size=25&duration=4000&pause=1000&color=00F7FF&center=true&vCenter=true&width=500&lines=ULTIMATE+WHATSAPP+BOT;MULTI-DEVICE+SUPPORT;POWERED+BY+BAILEYS;FAST++SECURE++RELIABLE" alt="Typing SVG" />
</p>

<div align="center">
  <a href="https://github.com/hacker263/followers">
    <img title="Followers" src="https://img.shields.io/github/followers/hacker263?color=EB5406&style=for-the-badge&logo=github&logoColor=white">
  </a>
  <a href="https://github.com/hacker263/patron/stargazers/">
    <img title="Stars" src="https://img.shields.io/github/stars/hacker263/Zed-Bot3?color=FFCE44&style=for-the-badge&logo=reverbnation&logoColor=white">
  </a>
  <a href="https://github.com/hacker263/patron/network/members">
    <img title="Forks" src="https://img.shields.io/github/forks/hacker263/Zed-Bot3?color=FF007F&style=for-the-badge&logo=git&logoColor=white">
  </a>
  <a href="https://github.com/hacker263/patron/">
    <img title="Repo Size" src="https://img.shields.io/github/repo-size/hacker263/Zed-Bot3?style=for-the-badge&color=FFFF33&logo=docusign&logoColor=white">
  </a>
  <a href="https://github.com/hacker263/patron/graphs/commit-activity">
    <img height="28" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge&logo=gitpod&logoColor=white">
  </a>
</div>

<p align="center">
  <img src="https://profile-counter.glitch.me/Zed-Bot3/count.svg" alt="Visitor Count" />
</p>

---

## ✨ Features

- 🤖 WhatsApp Multi-Device Support
- 🔁 Anti-Delete (Text + Media)
- 🎵 YouTube Audio Downloader
- 📥 Media Downloader (Instagram, TikTok, etc.)
- 🧠 AI Chatbot
- 💬 Group Moderation Commands
- 📛 Auto Sticker Response
- 🎮 Word Relay & Game Plugins
- 👮 Admin Tools (Ban, Kick, Promote)
- 🌐 Web-based Pairing Interface
- 📤 Sticker Maker (Image to Sticker)

---

## 🛰️ Deployment Steps

### ✅ First: Star and Fork the Repo

<a href='https://github.com/hacker263/patron/fork' target="_blank">
  <img src='https://img.shields.io/badge/FORK_REPOSITORY-008000?style=for-the-badge&logo=github&logoColor=white&labelColor=000000'/>
</a>

### 🔐 Generating & Publishing a session (optional)

You can generate a local WhatsApp session (recommended) and optionally publish it as a private gist for remote deployment.

- Local (recommended):
  1. Install deps: `npm install`
  2. Run: `npm run get-session` and scan the QR when it appears.
  3. After authentication, creds are saved to `./tmp/session/creds.json`.
  4. To export a copy suitable for gist upload: `node get-session.js --save-session-json` (writes `./tmp/session/session.json`).

- Publish to a private gist (optional):
  - Using the GitHub CLI (recommended):
    1. `gh auth login` (one-time)
    2. `npm run publish-session` (creates a private gist from `./tmp/session/session.json`)
  - Or using a token:
    1. `export GITHUB_TOKEN="ghp_xxx"`
    2. `node publish-session.js` (creates the gist via the GitHub API)

After publishing the script prints the `SESSION_ID` to use, e.g.: `SESSION_ID=Zed-Bot~<gistId>` — add that to your `.env` or export it in your shell before starting the bot.

Automated write: you can run `npm run publish-session:apply` which creates the gist and **automatically writes** `SESSION_ID=Zed-Bot~<gistId>` into a local `.env` file (or the file you pass with `--env`) — the script makes a backup of the file as `.env.bak.<timestamp>` before modifying it.

> ⚠️ Security: Keep the session file private. Avoid publishing it publicly unless you understand the risks.

---

### 🔗 Pairing Links

> **PAIRING LINK (01)**  
<a href='https://Zed-Bot.vercel.app' target="_blank">
  <img src='https://img.shields.io/badge/PAIR_CODE_1-00FFFF?style=for-the-badge&logo=matrix&logoColor=white&labelColor=000000'/>
</a>

> **PAIRING LINK (02)**  
<a href='https://Zed-Bot.vercel.app' target="_blank">
  <img src='https://img.shields.io/badge/PAIR_CODE_2-FF00FF?style=for-the-badge&logo=matrix&logoColor=white&labelColor=000000'/>
</a>

---

## ⚙️ Deployment Options

<a href='https://Zed-Bot.vercel.app/deploy-md3' target="_blank">
  <img src='https://img.shields.io/badge/DEPLOYMENT_GUIDE-FF00FF?style=for-the-badge&logo=matrix&logoColor=white&labelColor=000000'/>
</a>

👉 **If you want a panel to manage your bot easily**, check out this page:  
🔗 [https://Zed-Bot.vercel.app/deploy-md3](https://Zed-Bot.vercel.app/deploy-md3)

<details>
<summary><b>📲 Deploy on Termux (Manual Method)</b></summary>

```bash
apt update && apt upgrade
pkg install nodejs git
git clone https://github.com/hacker263/patron
cd Zed-Bot3
npm install
npm start
```
</details>

---

## 🤝 Connect With Me

<p align="center">
  <a href="https://www.youtube.com/@Itzpatron1">
    <img src="https://img.shields.io/badge/YouTube-ff0000?style=for-the-badge&logo=youtube&logoColor=white">
  </a><br>
  <a href="https://whatsapp.com/channel/0029Val0s0rIt5rsIDPCoD2q">
    <img src="https://img.shields.io/badge/WhatsApp Channel-25D366?style=for-the-badge&logo=whatsapp&logoColor=white">
  </a><br>
  <a href="https://t.me/patrontechhub">
    <img src="https://img.shields.io/badge/Telegram-00FFFF?style=for-the-badge&logo=telegram&logoColor=white">
  </a><br>
  <a href="https://chat.whatsapp.com/I2xPWgHLrKSJhkrUdfhKzV">
    <img src="https://img.shields.io/badge/Support Group-25D366?style=for-the-badge&logo=whatsapp&logoColor=white">
  </a><br>
  <a href="https://www.instagram.com/justt.patron?igsh=MzNlNGNkZWQ4Mg==">
    <img src="https://img.shields.io/badge/Instagram-A020F0?style=for-the-badge&logo=instagram&logoColor=white">
  </a>
</p>

---

## ⚠️ Disclaimer

> This bot is **not affiliated with WhatsApp Inc.**  
> It is intended for **educational and personal use only**.  
> Use at your own risk — **misuse may lead to WhatsApp bans**.  
> You are responsible for your own actions.

---

## 🧾 License

This project is licensed under the [MIT License](LICENSE).

 Please do not clone
---