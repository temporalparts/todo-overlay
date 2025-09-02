# Quick Test Instructions

## 1. Reload Extension
1. Go to `chrome://extensions`
2. Find TABULA
3. Click the refresh icon (↻)

## 2. Test Auto-Show
1. Open a new tab
2. Go to reddit.com
3. **Expected**: Overlay appears after 1 second
4. Look for console logs: `[TABULA] Content script loaded...`

## 3. Test Snooze (15 seconds)
1. Click "Snooze 15s" on the overlay
2. Refresh the page immediately
3. **Expected**: Overlay does NOT appear
4. Wait 15+ seconds and refresh
5. **Expected**: Overlay appears again

## 4. Test Dismiss (1 minute)
1. Click "Dismiss 1m" on the overlay
2. Refresh the page
3. **Expected**: Overlay does NOT appear for 1 minute

## 5. Test Extension Icon
1. Go to any website (e.g., google.com)
2. Click the TABULA extension icon
3. **Expected**: Overlay opens immediately (even if snoozed)

## 6. Test Tasks
1. Add a task: "Test task 1"
2. Check it as complete
3. Add another: "Test task 2"
4. Refresh the page
5. **Expected**: Tasks persist

## Troubleshooting
- Open Chrome DevTools Console (F12)
- Look for `[TABULA]` messages
- Check for any red error messages
- If no console logs appear, the content script isn't loading