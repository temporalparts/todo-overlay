# TABULA - Take Back Your Life Again

A powerful Chrome extension that transforms digital distractions into productivity moments. TABULA helps you reclaim your time by presenting your priorities when you need them most.

## Features (MVP)

✅ **Dynamic Task List** - Add, complete, and delete tasks
✅ **Beautiful UI** - Clean, modern interface with Tailwind CSS  
✅ **Domain Detection** - Auto-shows on configured domains (reddit.com, x.com, youtube.com by default)
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
   - Navigate to reddit.com, x.com, or youtube.com
   - TABULA will appear automatically, presenting your tasks
   - Click the extension icon to activate TABULA on any site

## Usage

### Task Management
- **Add Task**: Type in the input field and press Enter or click Add
- **Complete Task**: Click the checkbox
- **Delete Task**: Hover over task and click the trash icon

### Taking Back Control
- **Snooze**: Brief pause to handle urgent matters
- **Dismiss**: Longer break when you've earned it
- **Settings Tab**: Customize your time reclamation strategy
- **Real-time Sync**: All tabs stay synchronized

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

## Your Data, Your Control

✅ **100% Local** - Your tasks never leave your device
✅ **No Tracking** - TABULA respects your privacy completely
✅ **Offline First** - Works without internet connection
✅ **Export Anytime** - Your data is always yours

## Future Features

See the `TODO/` folder for planned features:
- Priority system (P0-P3)
- Due dates and recurring tasks
- Markdown notes
- Full-text search
- Keyboard shortcuts

## License

MIT