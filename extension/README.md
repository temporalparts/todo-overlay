# TABULA Extension Development

This directory contains the Chrome extension source code for TABULA.

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
src/
├── ui/                 # Preact components
│   ├── App.tsx        # Main app component
│   └── components/    # Reusable UI components
├── background/        # Service worker (tab management, timers)
├── content/          # Content script (overlay injection)
├── state/            # Chrome storage management
├── lib/              # Utility functions
├── data/             # Static data (quotes)
└── types.ts          # TypeScript definitions

public/               # Static assets & manifest
scripts/             # Build and utility scripts
dist/                # Built extension (generated)
```

## 🛠️ Available Commands

### Development
```bash
npm run dev          # Development with hot reload
npm run build        # Production build (bumps version)
npm run build:nobump # Production build (no version bump)
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint checks
```

### Version Management
```bash
npm run version:bump  # Increment patch (0.1.0 → 0.1.1)
npm run version:minor # Increment minor (0.1.0 → 0.2.0)
npm run version:major # Increment major (0.1.0 → 1.0.0)
```

### Utilities
```bash
npm run icons           # Generate PNG icons from SVG
npm run generate-quotes # Update quotes database
```

## 🏗️ Architecture Overview

### Component Flow
```
User Action → Extension Icon/Website Visit
                    ↓
            Background Worker
                    ↓
            Content Script
                    ↓
            Shadow DOM (isolated)
                    ↓
            Preact UI Components
                    ↓
            Chrome Storage API
```

### Key Components

**Content Script** (`src/content/inject.ts`)
- Injects overlay into web pages
- Creates Shadow DOM for CSS isolation
- Handles site-specific edge cases (YouTube, etc.)

**Background Worker** (`src/background/index.ts`)
- Manages snooze/dismiss timers
- Handles cross-tab communication
- Controls extension badge

**UI Layer** (`src/ui/`)
- Preact for lightweight React-like components
- Tailwind CSS for styling
- Zustand for state management

**Storage** (`src/state/storage.ts`)
- Wrapper around Chrome Storage API
- Handles data persistence
- Real-time sync across tabs

## 🌐 Domain Matching

TABULA uses flexible pattern matching to determine when to show:

### Pattern Types

| Pattern | Example | Matches |
|---------|---------|---------|
| Root domain | `google.com` | All subdomains (mail.google.com, docs.google.com) |
| Specific subdomain | `mail.google.com` | Only that exact subdomain |
| Domain with path | `github.com/facebook` | URLs starting with that path |
| Subdomain with path | `docs.google.com/spreadsheets` | Specific subdomain + path |

### Rules
- Case insensitive (`GitHub.com` = `github.com`)
- `www.` prefixes ignored
- No protocol needed (don't use `http://` or `https://`)
- Handles compound TLDs (`bbc.co.uk`, `example.com.au`)
- Minimum one dot required (`google.com` ✓, `google` ✗)

## 🧪 Testing Checklist

Before committing changes, verify:

1. **Build succeeds**: `npm run build`
2. **No type errors**: `npm run typecheck`
3. **Core features work**:
   - Overlay appears on configured domains
   - Tasks can be added/edited/deleted
   - Drag-and-drop works
   - Settings persist
4. **Site-specific testing**:
   - Reddit.com
   - YouTube.com
   - X.com (Twitter)
   - Custom domains

## 🚢 Release Process

1. **Update version**:
   ```bash
   npm run version:minor  # or :major, :bump
   ```

2. **Build production**:
   ```bash
   npm run build
   ```

3. **Create ZIP for Chrome Store**:
   ```bash
   cd dist && zip -r ../tabula-extension.zip . && cd ..
   ```

4. **Test the ZIP**:
   - Load in Chrome as unpacked extension
   - Verify all features work

## 💡 Development Tips

### Adding a New Feature

1. Update types in `src/types.ts`
2. Add UI components in `src/ui/components/`
3. Update storage if needed in `src/state/storage.ts`
4. Test across all supported sites
5. Run `npm run typecheck` before committing

### Debugging

- **Extension not loading**: Check `dist/` folder exists and `manifest.json` is valid
- **Overlay not appearing**: Check domain settings and console for errors
- **Tasks not saving**: Check Chrome storage quota and permissions
- **CSS issues**: Verify Shadow DOM isolation is working

### Performance

- Keep bundle size minimal (use Preact instead of React)
- Lazy load components when possible
- Use Chrome Storage API efficiently (batch operations)
- Profile with Chrome DevTools Performance tab

## 📚 Key Technologies

- **Preact**: Lightweight React alternative (3KB)
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type safety and better DX
- **Vite**: Fast build tool
- **Zustand**: Simple state management
- **Chrome Extension Manifest V3**: Modern extension API

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run typecheck` and `npm run lint`
5. Test on multiple websites
6. Submit a pull request

### Guidelines
- Follow existing code patterns
- Keep privacy as top priority
- Add types for new features
- Update documentation
- Test edge cases

## 📄 License

MIT License - see [LICENSE.txt](../LICENSE.txt)

## 🆘 Support

- [GitHub Issues](https://github.com/temporalparts/todo-overlay/issues)
- [Discussions](https://github.com/temporalparts/todo-overlay/discussions)
- [Support Development](https://ko-fi.com/temporalparts)