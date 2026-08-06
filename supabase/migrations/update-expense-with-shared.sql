-- Updates an existing transaction without changing its id and keeps the
-- optional shared-expense receivable in the same database transaction.
-- `p_shared_mode`: unchanged | set | remove.

create or replace function public.update_expense_with_shared(
  p_user_id uuid,
  p_expense_id bigint,
  p_occurred_at date,
  p_amount numeric,
  p_is_expense boolean,
  p_notes text,
  p_payment_type_tag_id bigint,
  p_category_tag_id bigint,
  p_user_category_id bigint,
  p_balance_asset_key text,
  p_balance_detail_type text,
  p_balance_detail_id bigint,
  p_shared_mode text default 'unchanged',
  p_shared_total numeric default null,
  p_shared_own_share numeric default null
) returns bigint
language plpgsql
security invoker
set search_path = public
as $$
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
