-- ============================================================
-- Pacifinance — Schema Postgres per Supabase
-- Autenticazione gestita da Supabase Auth (auth.users) — email sintetica interna
-- {user_code}@users.pacifinance.internal, mai esposta all'utente (login resta userId+password)
--
-- Generato con `supabase db dump --linked --schema public`: riflette lo
-- stato reale del progetto Supabase al momento del dump, non va editato a
-- mano (tranne l'event trigger rls_auto_enable poco più sotto, che il dump
-- non esporta — vedi il commento lì). Vedi AGENTS.md regola 11: ogni
-- migration in supabase/migrations/ deve aggiornare anche questo file nella
-- stessa PR, così README.md/CONTRIBUTING.md restano veri quando dicono che
-- un self-host o un nuovo contributor può bootstrappare il DB applicando
-- solo schema.sql, senza rigiocare tutta la cronologia delle migration.
--
-- Nota: "type"/"account_type" sono smallint (non enum Postgres) per restare
-- 1:1 compatibili con le costanti numeriche TagType/UserType già usate in
-- tutto il codice server (server/src/db/models/tags.ts, users.ts) e nel
-- frontend, evitando una conversione enum<->numero in ogni query.
--
-- Vedi docs/VERCEL_SUPABASE_MIGRATION.md per il contesto completo della migrazione.
-- ============================================================

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."get_balance_history"("p_user_id" "uuid", "p_months" integer DEFAULT NULL::integer) RETURNS TABLE("month_start" "date", "bank" numeric, "cash" numeric, "digital_services" numeric, "stocks" numeric, "etf" numeric, "bitcoin" numeric, "crypto" numeric, "bonds" numeric, "funds" numeric, "commodities" numeric, "emergency_fund" numeric, "recorded_at" timestamp with time zone)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  with monthly as (
    select
      date_trunc('month', user_date)::date as month_start,
      bank, cash, digital_services, stocks, etf, bitcoin, crypto, bonds, funds, commodities, emergency_fund,
      recorded_at,
      row_number() over (
        partition by date_trunc('month', user_date)
        order by user_date desc, recorded_at desc
      ) as rn
    from public.balances
    where user_id = p_user_id
      and (p_months is null or user_date >= (date_trunc('month', now()) - (p_months || ' months')::interval)::date)
  )
  select month_start, bank, cash, digital_services, stocks, etf, bitcoin, crypto, bonds, funds, commodities, emergency_fund, recorded_at
  from monthly
  where rn = 1
  order by month_start desc;
$$;


ALTER FUNCTION "public"."get_balance_history"("p_user_id" "uuid", "p_months" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_balance_ranking_pool"("p_user_ids" "uuid"[] DEFAULT NULL::"uuid"[], "p_ignore_test_demo" boolean DEFAULT true) RETURNS TABLE("user_id" "uuid", "total_balance" numeric)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  with eligible as (
    select p.id from public.profiles p
    where (not p_ignore_test_demo or p.account_type < 2)
      and (p_user_ids is null or p.id = any(p_user_ids))
  )
  select distinct on (b.user_id) b.user_id,
    (b.bank + b.cash + b.digital_services + b.stocks + b.etf + b.bitcoin + b.crypto + b.bonds + b.funds + b.commodities) as total_balance
  from public.balances b
  join eligible e on e.id = b.user_id
  where b.user_date < date_trunc('month', now())::date
  order by b.user_id, b.user_date desc, b.recorded_at desc;
$$;


ALTER FUNCTION "public"."get_balance_ranking_pool"("p_user_ids" "uuid"[], "p_ignore_test_demo" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_benchmark_metric_rows"("p_user_ids" "uuid"[], "p_current_month" "date" DEFAULT ("date_trunc"('month'::"text", "now"()))::"date") RETURNS TABLE("user_id" "uuid", "balance_total" numeric, "asset_allocation" "jsonb", "monthly_income" numeric, "monthly_expenses" numeric, "yearly_income" numeric, "yearly_expenses" numeric, "yearly_expenses_by_category" "jsonb")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  with eligible as (
    select unnest(p_user_ids) as user_id
  ),
  latest_balances as (
    select distinct on (b.user_id)
      b.user_id,
      totals.balance_total,
      case when totals.balance_total > 0 then jsonb_build_object(
        'liquid', round(totals.liquid / totals.balance_total * 100, 2),
        'investments', round(totals.investments / totals.balance_total * 100, 2),
        'crypto', round(totals.crypto / totals.balance_total * 100, 2)
      ) end as asset_allocation
    from public.balances b
    cross join lateral (select
      b.bank + b.cash + b.digital_services + b.emergency_fund as liquid,
      b.stocks + b.etf + b.bonds + b.funds + b.commodities as investments,
      b.bitcoin + b.crypto as crypto,
      b.bank + b.cash + b.digital_services + b.emergency_fund + b.stocks + b.etf + b.bonds + b.funds + b.commodities + b.bitcoin + b.crypto as balance_total
    ) totals
    join eligible e on e.user_id = b.user_id
    where b.user_date < p_current_month
    order by b.user_id, b.user_date desc, b.recorded_at desc
  ),
  monthly_totals as (
    select e.user_id,
      sum(e.amount) filter (where not e.is_expense) as monthly_income,
      sum(e.amount) filter (where e.is_expense) as monthly_expenses
    from public.expenses e
    join eligible u on u.user_id = e.user_id
    where e.occurred_at >= (p_current_month - interval '1 month')
      and e.occurred_at < p_current_month
    group by e.user_id
  ),
  yearly_totals as (
    select e.user_id,
      sum(e.amount) filter (where not e.is_expense) as yearly_income,
      sum(e.amount) filter (where e.is_expense) as yearly_expenses
    from public.expenses e
    join eligible u on u.user_id = e.user_id
    where e.occurred_at >= (p_current_month - interval '12 months')
      and e.occurred_at < p_current_month
    group by e.user_id
  ),
  category_totals as (
    select e.user_id, t.client_index, sum(e.amount) as total_amount
    from public.expenses e
    join eligible u on u.user_id = e.user_id
    join public.tags t on t.id = e.category_tag_id
    where e.is_expense
      and e.occurred_at >= (p_current_month - interval '12 months')
      and e.occurred_at < p_current_month
    group by e.user_id, t.client_index
  ),
  categories as (
    select user_id, jsonb_object_agg(client_index::text, total_amount) as yearly_expenses_by_category
    from category_totals
    group by user_id
  )
  select u.user_id, b.balance_total, b.asset_allocation, m.monthly_income, m.monthly_expenses,
    y.yearly_income, y.yearly_expenses,
    coalesce(c.yearly_expenses_by_category, '{}'::jsonb)
  from eligible u
  left join latest_balances b on b.user_id = u.user_id
  left join monthly_totals m on m.user_id = u.user_id
  left join yearly_totals y on y.user_id = u.user_id
  left join categories c on c.user_id = u.user_id;
$$;


ALTER FUNCTION "public"."get_benchmark_metric_rows"("p_user_ids" "uuid"[], "p_current_month" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_expense_ranking_pool"("p_user_ids" "uuid"[] DEFAULT NULL::"uuid"[], "p_is_expense" boolean DEFAULT true, "p_month" "date" DEFAULT NULL::"date") RETURNS TABLE("user_id" "uuid", "total_amount" numeric)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  with eligible as (
    select p.id from public.profiles p
    where p.account_type < 2
      and (p_user_ids is null or p.id = any(p_user_ids))
  ),
  target_month as (
    select coalesce(p_month, (date_trunc('month', now()) - interval '1 month')::date) as m
  )
  select e.user_id, sum(e.amount) as total_amount
  from public.expenses e
  join eligible el on el.id = e.user_id
  cross join target_month tm
  where e.is_expense = p_is_expense
    and e.occurred_at >= tm.m
    and e.occurred_at < (tm.m + interval '1 month')
  group by e.user_id;
$$;


ALTER FUNCTION "public"."get_expense_ranking_pool"("p_user_ids" "uuid"[], "p_is_expense" boolean, "p_month" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_monthly_totals"("p_user_id" "uuid", "p_months" integer DEFAULT NULL::integer) RETURNS TABLE("month_start" "date", "total_outflows" numeric, "total_incomes" numeric, "total_expenses" numeric, "total_investments" numeric, "total_transfers" numeric)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select
    date_trunc('month', occurred_at)::date as month_start,
    coalesce(sum(amount) filter (where direction = 'outflow' and not exclude_from_statistics), 0) as total_outflows,
    coalesce(sum(amount) filter (where direction = 'income' and not exclude_from_statistics), 0) as total_incomes,
    coalesce(sum(amount) filter (where purpose in ('expense', 'tax') and not exclude_from_statistics), 0) as total_expenses,
    coalesce(sum(amount) filter (where purpose = 'investment' and direction = 'outflow' and not exclude_from_statistics), 0) as total_investments,
    coalesce(sum(amount) filter (where purpose = 'transfer' and not exclude_from_statistics), 0) as total_transfers
  from public.transactions
  where user_id = p_user_id
    and (p_months is null or occurred_at >= (date_trunc('month', now()) - (p_months || ' months')::interval))
  group by date_trunc('month', occurred_at)
  order by month_start desc;
$$;


ALTER FUNCTION "public"."get_monthly_totals"("p_user_id" "uuid", "p_months" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


-- Wires rls_auto_enable() to fire on every CREATE TABLE in "public", so a
-- future table forgotten from an explicit "enable row level security"
-- statement still ends up RLS-protected. This event trigger was created
-- directly against the live database (outside any migration file) and
-- "supabase db dump --schema public" does not export event triggers
-- (they're database-level objects, not schema children), so it has to be
-- kept here by hand whenever schema.sql is regenerated from a fresh dump.
CREATE EVENT TRIGGER "rls_auto_enable" ON "ddl_command_end"
    WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
    EXECUTE FUNCTION "public"."rls_auto_enable"();


CREATE OR REPLACE FUNCTION "public"."update_expense_with_shared"("p_user_id" "uuid", "p_expense_id" bigint, "p_occurred_at" "date", "p_amount" numeric, "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint, "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint, "p_shared_mode" "text" DEFAULT 'unchanged'::"text", "p_shared_total" numeric DEFAULT NULL::numeric, "p_shared_own_share" numeric DEFAULT NULL::numeric) RETURNS bigint
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_receivable public.shared_expense_receivables%rowtype;
  v_effective_amount numeric := round(p_amount, 2);
  v_cash_amount numeric := null;
begin
  if p_shared_mode not in ('unchanged', 'set', 'remove') then
    raise exception 'invalid shared-expense mode';
  end if;

  if p_shared_mode = 'set' then
    if not p_is_expense or p_shared_total is null or p_shared_own_share is null
      or p_shared_total <= 0 or p_shared_own_share < 0 or p_shared_own_share >= p_shared_total then
      raise exception 'invalid shared-expense amounts';
    end if;
    v_effective_amount := round(p_shared_own_share, 2);
    v_cash_amount := round(p_shared_total, 2);
  elsif p_shared_mode = 'unchanged' then
    select * into v_receivable
    from public.shared_expense_receivables
    where user_id = p_user_id and expense_id = p_expense_id
    for update;
    if found then
      v_cash_amount := v_receivable.total_amount;
      v_effective_amount := v_receivable.own_share;
    end if;
  end if;

  update public.expenses set
    occurred_at = p_occurred_at,
    amount = v_effective_amount,
    cash_amount = v_cash_amount,
    is_expense = p_is_expense,
    notes = p_notes,
    payment_type_tag_id = p_payment_type_tag_id,
    category_tag_id = p_category_tag_id,
    user_category_id = p_user_category_id,
    balance_asset_key = p_balance_asset_key,
    balance_detail_type = p_balance_detail_type,
    balance_detail_id = p_balance_detail_id
  where id = p_expense_id and user_id = p_user_id;

  if not found then raise exception 'transaction not found'; end if;

  if p_shared_mode = 'set' then
    select * into v_receivable
    from public.shared_expense_receivables
    where user_id = p_user_id and expense_id = p_expense_id
    for update;

    if found and round(p_shared_total - p_shared_own_share, 2) < v_receivable.settled_amount then
      raise exception 'shared amount is lower than recorded reimbursements';
    end if;

    insert into public.shared_expense_receivables (
      user_id, expense_id, occurred_at, notes, total_amount, own_share,
      receivable_amount, settled_amount
    ) values (
      p_user_id, p_expense_id, p_occurred_at, p_notes,
      round(p_shared_total, 2), round(p_shared_own_share, 2),
      round(p_shared_total - p_shared_own_share, 2), 0
    )
    on conflict (expense_id) where expense_id is not null do update set
      occurred_at = excluded.occurred_at,
      notes = excluded.notes,
      total_amount = excluded.total_amount,
      own_share = excluded.own_share,
      receivable_amount = excluded.receivable_amount;
  elsif p_shared_mode = 'remove' then
    select * into v_receivable
    from public.shared_expense_receivables
    where user_id = p_user_id and expense_id = p_expense_id
    for update;

    if found and (
      v_receivable.settled_amount > 0 or exists (
        select 1 from public.shared_expense_reimbursements
        where user_id = p_user_id and receivable_id = v_receivable.id
      )
    ) then
      raise exception 'cannot remove a shared expense with recorded reimbursements';
    end if;

    delete from public.shared_expense_receivables
    where user_id = p_user_id and expense_id = p_expense_id;
  end if;

  return p_expense_id;
end;
$$;


ALTER FUNCTION "public"."update_expense_with_shared"("p_user_id" "uuid", "p_expense_id" bigint, "p_occurred_at" "date", "p_amount" numeric, "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint, "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint, "p_shared_mode" "text", "p_shared_total" numeric, "p_shared_own_share" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_transaction_with_shared"("p_user_id" "uuid", "p_transaction_id" bigint, "p_occurred_at" "date", "p_amount" numeric, "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint, "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint, "p_shared_mode" "text" DEFAULT 'unchanged'::"text", "p_shared_total" numeric DEFAULT NULL::numeric, "p_shared_own_share" numeric DEFAULT NULL::numeric) RETURNS bigint
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_receivable public.shared_expense_receivables%rowtype;
  v_effective_amount numeric := round(p_amount, 2);
  v_cash_amount numeric := null;
begin
  if p_shared_mode not in ('unchanged', 'set', 'remove') then
    raise exception 'invalid shared-expense mode';
  end if;

  if p_shared_mode = 'set' then
    if not p_is_expense or p_shared_total is null or p_shared_own_share is null
      or p_shared_total <= 0 or p_shared_own_share < 0 or p_shared_own_share >= p_shared_total then
      raise exception 'invalid shared-expense amounts';
    end if;
    v_effective_amount := round(p_shared_own_share, 2);
    v_cash_amount := round(p_shared_total, 2);
  elsif p_shared_mode = 'unchanged' then
    select * into v_receivable
    from public.shared_expense_receivables
    where user_id = p_user_id and expense_id = p_transaction_id
    for update;
    if found then
      v_cash_amount := v_receivable.total_amount;
      v_effective_amount := v_receivable.own_share;
    end if;
  end if;

  update public.expenses set
    occurred_at = p_occurred_at,
    amount = v_effective_amount,
    cash_amount = v_cash_amount,
    is_expense = p_is_expense,
    notes = p_notes,
    payment_type_tag_id = p_payment_type_tag_id,
    category_tag_id = p_category_tag_id,
    user_category_id = p_user_category_id,
    balance_asset_key = p_balance_asset_key,
    balance_detail_type = p_balance_detail_type,
    balance_detail_id = p_balance_detail_id
  where id = p_transaction_id and user_id = p_user_id;

  if not found then raise exception 'transaction not found'; end if;

  if p_shared_mode = 'set' then
    select * into v_receivable
    from public.shared_expense_receivables
    where user_id = p_user_id and expense_id = p_transaction_id
    for update;

    if found and round(p_shared_total - p_shared_own_share, 2) < v_receivable.settled_amount then
      raise exception 'shared amount is lower than recorded reimbursements';
    end if;

    insert into public.shared_expense_receivables (
      user_id, expense_id, occurred_at, notes, total_amount, own_share,
      receivable_amount, settled_amount
    ) values (
      p_user_id, p_transaction_id, p_occurred_at, p_notes,
      round(p_shared_total, 2), round(p_shared_own_share, 2),
      round(p_shared_total - p_shared_own_share, 2), 0
    )
    on conflict (expense_id) where expense_id is not null do update set
      occurred_at = excluded.occurred_at,
      notes = excluded.notes,
      total_amount = excluded.total_amount,
      own_share = excluded.own_share,
      receivable_amount = excluded.receivable_amount;
  elsif p_shared_mode = 'remove' then
    select * into v_receivable
    from public.shared_expense_receivables
    where user_id = p_user_id and expense_id = p_transaction_id
    for update;

    if found and (
      v_receivable.settled_amount > 0 or exists (
        select 1 from public.shared_expense_reimbursements
        where user_id = p_user_id and receivable_id = v_receivable.id
      )
    ) then
      raise exception 'cannot remove a shared expense with recorded reimbursements';
    end if;

    delete from public.shared_expense_receivables
    where user_id = p_user_id and expense_id = p_transaction_id;
  end if;

  return p_transaction_id;
end;
$$;


ALTER FUNCTION "public"."update_transaction_with_shared"("p_user_id" "uuid", "p_transaction_id" bigint, "p_occurred_at" "date", "p_amount" numeric, "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint, "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint, "p_shared_mode" "text", "p_shared_total" numeric, "p_shared_own_share" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_transaction_with_shared"("p_user_id" "uuid", "p_transaction_id" bigint, "p_occurred_at" "date", "p_amount" numeric, "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint, "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint, "p_purpose" "text", "p_shared_mode" "text" DEFAULT 'unchanged'::"text", "p_shared_total" numeric DEFAULT NULL::numeric, "p_shared_own_share" numeric DEFAULT NULL::numeric) RETURNS bigint
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_receivable public.shared_expense_receivables%rowtype;
  v_effective_amount numeric := round(p_amount, 2);
  v_cash_amount numeric := null;
begin
  if p_purpose not in ('income', 'expense', 'investment', 'transfer', 'debt', 'tax', 'refund', 'other') then
    raise exception 'invalid transaction purpose';
  end if;
  if (p_is_expense and p_purpose in ('income', 'refund'))
    or (not p_is_expense and p_purpose in ('expense', 'tax')) then
    raise exception 'transaction purpose is incompatible with direction';
  end if;
  if p_shared_mode not in ('unchanged', 'set', 'remove') then
    raise exception 'invalid shared-expense mode';
  end if;

  if p_shared_mode = 'set' then
    if not p_is_expense or p_purpose <> 'expense'
      or p_shared_total is null or p_shared_own_share is null
      or p_shared_total <= 0 or p_shared_own_share < 0 or p_shared_own_share >= p_shared_total then
      raise exception 'invalid shared-expense amounts';
    end if;
    v_effective_amount := round(p_shared_own_share, 2);
    v_cash_amount := round(p_shared_total, 2);
  elsif p_shared_mode = 'unchanged' then
    select * into v_receivable
    from public.shared_expense_receivables
    where user_id = p_user_id and expense_id = p_transaction_id
    for update;
    if found then
      if p_purpose <> 'expense' then raise exception 'shared transactions must be expenses'; end if;
      v_cash_amount := v_receivable.total_amount;
      v_effective_amount := v_receivable.own_share;
    end if;
  end if;

  update public.transactions set
    occurred_at = p_occurred_at,
    amount = v_effective_amount,
    cash_amount = v_cash_amount,
    is_expense = p_is_expense,
    purpose = p_purpose,
    notes = p_notes,
    payment_type_tag_id = p_payment_type_tag_id,
    category_tag_id = p_category_tag_id,
    user_category_id = p_user_category_id,
    balance_asset_key = p_balance_asset_key,
    balance_detail_type = p_balance_detail_type,
    balance_detail_id = p_balance_detail_id
  where id = p_transaction_id and user_id = p_user_id;

  if not found then raise exception 'transaction not found'; end if;

  if p_shared_mode = 'set' then
    select * into v_receivable
    from public.shared_expense_receivables
    where user_id = p_user_id and expense_id = p_transaction_id
    for update;

    if found and round(p_shared_total - p_shared_own_share, 2) < v_receivable.settled_amount then
      raise exception 'shared amount is lower than recorded reimbursements';
    end if;

    insert into public.shared_expense_receivables (
      user_id, expense_id, occurred_at, notes, total_amount, own_share,
      receivable_amount, settled_amount
    ) values (
      p_user_id, p_transaction_id, p_occurred_at, p_notes,
      round(p_shared_total, 2), round(p_shared_own_share, 2),
      round(p_shared_total - p_shared_own_share, 2), 0
    )
    on conflict (expense_id) where expense_id is not null do update set
      occurred_at = excluded.occurred_at,
      notes = excluded.notes,
      total_amount = excluded.total_amount,
      own_share = excluded.own_share,
      receivable_amount = excluded.receivable_amount;
  elsif p_shared_mode = 'remove' then
    select * into v_receivable
    from public.shared_expense_receivables
    where user_id = p_user_id and expense_id = p_transaction_id
    for update;

    if found and (
      v_receivable.settled_amount > 0 or exists (
        select 1 from public.shared_expense_reimbursements
        where user_id = p_user_id and receivable_id = v_receivable.id
      )
    ) then
      raise exception 'cannot remove a shared expense with recorded reimbursements';
    end if;

    delete from public.shared_expense_receivables
    where user_id = p_user_id and expense_id = p_transaction_id;
  end if;

  return p_transaction_id;
end;
$$;


ALTER FUNCTION "public"."update_transaction_with_shared"("p_user_id" "uuid", "p_transaction_id" bigint, "p_occurred_at" "date", "p_amount" numeric, "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint, "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint, "p_purpose" "text", "p_shared_mode" "text", "p_shared_total" numeric, "p_shared_own_share" numeric) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."balances" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_date" "date" NOT NULL,
    "bank" numeric DEFAULT 0 NOT NULL,
    "cash" numeric DEFAULT 0 NOT NULL,
    "digital_services" numeric DEFAULT 0 NOT NULL,
    "stocks" numeric DEFAULT 0 NOT NULL,
    "etf" numeric DEFAULT 0 NOT NULL,
    "bitcoin" numeric DEFAULT 0 NOT NULL,
    "crypto" numeric DEFAULT 0 NOT NULL,
    "bonds" numeric DEFAULT 0 NOT NULL,
    "funds" numeric DEFAULT 0 NOT NULL,
    "commodities" numeric DEFAULT 0 NOT NULL,
    "emergency_fund" numeric DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."balances" OWNER TO "postgres";


ALTER TABLE "public"."balances" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."balances_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."benchmark_profile_snapshots" (
    "month_start" "date" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "account_type" smallint NOT NULL,
    "job_country_tag_id" bigint,
    "job_tag_id" bigint,
    "job_type_tag_id" bigint,
    "work_time_tag_id" bigint,
    "remote_type_tag_id" bigint,
    "living_situation_tag_id" bigint,
    "housing_type_tag_id" bigint,
    "children_tag_id" bigint,
    "country_tag_id" bigint,
    "age_tag_id" bigint,
    "years_of_experience_tag_id" bigint
);


ALTER TABLE "public"."benchmark_profile_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."benchmark_runs" (
    "month_start" "date" NOT NULL,
    "algorithm_version" "text" NOT NULL,
    "generated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "contributor_count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."benchmark_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."deletions" (
    "user_id" "uuid" NOT NULL,
    "scheduled_for" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."deletions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "occurred_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "amount" numeric NOT NULL,
    "is_expense" boolean NOT NULL,
    "notes" "text",
    "payment_type_tag_id" bigint NOT NULL,
    "category_tag_id" bigint NOT NULL,
    "user_category_id" bigint,
    "balance_asset_key" "text",
    "balance_detail_type" "text",
    "balance_detail_id" bigint,
    "cash_amount" numeric,
    "exclude_from_statistics" boolean DEFAULT false NOT NULL,
    "direction" "text" GENERATED ALWAYS AS (
CASE
    WHEN "is_expense" THEN 'outflow'::"text"
    ELSE 'income'::"text"
END) STORED,
    "purpose" "text" DEFAULT 'other'::"text" NOT NULL,
    CONSTRAINT "expenses_balance_asset_key_check" CHECK (("balance_asset_key" = ANY (ARRAY['bank'::"text", 'cash'::"text", 'digitalServices'::"text", 'emergencyFund'::"text", 'stocks'::"text", 'etf'::"text", 'bitcoin'::"text", 'crypto'::"text", 'bonds'::"text", 'funds'::"text", 'commodities'::"text"]))),
    CONSTRAINT "expenses_balance_detail_type_check" CHECK (("balance_detail_type" = ANY (ARRAY['liquidity'::"text", 'investment'::"text"]))),
    CONSTRAINT "transactions_direction_check" CHECK (("direction" = ANY (ARRAY['income'::"text", 'outflow'::"text"]))),
    CONSTRAINT "transactions_purpose_check" CHECK (("purpose" = ANY (ARRAY['income'::"text", 'expense'::"text", 'investment'::"text", 'transfer'::"text", 'debt'::"text", 'tax'::"text", 'refund'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."transactions" IS 'Financial transactions. direction is canonical; is_expense remains the compatibility storage field for existing deployments.';



COMMENT ON COLUMN "public"."transactions"."purpose" IS 'Economic purpose, independent from income/outflow direction. Transfers and investments can therefore be excluded from spending.';



ALTER TABLE "public"."transactions" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."expenses_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."instrument_historical_prices" (
    "id" bigint NOT NULL,
    "instrument_id" bigint NOT NULL,
    "month_key" "text" NOT NULL,
    "price_eur" numeric NOT NULL,
    "raw_price" numeric NOT NULL,
    "raw_currency" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "submitted_by" "uuid",
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "verified_by" "uuid",
    "verified_at" timestamp with time zone,
    "rejection_note" "text",
    "reference_date" "date" NOT NULL,
    "source" "text" DEFAULT 'community'::"text" NOT NULL,
    "is_final" boolean DEFAULT true NOT NULL,
    CONSTRAINT "instrument_historical_prices_source_check" CHECK (("source" = ANY (ARRAY['community'::"text", 'coingecko'::"text", 'finnhub'::"text"]))),
    CONSTRAINT "instrument_historical_prices_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'verified'::"text", 'rejected'::"text", 'superseded'::"text"])))
);


ALTER TABLE "public"."instrument_historical_prices" OWNER TO "postgres";


COMMENT ON TABLE "public"."instrument_historical_prices" IS 'Shared canonical monthly prices for all investment instruments; provider rows take precedence and community rows are fallback/audit.';



ALTER TABLE "public"."instrument_historical_prices" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."instrument_historical_prices_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."investment_instruments" (
    "id" bigint NOT NULL,
    "kind" "text" NOT NULL,
    "symbol" "text" NOT NULL,
    "exchange" "text",
    "name" "text" NOT NULL,
    "currency" "text",
    "country" "text",
    "sector" "text",
    "industry" "text",
    "figi" "text",
    "isin" "text",
    "coingecko_id" "text",
    "provider" "text" DEFAULT 'manual'::"text" NOT NULL,
    "verified" boolean DEFAULT true NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "owner_user_id" "uuid",
    CONSTRAINT "investment_instruments_kind_check" CHECK (("kind" = ANY (ARRAY['stock'::"text", 'etf'::"text", 'crypto'::"text", 'bond'::"text", 'fund'::"text", 'commodity'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."investment_instruments" OWNER TO "postgres";


ALTER TABLE "public"."investment_instruments" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."investment_instruments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "user_id" "uuid" NOT NULL,
    "enabled" boolean DEFAULT false NOT NULL,
    "monthly_summary" boolean DEFAULT true NOT NULL,
    "data_update_reminder" boolean DEFAULT true NOT NULL,
    "recurring_due" boolean DEFAULT true NOT NULL,
    "shared_expense_updates" boolean DEFAULT true NOT NULL,
    "community_price_updates" boolean DEFAULT true NOT NULL,
    "reminder_day" smallint DEFAULT 1 NOT NULL,
    "reminder_hour" smallint DEFAULT 18 NOT NULL,
    "timezone" "text" DEFAULT 'UTC'::"text" NOT NULL,
    "language" "text" DEFAULT 'it'::"text" NOT NULL,
    "last_sent" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notification_preferences_language_check" CHECK ((("char_length"("language") >= 2) AND ("char_length"("language") <= 10))),
    CONSTRAINT "notification_preferences_reminder_day_check" CHECK ((("reminder_day" >= 1) AND ("reminder_day" <= 28))),
    CONSTRAINT "notification_preferences_reminder_hour_check" CHECK ((("reminder_hour" >= 0) AND ("reminder_hour" <= 23))),
    CONSTRAINT "notification_preferences_timezone_check" CHECK ((("char_length"("timezone") >= 1) AND ("char_length"("timezone") <= 80)))
);


ALTER TABLE "public"."notification_preferences" OWNER TO "postgres";


COMMENT ON TABLE "public"."notification_preferences" IS 'Explicit user choices for optional reminders; enabled=false means no push is sent.';



COMMENT ON COLUMN "public"."notification_preferences"."last_sent" IS 'Idempotency timestamps keyed by reminder type, maintained by send-reminders.';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "user_code" "text" NOT NULL,
    "nickname" "text" DEFAULT ''::"text" NOT NULL,
    "account_type" smallint DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "age_tag_id" bigint,
    "living_situation_tag_id" bigint,
    "housing_type_tag_id" bigint,
    "children_tag_id" bigint,
    "country_tag_id" bigint,
    "job_tag_id" bigint,
    "job_type_tag_id" bigint,
    "job_country_tag_id" bigint,
    "work_time_tag_id" bigint,
    "remote_type_tag_id" bigint,
    "years_of_experience_tag_id" bigint,
    "preferred_currency_tag_id" bigint,
    "expenses_limit" numeric DEFAULT '-1'::integer NOT NULL,
    "savings_percent" numeric DEFAULT '-1'::integer NOT NULL,
    "emergency_fund_goal" numeric DEFAULT '-1'::integer NOT NULL,
    "benchmark_consent" boolean DEFAULT false NOT NULL,
    "benchmark_consent_at" timestamp with time zone,
    "benchmark_consent_revoked_at" timestamp with time zone,
    "seen_badges" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "is_admin" boolean DEFAULT false NOT NULL,
    "expenses_limit_percent" numeric,
    "savings_amount_goal" numeric,
    "emergency_fund_months" numeric,
    "fixed_expenses_percent" numeric,
    "category_spending_limits" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "debt_reduction_goal" numeric,
    "position_concentration_limit" numeric,
    "asset_category_concentration_limit" numeric,
    "annual_passive_income_goal" numeric,
    "expenses_limit_percent_enabled" boolean DEFAULT true NOT NULL,
    "savings_amount_goal_enabled" boolean DEFAULT true NOT NULL,
    "emergency_fund_months_enabled" boolean DEFAULT true NOT NULL,
    "recovery_code_hash" "text",
    "recovery_code_generated_at" timestamp with time zone,
    CONSTRAINT "profiles_annual_passive_income_goal_check" CHECK ((("annual_passive_income_goal" IS NULL) OR ("annual_passive_income_goal" >= (0)::numeric))),
    CONSTRAINT "profiles_asset_category_concentration_limit_check" CHECK ((("asset_category_concentration_limit" IS NULL) OR (("asset_category_concentration_limit" >= (0)::numeric) AND ("asset_category_concentration_limit" <= (100)::numeric)))),
    CONSTRAINT "profiles_debt_reduction_goal_check" CHECK ((("debt_reduction_goal" IS NULL) OR ("debt_reduction_goal" >= (0)::numeric))),
    CONSTRAINT "profiles_emergency_fund_months_check" CHECK ((("emergency_fund_months" IS NULL) OR ("emergency_fund_months" >= (0)::numeric))),
    CONSTRAINT "profiles_expenses_limit_percent_check" CHECK ((("expenses_limit_percent" IS NULL) OR (("expenses_limit_percent" >= (0)::numeric) AND ("expenses_limit_percent" <= (100)::numeric)))),
    CONSTRAINT "profiles_fixed_expenses_percent_check" CHECK ((("fixed_expenses_percent" IS NULL) OR (("fixed_expenses_percent" >= (0)::numeric) AND ("fixed_expenses_percent" <= (100)::numeric)))),
    CONSTRAINT "profiles_position_concentration_limit_check" CHECK ((("position_concentration_limit" IS NULL) OR (("position_concentration_limit" >= (0)::numeric) AND ("position_concentration_limit" <= (100)::numeric)))),
    CONSTRAINT "profiles_savings_amount_goal_check" CHECK ((("savings_amount_goal" IS NULL) OR ("savings_amount_goal" >= (0)::numeric)))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."push_subscriptions" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "endpoint" "text" NOT NULL,
    "p256dh" "text" NOT NULL,
    "auth" "text" NOT NULL,
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."push_subscriptions" OWNER TO "postgres";


ALTER TABLE "public"."push_subscriptions" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."push_subscriptions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."recurring_transactions" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "is_expense" boolean NOT NULL,
    "amount" numeric NOT NULL,
    "notes" "text",
    "payment_type_tag_id" bigint,
    "category_tag_id" bigint NOT NULL,
    "user_category_id" bigint,
    "day_of_month" smallint NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "next_run_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "purpose" "text" DEFAULT 'other'::"text" NOT NULL,
    CONSTRAINT "recurring_transactions_day_of_month_check" CHECK ((("day_of_month" >= 1) AND ("day_of_month" <= 28))),
    CONSTRAINT "recurring_transactions_purpose_check" CHECK (("purpose" = ANY (ARRAY['income'::"text", 'expense'::"text", 'investment'::"text", 'transfer'::"text", 'debt'::"text", 'tax'::"text", 'refund'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."recurring_transactions" OWNER TO "postgres";


ALTER TABLE "public"."recurring_transactions" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."recurring_transactions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."roadmap_votes" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "item_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."roadmap_votes" OWNER TO "postgres";


ALTER TABLE "public"."roadmap_votes" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."roadmap_votes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."shared_expense_receivables" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "occurred_at" "date" NOT NULL,
    "notes" "text",
    "total_amount" numeric NOT NULL,
    "own_share" numeric NOT NULL,
    "receivable_amount" numeric NOT NULL,
    "settled_amount" numeric DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expense_id" bigint,
    CONSTRAINT "shared_expense_receivables_own_share_check" CHECK (("own_share" >= (0)::numeric)),
    CONSTRAINT "shared_expense_receivables_receivable_amount_check" CHECK (("receivable_amount" > (0)::numeric)),
    CONSTRAINT "shared_expense_receivables_settled_amount_check" CHECK (("settled_amount" >= (0)::numeric)),
    CONSTRAINT "shared_expense_receivables_total_amount_check" CHECK (("total_amount" > (0)::numeric))
);


ALTER TABLE "public"."shared_expense_receivables" OWNER TO "postgres";


ALTER TABLE "public"."shared_expense_receivables" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."shared_expense_receivables_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."shared_expense_reimbursements" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "receivable_id" bigint NOT NULL,
    "expense_id" bigint NOT NULL,
    "amount" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "shared_expense_reimbursements_amount_check" CHECK (("amount" > (0)::numeric))
);


ALTER TABLE "public"."shared_expense_reimbursements" OWNER TO "postgres";


ALTER TABLE "public"."shared_expense_reimbursements" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."shared_expense_reimbursements_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" bigint NOT NULL,
    "client_index" integer NOT NULL,
    "type" smallint NOT NULL,
    "label" "text" NOT NULL
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


ALTER TABLE "public"."tags" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."tags_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_categories" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "parent_tag_id" bigint NOT NULL,
    "label" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_categories" OWNER TO "postgres";


ALTER TABLE "public"."user_categories" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."user_categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_goals" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "goal_type" "text" DEFAULT 'savings'::"text" NOT NULL,
    "target_value" numeric NOT NULL,
    "current_value" numeric DEFAULT 0 NOT NULL,
    "linked_asset_key" "text",
    "deadline" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "target_percent_of_net_worth" numeric,
    CONSTRAINT "user_goals_goal_type_check" CHECK (("goal_type" = ANY (ARRAY['savings'::"text", 'purchase'::"text", 'investment'::"text", 'debt'::"text"]))),
    CONSTRAINT "user_goals_linked_asset_key_check" CHECK ((("linked_asset_key" IS NULL) OR ("linked_asset_key" = ANY (ARRAY['bank'::"text", 'cash'::"text", 'digitalServices'::"text", 'emergencyFund'::"text", 'stocks'::"text", 'etf'::"text", 'bitcoin'::"text", 'crypto'::"text", 'bonds'::"text", 'funds'::"text", 'commodities'::"text"])))),
    CONSTRAINT "user_goals_target_percent_of_net_worth_check" CHECK ((("target_percent_of_net_worth" IS NULL) OR (("target_percent_of_net_worth" >= (0)::numeric) AND ("target_percent_of_net_worth" <= (100)::numeric))))
);


ALTER TABLE "public"."user_goals" OWNER TO "postgres";


ALTER TABLE "public"."user_goals" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."user_goals_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_investment_dividends" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "instrument_id" bigint NOT NULL,
    "holding_id" bigint,
    "amount" numeric NOT NULL,
    "currency" "text",
    "gross_amount" numeric,
    "paid_date" "date" NOT NULL,
    "external_id" "text",
    "source" "text" NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_investment_dividends" OWNER TO "postgres";


ALTER TABLE "public"."user_investment_dividends" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."user_investment_dividends_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_investment_holding_history" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "holding_id" bigint,
    "instrument_id" bigint NOT NULL,
    "asset_key" "text" NOT NULL,
    "symbol" "text" NOT NULL,
    "name" "text" NOT NULL,
    "quantity" numeric,
    "average_price" numeric,
    "current_value" numeric,
    "invested_amount" numeric,
    "currency" "text" DEFAULT 'EUR'::"text" NOT NULL,
    "user_date" "date" NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "price_source" "text",
    CONSTRAINT "user_investment_holding_history_price_source_check" CHECK ((("price_source" IS NULL) OR ("price_source" = ANY (ARRAY['provider'::"text", 'community'::"text", 'manual'::"text", 'imported'::"text"]))))
);


ALTER TABLE "public"."user_investment_holding_history" OWNER TO "postgres";


ALTER TABLE "public"."user_investment_holding_history" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."user_investment_holding_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_investment_holdings" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "instrument_id" bigint NOT NULL,
    "asset_key" "text" NOT NULL,
    "position_type" "text" DEFAULT 'single'::"text" NOT NULL,
    "quantity" numeric,
    "average_price" numeric,
    "current_value" numeric,
    "invested_amount" numeric,
    "currency" "text" DEFAULT 'EUR'::"text" NOT NULL,
    "notes" "text" DEFAULT ''::"text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "import_source" "text",
    CONSTRAINT "user_investment_holdings_asset_key_check" CHECK (("asset_key" = ANY (ARRAY['stocks'::"text", 'etf'::"text", 'bitcoin'::"text", 'crypto'::"text", 'bonds'::"text", 'funds'::"text", 'commodities'::"text"]))),
    CONSTRAINT "user_investment_holdings_position_type_check" CHECK (("position_type" = ANY (ARRAY['single'::"text", 'pac'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."user_investment_holdings" OWNER TO "postgres";


ALTER TABLE "public"."user_investment_holdings" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."user_investment_holdings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_investment_settings" (
    "user_id" "uuid" NOT NULL,
    "monthly_target" numeric,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "monthly_target_percent" numeric,
    CONSTRAINT "user_investment_settings_monthly_target_percent_check" CHECK ((("monthly_target_percent" IS NULL) OR (("monthly_target_percent" >= (0)::numeric) AND ("monthly_target_percent" <= (100)::numeric))))
);


ALTER TABLE "public"."user_investment_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_investment_transactions" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "instrument_id" bigint NOT NULL,
    "holding_id" bigint,
    "side" "text" NOT NULL,
    "quantity" numeric NOT NULL,
    "price" numeric,
    "currency" "text",
    "total" numeric,
    "total_currency" "text",
    "trade_date" "date" NOT NULL,
    "external_id" "text",
    "source" "text" NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_investment_transactions_side_check" CHECK (("side" = ANY (ARRAY['buy'::"text", 'sell'::"text"])))
);


ALTER TABLE "public"."user_investment_transactions" OWNER TO "postgres";


ALTER TABLE "public"."user_investment_transactions" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."user_investment_transactions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_liquidity_account_history" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "account_id" bigint,
    "asset_key" "text" NOT NULL,
    "label" "text" NOT NULL,
    "current_value" numeric NOT NULL,
    "currency" "text" DEFAULT 'EUR'::"text" NOT NULL,
    "user_date" "date" NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_liquidity_account_history" OWNER TO "postgres";


ALTER TABLE "public"."user_liquidity_account_history" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."user_liquidity_account_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_liquidity_accounts" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "asset_key" "text" NOT NULL,
    "label" "text" NOT NULL,
    "current_value" numeric DEFAULT 0 NOT NULL,
    "currency" "text" DEFAULT 'EUR'::"text" NOT NULL,
    "notes" "text" DEFAULT ''::"text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_liquidity_accounts_asset_key_check" CHECK (("asset_key" = ANY (ARRAY['bank'::"text", 'cash'::"text", 'digitalServices'::"text", 'emergencyFund'::"text"])))
);


ALTER TABLE "public"."user_liquidity_accounts" OWNER TO "postgres";


ALTER TABLE "public"."user_liquidity_accounts" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."user_liquidity_accounts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."balances"
    ADD CONSTRAINT "balances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."benchmark_profile_snapshots"
    ADD CONSTRAINT "benchmark_profile_snapshots_pkey" PRIMARY KEY ("month_start", "user_id");



ALTER TABLE ONLY "public"."benchmark_runs"
    ADD CONSTRAINT "benchmark_runs_pkey" PRIMARY KEY ("month_start");



ALTER TABLE ONLY "public"."deletions"
    ADD CONSTRAINT "deletions_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."instrument_historical_prices"
    ADD CONSTRAINT "instrument_historical_prices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."investment_instruments"
    ADD CONSTRAINT "investment_instruments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_code_key" UNIQUE ("user_code");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_endpoint_key" UNIQUE ("endpoint");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recurring_transactions"
    ADD CONSTRAINT "recurring_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roadmap_votes"
    ADD CONSTRAINT "roadmap_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roadmap_votes"
    ADD CONSTRAINT "roadmap_votes_user_id_item_id_key" UNIQUE ("user_id", "item_id");



ALTER TABLE ONLY "public"."shared_expense_receivables"
    ADD CONSTRAINT "shared_expense_receivables_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shared_expense_reimbursements"
    ADD CONSTRAINT "shared_expense_reimbursements_expense_id_key" UNIQUE ("expense_id");



ALTER TABLE ONLY "public"."shared_expense_reimbursements"
    ADD CONSTRAINT "shared_expense_reimbursements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_client_index_type_key" UNIQUE ("client_index", "type");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_categories"
    ADD CONSTRAINT "user_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_categories"
    ADD CONSTRAINT "user_categories_user_id_parent_tag_id_label_key" UNIQUE ("user_id", "parent_tag_id", "label");



ALTER TABLE ONLY "public"."user_goals"
    ADD CONSTRAINT "user_goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_investment_dividends"
    ADD CONSTRAINT "user_investment_dividends_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_investment_holding_history"
    ADD CONSTRAINT "user_investment_holding_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_investment_holdings"
    ADD CONSTRAINT "user_investment_holdings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_investment_holdings"
    ADD CONSTRAINT "user_investment_holdings_user_id_instrument_id_key" UNIQUE ("user_id", "instrument_id");



ALTER TABLE ONLY "public"."user_investment_settings"
    ADD CONSTRAINT "user_investment_settings_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_investment_transactions"
    ADD CONSTRAINT "user_investment_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_liquidity_account_history"
    ADD CONSTRAINT "user_liquidity_account_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_liquidity_accounts"
    ADD CONSTRAINT "user_liquidity_accounts_pkey" PRIMARY KEY ("id");



CREATE INDEX "balances_user_date_idx" ON "public"."balances" USING "btree" ("user_id", "user_date" DESC, "recorded_at" DESC);



CREATE INDEX "benchmark_profile_snapshots_month_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("month_start", "account_type");



CREATE INDEX "expenses_user_date_idx" ON "public"."transactions" USING "btree" ("user_id", "occurred_at" DESC);



CREATE INDEX "expenses_user_isexpense_idx" ON "public"."transactions" USING "btree" ("user_id", "is_expense", "occurred_at" DESC);



CREATE UNIQUE INDEX "instrument_historical_prices_active_uidx" ON "public"."instrument_historical_prices" USING "btree" ("instrument_id", "month_key") WHERE ("status" = ANY (ARRAY['pending'::"text", 'verified'::"text"]));



CREATE INDEX "instrument_historical_prices_canonical_lookup_idx" ON "public"."instrument_historical_prices" USING "btree" ("instrument_id", "month_key", "source") WHERE ("status" = 'verified'::"text");



CREATE UNIQUE INDEX "investment_instruments_coingecko_uidx" ON "public"."investment_instruments" USING "btree" ("coingecko_id") WHERE ("coingecko_id" IS NOT NULL);



CREATE UNIQUE INDEX "investment_instruments_figi_uidx" ON "public"."investment_instruments" USING "btree" ("figi") WHERE ("figi" IS NOT NULL);



CREATE UNIQUE INDEX "investment_instruments_isin_uidx" ON "public"."investment_instruments" USING "btree" ("isin") WHERE ("isin" IS NOT NULL);



CREATE INDEX "investment_instruments_kind_idx" ON "public"."investment_instruments" USING "btree" ("kind", "active");



CREATE INDEX "investment_instruments_owner_idx" ON "public"."investment_instruments" USING "btree" ("owner_user_id") WHERE ("owner_user_id" IS NOT NULL);



CREATE INDEX "investment_instruments_search_idx" ON "public"."investment_instruments" USING "gin" ("to_tsvector"('"simple"'::"regconfig", (((((("symbol" || ' '::"text") || "name") || ' '::"text") || COALESCE("isin", ''::"text")) || ' '::"text") || COALESCE("coingecko_id", ''::"text"))));



CREATE UNIQUE INDEX "investment_instruments_symbol_exchange_uidx" ON "public"."investment_instruments" USING "btree" ("kind", "symbol", COALESCE("exchange", ''::"text")) WHERE ("owner_user_id" IS NULL);



CREATE INDEX "notification_preferences_enabled_idx" ON "public"."notification_preferences" USING "btree" ("enabled") WHERE "enabled";



CREATE INDEX "profiles_benchmark_consent_idx" ON "public"."profiles" USING "btree" ("benchmark_consent") WHERE "benchmark_consent";



CREATE INDEX "push_subscriptions_user_idx" ON "public"."push_subscriptions" USING "btree" ("user_id");



CREATE INDEX "recurring_transactions_due_idx" ON "public"."recurring_transactions" USING "btree" ("next_run_date") WHERE "active";



CREATE INDEX "recurring_transactions_user_idx" ON "public"."recurring_transactions" USING "btree" ("user_id");



CREATE INDEX "roadmap_votes_item_idx" ON "public"."roadmap_votes" USING "btree" ("item_id");



CREATE UNIQUE INDEX "shared_expense_receivables_expense_idx" ON "public"."shared_expense_receivables" USING "btree" ("expense_id") WHERE ("expense_id" IS NOT NULL);



CREATE INDEX "shared_expense_receivables_user_idx" ON "public"."shared_expense_receivables" USING "btree" ("user_id");



CREATE INDEX "shared_expense_reimbursements_receivable_idx" ON "public"."shared_expense_reimbursements" USING "btree" ("user_id", "receivable_id");



CREATE INDEX "transactions_user_purpose_date_idx" ON "public"."transactions" USING "btree" ("user_id", "purpose", "occurred_at" DESC);



CREATE INDEX "user_categories_user_idx" ON "public"."user_categories" USING "btree" ("user_id");



CREATE INDEX "user_goals_user_idx" ON "public"."user_goals" USING "btree" ("user_id", "updated_at" DESC);



CREATE UNIQUE INDEX "user_investment_dividends_external_id_uidx" ON "public"."user_investment_dividends" USING "btree" ("user_id", "instrument_id", "external_id");



CREATE INDEX "user_investment_dividends_user_idx" ON "public"."user_investment_dividends" USING "btree" ("user_id", "instrument_id", "paid_date" DESC);



CREATE UNIQUE INDEX "user_investment_holding_history_uidx" ON "public"."user_investment_holding_history" USING "btree" ("user_id", "holding_id", "user_date");



CREATE INDEX "user_investment_holding_history_user_idx" ON "public"."user_investment_holding_history" USING "btree" ("user_id", "asset_key", "user_date" DESC, "recorded_at" DESC);



CREATE INDEX "user_investment_holdings_instrument_idx" ON "public"."user_investment_holdings" USING "btree" ("instrument_id");



CREATE INDEX "user_investment_holdings_user_idx" ON "public"."user_investment_holdings" USING "btree" ("user_id", "updated_at" DESC);



CREATE UNIQUE INDEX "user_investment_transactions_external_id_uidx" ON "public"."user_investment_transactions" USING "btree" ("user_id", "instrument_id", "external_id");



CREATE INDEX "user_investment_transactions_user_idx" ON "public"."user_investment_transactions" USING "btree" ("user_id", "instrument_id", "trade_date" DESC);



CREATE UNIQUE INDEX "user_liquidity_account_history_uidx" ON "public"."user_liquidity_account_history" USING "btree" ("user_id", "account_id", "user_date");



CREATE INDEX "user_liquidity_account_history_user_idx" ON "public"."user_liquidity_account_history" USING "btree" ("user_id", "asset_key", "user_date" DESC, "recorded_at" DESC);



CREATE INDEX "user_liquidity_accounts_user_idx" ON "public"."user_liquidity_accounts" USING "btree" ("user_id", "asset_key", "updated_at" DESC);



-- Covering indexes for foreign keys the Supabase performance advisor
-- flagged as unindexed (0001_unindexed_foreign_keys) - added in one batch
-- rather than piecemeal since they're all single-column FK lookups.
CREATE INDEX "benchmark_profile_snapshots_age_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("age_tag_id");
CREATE INDEX "benchmark_profile_snapshots_children_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("children_tag_id");
CREATE INDEX "benchmark_profile_snapshots_country_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("country_tag_id");
CREATE INDEX "benchmark_profile_snapshots_housing_type_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("housing_type_tag_id");
CREATE INDEX "benchmark_profile_snapshots_job_country_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("job_country_tag_id");
CREATE INDEX "benchmark_profile_snapshots_job_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("job_tag_id");
CREATE INDEX "benchmark_profile_snapshots_job_type_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("job_type_tag_id");
CREATE INDEX "benchmark_profile_snapshots_living_situation_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("living_situation_tag_id");
CREATE INDEX "benchmark_profile_snapshots_remote_type_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("remote_type_tag_id");
CREATE INDEX "benchmark_profile_snapshots_user_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("user_id");
CREATE INDEX "benchmark_profile_snapshots_work_time_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("work_time_tag_id");
CREATE INDEX "benchmark_profile_snapshots_years_of_experience_tag_id_idx" ON "public"."benchmark_profile_snapshots" USING "btree" ("years_of_experience_tag_id");
CREATE INDEX "instrument_historical_prices_submitted_by_idx" ON "public"."instrument_historical_prices" USING "btree" ("submitted_by");
CREATE INDEX "instrument_historical_prices_verified_by_idx" ON "public"."instrument_historical_prices" USING "btree" ("verified_by");
CREATE INDEX "profiles_age_tag_id_idx" ON "public"."profiles" USING "btree" ("age_tag_id");
CREATE INDEX "profiles_children_tag_id_idx" ON "public"."profiles" USING "btree" ("children_tag_id");
CREATE INDEX "profiles_country_tag_id_idx" ON "public"."profiles" USING "btree" ("country_tag_id");
CREATE INDEX "profiles_housing_type_tag_id_idx" ON "public"."profiles" USING "btree" ("housing_type_tag_id");
CREATE INDEX "profiles_job_country_tag_id_idx" ON "public"."profiles" USING "btree" ("job_country_tag_id");
CREATE INDEX "profiles_job_tag_id_idx" ON "public"."profiles" USING "btree" ("job_tag_id");
CREATE INDEX "profiles_job_type_tag_id_idx" ON "public"."profiles" USING "btree" ("job_type_tag_id");
CREATE INDEX "profiles_living_situation_tag_id_idx" ON "public"."profiles" USING "btree" ("living_situation_tag_id");
CREATE INDEX "profiles_preferred_currency_tag_id_idx" ON "public"."profiles" USING "btree" ("preferred_currency_tag_id");
CREATE INDEX "profiles_remote_type_tag_id_idx" ON "public"."profiles" USING "btree" ("remote_type_tag_id");
CREATE INDEX "profiles_work_time_tag_id_idx" ON "public"."profiles" USING "btree" ("work_time_tag_id");
CREATE INDEX "profiles_years_of_experience_tag_id_idx" ON "public"."profiles" USING "btree" ("years_of_experience_tag_id");
CREATE INDEX "recurring_transactions_category_tag_id_idx" ON "public"."recurring_transactions" USING "btree" ("category_tag_id");
CREATE INDEX "recurring_transactions_payment_type_tag_id_idx" ON "public"."recurring_transactions" USING "btree" ("payment_type_tag_id");
CREATE INDEX "recurring_transactions_user_category_id_idx" ON "public"."recurring_transactions" USING "btree" ("user_category_id");
CREATE INDEX "shared_expense_reimbursements_receivable_id_idx" ON "public"."shared_expense_reimbursements" USING "btree" ("receivable_id");
CREATE INDEX "transactions_category_tag_id_idx" ON "public"."transactions" USING "btree" ("category_tag_id");
CREATE INDEX "transactions_payment_type_tag_id_idx" ON "public"."transactions" USING "btree" ("payment_type_tag_id");
CREATE INDEX "transactions_user_category_id_idx" ON "public"."transactions" USING "btree" ("user_category_id");
CREATE INDEX "user_categories_parent_tag_id_idx" ON "public"."user_categories" USING "btree" ("parent_tag_id");
CREATE INDEX "user_investment_dividends_holding_id_idx" ON "public"."user_investment_dividends" USING "btree" ("holding_id");
CREATE INDEX "user_investment_dividends_instrument_id_idx" ON "public"."user_investment_dividends" USING "btree" ("instrument_id");
CREATE INDEX "user_investment_holding_history_holding_id_idx" ON "public"."user_investment_holding_history" USING "btree" ("holding_id");
CREATE INDEX "user_investment_holding_history_instrument_id_idx" ON "public"."user_investment_holding_history" USING "btree" ("instrument_id");
CREATE INDEX "user_investment_transactions_holding_id_idx" ON "public"."user_investment_transactions" USING "btree" ("holding_id");
CREATE INDEX "user_investment_transactions_instrument_id_idx" ON "public"."user_investment_transactions" USING "btree" ("instrument_id");
CREATE INDEX "user_liquidity_account_history_account_id_idx" ON "public"."user_liquidity_account_history" USING "btree" ("account_id");



ALTER TABLE ONLY "public"."balances"
    ADD CONSTRAINT "balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."benchmark_profile_snapshots"
    ADD CONSTRAINT "benchmark_profile_snapshots_age_tag_id_fkey" FOREIGN KEY ("age_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."benchmark_profile_snapshots"
    ADD CONSTRAINT "benchmark_profile_snapshots_children_tag_id_fkey" FOREIGN KEY ("children_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."benchmark_profile_snapshots"
    ADD CONSTRAINT "benchmark_profile_snapshots_country_tag_id_fkey" FOREIGN KEY ("country_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."benchmark_profile_snapshots"
    ADD CONSTRAINT "benchmark_profile_snapshots_housing_type_tag_id_fkey" FOREIGN KEY ("housing_type_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."benchmark_profile_snapshots"
    ADD CONSTRAINT "benchmark_profile_snapshots_job_country_tag_id_fkey" FOREIGN KEY ("job_country_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."benchmark_profile_snapshots"
    ADD CONSTRAINT "benchmark_profile_snapshots_job_tag_id_fkey" FOREIGN KEY ("job_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."benchmark_profile_snapshots"
    ADD CONSTRAINT "benchmark_profile_snapshots_job_type_tag_id_fkey" FOREIGN KEY ("job_type_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."benchmark_profile_snapshots"
    ADD CONSTRAINT "benchmark_profile_snapshots_living_situation_tag_id_fkey" FOREIGN KEY ("living_situation_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."benchmark_profile_snapshots"
    ADD CONSTRAINT "benchmark_profile_snapshots_month_start_fkey" FOREIGN KEY ("month_start") REFERENCES "public"."benchmark_runs"("month_start") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."benchmark_profile_snapshots"
    ADD CONSTRAINT "benchmark_profile_snapshots_remote_type_tag_id_fkey" FOREIGN KEY ("remote_type_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."benchmark_profile_snapshots"
    ADD CONSTRAINT "benchmark_profile_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."benchmark_profile_snapshots"
    ADD CONSTRAINT "benchmark_profile_snapshots_work_time_tag_id_fkey" FOREIGN KEY ("work_time_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."benchmark_profile_snapshots"
    ADD CONSTRAINT "benchmark_profile_snapshots_years_of_experience_tag_id_fkey" FOREIGN KEY ("years_of_experience_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."deletions"
    ADD CONSTRAINT "deletions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "expenses_category_tag_id_fkey" FOREIGN KEY ("category_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "expenses_payment_type_tag_id_fkey" FOREIGN KEY ("payment_type_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "expenses_user_category_id_fkey" FOREIGN KEY ("user_category_id") REFERENCES "public"."user_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instrument_historical_prices"
    ADD CONSTRAINT "instrument_historical_prices_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."investment_instruments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instrument_historical_prices"
    ADD CONSTRAINT "instrument_historical_prices_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."instrument_historical_prices"
    ADD CONSTRAINT "instrument_historical_prices_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."investment_instruments"
    ADD CONSTRAINT "investment_instruments_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_age_tag_id_fkey" FOREIGN KEY ("age_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_children_tag_id_fkey" FOREIGN KEY ("children_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_country_tag_id_fkey" FOREIGN KEY ("country_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_housing_type_tag_id_fkey" FOREIGN KEY ("housing_type_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_job_country_tag_id_fkey" FOREIGN KEY ("job_country_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_job_tag_id_fkey" FOREIGN KEY ("job_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_job_type_tag_id_fkey" FOREIGN KEY ("job_type_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_living_situation_tag_id_fkey" FOREIGN KEY ("living_situation_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_preferred_currency_tag_id_fkey" FOREIGN KEY ("preferred_currency_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_remote_type_tag_id_fkey" FOREIGN KEY ("remote_type_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_work_time_tag_id_fkey" FOREIGN KEY ("work_time_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_years_of_experience_tag_id_fkey" FOREIGN KEY ("years_of_experience_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recurring_transactions"
    ADD CONSTRAINT "recurring_transactions_category_tag_id_fkey" FOREIGN KEY ("category_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."recurring_transactions"
    ADD CONSTRAINT "recurring_transactions_payment_type_tag_id_fkey" FOREIGN KEY ("payment_type_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."recurring_transactions"
    ADD CONSTRAINT "recurring_transactions_user_category_id_fkey" FOREIGN KEY ("user_category_id") REFERENCES "public"."user_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."recurring_transactions"
    ADD CONSTRAINT "recurring_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roadmap_votes"
    ADD CONSTRAINT "roadmap_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shared_expense_receivables"
    ADD CONSTRAINT "shared_expense_receivables_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "public"."transactions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."shared_expense_receivables"
    ADD CONSTRAINT "shared_expense_receivables_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shared_expense_reimbursements"
    ADD CONSTRAINT "shared_expense_reimbursements_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "public"."transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shared_expense_reimbursements"
    ADD CONSTRAINT "shared_expense_reimbursements_receivable_id_fkey" FOREIGN KEY ("receivable_id") REFERENCES "public"."shared_expense_receivables"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shared_expense_reimbursements"
    ADD CONSTRAINT "shared_expense_reimbursements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_categories"
    ADD CONSTRAINT "user_categories_parent_tag_id_fkey" FOREIGN KEY ("parent_tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."user_categories"
    ADD CONSTRAINT "user_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_goals"
    ADD CONSTRAINT "user_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_investment_dividends"
    ADD CONSTRAINT "user_investment_dividends_holding_id_fkey" FOREIGN KEY ("holding_id") REFERENCES "public"."user_investment_holdings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_investment_dividends"
    ADD CONSTRAINT "user_investment_dividends_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."investment_instruments"("id");



ALTER TABLE ONLY "public"."user_investment_dividends"
    ADD CONSTRAINT "user_investment_dividends_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_investment_holding_history"
    ADD CONSTRAINT "user_investment_holding_history_holding_id_fkey" FOREIGN KEY ("holding_id") REFERENCES "public"."user_investment_holdings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_investment_holding_history"
    ADD CONSTRAINT "user_investment_holding_history_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."investment_instruments"("id");



ALTER TABLE ONLY "public"."user_investment_holding_history"
    ADD CONSTRAINT "user_investment_holding_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_investment_holdings"
    ADD CONSTRAINT "user_investment_holdings_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."investment_instruments"("id");



ALTER TABLE ONLY "public"."user_investment_holdings"
    ADD CONSTRAINT "user_investment_holdings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_investment_settings"
    ADD CONSTRAINT "user_investment_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_investment_transactions"
    ADD CONSTRAINT "user_investment_transactions_holding_id_fkey" FOREIGN KEY ("holding_id") REFERENCES "public"."user_investment_holdings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_investment_transactions"
    ADD CONSTRAINT "user_investment_transactions_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."investment_instruments"("id");



ALTER TABLE ONLY "public"."user_investment_transactions"
    ADD CONSTRAINT "user_investment_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_liquidity_account_history"
    ADD CONSTRAINT "user_liquidity_account_history_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."user_liquidity_accounts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_liquidity_account_history"
    ADD CONSTRAINT "user_liquidity_account_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_liquidity_accounts"
    ADD CONSTRAINT "user_liquidity_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Users delete own push subscriptions" ON "public"."push_subscriptions" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users read own notification preferences" ON "public"."notification_preferences" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users read own push subscriptions" ON "public"."push_subscriptions" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users update own notification preferences" ON "public"."notification_preferences" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."balances" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "balances_own_rows" ON "public"."balances" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."benchmark_profile_snapshots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."benchmark_runs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "benchmark_runs_no_client_access" ON "public"."benchmark_runs" TO "authenticated", "anon" USING (false) WITH CHECK (false);



CREATE POLICY "benchmark_snapshots_no_client_access" ON "public"."benchmark_profile_snapshots" TO "authenticated", "anon" USING (false) WITH CHECK (false);



ALTER TABLE "public"."deletions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deletions_own_row" ON "public"."deletions" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "expenses_own_rows" ON "public"."transactions" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."instrument_historical_prices" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "instrument_historical_prices_select_verified_or_own" ON "public"."instrument_historical_prices" FOR SELECT TO "authenticated" USING ((("status" = 'verified'::"text") OR (( SELECT "auth"."uid"() AS "uid") = "submitted_by")));



ALTER TABLE "public"."investment_instruments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "investment_instruments_select_authenticated" ON "public"."investment_instruments" FOR SELECT TO "authenticated" USING (("active" = true));



ALTER TABLE "public"."notification_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_own_row" ON "public"."profiles" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recurring_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "recurring_transactions_own_rows" ON "public"."recurring_transactions" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."roadmap_votes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "roadmap_votes_own_rows" ON "public"."roadmap_votes" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."shared_expense_receivables" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shared_expense_reimbursements" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "shared_expense_reimbursements_own_rows" ON "public"."shared_expense_reimbursements" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "shared_receivables_own_rows" ON "public"."shared_expense_receivables" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tags_select_authenticated" ON "public"."tags" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_categories_own_rows" ON "public"."user_categories" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."user_goals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_goals_own_rows" ON "public"."user_goals" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."user_investment_dividends" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_investment_dividends_own_rows" ON "public"."user_investment_dividends" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."user_investment_holding_history" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_investment_holding_history_insert_own" ON "public"."user_investment_holding_history" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "user_investment_holding_history_select_own" ON "public"."user_investment_holding_history" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "user_investment_holding_history_update_own" ON "public"."user_investment_holding_history" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."user_investment_holdings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_investment_holdings_own_rows" ON "public"."user_investment_holdings" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."user_investment_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_investment_settings_own_rows" ON "public"."user_investment_settings" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."user_investment_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_investment_transactions_own_rows" ON "public"."user_investment_transactions" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."user_liquidity_account_history" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_liquidity_account_history_insert_own" ON "public"."user_liquidity_account_history" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "user_liquidity_account_history_select_own" ON "public"."user_liquidity_account_history" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "user_liquidity_account_history_update_own" ON "public"."user_liquidity_account_history" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."user_liquidity_accounts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_liquidity_accounts_own_rows" ON "public"."user_liquidity_accounts" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_balance_history"("p_user_id" "uuid", "p_months" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_balance_history"("p_user_id" "uuid", "p_months" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_balance_history"("p_user_id" "uuid", "p_months" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_balance_ranking_pool"("p_user_ids" "uuid"[], "p_ignore_test_demo" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."get_balance_ranking_pool"("p_user_ids" "uuid"[], "p_ignore_test_demo" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_balance_ranking_pool"("p_user_ids" "uuid"[], "p_ignore_test_demo" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_benchmark_metric_rows"("p_user_ids" "uuid"[], "p_current_month" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_benchmark_metric_rows"("p_user_ids" "uuid"[], "p_current_month" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_benchmark_metric_rows"("p_user_ids" "uuid"[], "p_current_month" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_expense_ranking_pool"("p_user_ids" "uuid"[], "p_is_expense" boolean, "p_month" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_expense_ranking_pool"("p_user_ids" "uuid"[], "p_is_expense" boolean, "p_month" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_expense_ranking_pool"("p_user_ids" "uuid"[], "p_is_expense" boolean, "p_month" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_monthly_totals"("p_user_id" "uuid", "p_months" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_monthly_totals"("p_user_id" "uuid", "p_months" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_monthly_totals"("p_user_id" "uuid", "p_months" integer) TO "service_role";



-- Not granted to anon/authenticated on purpose: this only ever needs to run
-- as the event trigger defined above, never as a direct RPC call (Security
-- Advisor's "Public Can Execute SECURITY DEFINER Function" check).
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_expense_with_shared"("p_user_id" "uuid", "p_expense_id" bigint, "p_occurred_at" "date", "p_amount" numeric, "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint, "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint, "p_shared_mode" "text", "p_shared_total" numeric, "p_shared_own_share" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."update_expense_with_shared"("p_user_id" "uuid", "p_expense_id" bigint, "p_occurred_at" "date", "p_amount" numeric, "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint, "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint, "p_shared_mode" "text", "p_shared_total" numeric, "p_shared_own_share" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_expense_with_shared"("p_user_id" "uuid", "p_expense_id" bigint, "p_occurred_at" "date", "p_amount" numeric, "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint, "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint, "p_shared_mode" "text", "p_shared_total" numeric, "p_shared_own_share" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_transaction_with_shared"("p_user_id" "uuid", "p_transaction_id" bigint, "p_occurred_at" "date", "p_amount" numeric, "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint, "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint, "p_shared_mode" "text", "p_shared_total" numeric, "p_shared_own_share" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."update_transaction_with_shared"("p_user_id" "uuid", "p_transaction_id" bigint, "p_occurred_at" "date", "p_amount" numeric, "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint, "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint, "p_shared_mode" "text", "p_shared_total" numeric, "p_shared_own_share" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_transaction_with_shared"("p_user_id" "uuid", "p_transaction_id" bigint, "p_occurred_at" "date", "p_amount" numeric, "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint, "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint, "p_shared_mode" "text", "p_shared_total" numeric, "p_shared_own_share" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_transaction_with_shared"("p_user_id" "uuid", "p_transaction_id" bigint, "p_occurred_at" "date", "p_amount" numeric, "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint, "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint, "p_purpose" "text", "p_shared_mode" "text", "p_shared_total" numeric, "p_shared_own_share" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."update_transaction_with_shared"("p_user_id" "uuid", "p_transaction_id" bigint, "p_occurred_at" "date", "p_amount" numeric, "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint, "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint, "p_purpose" "text", "p_shared_mode" "text", "p_shared_total" numeric, "p_shared_own_share" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_transaction_with_shared"("p_user_id" "uuid", "p_transaction_id" bigint, "p_occurred_at" "date", "p_amount" numeric, "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint, "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint, "p_purpose" "text", "p_shared_mode" "text", "p_shared_total" numeric, "p_shared_own_share" numeric) TO "service_role";



GRANT ALL ON TABLE "public"."balances" TO "anon";
GRANT ALL ON TABLE "public"."balances" TO "authenticated";
GRANT ALL ON TABLE "public"."balances" TO "service_role";



GRANT ALL ON SEQUENCE "public"."balances_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."balances_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."balances_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."benchmark_profile_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."benchmark_profile_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."benchmark_profile_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."benchmark_runs" TO "anon";
GRANT ALL ON TABLE "public"."benchmark_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."benchmark_runs" TO "service_role";



GRANT ALL ON TABLE "public"."deletions" TO "anon";
GRANT ALL ON TABLE "public"."deletions" TO "authenticated";
GRANT ALL ON TABLE "public"."deletions" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."expenses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."expenses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."expenses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."instrument_historical_prices" TO "anon";
GRANT ALL ON TABLE "public"."instrument_historical_prices" TO "authenticated";
GRANT ALL ON TABLE "public"."instrument_historical_prices" TO "service_role";



GRANT ALL ON SEQUENCE "public"."instrument_historical_prices_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."instrument_historical_prices_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."instrument_historical_prices_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."investment_instruments" TO "anon";
GRANT ALL ON TABLE "public"."investment_instruments" TO "authenticated";
GRANT ALL ON TABLE "public"."investment_instruments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."investment_instruments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."investment_instruments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."investment_instruments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notification_preferences" TO "anon";
GRANT ALL ON TABLE "public"."notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."push_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."push_subscriptions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."push_subscriptions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."push_subscriptions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."recurring_transactions" TO "anon";
GRANT ALL ON TABLE "public"."recurring_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."recurring_transactions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."recurring_transactions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."recurring_transactions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."recurring_transactions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."roadmap_votes" TO "anon";
GRANT ALL ON TABLE "public"."roadmap_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."roadmap_votes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."roadmap_votes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."roadmap_votes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."roadmap_votes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."shared_expense_receivables" TO "anon";
GRANT ALL ON TABLE "public"."shared_expense_receivables" TO "authenticated";
GRANT ALL ON TABLE "public"."shared_expense_receivables" TO "service_role";



GRANT ALL ON SEQUENCE "public"."shared_expense_receivables_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."shared_expense_receivables_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."shared_expense_receivables_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."shared_expense_reimbursements" TO "anon";
GRANT ALL ON TABLE "public"."shared_expense_reimbursements" TO "authenticated";
GRANT ALL ON TABLE "public"."shared_expense_reimbursements" TO "service_role";



GRANT ALL ON SEQUENCE "public"."shared_expense_reimbursements_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."shared_expense_reimbursements_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."shared_expense_reimbursements_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tags_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tags_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tags_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_categories" TO "anon";
GRANT ALL ON TABLE "public"."user_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."user_categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_goals" TO "anon";
GRANT ALL ON TABLE "public"."user_goals" TO "authenticated";
GRANT ALL ON TABLE "public"."user_goals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_goals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_goals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_goals_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_investment_dividends" TO "anon";
GRANT ALL ON TABLE "public"."user_investment_dividends" TO "authenticated";
GRANT ALL ON TABLE "public"."user_investment_dividends" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_investment_dividends_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_investment_dividends_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_investment_dividends_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_investment_holding_history" TO "anon";
GRANT ALL ON TABLE "public"."user_investment_holding_history" TO "authenticated";
GRANT ALL ON TABLE "public"."user_investment_holding_history" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_investment_holding_history_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_investment_holding_history_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_investment_holding_history_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_investment_holdings" TO "anon";
GRANT ALL ON TABLE "public"."user_investment_holdings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_investment_holdings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_investment_holdings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_investment_holdings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_investment_holdings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_investment_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_investment_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_investment_settings" TO "service_role";



GRANT ALL ON TABLE "public"."user_investment_transactions" TO "anon";
GRANT ALL ON TABLE "public"."user_investment_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_investment_transactions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_investment_transactions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_investment_transactions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_investment_transactions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_liquidity_account_history" TO "anon";
GRANT ALL ON TABLE "public"."user_liquidity_account_history" TO "authenticated";
GRANT ALL ON TABLE "public"."user_liquidity_account_history" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_liquidity_account_history_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_liquidity_account_history_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_liquidity_account_history_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_liquidity_accounts" TO "anon";
GRANT ALL ON TABLE "public"."user_liquidity_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."user_liquidity_accounts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_liquidity_accounts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_liquidity_accounts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_liquidity_accounts_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







