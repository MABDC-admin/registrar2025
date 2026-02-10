

# Delete 6 STFXSA Learner Records

## Records to Delete

| Name | Level | ID |
|------|-------|----|
| Agta Nalata | Grade 1 | 2b352922-... |
| Isabella Cruz | Grade 1 | c13db39f-... |
| Juan Dela Cruz | Grade 2 | c201ac9d-... |
| Maria Santos | Grade 1 | b0b421ff-... |
| Miguel Garcia | Kinder 2 | c9636ca6-... |
| Sofia Reyes | Grade 3 | 95959e0a-... |

All 6 learners belong to STFXSA school. None have associated grade records or documents, so this is a clean delete.

## What Will Happen

A single database migration will delete these 6 rows from the `students` table using their exact IDs. This is permanent and cannot be undone.

## Technical Details

**Migration SQL:**
```sql
DELETE FROM public.students
WHERE id IN (
  '2b352922-cb5c-465c-a2ec-7992efa075eb',
  'c13db39f-8b90-4bdf-a29b-ee9803371508',
  'c201ac9d-1a33-4b01-8df1-a17845b07103',
  'b0b421ff-b664-4e99-aedd-14945e483183',
  'c9636ca6-c7ec-444d-b037-b7e8133b0a34',
  '95959e0a-588e-40fd-b435-4af489b5cc79'
)
AND school_id = '22222222-2222-2222-2222-222222222222';
```

The `AND school_id` clause is a safety check to ensure only STFXSA records are affected.

