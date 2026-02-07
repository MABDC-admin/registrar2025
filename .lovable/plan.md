

# Fix Persistent Take Control Access via API-Generated MeshCentral URLs

## Problem

The current "Take Control" button opens `https://rmm.mabdc.org/takecontrol/{agent_id}`, which is a **web UI page** that requires an active browser session (cookie-based login). When you log out of the RMM website, the session cookie is destroyed, so clicking "Take Control" forces a re-login -- even though the API key has full permissions.

The API key only works for REST API calls (via the `X-API-KEY` header), not for web UI pages.

## Root Cause

After reviewing the Tactical RMM source code, here is how "Take Control" actually works internally:

1. When you click "Take Control" in the RMM web UI, the backend calls `GET /agents/{agent_id}/meshcentral/`
2. This endpoint generates a **temporary MeshCentral login token** server-side
3. It returns a direct URL like: `https://mesh.mabdc.org/?login={token}&gotonode={mesh_node_id}&viewmode=11&hide=31`
4. This URL contains embedded authentication -- no browser session needed

## Solution

Instead of opening the RMM web UI take control page, our edge function will call the RMM API endpoint `/agents/{agent_id}/meshcentral/` using the API key. This returns a `control` URL with an embedded login token that works independently of any web session.

```text
Current flow (broken):
  Click "Take Control" --> Opens rmm.mabdc.org/takecontrol/{id} --> Requires web session --> Login required

New flow (persistent):
  Click "Take Control" --> Edge function calls API /agents/{id}/meshcentral/ with API key
                       --> API returns URL with embedded login token
                       --> Opens MeshCentral directly with token --> No login needed
```

## Changes

### 1. Edge Function (`supabase/functions/tacticalrmm-proxy/index.ts`)

Add a new action handler `takecontrol` that:
- Calls `GET /agents/{agent_id}/meshcentral/` with the `X-API-KEY` header
- Returns the `control` URL from the response (which contains the embedded login token)

### 2. Agent Detail Sheet (`src/components/tacticalrmm/AgentDetailSheet.tsx`)

Update the "Take Control" button to:
- Call the edge function with `action: 'takecontrol'` and the agent ID
- Receive the authenticated MeshCentral URL back
- Open that URL in a new tab
- Show a loading state while fetching the URL

### 3. Types (`src/components/tacticalrmm/types.ts`)

Confirm `mesh_node_id` is already in the Agent type (it is, based on existing MeshCentral code).

## Files Modified

| File | Change |
|---|---|
| `supabase/functions/tacticalrmm-proxy/index.ts` | Add `takecontrol` action that calls `/agents/{id}/meshcentral/` API |
| `src/components/tacticalrmm/AgentDetailSheet.tsx` | Update Take Control to fetch authenticated URL from API, then open it |

## Technical Details

The RMM API endpoint `GET /agents/{agent_id}/meshcentral/` returns:
```json
{
  "hostname": "DESKTOP-4VD01U8",
  "control": "https://mesh.mabdc.org/?login=TOKEN&gotonode=NODE_ID&viewmode=11&hide=31",
  "terminal": "https://mesh.mabdc.org/?login=TOKEN&gotonode=NODE_ID&viewmode=12&hide=31",
  "file": "https://mesh.mabdc.org/?login=TOKEN&gotonode=NODE_ID&viewmode=13&hide=31",
  "status": "online",
  "client": "...",
  "site": "..."
}
```

The `control` URL is what we need -- it opens MeshCentral's remote desktop view with a pre-authenticated token, completely bypassing any web session requirement.

