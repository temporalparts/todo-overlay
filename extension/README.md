# NudgeNotes - TODO Overlay Chrome Extension

A minimalist TODO overlay that nudges you on distractor sites. Stay focused with gentle reminders of your tasks.

## Features (MVP)

✅ **Dynamic Task List** - Add, complete, and delete tasks
✅ **Beautiful UI** - Clean, modern interface with Tailwind CSS  
✅ **Domain Detection** - Auto-shows on configured domains (reddit.com, twitter.com, youtube.com by default)
✅ **Snooze/Dismiss** - Snooze for 5 minutes or dismiss for 60 minutes
✅ **Settings Page** - Configure allowed domains and behavior
✅ **Dark Mode** - Automatic theme detection
✅ **Data Export/Import** - Backup your tasks and settings

## Installation (Developer Mode)

1. Clone and build the extension:
```bash
cd extension
npm install
npm run build
```

2. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `extension/dist` folder

3. Test it:
   - Navigate to reddit.com, twitter.com, or youtube.com
   - The overlay should appear automatically
   - Click the extension icon to open on any site

## Usage

### Task Management
- **Add Task**: Type in the input field and press Enter or click Add
- **Complete Task**: Click the checkbox
- **Delete Task**: Hover over task and click the trash icon

### Overlay Control
- **Snooze 5m**: Temporarily hide for 5 minutes on this domain
- **Dismiss 60m**: Hide for 60 minutes on this domain  
- **Close (X)**: Close without snoozing (when opened via icon)
- **Click Outside**: Same as Snooze 5m

### Settings
- Click the extension icon → Settings
- Or right-click extension icon → Options
- Configure allowed domains and behavior

## Development

```bash
# Install dependencies
npm install

# Development mode (watch for changes)
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck
```

## Privacy

✅ **No data collection** - All data stored locally
✅ **No external requests** - Completely offline
✅ **No analytics** - Your privacy is respected

## Future Features

See the `TODO/` folder for planned features:
- Priority system (P0-P3)
- Due dates and recurring tasks
- Markdown notes
- Full-text search
- Keyboard shortcuts

## License

MIT