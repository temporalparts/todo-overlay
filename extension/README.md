# TABULA Chrome Extension

This directory contains the complete source code for the TABULA Chrome extension.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Development mode (watches for changes)
npm run dev
```

After building, load the `dist/` folder as an unpacked extension in Chrome.

## 📂 Project Structure

```
extension/
├── src/                    # Source code
│   ├── ui/                # UI Components (Preact)
│   │   ├── App.tsx        # Main application component
│   │   └── components/    # Reusable components
│   │       ├── TaskList.tsx      # Task list with drag-and-drop
│   │       ├── TaskItem.tsx      # Individual task component
│   │       ├── AddTask.tsx       # Task input component
│   │       ├── Settings.tsx      # Settings management
│   │       └── shared/           # Shared UI components
│   ├── background/        # Background service worker
│   │   └── index.ts      # Tab management, snooze timers
│   ├── content/          # Content scripts
│   │   └── inject.ts     # Overlay injection logic
│   ├── state/            # State management
│   │   └── storage.ts    # Chrome storage API wrapper
│   ├── lib/              # Utility functions
│   │   └── domain.ts     # Domain parsing utilities
│   ├── data/             # Static data
│   │   └── quotes.ts     # Inspirational quotes
│   └── types.ts          # TypeScript type definitions
├── public/               # Static assets
│   ├── manifest.json     # Extension manifest (v3)
│   ├── icon*.png        # Extension icons
│   └── *.html           # Extension pages
├── scripts/             # Build and utility scripts
│   ├── build-all.js     # Main build orchestrator
│   ├── bump-version.js  # Version management
│   ├── convert-svg-to-icons.js  # Icon generation
│   └── create-store-assets.js   # Chrome Web Store assets
├── dist/                # Built extension (generated)
├── store-assets/        # Chrome Web Store images (generated)
└── TODO/               # Feature planning documents
```

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start development mode with hot reload
- `npm run build` - Build production extension with version bump
- `npm run build:nobump` - Build without version increment
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint checks

### Utilities
- `npm run icons` - Generate PNG icons from SVG source
- `npm run version:bump` - Increment patch version
- `npm run version:minor` - Increment minor version
- `npm run version:major` - Increment major version
- `npm run generate-quotes` - Update quotes database

## 🏗️ Architecture

### Component Communication

```
User → Chrome Extension Icon → background/index.ts
                                      ↓
Website → content/inject.ts → Creates Shadow DOM → Renders ui/App.tsx
                                                          ↓
                                              state/storage.ts ← Chrome Storage API
```

### Key Components

#### Content Script (`src/content/inject.ts`)
- Injects overlay into web pages
- Creates isolated Shadow DOM for CSS encapsulation
- Handles YouTube's CSS interference
- Manages overlay visibility state

#### Background Service Worker (`src/background/index.ts`)
- Manages snooze/dismiss timers
- Handles cross-tab communication
- Controls extension icon badge
- Manages tab navigation and activation

#### UI Layer (`src/ui/`)
- Built with Preact (lightweight React alternative)
- Tailwind CSS for styling
- Zustand for local state management
- Real-time sync with Chrome Storage API

#### Storage Layer (`src/state/storage.ts`)
- Abstraction over Chrome Storage API
- Handles data persistence
- Manages settings and tasks
- Provides data migration capabilities

## 🔧 Configuration Files

- `manifest.json` - Chrome extension manifest (v3)
- `vite.config.ts` - Main Vite configuration
- `vite.content.config.ts` - Content script build config
- `vite.others.config.ts` - Background/popup build config
- `tailwind.config.cjs` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

## 🧪 Testing

### Manual Testing Checklist
1. **Installation**
   - Extension loads without errors
   - Icons appear correctly
   - Extension popup works

2. **Core Features**
   - Overlay appears on configured domains
   - Tasks can be added/completed/deleted
   - Drag-and-drop reordering works
   - Undo functionality (Ctrl/Cmd+Z)
   - Settings persist across sessions

3. **Cross-site Testing**
   - Reddit.com - Check message personalization
   - YouTube.com - Verify CSS interference resistance
   - X.com - Test overlay display
   - Custom domains - Add and test new domains

4. **Performance**
   - No console errors
   - Smooth animations
   - Quick load times
   - Minimal memory usage

## 🚢 Deployment

### Chrome Web Store Preparation

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Create store assets:**
   ```bash
   node scripts/create-store-assets.js
   ```

3. **Generate submission ZIP:**
   ```bash
   cd dist && zip -r ../tabula-extension.zip . && cd ..
   ```

### Files for Chrome Web Store
- `tabula-extension.zip` - Extension package
- `store-assets/` - Promotional images
- `CHROME_STORE_LISTING.md` - Store listing content
- `PRIVACY.md` - Privacy policy

## 📝 Development Guidelines

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Tailwind CSS for styling
- ESLint for code quality

### Best Practices
1. **Privacy First** - No external API calls or tracking
2. **Performance** - Keep bundle size minimal
3. **User Experience** - Smooth animations, intuitive UI
4. **Accessibility** - Keyboard navigation support
5. **Error Handling** - Graceful degradation

### Adding New Features
1. Create feature plan in `TODO/` folder
2. Implement with TypeScript
3. Update types in `src/types.ts`
4. Add UI components in `src/ui/components/`
5. Update storage logic if needed
6. Test across all supported sites
7. Update documentation

## 🐛 Troubleshooting

### Common Issues

**Extension not loading:**
- Ensure you've run `npm run build`
- Check that you're loading the `dist/` folder
- Verify manifest.json is valid

**Overlay not appearing:**
- Check domain is in settings
- Verify content script permissions
- Check browser console for errors

**Tasks not saving:**
- Check Chrome storage quota
- Verify storage permissions
- Look for storage API errors

**YouTube CSS issues:**
- Ensure inject.ts CSS resets are applied
- Check Shadow DOM isolation
- Verify viewport units usage

## 📚 Resources

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/mv3/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Preact Documentation](https://preactjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow existing code style
- Add types for new features
- Update documentation
- Test on multiple websites
- Keep privacy as top priority

## 📄 License

MIT License - see [LICENSE.txt](../LICENSE.txt) for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/temporalparts/todo-overlay/issues)
- **Discussions**: [GitHub Discussions](https://github.com/temporalparts/todo-overlay/discussions)
- **Support Development**: [Ko-fi](https://ko-fi.com/temporalparts)