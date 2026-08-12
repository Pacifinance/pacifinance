-- instrument_historical_prices.verified_by (the admin who approved/rejected a
-- community price submission) was created without an ON DELETE clause,
-- defaulting to NO ACTION - unlike every other user-reference FK in this
-- schema, which is ON DELETE CASCADE. In practice this meant deleting an
-- admin account that had ever verified/rejected someone ELSE's submission
-- would fail with a foreign-key violation in users.deleteUserById (the
-- Supabase Auth user delete, which every other user-owned row cascades away
-- from cleanly).
--
-- SET NULL (not CASCADE) is correct here: verified_by records who reviewed
-- the row, not who owns it - submitted_by (already ON DELETE CASCADE) is the
-- actual owner. Losing the admin shouldn't delete other users' price
-- submissions, just clear the "reviewed by" attribution.

alter table public.instrument_historical_prices
  drop constraint if exists instrument_historical_prices_verified_by_fkey;
alter table public.instrument_historical_prices
  add constraint instrument_historical_prices_verified_by_fkey
  foreign key (verified_by) references auth.users(id) on delete set null;
