# TODO - Feature Roadmap

## Task Management
- [ ] Set priority levels for tasks (High/Medium/Low)
- [ ] Auto-sort tasks by priority/relevance at the top of the agenda
- [ ] Add recurring tasks (daily, weekly, monthly)
- [ ] Tag tasks with custom labels/categories

## Notifications & Alerts
- [ ] Desktop notifications for upcoming tasks
- [ ] Alert system for time-sensitive items
- [ ] Reminder notifications before due dates

## Calendar Integration
- [ ] Add events directly to calendar
- [ ] Sync tasks with calendar applications
- [ ] View tasks in calendar format

## Search & Organization
- [ ] Full-text search across all tasks and notes
- [ ] Filter tasks by tags, priority, or date
- [ ] Advanced search with regex support

## Note-Taking & Formatting
- [ ] Markdown support for task descriptions
- [ ] Rich text formatting options
- [ ] Attach notes to tasks
- [ ] Preview formatted content

## Considerations for Feature Prioritization

### Core Value Proposition
TABULA's unique strength is its **interception-based productivity model** - it blocks distracting websites and converts that moment of distraction into productive task management. New features should enhance this core loop rather than dilute it.

### Implementation Priorities

#### 1. High Impact, Low Complexity (Do First)
- **Task priorities & sorting** - Essential for users to focus on what matters when intercepted
- **Markdown in descriptions** - Already have the UI, just need rendering
- **Tags/labels** - Simple to implement, high organizational value
- **Keyboard shortcuts** - Quick task entry when blocked from a site

#### 2. Strategic Enhancements (Do Second)  
- **Recurring tasks** - Builds habit formation, aligns with breaking bad browsing habits
- **Desktop notifications** - Reminds users of priorities before they hit blocked sites
- **Full-text search** - Becomes critical as task lists grow

#### 3. Complex but Valuable (Plan Carefully)
- **Calendar integration** - Requires OAuth, API complexity, but connects tasks to time
- **Cross-device sync** - Needs backend infrastructure but enables mobile blocking

### Technical Considerations

#### Current Architecture Strengths
- Clean separation between UI components and storage layer
- WebExtension APIs provide good foundation for notifications
- Shadow DOM isolation prevents site interference
- Existing snooze system can be extended for recurring tasks

#### Challenges to Address
- **Storage limits** - browser.storage.local has 5MB limit, may need IndexedDB for attachments/notes
- **Performance** - Full-text search needs efficient indexing strategy
- **Permissions** - New features may require additional permissions (notifications, calendar access)

### User Experience Principles

#### Keep the Friction Productive
- The interruption is the feature - don't make dismissing too easy
- Quick task capture should be possible in under 5 seconds
- Priority tasks should be immediately visible on intercept

#### Avoid Feature Creep
- Resist becoming a full project management tool (plenty exist already)
- Don't add collaboration features - this is a personal productivity tool
- Keep mobile app separate if built - different use cases

#### Metrics to Guide Development
- Measure: Tasks completed vs tasks created ratio
- Measure: Time between intercept and productive action
- Measure: Snooze usage patterns (are we actually changing habits?)

### Recommended Implementation Order

1. **Priority system + auto-sort** - Immediate value, straightforward implementation
2. **Tags** - Enhances organization without complexity  
3. **Markdown support** - Leverages existing UI, improves task clarity
4. **Keyboard shortcuts** - Reduces friction for power users
5. **Recurring tasks** - Builds on existing date system
6. **Search** - Becomes necessary as users accumulate tasks
7. **Notifications** - Extends the intervention model beyond browsing
8. **Calendar integration** - Major feature requiring careful planning