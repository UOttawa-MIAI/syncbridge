# 🌉 SyncBridge

> **Faculty Web Admin Portal & Announcement Gateway for the uOttawa MIAI Discord Community**

SyncBridge is a stateless, secure, and modern web application built with **Next.js 14, Tailwind CSS, and shadcn/ui**. It enables university professors, program directors, and academic advisors to draft, preview, and broadcast official announcements directly into the student-led MIAI Discord server with 1 click, without having to create or manage a Discord account.

---

## ✨ Core Features

- **⚡ Real-Time Live WYSIWYG Discord Preview**: See pixel-perfect simulations of how your announcement, Markdown formatting, and role mentions will look inside Discord before broadcasting.
- **🎨 Custom Embed Styling**: Choose from official uOttawa Garnet (`#8F001A`), Sapphire Blue, Emerald Green, and Amber Gold accent palettes.
- **📑 1-Click Quick Templates**: Pre-loaded templates for *Guest Lectures & Keynotes*, *Co-op & Career Spotlights*, and *Academic Registration Deadlines*.
- **📱 Fully Responsive & Mobile Friendly**: Dual-column layout on Desktop + dedicated tab switcher on mobile screens.
- **🛡️ 100% Stateless & Privacy-First**: Zero database overhead, zero student data stored, and complete separation of concerns.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + uOttawa Brand Design System
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown Rendering**: [react-markdown](https://github.com/remarkjs/react-markdown)
- **Integration**: Discord REST API v10 / Webhooks

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/UOttawa-MIAI/syncbridge.git
cd syncbridge
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Add your Discord Channel Webhook URL (from Discord Channel Settings $\rightarrow$ Integrations $\rightarrow$ Webhooks):
```env
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
```
*(Note: If no webhook URL is set, SyncBridge automatically runs in **Simulation Test Mode** so you can test the UI and API locally!)*

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
