# Chrome Web Store Deployment Checklist

## ✅ Completed Items

### Extension Package
- [x] Valid manifest.json (v3)
- [x] Extension icons (16x16, 32x32, 48x48, 128x128 PNG)
- [x] Working extension build
- [x] GitHub repository URL updated

### Technical Requirements
- [x] Manifest version 3
- [x] All permissions justified (storage, scripting, activeTab)
- [x] Host permissions (<all_urls> for domain detection)
- [x] Content scripts configured
- [x] Background service worker
- [x] Ko-fi donation link configured (https://ko-fi.com/temporalparts)

## ✅ Store Assets Created

### Store Assets Required
- [x] **Small Promotional Image** (440x280 PNG) - Created in store-assets/
- [x] **Screenshots** (1280x800 and 640x400 PNG) - Created in store-assets/
- [x] **Marquee Promotional Image** (1400x560 PNG) - Created in store-assets/
- [x] **Extension ZIP** - tabula-extension.zip (56KB) ready for upload

## ⚠️ Items Still Needed for Chrome Web Store

### Store Listing Information
- [ ] **Extension Name**: TABULA
- [ ] **Short Description** (132 chars max): "Take Back Your Life Again - Transform digital distractions into productivity moments"
- [ ] **Detailed Description**: Need to prepare comprehensive description
- [ ] **Category**: Productivity
- [ ] **Language**: English

### Privacy & Compliance
- [ ] **Privacy Policy**: Need to create and host (can use GitHub Pages)
- [ ] **Data Usage Declaration**: 
  - Storage: Tasks and settings stored locally
  - No data collection or transmission
  - No analytics or tracking
- [ ] **Single Purpose Description**: Task management overlay for productivity

### Developer Account
- [ ] Register Chrome Developer Account ($5 one-time fee)
- [ ] Verify account details
- [ ] Set up payment if offering paid features (currently free)

### Testing & Quality
- [ ] Test on multiple screen sizes
- [ ] Test on popular websites (Reddit, YouTube, Twitter/X)
- [ ] Verify no console errors
- [ ] Test dark/light mode
- [ ] Test all features work as expected

### Optional Enhancements
- [ ] Create demo video
- [ ] Set up support email
- [ ] Add Ko-fi or Buy Me a Coffee link (currently placeholder)
- [ ] Create landing page

## Deployment Steps

1. **Create Store Assets**
   ```bash
   # Create a directory for store assets
   mkdir store-assets
   # Need to create promotional images and screenshots
   ```

2. **Build Extension for Submission**
   ```bash
   npm run build
   # Create ZIP of dist folder
   cd dist && zip -r ../tabula-extension.zip . && cd ..
   ```

3. **Register Developer Account**
   - Go to https://chrome.google.com/webstore/devconsole
   - Pay $5 registration fee
   - Verify email and account details

4. **Submit Extension**
   - Upload ZIP file
   - Fill in all listing details
   - Upload promotional assets
   - Submit for review

## Privacy Policy Template

```markdown
# TABULA Privacy Policy

Last Updated: [Date]

TABULA ("we", "our", or "the extension") is committed to protecting your privacy.

## Data Collection
TABULA does NOT collect, transmit, or share any personal data. All data remains locally on your device.

## Data Storage
- Tasks and settings are stored locally using Chrome's storage API
- Data never leaves your browser
- No external servers or databases are used

## Permissions
- **Storage**: To save your tasks and settings locally
- **Scripting & Active Tab**: To display the overlay on configured websites
- **Host Permissions**: To detect when you visit configured domains

## Contact
For questions about this privacy policy, please contact us through our GitHub repository:
https://github.com/temporalparts/todo-overlay

## Changes
Any changes to this policy will be posted on this page.
```

## Notes
- Ko-fi link in settings still needs to be updated with actual account
- Consider adding analytics-free feedback mechanism
- Review time is typically 1-3 business days for new extensions