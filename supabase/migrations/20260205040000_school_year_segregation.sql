-- Migration: Add school_id and academic_year_id columns and implement data segregation
-- This migration adds the necessary columns for school-academic year segregation

-- ============================================================================
-- PART 1: Add school_id and academic_year_id columns to all tables
-- ============================================================================

-- Add columns to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id),
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id);

-- Add columns to grades table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'grades') THEN
    ALTER TABLE grades 
    ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id),
    ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id);
  END IF;
END $$;

-- Add columns to attendance table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attendance') THEN
    ALTER TABLE attendance 
    ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id),
    ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id);
  END IF;
END $$;

-- Add columns to raw_scores table
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'raw_scores') THEN
    ALTER TABLE raw_scores 
    ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id),
    ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id);
  END IF;
END $$;

-- Add columns to enrollments table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'enrollments') THEN
    ALTER TABLE enrollments 
    ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id),
    ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id);
  END IF;
END $$;

-- ============================================================================
-- PART 2: Set default values for existing records (if schools/academic_years exist)
-- ============================================================================

-- Update existing students with first available school and academic year
DO $$ 
DECLARE
  default_school_id UUID;
  default_academic_year_id UUID;
BEGIN
  -- Get first school
  SELECT id INTO default_school_id FROM schools LIMIT 1;
  
  IF default_school_id IS NOT NULL THEN
    -- Get first academic year for that school
    SELECT id INTO default_academic_year_id 
    FROM academic_years 
    WHERE school_id = default_school_id 
    LIMIT 1;
    
    IF default_academic_year_id IS NOT NULL THEN
      -- Update students without school_id
      UPDATE students 
      SET school_id = default_school_id,
          academic_year_id = default_academic_year_id
      WHERE school_id IS NULL;
      
      -- Update other tables similarly
      IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'grades') THEN
        UPDATE grades 
        SET school_id = default_school_id,
            academic_year_id = default_academic_year_id
        WHERE school_id IS NULL;
      END IF;
      
      IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attendance') THEN
        UPDATE attendance 
        SET school_id = default_school_id,
            academic_year_id = default_academic_year_id
        WHERE school_id IS NULL;
      END IF;
      
      IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'raw_scores') THEN
        UPDATE raw_scores 
        SET school_id = default_school_id,
            academic_year_id = default_academic_year_id
        WHERE school_id IS NULL;
      END IF;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- PART 3: Make columns NOT NULL after populating
-- ============================================================================

-- Make students columns NOT NULL
ALTER TABLE students 
ALTER COLUMN school_id SET NOT NULL,
ALTER COLUMN academic_year_id SET NOT NULL;

-- Make other tables NOT NULL (if they exist and have data)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'grades') THEN
    ALTER TABLE grades 
    ALTER COLUMN school_id SET NOT NULL,
    ALTER COLUMN academic_year_id SET NOT NULL;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attendance') THEN
    ALTER TABLE attendance 
    ALTER COLUMN school_id SET NOT NULL,
    ALTER COLUMN academic_year_id SET NOT NULL;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'raw_scores') THEN
    ALTER TABLE raw_scores 
    ALTER COLUMN school_id SET NOT NULL,
    ALTER COLUMN academic_year_id SET NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- PART 4: Add Composite Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_students_school_year 
ON students(school_id, academic_year_id);

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'grades') THEN
    CREATE INDEX IF NOT EXISTS idx_grades_school_year 
    ON grades(school_id, academic_year_id);
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attendance') THEN
    CREATE INDEX IF NOT EXISTS idx_attendance_school_year 
    ON attendance(school_id, academic_year_id);
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'raw_scores') THEN
    CREATE INDEX IF NOT EXISTS idx_raw_scores_school_year 
    ON raw_scores(school_id, academic_year_id);
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'enrollments') THEN
    CREATE INDEX IF NOT EXISTS idx_enrollments_school_year 
    ON enrollments(school_id, academic_year_id);
  END IF;
END $$;

-- ============================================================================
-- PART 5: Create Validation Function
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_school_academic_year()
RETURNS TRIGGER AS $$
DECLARE
  ay_school_id UUID;
BEGIN
  -- Get the school_id from the academic_year
  SELECT school_id INTO ay_school_id
  FROM academic_years
  WHERE id = NEW.academic_year_id;

  -- Check if academic year exists
  IF ay_school_id IS NULL THEN
    RAISE EXCEPTION 'Academic year % does not exist', NEW.academic_year_id;
  END IF;

  -- Check if school_id matches
  IF ay_school_id != NEW.school_id THEN
    RAISE EXCEPTION 'Data segregation violation: Academic year % belongs to school %, but record specifies school %',
      NEW.academic_year_id, ay_school_id, NEW.school_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 6: Create Triggers for All Tables
-- ============================================================================

DROP TRIGGER IF EXISTS trg_validate_students_school_year ON students;
CREATE TRIGGER trg_validate_students_school_year
  BEFORE INSERT OR UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION validate_school_academic_year();

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'grades') THEN
    DROP TRIGGER IF EXISTS trg_validate_grades_school_year ON grades;
    CREATE TRIGGER trg_validate_grades_school_year
      BEFORE INSERT OR UPDATE ON grades
      FOR EACH ROW
      EXECUTE FUNCTION validate_school_academic_year();
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attendance') THEN
    DROP TRIGGER IF EXISTS trg_validate_attendance_school_year ON attendance;
    CREATE TRIGGER trg_validate_attendance_school_year
      BEFORE INSERT OR UPDATE ON attendance
      FOR EACH ROW
      EXECUTE FUNCTION validate_school_academic_year();
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'raw_scores') THEN
    DROP TRIGGER IF EXISTS trg_validate_raw_scores_school_year ON raw_scores;
    CREATE TRIGGER trg_validate_raw_scores_school_year
      BEFORE INSERT OR UPDATE ON raw_scores
      FOR EACH ROW
      EXECUTE FUNCTION validate_school_academic_year();
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'enrollments') THEN
    DROP TRIGGER IF EXISTS trg_validate_enrollments_school_year ON enrollments;
    CREATE TRIGGER trg_validate_enrollments_school_year
      BEFORE INSERT OR UPDATE ON enrollments
      FOR EACH ROW
      EXECUTE FUNCTION validate_school_academic_year();
  END IF;
END $$;

-- ============================================================================
-- PART 7: Add Comments for Documentation
-- ============================================================================

COMMENT ON COLUMN students.school_id IS 'School this student belongs to - ensures data segregation';
COMMENT ON COLUMN students.academic_year_id IS 'Academic year for this student record - ensures data segregation';

COMMENT ON FUNCTION validate_school_academic_year() IS 
'Validates that the academic_year_id belongs to the same school as the record. 
This enforces data segregation between schools and prevents cross-contamination.';
