

# Tactical RMM Dashboard Fixes and Enhancements

## Issues Identified

1. **"Open" (Remote Desktop) button not visible**: The button only shows when both `meshUrl` AND `agent.meshnode_id` are present. The `meshnode_id` is only populated after clicking an agent to fetch details, but it may not be returned by the API if the field name differs. The proxy returns `meshUrl` at top level but the dashboard needs to pass it through correctly.

2. **No site filtering**: Tactical RMM organizes agents by "sites" (within clients). The current dashboard has no site filter.

3. **Default filter should be "online"**: Currently defaults to showing all agents.

4. **No description field in card/table view**: Agent descriptions from Tactical RMM are not displayed.

---

## Changes

### 1. Update Agent Type (`src/components/tacticalrmm/types.ts`)

Add missing fields from the Tactical RMM API:
- `site_name: string` -- the site the agent belongs to
- `client_name: string` -- the client/organization
- `description: string` -- agent description/notes
- `monitoring_type: string` -- server vs workstation

### 2. Fix Remote Desktop Button Visibility (`AgentDetailSheet.tsx`)

- Make the "Open Remote Desktop" button always visible when `meshUrl` exists (even without `meshnode_id`), but disabled with a tooltip explaining why if `meshnode_id` is missing
- Ensure `meshnode_id` is fetched during the detail call

### 3. Add Site Filtering (`TacticalRMMDashboard.tsx`)

- Extract unique site names from the loaded agents list
- Add a site filter dropdown next to the existing status filter
- Filter agents by selected site

### 4. Default to "Online" Filter

- Change `statusFilter` initial state from `'all'` to `'online'`

### 5. Add Description to Card and Table Views

**AgentCard.tsx:**
- Show `agent.description` below the OS line (truncated, muted text)
- Show `agent.site_name` as a small badge or label

**AgentTable.tsx:**
- Add a "Site" column
- Add a "Description" column (truncated)

### 6. Update Proxy to Include Sites Endpoint

Add a `sites` action to `tacticalrmm-proxy/index.ts` that fetches `/clients/` or extracts unique sites from agent data, to populate the site filter dropdown.

---

## Technical Details

### Files Modified

| File | Changes |
|---|---|
| `src/components/tacticalrmm/types.ts` | Add `site_name`, `client_name`, `description`, `monitoring_type` fields |
| `src/components/tacticalrmm/TacticalRMMDashboard.tsx` | Add site filter dropdown, default status to "online", extract unique sites from agents |
| `src/components/tacticalrmm/AgentCard.tsx` | Display description and site name |
| `src/components/tacticalrmm/AgentTable.tsx` | Add Site and Description columns |
| `src/components/tacticalrmm/AgentDetailSheet.tsx` | Show Remote Desktop button more prominently, handle missing meshnode_id gracefully |
| `supabase/functions/tacticalrmm-proxy/index.ts` | No changes needed -- site data comes with agent list response |

### Site Filter Logic

Sites are extracted from the agents array:
```text
const sites = [...new Set(agents.map(a => a.site_name).filter(Boolean))];
```

A new `siteFilter` state (default `'all'`) filters the displayed agents.

### Remote Desktop Button Fix

The button will appear whenever `meshUrl` is configured. If the agent lacks a `meshnode_id`, it opens MeshCentral's main page instead of a specific device page, so you can still navigate to the device manually.

