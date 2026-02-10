-- ============================================================
-- Full Schema Dump - Public Schema
-- Generated: 2026-02-10
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public.academic_years (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  school_id uuid NOT NULL,
  is_archived boolean NOT NULL DEFAULT false,
  archived_at timestamp with time zone,
  archived_by uuid,
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.admission_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admission_id uuid NOT NULL,
  action text NOT NULL,
  performed_by uuid,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (admission_id) REFERENCES public.admissions(id)
);

CREATE TABLE public.admissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  lrn text,
  level text NOT NULL,
  school text,
  school_id uuid NOT NULL,
  academic_year_id uuid NOT NULL,
  birth_date date,
  gender text,
  mother_maiden_name text,
  mother_contact text,
  father_name text,
  father_contact text,
  phil_address text,
  uae_address text,
  previous_school text,
  parent_email text,
  status text NOT NULL DEFAULT 'pending'::text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  rejection_reason text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id)
);

CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid,
  academic_year_id uuid,
  title text NOT NULL,
  content text NOT NULL,
  target_audience text[] DEFAULT ARRAY['all'::text],
  target_grade_levels text[],
  priority text DEFAULT 'normal'::text,
  is_pinned boolean DEFAULT false,
  published_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id)
);

CREATE TABLE public.archived_student_status (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  academic_year_id uuid NOT NULL,
  school_id uuid NOT NULL,
  was_active boolean NOT NULL DEFAULT true,
  grade_level text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (student_id, academic_year_id),
  FOREIGN KEY (student_id) REFERENCES public.students(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.assessment_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL,
  fee_catalog_id uuid,
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  is_mandatory boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (assessment_id) REFERENCES public.student_assessments(id),
  FOREIGN KEY (fee_catalog_id) REFERENCES public.fee_catalog(id)
);

CREATE TABLE public.assignment_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL,
  student_id uuid NOT NULL,
  submitted_at timestamp with time zone,
  score numeric,
  feedback text,
  status text DEFAULT 'pending'::text,
  attachments jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (assignment_id, student_id),
  FOREIGN KEY (assignment_id) REFERENCES public.student_assignments(id),
  FOREIGN KEY (student_id) REFERENCES public.students(id)
);

CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid,
  lrn text,
  action text NOT NULL,
  status text NOT NULL,
  ip_address text,
  country_code text,
  city text,
  user_agent text,
  error_message text,
  school text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (id)
);

CREATE TABLE public.auth_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text,
  user_name text,
  action text NOT NULL,
  ip_address text,
  user_agent text,
  status text DEFAULT 'success'::text,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.balance_carry_forwards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  school_id uuid NOT NULL,
  from_academic_year_id uuid NOT NULL,
  to_academic_year_id uuid NOT NULL,
  from_assessment_id uuid NOT NULL,
  to_assessment_id uuid,
  carried_amount numeric NOT NULL DEFAULT 0,
  carried_at timestamp with time zone NOT NULL DEFAULT now(),
  carried_by uuid,
  notes text,
  PRIMARY KEY (id),
  UNIQUE (student_id, from_academic_year_id, to_academic_year_id),
  FOREIGN KEY (student_id) REFERENCES public.students(id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id),
  FOREIGN KEY (from_academic_year_id) REFERENCES public.academic_years(id),
  FOREIGN KEY (to_academic_year_id) REFERENCES public.academic_years(id),
  FOREIGN KEY (from_assessment_id) REFERENCES public.student_assessments(id),
  FOREIGN KEY (to_assessment_id) REFERENCES public.student_assessments(id)
);

CREATE TABLE public.book_annotations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL,
  page_number integer NOT NULL,
  user_id uuid NOT NULL,
  type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (book_id) REFERENCES public.books(id)
);

CREATE TABLE public.book_page_index (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL,
  page_id uuid NOT NULL,
  page_number integer NOT NULL,
  extracted_text text,
  topics text[] DEFAULT '{}'::text[],
  keywords text[] DEFAULT '{}'::text[],
  chapter_title text,
  summary text,
  indexed_at timestamp with time zone,
  index_status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  search_vector tsvector,
  PRIMARY KEY (id),
  UNIQUE (book_id, page_id),
  FOREIGN KEY (book_id) REFERENCES public.books(id),
  FOREIGN KEY (page_id) REFERENCES public.book_pages(id)
);

CREATE TABLE public.book_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL,
  page_number integer NOT NULL,
  image_url text NOT NULL,
  thumbnail_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  detected_page_number text,
  page_type text DEFAULT 'unknown'::text,
  detection_confidence numeric,
  detection_completed boolean DEFAULT false,
  PRIMARY KEY (id),
  UNIQUE (book_id, page_number),
  FOREIGN KEY (book_id) REFERENCES public.books(id)
);

CREATE TABLE public.books (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  grade_level integer NOT NULL,
  subject text,
  cover_url text,
  pdf_url text,
  page_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'processing'::text,
  school text,
  uploaded_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  index_status text DEFAULT 'pending'::text,
  PRIMARY KEY (id)
);

CREATE TABLE public.canva_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expires_at timestamp with time zone NOT NULL,
  canva_user_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.canva_oauth_states (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  state_key text NOT NULL,
  user_id uuid NOT NULL,
  code_verifier text NOT NULL,
  redirect_uri text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + '00:10:00'::interval),
  PRIMARY KEY (id)
);

CREATE TABLE public.class_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  academic_year_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  grade_level text NOT NULL,
  section text,
  day_of_week integer NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  room text,
  teacher_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id),
  FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  FOREIGN KEY (teacher_id) REFERENCES public.teachers(id)
);

CREATE TABLE public.clearance_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  rule_name text NOT NULL,
  rule_type text NOT NULL,
  threshold numeric DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.conversation_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member'::text,
  last_read_at timestamp with time zone DEFAULT now(),
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);

CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'private'::text,
  name text,
  created_by uuid NOT NULL,
  school_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.data_exports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  school_id uuid,
  academic_year_id uuid,
  export_type text NOT NULL,
  table_name text NOT NULL,
  record_count integer,
  file_name text,
  file_size_bytes bigint,
  exported_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id)
);

CREATE TABLE public.data_validation_issues (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  school_id uuid NOT NULL,
  issue_type text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL DEFAULT 'warning'::text,
  field_name text,
  is_resolved boolean NOT NULL DEFAULT false,
  resolved_by uuid,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES public.students(id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.discounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'percentage'::text,
  value numeric NOT NULL DEFAULT 0,
  applies_to text NOT NULL DEFAULT 'all'::text,
  fee_item_ids text[],
  max_cap numeric,
  stackable boolean NOT NULL DEFAULT false,
  requires_approval boolean NOT NULL DEFAULT false,
  required_documents text[],
  valid_from date,
  valid_until date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.exam_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  academic_year_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  grade_level text NOT NULL,
  exam_type text NOT NULL,
  exam_date date NOT NULL,
  start_time time without time zone,
  end_time time without time zone,
  room text,
  quarter integer,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id),
  FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);

CREATE TABLE public.excalidraw_drawings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Drawing'::text,
  scene_data jsonb DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL,
  is_shared boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.fee_catalog (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'other'::text,
  amount numeric NOT NULL DEFAULT 0,
  is_mandatory boolean NOT NULL DEFAULT true,
  is_recurring boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.fee_template_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL,
  fee_catalog_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  is_mandatory boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (template_id) REFERENCES public.fee_templates(id),
  FOREIGN KEY (fee_catalog_id) REFERENCES public.fee_catalog(id)
);

CREATE TABLE public.fee_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  academic_year_id uuid NOT NULL,
  name text NOT NULL,
  grade_level text,
  strand text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id)
);

CREATE TABLE public.finance_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  user_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  reason text,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.finance_clearance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  school_id uuid NOT NULL,
  academic_year_id uuid NOT NULL,
  is_cleared boolean NOT NULL DEFAULT false,
  cleared_at timestamp with time zone,
  cleared_by uuid,
  balance_threshold numeric DEFAULT 0,
  blocks_exams boolean NOT NULL DEFAULT true,
  blocks_grades boolean NOT NULL DEFAULT true,
  blocks_enrollment boolean NOT NULL DEFAULT true,
  auto_generated boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES public.students(id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id)
);

CREATE TABLE public.finance_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  academic_year_id uuid,
  default_payment_terms text DEFAULT 'cash'::text,
  late_fee_enabled boolean NOT NULL DEFAULT false,
  late_fee_type text DEFAULT 'fixed'::text,
  late_fee_amount numeric DEFAULT 0,
  refund_policy text,
  or_number_format text DEFAULT 'OR-{YYYY}-{SEQ}'::text,
  or_next_number integer DEFAULT 1,
  ar_number_format text DEFAULT 'AR-{YYYY}-{SEQ}'::text,
  ar_next_number integer DEFAULT 1,
  convenience_fee_mode text DEFAULT 'absorb'::text,
  convenience_fee_amount numeric DEFAULT 0,
  clearance_threshold numeric DEFAULT 0,
  auto_clearance boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id)
);

CREATE TABLE public.flipbooks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_image_url text,
  flipbook_url text NOT NULL,
  grade_levels text[] NOT NULL,
  school text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.google_docs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  doc_type text NOT NULL DEFAULT 'document'::text,
  school_id uuid,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.grade_change_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_grade_id uuid NOT NULL,
  requested_by uuid NOT NULL,
  reason text NOT NULL,
  old_values jsonb NOT NULL,
  new_values jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  review_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (student_grade_id) REFERENCES public.student_grades(id)
);

CREATE TABLE public.grade_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  academic_year_id uuid NOT NULL,
  school_id uuid NOT NULL,
  q1_grade numeric,
  q2_grade numeric,
  q3_grade numeric,
  q4_grade numeric,
  final_grade numeric,
  remarks text,
  snapshot_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES public.students(id),
  FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.helpdesk_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_id uuid,
  comment_id uuid,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  content_type text NOT NULL,
  uploader_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (ticket_id) REFERENCES public.helpdesk_tickets(id),
  FOREIGN KEY (comment_id) REFERENCES public.helpdesk_comments(id)
);

CREATE TABLE public.helpdesk_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  content text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (ticket_id) REFERENCES public.helpdesk_tickets(id)
);

CREATE TABLE public.helpdesk_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open'::text,
  priority text NOT NULL DEFAULT 'medium'::text,
  category text NOT NULL DEFAULT 'other'::text,
  assigned_to uuid,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  school_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  pc_name text,
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.message_receipts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'delivered'::text,
  status_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (message_id) REFERENCES public.messages(id)
);

CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text,
  message_type text NOT NULL DEFAULT 'text'::text,
  file_url text,
  file_name text,
  file_size bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);

CREATE TABLE public.notebook_cells (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  notebook_id uuid NOT NULL,
  cell_type text NOT NULL DEFAULT 'markdown'::text,
  content text NOT NULL DEFAULT ''::text,
  output text,
  position integer NOT NULL DEFAULT 0,
  model text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  pdf_filename text,
  pdf_page_count integer,
  pdf_extracted_text text,
  presentation_slide_count integer DEFAULT 8,
  presentation_style text DEFAULT 'modern'::text,
  PRIMARY KEY (id),
  FOREIGN KEY (notebook_id) REFERENCES public.notebooks(id)
);

CREATE TABLE public.notebooks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  school text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.payment_plan_installments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  installment_number integer NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  due_date date NOT NULL,
  paid_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending'::text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (plan_id) REFERENCES public.payment_plans(id)
);

CREATE TABLE public.payment_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL,
  student_id uuid NOT NULL,
  school_id uuid NOT NULL,
  plan_type text NOT NULL DEFAULT 'monthly'::text,
  total_installments integer NOT NULL DEFAULT 1,
  grace_period_days integer NOT NULL DEFAULT 0,
  late_fee_type text DEFAULT 'fixed'::text,
  late_fee_amount numeric DEFAULT 0,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (assessment_id) REFERENCES public.student_assessments(id),
  FOREIGN KEY (student_id) REFERENCES public.students(id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.payment_proofs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL,
  file_url text NOT NULL,
  file_name text,
  uploaded_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (payment_id) REFERENCES public.payments(id)
);

CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assessment_id uuid,
  student_id uuid NOT NULL,
  school_id uuid NOT NULL,
  academic_year_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash'::text,
  reference_number text,
  or_number text,
  receipt_type text NOT NULL DEFAULT 'OR'::text,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  received_by uuid,
  status text NOT NULL DEFAULT 'pending'::text,
  void_reason text,
  voided_by uuid,
  voided_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (assessment_id) REFERENCES public.student_assessments(id),
  FOREIGN KEY (student_id) REFERENCES public.students(id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id)
);

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.raw_scores (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  student_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  academic_year_id uuid NOT NULL,
  quarter integer NOT NULL,
  ww_scores numeric[] DEFAULT '{}'::numeric[],
  ww_max_scores numeric[] DEFAULT '{}'::numeric[],
  pt_scores numeric[] DEFAULT '{}'::numeric[],
  pt_max_scores numeric[] DEFAULT '{}'::numeric[],
  qa_score numeric DEFAULT 0,
  qa_max numeric DEFAULT 100,
  initial_grade numeric,
  transmuted_grade integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  school_id uuid NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES public.students(id),
  FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.report_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  file_url text NOT NULL,
  school text DEFAULT 'MABDC'::text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.role_change_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  changed_by uuid NOT NULL,
  old_role text,
  new_role text NOT NULL,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.role_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid,
  role text NOT NULL,
  resource_key text NOT NULL,
  can_view boolean DEFAULT false,
  can_edit boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.school_access_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  school_id uuid,
  academic_year_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.school_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_type text NOT NULL DEFAULT 'general'::text,
  academic_year_id uuid,
  school text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.school_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id text NOT NULL DEFAULT 'default'::text,
  name text NOT NULL DEFAULT 'School Name'::text,
  acronym text,
  address text,
  phone text,
  email text,
  website text,
  logo_url text,
  theme_id text DEFAULT 'default'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.school_switch_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  from_school_id uuid,
  to_school_id uuid,
  from_academic_year_id uuid,
  to_academic_year_id uuid,
  session_id text,
  ip_address inet,
  switched_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.schools (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  address text,
  contact_number text,
  email text,
  principal_name text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.student_assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  school_id uuid NOT NULL,
  academic_year_id uuid NOT NULL,
  template_id uuid,
  total_amount numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  net_amount numeric NOT NULL DEFAULT 0,
  total_paid numeric NOT NULL DEFAULT 0,
  balance numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending'::text,
  assessed_by uuid,
  assessed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_closed boolean NOT NULL DEFAULT false,
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES public.students(id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id)
);

CREATE TABLE public.student_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  academic_year_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  grade_level text NOT NULL,
  title text NOT NULL,
  description text,
  instructions text,
  due_date timestamp with time zone NOT NULL,
  max_score numeric,
  assignment_type text DEFAULT 'homework'::text,
  attachments jsonb,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id),
  FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);

CREATE TABLE public.student_attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  school_id uuid NOT NULL,
  academic_year_id uuid NOT NULL,
  date date NOT NULL,
  status text NOT NULL,
  time_in time without time zone,
  time_out time without time zone,
  remarks text,
  recorded_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES public.students(id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id)
);

CREATE TABLE public.student_discounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  discount_id uuid NOT NULL,
  assessment_id uuid,
  school_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  approved_by uuid,
  approved_at timestamp with time zone,
  applied_amount numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES public.students(id),
  FOREIGN KEY (discount_id) REFERENCES public.discounts(id),
  FOREIGN KEY (assessment_id) REFERENCES public.student_assessments(id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.student_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  document_name text NOT NULL,
  document_type text NOT NULL,
  file_url text,
  slot_number integer NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  extracted_text text,
  detected_type text,
  summary text,
  keywords text[],
  detected_language text,
  confidence_score numeric,
  analysis_status text DEFAULT 'pending'::text,
  original_filename text,
  page_count integer,
  page_images jsonb DEFAULT '[]'::jsonb,
  thumbnail_url text,
  is_pdf_page boolean DEFAULT false,
  parent_document_id uuid,
  page_number integer,
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES public.students(id)
);

CREATE TABLE public.student_grades (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  academic_year_id uuid NOT NULL,
  q1_grade numeric,
  q2_grade numeric,
  q3_grade numeric,
  q4_grade numeric,
  final_grade numeric,
  remarks text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  school_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft'::text,
  submitted_by uuid,
  submitted_at timestamp with time zone,
  approved_by uuid,
  approved_at timestamp with time zone,
  finalized_by uuid,
  finalized_at timestamp with time zone,
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES public.students(id),
  FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.student_incidents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  incident_date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  action_taken text,
  reported_by text,
  status text DEFAULT 'open'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES public.students(id)
);

CREATE TABLE public.student_subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  academic_year_id uuid,
  grade numeric,
  status text DEFAULT 'enrolled'::text,
  enrolled_at timestamp with time zone DEFAULT now(),
  school_id uuid NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (student_id) REFERENCES public.students(id),
  FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lrn text NOT NULL,
  student_name text NOT NULL,
  level text NOT NULL,
  birth_date date,
  age integer,
  gender text,
  mother_contact text,
  mother_maiden_name text,
  father_contact text,
  father_name text,
  phil_address text,
  uae_address text,
  previous_school text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  photo_url text,
  school text DEFAULT 'MABDC'::text,
  school_id uuid NOT NULL,
  academic_year_id uuid NOT NULL,
  religion text,
  mother_tongue text,
  dialects text,
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id),
  FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id)
);

CREATE TABLE public.subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  grade_levels text[] NOT NULL,
  department text,
  units integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.teachers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  employee_id text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  department text,
  subjects text[],
  status text DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  grade_level text,
  school text DEFAULT 'MABDC'::text,
  PRIMARY KEY (id)
);

CREATE TABLE public.user_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  email text NOT NULL,
  temp_password text NOT NULL,
  role text NOT NULL,
  student_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  password_changed boolean DEFAULT false,
  teacher_id uuid,
  PRIMARY KEY (id)
);

CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.user_school_access (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  school_id uuid NOT NULL,
  role text NOT NULL,
  granted_by uuid,
  granted_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  PRIMARY KEY (id)
);

CREATE TABLE public.zoom_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  meeting_url text,
  meeting_id text,
  meeting_password text,
  breakout_rooms jsonb DEFAULT '[]'::jsonb,
  schedule_start time without time zone NOT NULL DEFAULT '07:30:00'::time without time zone,
  schedule_end time without time zone NOT NULL DEFAULT '17:30:00'::time without time zone,
  timezone text NOT NULL DEFAULT 'Asia/Dubai'::text,
  active_days integer[] NOT NULL DEFAULT '{1,2,3,4,5}'::integer[],
  is_active boolean NOT NULL DEFAULT true,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (school_id) REFERENCES public.schools(id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_academic_years_school ON public.academic_years USING btree (school_id);
CREATE INDEX idx_announcements_published ON public.announcements USING btree (published_at);
CREATE INDEX idx_announcements_school ON public.announcements USING btree (school_id);
CREATE INDEX idx_assignment_submissions_student ON public.assignment_submissions USING btree (student_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);
CREATE INDEX idx_audit_logs_lrn ON public.audit_logs USING btree (lrn);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);
CREATE INDEX idx_auth_activity_logs_action ON public.auth_activity_logs USING btree (action);
CREATE INDEX idx_auth_activity_logs_created_at ON public.auth_activity_logs USING btree (created_at DESC);
CREATE INDEX idx_auth_activity_logs_user_id ON public.auth_activity_logs USING btree (user_id);
CREATE INDEX idx_book_annotations_book_page ON public.book_annotations USING btree (book_id, page_number);
CREATE INDEX idx_book_annotations_user ON public.book_annotations USING btree (user_id);
CREATE INDEX idx_book_page_index_search ON public.book_page_index USING gin (search_vector);
CREATE INDEX idx_book_pages_book_id ON public.book_pages USING btree (book_id);
CREATE INDEX idx_conversation_participants_user ON public.conversation_participants USING btree (user_id);
CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);
CREATE INDEX idx_notebook_cells_notebook ON public.notebook_cells USING btree (notebook_id);
CREATE INDEX idx_raw_scores_student_subject ON public.raw_scores USING btree (student_id, subject_id, academic_year_id, quarter);
CREATE INDEX idx_student_attendance_date ON public.student_attendance USING btree (student_id, date);
CREATE INDEX idx_student_attendance_school ON public.student_attendance USING btree (school_id, academic_year_id);
CREATE INDEX idx_student_grades_school ON public.student_grades USING btree (school_id, academic_year_id);
CREATE INDEX idx_student_grades_student ON public.student_grades USING btree (student_id, subject_id, academic_year_id);
CREATE INDEX idx_students_school_year ON public.students USING btree (school_id, academic_year_id);
