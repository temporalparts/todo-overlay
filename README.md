# TABULA - Take Back Your Life Again

<p align="center">
  <img src="tabula.svg" alt="TABULA Logo" width="128" height="128">
</p>

<p align="center">
  <strong>Transform distractions into productivity moments.</strong><br>
  A privacy-first Chrome extension that gently redirects your focus when you need it most.
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/tabula/ljcogekgnjdiknmficpiamehmlnemakg">Install from Chrome Store</a> •
  <a href="https://github.com/temporalparts/todo-overlay/issues">Report Bug</a> •
  <a href="https://github.com/temporalparts/todo-overlay/discussions">Discussions</a> •
  <a href="https://ko-fi.com/temporalparts">Support</a>
</p>

---

## What is TABULA?

TABULA is a Chrome extension that helps you stay focused by showing your task list when you visit distracting websites. Instead of blocking sites entirely, it presents a beautiful overlay with your priorities, letting you choose whether to continue or refocus.

**Why TABULA?** The name comes from "tabula rasa" (blank slate), representing the fresh start you get each day. It also stands for **T**ake **B**ack **Y**our **L**ife **A**gain.

## ✨ Key Features

- **🎯 Smart Interventions** - Automatically appears on distracting sites (Reddit, YouTube, X, etc.)
- **📝 Task Management** - Add, complete, and organize tasks with drag-and-drop
- **⏱️ Flexible Timing** - Snooze for quick tasks or dismiss for earned break time
- **🔒 100% Private** - All data stays on your device, no tracking, works offline
- **🎨 Beautiful Design** - Clean interface with dark/light themes
- **🔄 Real-time Sync** - Tasks update across all browser tabs instantly

## 🚀 Quick Start

### Option 1: Install from Chrome Web Store

<a href="https://chromewebstore.google.com/detail/tabula/ljcogekgnjdiknmficpiamehmlnemakg">
  <img src="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/UV4C4ybeBTsZt43U4xis.png" alt="Available in the Chrome Web Store" height="60">
</a>

### Option 2: Install from Source (5 minutes)

1. **Clone the repository**
   ```bash
   git clone https://github.com/temporalparts/todo-overlay.git
   cd todo-overlay/extension
   ```

2. **Build the extension**
   ```bash
   npm install
   npm run build
   ```

3. **Load in Chrome**
   - Open `chrome://extensions`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `extension/dist` folder

4. **Try it out**
   - Visit reddit.com or youtube.com
   - TABULA will appear automatically!

## 📖 How It Works

1. **Add your tasks** - Click the extension icon and add what you need to accomplish
2. **Browse normally** - Go about your regular internet usage
3. **Get gentle reminders** - When you visit distracting sites, TABULA shows your tasks
4. **Make conscious choices** - Complete a task, snooze briefly, or dismiss if you've earned a break

## 🎮 Usage Tips

### Task Management
- **Add tasks**: Type and press Enter
- **Prioritize**: Set High/Medium/Low priority with colors
- **Reorder**: Drag and drop tasks
- **Set deadlines**: Click the calendar icon
- **Undo mistakes**: Use Ctrl/Cmd+Z

### Time Controls
- **Snooze** (15 min default): "I just need to check something quick"
- **Dismiss** (60 min default): "I've earned some recreation time"
- **Manual trigger**: Click the extension icon on any website

## 🔒 Privacy First

Your data never leaves your device:
- ✅ 100% local storage
- ✅ No analytics or tracking
- ✅ Works completely offline
- ✅ Open source and auditable
- ✅ Export your data anytime

## 🛠️ Development

Want to contribute or customize TABULA?

```bash
# Setup
git clone https://github.com/temporalparts/todo-overlay.git
cd todo-overlay/extension
npm install

# Development (with hot reload)
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck
```

See [extension/README.md](extension/README.md) for detailed development docs.

## 🗺️ Roadmap

### Now Available (v0.2.39)
✅ Core task management  
✅ Priority levels & due dates  
✅ Drag-and-drop reordering  
✅ Undo/redo support  
✅ Dark/light themes  
✅ Quote rotation  
✅ Cross-tab sync  

### Coming Soon
🏷️ Tags & categories  
📝 Markdown formatting  
⌨️ Keyboard shortcuts  
🔄 Recurring tasks  
📊 Productivity insights (local only)  

## 💬 Community & Support

- **[Report Issues](https://github.com/temporalparts/todo-overlay/issues)** - Found a bug? Let us know!
- **[Discussions](https://github.com/temporalparts/todo-overlay/discussions)** - Share ideas and get help
- **[Support Development](https://ko-fi.com/temporalparts)** - If TABULA helps you, consider supporting it

## 📄 License

MIT License - see [LICENSE.txt](LICENSE.txt)

---

<p align="center">
  <strong>Ready to reclaim your time?</strong><br>
  Install TABULA and transform distractions into productivity.
</p>

<p align="center">
  Made with ❤️ by <a href="https://github.com/temporalparts">temporalparts</a>
</p>