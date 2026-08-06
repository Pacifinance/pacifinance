# Supabase/RLS release checklist

This audit must be run against the actual Supabase project by its operator.

- [ ] RLS is enabled on every user-owned table in `supabase/schema.sql` and migrations.
- [ ] `SELECT`, `INSERT`, `UPDATE` and `DELETE` policies require `auth.uid() = user_id` (or an equivalent ownership join).
- [ ] Service-role keys exist only in server environment variables and are absent from client bundles.
- [ ] Anonymous benchmark endpoints return aggregates only and enforce consent plus the minimum cohort.
- [ ] Test users/demo users cannot enter production benchmark aggregates.
- [ ] Storage buckets and exported files have private policies and signed, expiring URLs.
- [ ] A negative test using two authenticated users cannot read or mutate the other user's rows.
- [ ] Backup/PITR is enabled and a restore drill has succeeded.

Record the project, date, migration revision, reviewer and evidence for each item before declaring Phase 1 complete.
