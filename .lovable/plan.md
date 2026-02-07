

# Replace "Add Teacher" with Messages + Add Registrar to Communication

## What Changes

1. **Quick Actions Widget**: The "Add Teacher" button on the admin and registrar dashboard portal will be replaced with a "Messages" button that navigates to the communication page.

2. **Registrar Access**: The registrar role will be added to the messaging system so registrars can send and receive messages alongside admins and teachers.

3. **Mailbox Icon with Badge**: A mailbox/envelope icon will be added to the top header bar (both mobile and desktop) showing the unread message count as a notification badge. Clicking it navigates to the Messages page.

4. **Sidebar Update**: The Messages nav item will be added to the registrar's sidebar navigation (under School Management group).

---

## Technical Details

### Files to Modify

**1. `src/components/dashboard/QuickActions.tsx`**
- Replace the "Add Teacher" action (index 1) with a "Messages" action that calls `onNavigate('messages')`
- Use a message/mail icon instead of the teacher icon

**2. `src/components/layout/DashboardLayout.tsx`**
- Add `{ id: 'messages', icon: EventsIcon3D, label: 'Messages' }` to the registrar's "School Management" group
- Import `useUnreadCount` hook and `Mail` icon from lucide-react
- Add a mailbox icon button with unread badge in the mobile header and as a floating/fixed element in the sidebar header area (visible for admin, teacher, and registrar roles)
- Clicking the mailbox icon calls `onTabChange('messages')`

**3. `src/pages/Index.tsx`**
- Update the Messages access check from `(role === 'admin' || role === 'teacher')` to `(role === 'admin' || role === 'teacher' || role === 'registrar')`

**4. Database Migration (new SQL migration)**
- Add registrar role to RLS policies on `conversations`, `conversation_participants`, `messages`, and `message_receipts` tables:
  - Update the "Admin/teacher can create conversations" policy to include registrar
  - Update the "Participants can insert messages" policy to also allow registrar
  - Add registrar checks to participant management policies

**5. `src/components/messaging/NewChatDialog.tsx`**
- Update the user query to also fetch registrar users as available contacts (currently only fetches admin/teacher roles)

**6. `src/hooks/useMessaging.ts`**
- No structural changes needed; the hook already works for any authenticated user who is a conversation participant

### Mailbox Icon Placement
- **Mobile header**: Next to the school name/switcher area, a small mail icon with a red badge showing unread count
- **Sidebar header**: Below the school switcher, a subtle mail icon button with badge (hidden when sidebar is collapsed, shown as icon-only when collapsed)
- Only visible to admin, teacher, and registrar roles
