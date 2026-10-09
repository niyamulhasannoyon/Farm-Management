-- RBCL Flock Monitor - Supabase PostgreSQL Schema & RLS Setup

-- 1. Enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'DATA_ENTRY', 'VIEWER');
CREATE TYPE "FlockStatus" AS ENUM ('ACTIVE', 'CLOSED');
CREATE TYPE "AuditAction" AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- 2. Profiles Table (Linked with auth.users)
CREATE TABLE IF NOT EXISTS "profiles" (
  "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "email" TEXT UNIQUE NOT NULL,
  "fullName" TEXT,
  "role" "Role" NOT NULL DEFAULT 'DATA_ENTRY',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Units Table
CREATE TABLE IF NOT EXISTS "units" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Sheds Table
CREATE TABLE IF NOT EXISTS "sheds" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "unit_id" UUID NOT NULL REFERENCES "units"("id") ON DELETE CASCADE,
  "shed_no" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "sheds_unit_id_shed_no_key" UNIQUE ("unit_id", "shed_no")
);

-- 5. Flocks Table
CREATE TABLE IF NOT EXISTS "flocks" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "flock_no" TEXT NOT NULL,
  "unit_id" UUID NOT NULL REFERENCES "units"("id"),
  "shed_id" UUID NOT NULL REFERENCES "sheds"("id"),
  "breed" TEXT NOT NULL,
  "housing_date" TIMESTAMPTZ NOT NULL,
  "status" "FlockStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "flocks_unit_id_flock_no_key" UNIQUE ("unit_id", "flock_no")
);

-- 6. Standard Weights Table (Breed Curves)
CREATE TABLE IF NOT EXISTS "standard_weights" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "breed" TEXT NOT NULL,
  "age_weeks" INT NOT NULL,
  "std_weight_f" DOUBLE PRECISION NOT NULL,
  "std_weight_m" DOUBLE PRECISION,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "standard_weights_breed_age_weeks_key" UNIQUE ("breed", "age_weeks")
);

-- 7. Weekly Records Table (Raw Data Only)
CREATE TABLE IF NOT EXISTS "weekly_records" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "flock_id" UUID NOT NULL REFERENCES "flocks"("id") ON DELETE CASCADE,
  "age_weeks" INT NOT NULL,
  "week_end_date" TIMESTAMPTZ NOT NULL,
  "housed_f" INT NOT NULL,
  "housed_m" INT NOT NULL,
  "mortality_f" INT NOT NULL DEFAULT 0,
  "mortality_m" INT NOT NULL DEFAULT 0,
  "sold_f" INT NOT NULL DEFAULT 0,
  "sold_m" INT NOT NULL DEFAULT 0,
  "std_weight_f" DOUBLE PRECISION,
  "actual_weight_f" DOUBLE PRECISION,
  "std_weight_m" DOUBLE PRECISION,
  "actual_weight_m" DOUBLE PRECISION,
  "uniformity_f" DOUBLE PRECISION,
  "uniformity_m" DOUBLE PRECISION,
  "feed_g_per_bird_f" DOUBLE PRECISION,
  "feed_g_per_bird_m" DOUBLE PRECISION,
  "created_by" UUID REFERENCES "profiles"("id"),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "weekly_records_flock_id_age_weeks_key" UNIQUE ("flock_id", "age_weeks")
);

-- 8. Alert Thresholds
CREATE TABLE IF NOT EXISTS "alert_thresholds" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "breed" TEXT UNIQUE,
  "weekly_mortality_pct_threshold" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  "weight_dev_pct_threshold" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
  "min_age_weeks_for_weight_alert" INT NOT NULL DEFAULT 4,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "table_name" TEXT NOT NULL,
  "record_id" TEXT NOT NULL,
  "action" "AuditAction" NOT NULL,
  "user_id" UUID REFERENCES "profiles"("id"),
  "old_data" JSONB,
  "new_data" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. SQL View: flock_weekly_computed_view
-- Dynamically computes live counts, depletion %, cumulative running sums, and weight deviations
CREATE OR REPLACE VIEW flock_weekly_computed_view AS
WITH weekly_calc AS (
  SELECT
    wr.*,
    GREATEST(0, wr.housed_f - wr.mortality_f - wr.sold_f) AS live_at_week_end_f,
    GREATEST(0, wr.housed_m - wr.mortality_m - wr.sold_m) AS live_at_week_end_m,
    CASE WHEN wr.housed_f > 0 THEN ((wr.mortality_f + wr.sold_f)::DOUBLE PRECISION / wr.housed_f) * 100 ELSE 0 END AS weekly_depletion_pct_f,
    CASE WHEN wr.housed_m > 0 THEN ((wr.mortality_m + wr.sold_m)::DOUBLE PRECISION / wr.housed_m) * 100 ELSE 0 END AS weekly_depletion_pct_m,
    CASE WHEN wr.housed_f > 0 THEN (wr.mortality_f::DOUBLE PRECISION / wr.housed_f) * 100 ELSE 0 END AS weekly_mortality_pct_f,
    CASE WHEN wr.housed_m > 0 THEN (wr.mortality_m::DOUBLE PRECISION / wr.housed_m) * 100 ELSE 0 END AS weekly_mortality_pct_m,
    CASE WHEN wr.actual_weight_f IS NOT NULL AND wr.std_weight_f IS NOT NULL THEN (wr.actual_weight_f - wr.std_weight_f) ELSE NULL END AS weight_deviation_g_f,
    CASE WHEN wr.actual_weight_m IS NOT NULL AND wr.std_weight_m IS NOT NULL THEN (wr.actual_weight_m - wr.std_weight_m) ELSE NULL END AS weight_deviation_g_m,
    CASE WHEN wr.actual_weight_f IS NOT NULL AND wr.std_weight_f > 0 THEN ((wr.actual_weight_f - wr.std_weight_f) / wr.std_weight_f) * 100 ELSE NULL END AS weight_deviation_pct_f,
    CASE WHEN wr.actual_weight_m IS NOT NULL AND wr.std_weight_m > 0 THEN ((wr.actual_weight_m - wr.std_weight_m) / wr.std_weight_m) * 100 ELSE NULL END AS weight_deviation_pct_m
  FROM weekly_records wr
)
SELECT
  wc.*,
  ROUND(SUM(wc.weekly_depletion_pct_f) OVER (PARTITION BY wc.flock_id ORDER BY wc.age_weeks ASC)::NUMERIC, 4)::DOUBLE PRECISION AS cumulative_depletion_pct_f,
  ROUND(SUM(wc.weekly_depletion_pct_m) OVER (PARTITION BY wc.flock_id ORDER BY wc.age_weeks ASC)::NUMERIC, 4)::DOUBLE PRECISION AS cumulative_depletion_pct_m
FROM weekly_calc wc;

-- 11. Row-Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheds ENABLE ROW LEVEL SECURITY;
ALTER TABLE flocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch current authenticated user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS "Role" AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Authenticated users can read all profiles; only admin or self can update
CREATE POLICY "Profiles readable by authenticated users" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage all profiles" ON profiles
  FOR ALL TO authenticated USING (get_current_user_role() = 'ADMIN');

-- General Read: All authenticated staff can read Units, Sheds, Flocks, Standard Weights, Weekly Records, Thresholds
CREATE POLICY "Authenticated users can read master data" ON units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read sheds" ON sheds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read flocks" ON flocks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read standard weights" ON standard_weights FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read weekly records" ON weekly_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read alert thresholds" ON alert_thresholds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read audit logs" ON audit_logs FOR SELECT TO authenticated USING (true);

-- Weekly Records Write Policies
-- Admins and Managers have full write access
CREATE POLICY "Admins and Managers can write weekly records" ON weekly_records
  FOR ALL TO authenticated
  USING (get_current_user_role() IN ('ADMIN', 'MANAGER'))
  WITH CHECK (get_current_user_role() IN ('ADMIN', 'MANAGER'));

-- Data Entry users can only insert or update the latest 2 weeks
CREATE POLICY "Data Entry can edit only last 2 weeks" ON weekly_records
  FOR ALL TO authenticated
  USING (
    get_current_user_role() = 'DATA_ENTRY'
    AND age_weeks >= (
      COALESCE((SELECT MAX(age_weeks) FROM weekly_records WHERE flock_id = weekly_records.flock_id), weekly_records.age_weeks) - 1
    )
  )
  WITH CHECK (
    get_current_user_role() = 'DATA_ENTRY'
    AND age_weeks >= (
      COALESCE((SELECT MAX(age_weeks) FROM weekly_records WHERE flock_id = weekly_records.flock_id), weekly_records.age_weeks) - 1
    )
  );

-- Audit Trigger function
CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (table_name, record_id, action, user_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, OLD.id::TEXT, 'DELETE', auth.uid(), to_jsonb(OLD), NULL);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (table_name, record_id, action, user_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'UPDATE', auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (table_name, record_id, action, user_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'INSERT', auth.uid(), NULL, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_weekly_records
AFTER INSERT OR UPDATE OR DELETE ON weekly_records
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

CREATE TRIGGER audit_flocks
AFTER INSERT OR UPDATE OR DELETE ON flocks
FOR EACH ROW EXECUTE FUNCTION process_audit_log();
