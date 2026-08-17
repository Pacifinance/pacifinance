-- Supabase Performance Advisor remediation (idempotent).
--
-- 1. auth_rls_initplan: RLS policies calling auth.uid() directly get it
--    re-evaluated once per row instead of once per query. Wrapping it in a
--    scalar subquery lets Postgres treat it as a stable InitPlan value -
--    same access rules, faster at scale. Recreates all 26 flagged policies
--    (drop+create, since ALTER POLICY can't change the USING/CHECK body).

DROP POLICY IF EXISTS "Users delete own push subscriptions" ON "public"."push_subscriptions";
CREATE POLICY "Users delete own push subscriptions" ON "public"."push_subscriptions" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "Users read own notification preferences" ON "public"."notification_preferences";
CREATE POLICY "Users read own notification preferences" ON "public"."notification_preferences" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "Users read own push subscriptions" ON "public"."push_subscriptions";
CREATE POLICY "Users read own push subscriptions" ON "public"."push_subscriptions" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "Users update own notification preferences" ON "public"."notification_preferences";
CREATE POLICY "Users update own notification preferences" ON "public"."notification_preferences" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "balances_own_rows" ON "public"."balances";
CREATE POLICY "balances_own_rows" ON "public"."balances" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "deletions_own_row" ON "public"."deletions";
CREATE POLICY "deletions_own_row" ON "public"."deletions" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "expenses_own_rows" ON "public"."transactions";
CREATE POLICY "expenses_own_rows" ON "public"."transactions" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "instrument_historical_prices_select_verified_or_own" ON "public"."instrument_historical_prices";
CREATE POLICY "instrument_historical_prices_select_verified_or_own" ON "public"."instrument_historical_prices" FOR SELECT TO "authenticated" USING ((("status" = 'verified'::"text") OR (( SELECT "auth"."uid"() AS "uid") = "submitted_by")));

DROP POLICY IF EXISTS "profiles_own_row" ON "public"."profiles";
CREATE POLICY "profiles_own_row" ON "public"."profiles" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));

DROP POLICY IF EXISTS "recurring_transactions_own_rows" ON "public"."recurring_transactions";
CREATE POLICY "recurring_transactions_own_rows" ON "public"."recurring_transactions" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "roadmap_votes_own_rows" ON "public"."roadmap_votes";
CREATE POLICY "roadmap_votes_own_rows" ON "public"."roadmap_votes" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "shared_expense_reimbursements_own_rows" ON "public"."shared_expense_reimbursements";
CREATE POLICY "shared_expense_reimbursements_own_rows" ON "public"."shared_expense_reimbursements" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "shared_receivables_own_rows" ON "public"."shared_expense_receivables";
CREATE POLICY "shared_receivables_own_rows" ON "public"."shared_expense_receivables" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "user_categories_own_rows" ON "public"."user_categories";
CREATE POLICY "user_categories_own_rows" ON "public"."user_categories" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "user_goals_own_rows" ON "public"."user_goals";
CREATE POLICY "user_goals_own_rows" ON "public"."user_goals" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "user_investment_dividends_own_rows" ON "public"."user_investment_dividends";
CREATE POLICY "user_investment_dividends_own_rows" ON "public"."user_investment_dividends" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "user_investment_holding_history_insert_own" ON "public"."user_investment_holding_history";
CREATE POLICY "user_investment_holding_history_insert_own" ON "public"."user_investment_holding_history" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "user_investment_holding_history_select_own" ON "public"."user_investment_holding_history";
CREATE POLICY "user_investment_holding_history_select_own" ON "public"."user_investment_holding_history" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "user_investment_holding_history_update_own" ON "public"."user_investment_holding_history";
CREATE POLICY "user_investment_holding_history_update_own" ON "public"."user_investment_holding_history" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "user_investment_holdings_own_rows" ON "public"."user_investment_holdings";
CREATE POLICY "user_investment_holdings_own_rows" ON "public"."user_investment_holdings" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "user_investment_settings_own_rows" ON "public"."user_investment_settings";
CREATE POLICY "user_investment_settings_own_rows" ON "public"."user_investment_settings" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "user_investment_transactions_own_rows" ON "public"."user_investment_transactions";
CREATE POLICY "user_investment_transactions_own_rows" ON "public"."user_investment_transactions" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "user_liquidity_account_history_insert_own" ON "public"."user_liquidity_account_history";
CREATE POLICY "user_liquidity_account_history_insert_own" ON "public"."user_liquidity_account_history" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "user_liquidity_account_history_select_own" ON "public"."user_liquidity_account_history";
CREATE POLICY "user_liquidity_account_history_select_own" ON "public"."user_liquidity_account_history" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "user_liquidity_account_history_update_own" ON "public"."user_liquidity_account_history";
CREATE POLICY "user_liquidity_account_history_update_own" ON "public"."user_liquidity_account_history" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

DROP POLICY IF EXISTS "user_liquidity_accounts_own_rows" ON "public"."user_liquidity_accounts";
CREATE POLICY "user_liquidity_accounts_own_rows" ON "public"."user_liquidity_accounts" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

-- 2. unindexed_foreign_keys: covering btree indexes for every FK column
--    the advisor flagged as missing one (0001_unindexed_foreign_keys).
CREATE INDEX IF NOT EXISTS "benchmark_profile_snapshots_age_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("age_tag_id");
CREATE INDEX IF NOT EXISTS "benchmark_profile_snapshots_children_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("children_tag_id");
CREATE INDEX IF NOT EXISTS "benchmark_profile_snapshots_country_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("country_tag_id");
CREATE INDEX IF NOT EXISTS "benchmark_profile_snapshots_housing_type_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("housing_type_tag_id");
CREATE INDEX IF NOT EXISTS "benchmark_profile_snapshots_job_country_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("job_country_tag_id");
CREATE INDEX IF NOT EXISTS "benchmark_profile_snapshots_job_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("job_tag_id");
CREATE INDEX IF NOT EXISTS "benchmark_profile_snapshots_job_type_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("job_type_tag_id");
CREATE INDEX IF NOT EXISTS "benchmark_profile_snapshots_living_situation_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("living_situation_tag_id");
CREATE INDEX IF NOT EXISTS "benchmark_profile_snapshots_remote_type_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("remote_type_tag_id");
CREATE INDEX IF NOT EXISTS "benchmark_profile_snapshots_user_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("user_id");
CREATE INDEX IF NOT EXISTS "benchmark_profile_snapshots_work_time_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("work_time_tag_id");
CREATE INDEX IF NOT EXISTS "benchmark_profile_snapshots_years_of_experience_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("years_of_experience_tag_id");
CREATE INDEX IF NOT EXISTS "instrument_historical_prices_submitted_by_idx" ON "public"."instrument_historical_prices" USING "btree" ("submitted_by");
CREATE INDEX IF NOT EXISTS "instrument_historical_prices_verified_by_idx" ON "public"."instrument_historical_prices" USING "btree" ("verified_by");
CREATE INDEX IF NOT EXISTS "profiles_age_tag_id_idx" ON "public"."profiles" USING "btree" ("age_tag_id");
CREATE INDEX IF NOT EXISTS "profiles_children_tag_id_idx" ON "public"."profiles" USING "btree" ("children_tag_id");
CREATE INDEX IF NOT EXISTS "profiles_country_tag_id_idx" ON "public"."profiles" USING "btree" ("country_tag_id");
CREATE INDEX IF NOT EXISTS "profiles_housing_type_tag_id_idx" ON "public"."profiles" USING "btree" ("housing_type_tag_id");
CREATE INDEX IF NOT EXISTS "profiles_job_country_tag_id_idx" ON "public"."profiles" USING "btree" ("job_country_tag_id");
CREATE INDEX IF NOT EXISTS "profiles_job_tag_id_idx" ON "public"."profiles" USING "btree" ("job_tag_id");
CREATE INDEX IF NOT EXISTS "profiles_job_type_tag_id_idx" ON "public"."profiles" USING "btree" ("job_type_tag_id");
CREATE INDEX IF NOT EXISTS "profiles_living_situation_tag_id_idx" ON "public"."profiles" USING "btree" ("living_situation_tag_id");
CREATE INDEX IF NOT EXISTS "profiles_preferred_currency_tag_id_idx" ON "public"."profiles" USING "btree" ("preferred_currency_tag_id");
CREATE INDEX IF NOT EXISTS "profiles_remote_type_tag_id_idx" ON "public"."profiles" USING "btree" ("remote_type_tag_id");
CREATE INDEX IF NOT EXISTS "profiles_work_time_tag_id_idx" ON "public"."profiles" USING "btree" ("work_time_tag_id");
CREATE INDEX IF NOT EXISTS "profiles_years_of_experience_tag_id_idx" ON "public"."profiles" USING "btree" ("years_of_experience_tag_id");
CREATE INDEX IF NOT EXISTS "recurring_transactions_category_tag_id_idx" ON "public"."recurring_transactions" USING "btree" ("category_tag_id");
CREATE INDEX IF NOT EXISTS "recurring_transactions_payment_type_tag_id_idx" ON "public"."recurring_transactions" USING "btree" ("payment_type_tag_id");
CREATE INDEX IF NOT EXISTS "recurring_transactions_user_category_id_idx" ON "public"."recurring_transactions" USING "btree" ("user_category_id");
CREATE INDEX IF NOT EXISTS "shared_expense_reimbursements_receivable_id_idx" ON "public"."shared_expense_reimbursements" USING "btree" ("receivable_id");
CREATE INDEX IF NOT EXISTS "transactions_category_tag_id_idx" ON "public"."transactions" USING "btree" ("category_tag_id");
CREATE INDEX IF NOT EXISTS "transactions_payment_type_tag_id_idx" ON "public"."transactions" USING "btree" ("payment_type_tag_id");
CREATE INDEX IF NOT EXISTS "transactions_user_category_id_idx" ON "public"."transactions" USING "btree" ("user_category_id");
CREATE INDEX IF NOT EXISTS "user_categories_parent_tag_id_idx" ON "public"."user_categories" USING "btree" ("parent_tag_id");
CREATE INDEX IF NOT EXISTS "user_investment_dividends_holding_id_idx" ON "public"."user_investment_dividends" USING "btree" ("holding_id");
CREATE INDEX IF NOT EXISTS "user_investment_dividends_instrument_id_idx" ON "public"."user_investment_dividends" USING "btree" ("instrument_id");
CREATE INDEX IF NOT EXISTS "user_investment_holding_history_holding_id_idx" ON "public"."user_investment_holding_history" USING "btree" ("holding_id");
CREATE INDEX IF NOT EXISTS "user_investment_holding_history_instrument_id_idx" ON "public"."user_investment_holding_history" USING "btree" ("instrument_id");
CREATE INDEX IF NOT EXISTS "user_investment_transactions_holding_id_idx" ON "public"."user_investment_transactions" USING "btree" ("holding_id");
CREATE INDEX IF NOT EXISTS "user_investment_transactions_instrument_id_idx" ON "public"."user_investment_transactions" USING "btree" ("instrument_id");
CREATE INDEX IF NOT EXISTS "user_liquidity_account_history_account_id_idx" ON "public"."user_liquidity_account_history" USING "btree" ("account_id");
