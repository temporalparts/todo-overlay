# TODO - Feature Roadmap

## ✅ Completed Features
- [x] Core task management (add, complete, delete, reorder)
- [x] Priority levels (High/Medium/Low with color coding)
- [x] Due dates with calendar picker
- [x] Drag-and-drop task reordering
- [x] Undo/redo support (Ctrl/Cmd+Z)
- [x] Dark/light/auto theme modes
- [x] Domain-based auto-display
- [x] Snooze and dismiss functionality
- [x] Cross-tab synchronization
- [x] Inspirational quote rotation
- [x] Data export/import
- [x] GitHub and Ko-fi integration

## 🚀 Phase 1: Core Enhancements (High Priority)

### Task Management Improvements
- [ ] **Tags/Labels System** - Custom categories for better organization
  - Color-coded tags
  - Multi-tag support per task
  - Quick filter by tag
  
- [ ] **Task Search** - Find tasks quickly
  - Real-time search as you type
  - Search in task titles and descriptions
  - Search history

- [ ] **Keyboard Shortcuts** - Power user features
  - Quick add (Ctrl/Cmd+N)
  - Navigate tasks with arrow keys
  - Quick complete (Space)
  - Quick delete (Delete/Backspace)
  - Focus search (Ctrl/Cmd+F)

### Content & Formatting
- [ ] **Markdown Support** - Rich text in task descriptions
  - Bold, italic, strikethrough
  - Links and code blocks
  - Checklists within tasks
  - Preview/edit toggle

## 📋 Phase 2: Productivity Features (Medium Priority)

### Recurring & Automated Tasks
- [ ] **Recurring Tasks** - Templates for regular activities
  - Daily/weekly/monthly patterns
  - Custom recurrence rules
  - Auto-create on schedule
  - Skip/reschedule options

- [ ] **Smart Sorting** - Intelligent task prioritization
  - Sort by due date proximity
  - Bubble up overdue tasks
  - Priority + date hybrid sorting
  - Custom sort preferences

### Analytics & Insights
- [ ] **Productivity Analytics** (Local only)
  - Tasks completed per day/week
  - Time spent on sites before dismissing
  - Snooze pattern analysis
  - Productivity trends over time
  - Export analytics data

### Notifications
- [ ] **Desktop Notifications** - Proactive reminders
  - Due date reminders
  - Daily task summary
  - Overdue task alerts
  - Customizable notification schedule

## 🌟 Phase 3: Integrations (Nice to Have)

### Note-Taking Integration
- [ ] **Obsidian Integration** - Sync with knowledge base
  - Export tasks to daily notes
  - Import tasks from Obsidian
  - Bi-directional sync option
  - Template support
  - Link tasks to notes

- [ ] **Notion Integration** - Connect with workspace
  - Sync with Notion databases
  - Create tasks from Notion
  - Update status in both systems

### Calendar & Time Management
- [ ] **Calendar Integration** - Time-based task management
  - Google Calendar sync
  - Outlook integration
  - Time blocking for tasks
  - Calendar view in extension

### Developer Tools
- [ ] **API/Webhooks** - External integrations
  - REST API for task management
  - Webhook triggers for events
  - Zapier/IFTTT integration
  - CLI tool for task management

## 🔮 Phase 4: Ecosystem Expansion (Future Vision)

### Multi-Device Support
- [ ] **Mobile Companion App** - iOS/Android apps
  - Sync with extension
  - Mobile site blocking
  - Quick task capture
  - Widget support

- [ ] **Cloud Sync** (Privacy-first)
  - End-to-end encrypted backup
  - Cross-device synchronization
  - Self-hosted option
  - Account system

### Advanced Features
- [ ] **AI Assistant** - Smart task management
  - Natural language task creation
  - Smart task suggestions
  - Auto-categorization
  - Priority recommendations

- [ ] **Team Features** (Separate product)
  - Shared task lists for families
  - Accountability partners
  - Team productivity metrics

## 🛠️ Technical Improvements

### Performance & Storage
- [ ] **IndexedDB Migration** - For large datasets
  - Handle 1000+ tasks efficiently
  - Full-text search indexing
  - Attachment support
  - Better performance

### Developer Experience
- [ ] **Plugin System** - Extensibility
  - Custom integrations
  - Theme marketplace
  - Community plugins
  - Developer API

## ❌ Deprecated/Not Planned

These features were considered but decided against to maintain focus:

- ~~Project management features~~ - Keep it simple, not another Jira
- ~~Time tracking~~ - Adds complexity without core value
- ~~Social features~~ - This is a personal productivity tool
- ~~Ads or monetization tracking~~ - Privacy first, always
- ~~Cloud storage requirement~~ - Local-first is a core principle

## 📊 Implementation Priorities

### Decision Criteria
1. **User Impact** - How many users will benefit?
2. **Complexity** - How difficult to implement?
3. **Core Value** - Does it enhance the distraction-blocking loop?
4. **Privacy** - Does it maintain local-first principles?

### Recommended Order
1. **Tags & Search** - High impact, moderate complexity
2. **Markdown Support** - Highly requested, straightforward
3. **Keyboard Shortcuts** - Power user essential
4. **Recurring Tasks** - Common use case
5. **Obsidian Integration** - Strong user overlap
6. **Analytics** - Helps users understand habits
7. **Mobile App** - Major expansion but different platform

## 💡 Design Principles

### Keep the Core Loop Sacred
- The interruption is the feature
- Quick task capture (< 5 seconds)
- Minimal clicks to productivity
- Don't make dismissal too easy

### Privacy is Non-Negotiable
- Local-first always
- Optional cloud features only
- No tracking or analytics to third parties
- User owns their data

### Simplicity Over Features
- Every feature must justify its complexity
- Avoid feature creep
- Stay focused on time reclamation
- Clean, distraction-free UI

## 📈 Success Metrics

Track these to guide development:
- Task completion rate
- Time to first productive action after intercept
- Snooze frequency reduction over time
- User retention after 30 days
- Feature adoption rates

---

*Last Updated: August 2024*
*Version: 0.2.6*