# Chrome Web Store Listing Information

## Privacy Practices Tab

### Permission Justifications

#### 1. activeTab Permission
**Justification:**
The activeTab permission is used to allow users to manually trigger the TABULA overlay on any website by clicking the extension icon. This gives users full control over when and where TABULA appears, beyond the configured domain list. The permission is only activated when the user explicitly clicks the extension icon, ensuring user-initiated interaction.

#### 2. Host Permissions (<all_urls>)
**Justification:**
Host permissions are required to detect when users visit configured websites (like Reddit, YouTube, or X/Twitter) and automatically display the task overlay. This allows TABULA to help users reclaim their time precisely when they're about to engage with potentially distracting websites. Users have full control over which domains trigger the overlay through the extension settings.

#### 3. Remote Code
**Justification:**
TABULA does not use any remote code. All JavaScript and CSS are bundled within the extension package. No external scripts are loaded, and no code is fetched from remote servers. The extension operates entirely with local, pre-packaged code for security and privacy.

#### 4. Scripting Permission
**Justification:**
The scripting permission is required to inject the TABULA overlay interface into web pages. This allows the extension to display the task management interface as an overlay on top of distracting websites, helping users focus on their priorities. The injected script only creates the task interface and does not interact with or modify the underlying website content.

#### 5. Storage Permission
**Justification:**
The storage permission is used to save users' tasks, settings, and preferences locally in their browser. This includes the task list, completed items, snooze settings, theme preferences, and configured domains. All data is stored locally on the user's device and is never transmitted to external servers. This ensures users' task data remains private and accessible across browser sessions.

### Single Purpose Description
**Single Purpose:**
TABULA is a productivity tool that displays a task management overlay on distracting websites to help users focus on their priorities and reclaim their time from digital distractions.

## Store Listing Tab

### Short Description (132 chars max)
Take Back Your Life Again - Transform digital distractions into productivity moments with a beautiful task overlay

### Detailed Description
TABULA helps you reclaim your time from digital distractions by presenting your tasks and priorities exactly when you need them most - when visiting potentially time-wasting websites.

**How It Works:**
When you visit distracting websites like Reddit, YouTube, or social media, TABULA automatically displays a beautiful full-screen overlay showing your task list. This gentle intervention reminds you of your real priorities and helps you make conscious decisions about how to spend your time.

**Key Features:**

✅ **Smart Task Management**
- Add, complete, and organize tasks with a clean, intuitive interface
- Drag-and-drop to reorder tasks by importance
- Set priorities (P0-P3) and due dates
- Undo support with Cmd/Ctrl+Z

✅ **Intelligent Website Detection**
- Automatically appears on configured domains
- Customize which websites trigger the overlay
- Manual activation on any site via extension icon

✅ **Flexible Time Control**
- Snooze for quick tasks (customizable timer)
- Dismiss for longer focused sessions
- Full control over when and how TABULA appears

✅ **Beautiful, Responsive Design**
- Clean, modern interface that works on any screen size
- Dark mode support (automatic or manual)
- Inspiring quotes to keep you motivated
- Smooth animations and transitions

✅ **Complete Privacy**
- 100% local storage - your data never leaves your device
- No tracking, analytics, or external servers
- Works completely offline
- Export/import your data anytime

✅ **Customization Options**
- Configure snooze and dismiss durations
- Choose your theme (light/dark/auto)
- Add or remove websites from the trigger list
- Rotating motivational quotes

**Perfect For:**
- Remote workers fighting digital distractions
- Students trying to stay focused
- Anyone wanting to be more intentional with their screen time
- People looking to build better digital habits

**Why TABULA?**
The name TABULA comes from "tabula rasa" (blank slate), representing the fresh start you get each day to reclaim your time. The acronym also stands for "Take Back Your Life Again" - our mission to help you regain control over your digital life.

**Open Source & Supported:**
TABULA is open source and actively maintained. Visit our GitHub repository to contribute, report issues, or see the roadmap. If you find TABULA helpful, consider supporting development through Ko-fi.

**Your Data, Your Control:**
Unlike other productivity tools, TABULA never sends your data anywhere. Your tasks, settings, and usage patterns stay entirely on your device. You can export your data at any time, giving you complete ownership and portability.

Start reclaiming your time today. Install TABULA and transform every moment of distraction into an opportunity to focus on what truly matters.

---

Version 0.2.0 - First public release
GitHub: https://github.com/temporalparts/todo-overlay
Support: https://ko-fi.com/temporalparts

### Category
Productivity

### Language
English (United States)

## Additional Notes

### Data Usage Certification
- This extension does NOT collect any user data
- This extension does NOT transmit any information to external servers
- All data is stored locally using Chrome's storage API
- No personal information is collected or shared
- No analytics or tracking of any kind

### Privacy Policy URL
You'll need to host this privacy policy (can use GitHub Pages):
https://github.com/temporalparts/todo-overlay/blob/main/PRIVACY.md

Or create a simple GitHub Pages site with the privacy policy content.