

# Zoom Virtual Classroom Dashboard (Using Existing Meeting Links)

## Overview
Since you already have Zoom meeting URLs, meeting IDs with passwords, and pre-configured breakout rooms, we don't need any Zoom API integration. Instead, we'll build a dashboard that stores your existing links and provides a smart, time-aware interface for teachers and students to join.

## What You'll Get

- A **"Virtual Classes"** page in the sidebar
- **Live status indicator** showing whether class is in session (Mon-Fri, 7:30 AM - 5:30 PM UAE time)
- **Current UAE time** displayed prominently
- **"Join Main Meeting"** button that opens your existing Zoom meeting URL
- **Breakout Rooms list** with individual join buttons for each pre-configured room
- **Admin settings** to update the meeting URL, password, and breakout room links anytime
- Buttons are only active during scheduled hours; outside hours they show a countdown to the next session

## No Zoom API Needed
Since your meetings and breakout rooms are already set up in Zoom, the system simply stores and launches the URLs you provide. No automation credentials required.

---

## Technical Details

### 1. Database Table: `zoom_settings`

Stores the meeting configuration per school.

| Column | Type | Description |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| school_id | uuid (FK) | Links to school |
| meeting_url | text | Main Zoom meeting join URL |
| meeting_id | text | Zoom meeting ID |
| meeting_password | text | Meeting password |
| breakout_rooms | jsonb | Array of `{name, url}` objects |
| schedule_start | time | Default: 07:30:00 |
| schedule_end | time | Default: 17:30:00 |
| timezone | text | Default: Asia/Dubai |
| active_days | int[] | Default: {1,2,3,4,5} (Mon-Fri) |
| is_active | boolean | Default: true |
| updated_by | uuid | Last editor |
| created_at / updated_at | timestamptz | Timestamps |

**RLS Policies:**
- Admin/Registrar: Full read/write access for their school
- Teacher/Student: Read-only access for their school

### 2. New Files

**`src/components/zoom/ZoomDashboard.tsx`** -- Main dashboard page
- Fetches `zoom_settings` for the current school
- Shows live UAE clock and session status (green "In Session" / gray "Offline")
- Large "Join Main Meeting" button (opens URL in new tab, disabled outside hours)
- Meeting ID and password display (copyable)
- Breakout rooms grid -- each room has a name and "Join" button
- If no settings configured yet, shows setup prompt for admin
- Countdown timer when outside scheduled hours

**`src/components/zoom/ZoomSettingsPanel.tsx`** -- Admin configuration
- Form to enter/update main meeting URL, meeting ID, and password
- Dynamic list to add/edit/remove breakout rooms (name + URL pairs)
- Schedule configuration (start time, end time, active days)
- Toggle to enable/disable the virtual classroom
- Only visible to admin and registrar roles

### 3. Modified Files

**`src/components/layout/DashboardLayout.tsx`**
- Import a Video icon from lucide-react
- Add "Virtual Classes" navigation item for admin, registrar, and teacher roles
- Add corresponding 3D and Apple-style icon mappings

**`src/pages/Index.tsx`**
- Import `ZoomDashboard` component
- Add rendering block for `activeTab === 'zoom'` accessible to admin, registrar, and teacher roles

### 4. Implementation Order

1. Create `zoom_settings` database table with RLS policies
2. Create `ZoomDashboard.tsx` with live status, join buttons, and breakout room list
3. Create `ZoomSettingsPanel.tsx` for admin to manage links
4. Add sidebar navigation in `DashboardLayout.tsx`
5. Add tab routing in `Index.tsx`

