-- Lets a single transaction record its amount as split across two balance
-- sources — e.g. a meal-voucher purchase where part comes out of a
-- fixed-denomination voucher account (see user_liquidity_accounts.unit_value,
-- add-liquidity-account-denomination.sql) and the remainder off a card/cash
-- account, shown and edited as ONE row rather than two linked transactions.
--
-- balance_asset_key_2/detail_type_2/detail_id_2 mirror the existing primary
-- balance_asset_key/detail_type/detail_id columns (same shape, same meaning).
-- balance_amount_2 is the EUR amount taken from the SECOND source; the
-- primary source's implied share is `amount - balance_amount_2`.
--
-- All four nullable: a transaction with no split (the vast majority) leaves
-- them null, unchanged from before this migration. A split is only
-- meaningful together with a primary balance_asset_key — enforced
-- application-side (see sanitizeBalanceSource in
-- server/src/routes/private/transactions.ts), not by a DB constraint, to
-- match how the primary/detail relationship is already validated.

alter table public.transactions
  add column if not exists balance_asset_key_2 text,
  add column if not exists balance_detail_type_2 text,
  add column if not exists balance_detail_id_2 bigint,
  add column if not exists balance_amount_2 numeric;

alter table public.transactions
  drop constraint if exists transactions_balance_asset_key_2_check,
  add constraint transactions_balance_asset_key_2_check
  check (balance_asset_key_2 in ('bank', 'cash', 'digitalServices', 'emergencyFund',
    'stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'commodities'));

alter table public.transactions
  drop constraint if exists transactions_balance_detail_type_2_check,
  add constraint transactions_balance_detail_type_2_check
  check (balance_detail_type_2 in ('liquidity', 'investment'));

alter table public.transactions
  drop constraint if exists transactions_balance_amount_2_check,
  add constraint transactions_balance_amount_2_check
  check (balance_amount_2 is null or balance_amount_2 > 0);

-- Adds the same two columns to update_transaction_with_shared (the RPC used
-- by POST /api/transactions/update — see server/src/db/models/transactions.ts
-- updateExisting). Postgres treats a changed argument list as a distinct
-- overload rather than replacing the existing function in place (this
-- codebase already has one such precedent: update_transaction_with_shared
-- itself once gained a p_purpose argument the same way) — the old 16-argument
-- overload below is left in place, unused, exactly like that prior case.
CREATE OR REPLACE FUNCTION "public"."update_transaction_with_shared"(
  "p_user_id" "uuid", "p_transaction_id" bigint, "p_occurred_at" "date", "p_amount" numeric,
  "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint,
  "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint,
  "p_purpose" "text", "p_shared_mode" "text" DEFAULT 'unchanged'::"text", "p_shared_total" numeric DEFAULT NULL::numeric,
  "p_shared_own_share" numeric DEFAULT NULL::numeric, "p_balance_asset_key_2" "text" DEFAULT NULL::"text",
  "p_balance_detail_type_2" "text" DEFAULT NULL::"text", "p_balance_detail_id_2" bigint DEFAULT NULL::bigint,
  "p_balance_amount_2" numeric DEFAULT NULL::numeric
) RETURNS bigint
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

  if p_balance_asset_key_2 is not null and (
    p_balance_asset_key is null
    or p_balance_amount_2 is null
    or p_balance_amount_2 <= 0
    or p_balance_amount_2 >= v_effective_amount
  ) then
    raise exception 'invalid balance split';
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
    balance_detail_id = p_balance_detail_id,
    balance_asset_key_2 = p_balance_asset_key_2,
    balance_detail_type_2 = p_balance_detail_type_2,
    balance_detail_id_2 = p_balance_detail_id_2,
    balance_amount_2 = p_balance_amount_2
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

GRANT ALL ON FUNCTION "public"."update_transaction_with_shared"(
  "p_user_id" "uuid", "p_transaction_id" bigint, "p_occurred_at" "date", "p_amount" numeric,
  "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint,
  "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint,
  "p_purpose" "text", "p_shared_mode" "text", "p_shared_total" numeric,
  "p_shared_own_share" numeric, "p_balance_asset_key_2" "text",
  "p_balance_detail_type_2" "text", "p_balance_detail_id_2" bigint,
  "p_balance_amount_2" numeric
) TO "anon";
GRANT ALL ON FUNCTION "public"."update_transaction_with_shared"(
  "p_user_id" "uuid", "p_transaction_id" bigint, "p_occurred_at" "date", "p_amount" numeric,
  "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint,
  "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint,
  "p_purpose" "text", "p_shared_mode" "text", "p_shared_total" numeric,
  "p_shared_own_share" numeric, "p_balance_asset_key_2" "text",
  "p_balance_detail_type_2" "text", "p_balance_detail_id_2" bigint,
  "p_balance_amount_2" numeric
) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_transaction_with_shared"(
  "p_user_id" "uuid", "p_transaction_id" bigint, "p_occurred_at" "date", "p_amount" numeric,
  "p_is_expense" boolean, "p_notes" "text", "p_payment_type_tag_id" bigint, "p_category_tag_id" bigint,
  "p_user_category_id" bigint, "p_balance_asset_key" "text", "p_balance_detail_type" "text", "p_balance_detail_id" bigint,
  "p_purpose" "text", "p_shared_mode" "text", "p_shared_total" numeric,
  "p_shared_own_share" numeric, "p_balance_asset_key_2" "text",
  "p_balance_detail_type_2" "text", "p_balance_detail_id_2" bigint,
  "p_balance_amount_2" numeric
) TO "service_role";
