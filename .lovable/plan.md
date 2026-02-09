
# Insert 4 STFXSA Kindergarten Students and Auto-Enroll in Subjects

## Overview

Insert 4 learners from the uploaded images into the STFXSA school as Kindergarten students, then auto-enroll each into all 6 available Kindergarten subjects.

## Student Data (from images)

| # | LRN | Name | Gender | Birthdate | Age | Mother | Father | Address | Religion |
|---|-----|------|--------|-----------|-----|--------|--------|---------|----------|
| 1 | 411103250003 | BIBAT, ERGIEL LHIAM ALBESA | M | 2020-06-14 | 5 | ALBESA, WENGELYN, BATIAO | BIBAT, ERNEST, TRIGO | ESPERANZA, INOPACAN | Christianity |
| 2 | 411103250002 | BATIANCILA, JORXIA VILLACORTE | F | 2020-05-10 | 5 | VILLACORTE, MARY GRACE, ANDUJAR | BATIANCILA, MARK JORIEL, BANDIJA | PLARIDEL, CITY OF BAYBAY | Christianity |
| 3 | 411103250004 | MOLATO, GWYN XAVIENNA SUAL | F | 2020-07-15 | 5 | SUAL, RONALYN, BANCULO | MOLATO, JOHN MARK, BISNAR | JUBASAN, INOPACAN | Christianity |
| 4 | 411103250061 | PALMA, FLORIANNE ANGELI BRONOLA | F | 2020-11-02 | 4 | BRONOLA, ANALISA, FALLER | PALMA, JEROME, POLISTICO | CONALUM, INOPACAN | Christianity |

## Database Operations

Two data insertions using the insert tool (no schema changes needed):

### Step 1: Insert 4 students into `public.students`

Key field mapping:
- `student_name`: Last name, First name Middle name (DepEd format)
- `level`: "Kindergarten" (STFXSA naming)
- `school`: "STFXSA"
- `school_id`: `22222222-2222-2222-2222-222222222222`
- `academic_year_id`: `74fb8614-8b9d-49d8-ac4a-7f4c74df201e` (SY 2025-2026)
- `phil_address`: Current Residence from the records
- `religion`: Christianity

### Step 2: Auto-enroll each student in 6 Kindergarten subjects

Insert into `student_subjects` for each student, linking to all 6 Kindergarten subject IDs:
- Literacy, Language, and Communication
- Socio-Emotional Development
- Values Development
- Physical Health and Motor Development
- Aesthetic/Creative Development
- Cognitive Development

No code changes required -- this is purely data insertion.
