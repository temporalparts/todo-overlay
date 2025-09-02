# Test Checklist for TABULA MVP

## Installation
- [ ] Extension loads without errors in chrome://extensions
- [ ] All required permissions are listed correctly
- [ ] Icons display properly in toolbar

## Basic Functionality
- [ ] Can add a new task
- [ ] Can mark task as complete
- [ ] Can delete a task
- [ ] Tasks persist after closing overlay
- [ ] Task count badge updates on extension icon

## Overlay Behavior
- [ ] Auto-opens on reddit.com (if not snoozed)
- [ ] Auto-opens on twitter.com (if not snoozed)
- [ ] Auto-opens on youtube.com (if not snoozed)
- [ ] Does NOT auto-open on other sites
- [ ] Clicking extension icon opens overlay on any site

## Snooze/Dismiss
- [ ] "Snooze 5m" hides overlay and prevents auto-open for 5 minutes
- [ ] "Dismiss 60m" hides overlay and prevents auto-open for 60 minutes
- [ ] Snooze is per-domain (snoozing reddit doesn't affect twitter)
- [ ] Clicking outside overlay triggers snooze (when auto-opened)
- [ ] Clicking X just closes (when opened via icon)
- [ ] Opening via icon ignores snooze state

## Settings Page
- [ ] Can add new domains to allowlist
- [ ] Can remove domains from allowlist
- [ ] Invalid domains are cleaned (strips protocol, www, etc)
- [ ] Can toggle "auto-open on allowlisted" setting
- [ ] Can change theme (auto/light/dark)
- [ ] Settings persist after browser restart
- [ ] Export creates valid JSON file
- [ ] Import restores tasks and settings

## UI/UX
- [ ] Overlay is centered and responsive
- [ ] Dark mode works correctly
- [ ] Animations are smooth
- [ ] No CSS conflicts with host page (Shadow DOM isolation)
- [ ] Scrollbar appears for long task lists
- [ ] Empty state shows helpful message

## Edge Cases
- [ ] Works on sites with strict CSP
- [ ] Works on SPA sites (React, Vue apps)
- [ ] Handles rapid open/close without errors
- [ ] Multiple tabs can have overlays open simultaneously
- [ ] Works in incognito mode (if enabled)

## Performance
- [ ] Overlay opens quickly (< 500ms)
- [ ] No memory leaks after repeated open/close
- [ ] No console errors or warnings
- [ ] Page performance not significantly impacted