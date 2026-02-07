

# Robust Fix: Eliminate All RLS Infinite Recursion in Messaging Tables

## Problem
The error `infinite recursion detected in policy for relation "conversation_participants"` persists because the **remaining** SELECT policy on `conversation_participants` ("Participants can view co-participants") also queries its own table in a subquery. This triggers recursion, and since every other table's policies (`conversations`, `messages`, `message_receipts`) reference `conversation_participants` in their subqueries, ALL messaging operations fail.

There are also duplicate policies that should be cleaned up.

## Solution

A single database migration that:

### Step 1: Create a SECURITY DEFINER function
A helper function `get_user_conversation_ids(uuid)` that returns all conversation IDs a user participates in. Because it uses `SECURITY DEFINER`, it bypasses RLS entirely -- breaking the recursion chain.

```sql
CREATE OR REPLACE FUNCTION public.get_user_conversation_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT conversation_id 
  FROM conversation_participants 
  WHERE user_id = _user_id;
$$;
```

### Step 2: Drop ALL existing problematic policies
Remove every SELECT/INSERT policy that uses a subquery on `conversation_participants`, plus duplicate policies:

- `conversation_participants`: "Participants can view co-participants" (self-referencing SELECT)
- `conversation_participants`: "Admin/teacher can add participants" (duplicate INSERT)
- `conversations`: "Participants can view conversations" (buggy SELECT referencing conversation_participants)
- `conversations`: "Users can view their conversations" (duplicate SELECT referencing conversation_participants)
- `messages`: "Participants can view messages" (SELECT referencing conversation_participants)
- `messages`: "Participants can insert messages" (duplicate INSERT referencing conversation_participants)
- `messages`: "Participants can send messages" (duplicate INSERT referencing conversation_participants)
- `message_receipts`: "Participants can view receipts" (SELECT joining conversation_participants)

### Step 3: Recreate clean policies using the SECURITY DEFINER function

**conversation_participants (SELECT):**
```sql
-- Simple: you can see rows where user_id is you, 
-- OR the conversation_id is one you belong to
USING (
  user_id = auth.uid() 
  OR conversation_id IN (SELECT get_user_conversation_ids(auth.uid()))
)
```

**conversations (SELECT):**
```sql
USING (id IN (SELECT get_user_conversation_ids(auth.uid())))
```

**messages (SELECT):**
```sql
USING (conversation_id IN (SELECT get_user_conversation_ids(auth.uid())))
```

**messages (INSERT):** single clean policy
```sql
WITH CHECK (
  sender_id = auth.uid() 
  AND conversation_id IN (SELECT get_user_conversation_ids(auth.uid()))
)
```

**message_receipts (SELECT):** single clean policy
```sql
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM messages m 
    WHERE m.id = message_receipts.message_id 
    AND m.sender_id = auth.uid()
  )
)
```

### No Code Changes Required
All frontend code remains the same. Only the database policies are fixed.

