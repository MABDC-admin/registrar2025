

# Fix Live Monitor View - Replace Iframes with Popup Windows

## Problem

MeshCentral blocks WebSocket connections when embedded inside an iframe due to its `X-Frame-Options` and Content Security Policy (`frame-ancestors`) headers. This is a server-side security restriction on the MeshCentral server (`mesh.mabdc.org`) -- it cannot be bypassed from the frontend code.

The URLs work perfectly when opened in a regular browser tab because there is no iframe cross-origin restriction.

## Solution

Replace the iframe-based approach with a **managed popup windows** strategy:

1. "Connect All" opens each agent's MeshCentral session in a separate popup window (using `window.open()` with specified dimensions)
2. The Live Monitor View becomes a **control panel** showing connection status, with buttons to re-focus or re-open each window
3. Each popup is tracked so the control panel can show which are still open

This gives you the multi-monitor experience (tile the popups on your screen) while working within MeshCentral's security constraints.

```text
Current (broken):
  Connect All --> Embed iframes --> WebSocket blocked by CSP --> Error

New (working):
  Connect All --> Open popup windows --> Full MeshCentral in each --> Works
  Control panel stays open to manage all windows
```

## Changes

### 1. LiveMonitorView.tsx - Rewrite as Control Panel

Replace iframe tiles with a status/control grid:
- Each tile shows agent name, status, and action buttons
- "Focus" button brings an existing popup to front
- "Reopen" button launches a new popup if closed
- Track popup window references to detect if user closed them
- Auto-open all popups on initial mount
- "Open All" button to relaunch all at once

### 2. TacticalRMMDashboard.tsx - Minor Update

- Pass the raw control URLs to LiveMonitorView (no change to fetch logic)
- The existing `handleConnectAll` already fetches all URLs correctly

## Files Modified

| File | Change |
|---|---|
| `src/components/tacticalrmm/LiveMonitorView.tsx` | Replace iframe grid with popup window management control panel |
| `src/components/tacticalrmm/TacticalRMMDashboard.tsx` | Minor cleanup if needed |

## Technical Details

- `window.open(url, windowName, 'width=1024,height=768')` opens each session in a named popup
- Using named windows means calling `window.open` again with the same name will focus the existing window instead of opening a duplicate
- A periodic check (every 3 seconds) detects if popup windows were closed by the user and updates the status indicator
- Each tile shows: agent name, connection status (open/closed), Focus button, Reopen button, Open in Tab fallback
- The control panel grid layout (auto/2x2/3x3 toggle) is kept for organizing the status tiles
- On "Back", all popup windows remain open (user can close them manually)

## User Experience

1. Click "Connect All" -- fetches authenticated URLs for all online agents
2. Live Monitor control panel appears with all agents listed
3. Popup windows automatically open for each agent (may require allowing popups)
4. User tiles/arranges popup windows on their monitor(s)
5. Control panel lets them re-focus, reopen, or dismiss individual sessions
6. "Refresh All" generates fresh authentication tokens and reopens windows

