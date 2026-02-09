

# Insert 16 STFXSA Teachers with Accounts and MABDC Access

## Overview

Insert 16 teachers into the STFXSA school, create authentication accounts using lastname-based emails with unified password `123456`, and grant each teacher access to MABDC student records.

## Teacher List

| Grade Level   | Full Name                  | Email (generated)              |
|---------------|----------------------------|--------------------------------|
| Kindergarten  | Loida B. Peteros           | peteros@stfxsa.org             |
| Grade 1       | Apple B. Cortes            | cortes@stfxsa.org              |
| Grade 1       | Jianne B. Briones          | briones@stfxsa.org             |
| Grade 2       | Chemlie D. Yap             | yap@stfxsa.org                 |
| Grade 2       | Johnin Mae P. Declaro      | declaro@stfxsa.org             |
| Grade 3       | Melody Dawn M. Bisnar      | bisnar@stfxsa.org              |
| Grade 3       | Shaylene B. Manapsal       | manapsal@stfxsa.org            |
| Grade 4       | Joshua B. Munez            | munez@stfxsa.org               |
| Grade 4       | Wenna Jane L. Caiwan       | caiwan@stfxsa.org              |
| Grade 5       | Melirose D. Cerbo          | cerbo@stfxsa.org               |
| Grade 5       | Syrah U. Ababat            | ababat@stfxsa.org              |
| Grade 6       | Ronalyn B. Sual            | sual@stfxsa.org                |
| Grade 6       | Ria D. Corpez              | corpez@stfxsa.org              |
| Grade 7       | Casandra U. Dante          | dante@stfxsa.org               |
| Grade 7       | Alwin Marie P. Estremos    | estremos@stfxsa.org            |

(15 teachers total -- Kindergarten has 1 teacher, Grades 1-7 have 2 each)

## Steps

### 1. Create Auth Accounts via Edge Function
For each teacher, call the `create-users` edge function with:
- `action: "create_teacher"`
- `email: lastname@stfxsa.org`
- `password: "123456"`
- `fullName: full teacher name`

This creates the auth user, sets role to `teacher`, and stores credentials.

### 2. Insert Teacher Records
Insert 15 rows into the `teachers` table with:
- `employee_id`: Sequential IDs (e.g., STFXSA-001 through STFXSA-015)
- `full_name`: Teacher's full name
- `email`: lastname@stfxsa.org
- `grade_level`: Assigned grade level
- `school`: "STFXSA"
- `user_id`: The auth user ID returned from step 1

### 3. Store teacher_id in user_credentials
Link each teacher's credential record to their teacher record by updating `user_credentials.teacher_id`.

### 4. Grant MABDC Access
Insert a row in `user_school_access` for each teacher:
- `user_id`: The teacher's auth user ID
- `school_id`: `33333333-3333-3333-3333-333333333333` (MABDC)
- `role`: "teacher"
- `is_active`: true

This allows each teacher to view MABDC student records.

## Technical Details

- All 15 account creations will be done by calling the `create-users` edge function sequentially (to avoid race conditions in auth)
- Teacher records will be inserted via a single batch SQL insert
- The `user_school_access` entries will be inserted in a single batch
- If any email already exists, that teacher will be skipped with a warning logged

