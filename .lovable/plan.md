

# Enhanced Tactical RMM Dashboard

Upgrading the current table-only view into a full device management dashboard with card/grid views, agent detail panel, and management actions.

---

## What You'll Get

- **View Switcher**: Toggle between Card view (visual grid of devices) and Table view (current list)
- **Device Cards**: Each device shown as a visual card with status indicator, OS icon, hostname, and quick-action buttons
- **Agent Detail Panel**: Click any device to open a slide-out panel showing full details, system info, and management actions
- **Management Actions**: Send commands, trigger patch scans, request reboot, and open remote desktop (opens Tactical RMM's MeshCentral remote view in a new tab)
- **Sorting and Filtering**: Filter by status (online/offline/needs reboot) plus existing search

---

## Technical Details

### 1. Update Backend Proxy (`supabase/functions/tacticalrmm-proxy/index.ts`)

Add support for:
- **Agent details**: `GET /agents/<agent_id>/` -- returns full agent info (CPU, RAM, disks, services)
- **Send command**: `POST /agents/<agent_id>/cmd/` -- execute shell/PowerShell commands
- **Patch scan**: `POST /agents/<agent_id>/cmd/` with Windows Update scan command  
- **Reboot**: `POST /agents/<agent_id>/reboot/`
- **MeshCentral URL**: Extract the `meshnode_id` from agent data to construct the remote control link

The proxy will support both GET and POST methods to the Tactical RMM API, with the `method` field in the request body.

### 2. Refactor Frontend (`src/components/tacticalrmm/TacticalRMMDashboard.tsx`)

**New state:**
- `viewMode`: `'card' | 'table'` -- toggle between views
- `selectedAgent`: the agent currently being viewed in detail
- `detailLoading`: loading state for agent detail fetch
- `agentDetail`: full agent detail data
- `statusFilter`: `'all' | 'online' | 'offline' | 'reboot'`

**New sub-components (inline or extracted):**

- **AgentCard**: A card component per device showing:
  - Color-coded status dot (green/red)
  - OS icon (Windows/Linux/Mac based on `plat` field)
  - Hostname (bold)
  - OS version (truncated)
  - Last seen timestamp
  - Reboot/patches badges
  - Click to open detail panel

- **AgentDetailSheet**: A dialog/sheet that slides in when clicking a device:
  - Full system info (CPU, RAM, disks, uptime)
  - Installed patches count
  - Last seen, IP address
  - Action buttons:
    - "Open Remote Desktop" -- opens `https://<TACTICALRMM_MESH_URL>` with the agent's mesh node (new tab)
    - "Run Command" -- input field + execute button (sends to proxy)
    - "Scan for Patches" -- triggers update scan
    - "Reboot" -- with confirmation dialog

- **ViewToggle**: Simple button group to switch card/table views

- **StatusFilter**: Dropdown or button group to filter by online/offline/needs reboot

### 3. Remote Desktop Access

Tactical RMM uses MeshCentral for remote control. Each agent has a `meshnode_id`. The remote desktop link format is:
```
https://mesh.yourdomain.com/#/device/<meshnode_id>
```

The proxy will return the mesh node ID from agent details, and clicking "Open Remote Desktop" will open this URL in a new tab. This requires the `TACTICALRMM_MESH_URL` secret (your MeshCentral URL).

If the mesh URL is not configured, the button will be hidden with a note.

### 4. Files Modified

| File | Changes |
|---|---|
| `supabase/functions/tacticalrmm-proxy/index.ts` | Add POST method support, agent detail endpoint, command execution, reboot endpoint |
| `src/components/tacticalrmm/TacticalRMMDashboard.tsx` | Full rewrite: add card grid view, view switcher, status filters, agent detail sheet, management actions |

### 5. New Secret (Optional)

- `TACTICALRMM_MESH_URL` -- Your MeshCentral URL for remote desktop links (e.g., `https://mesh.yourdomain.com`). If not provided, the remote desktop button simply won't appear.

