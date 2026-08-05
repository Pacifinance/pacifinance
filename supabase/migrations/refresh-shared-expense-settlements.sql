-- Keep a receivable's settled total correct when a linked income is deleted
-- or replaced later. Imports also refresh this value explicitly; this trigger
-- makes the relationship safe for every UI workflow.
create or replace function public.refresh_shared_expense_settled_amount()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_receivable_id bigint := coalesce(new.receivable_id, old.receivable_id);
begin
  update public.shared_expense_receivables
  set settled_amount = coalesce((
    select sum(amount)
    from public.shared_expense_reimbursements
    where receivable_id = target_receivable_id
  ), 0)
  where id = target_receivable_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists refresh_shared_expense_settled_amount_trigger
  on public.shared_expense_reimbursements;

create trigger refresh_shared_expense_settled_amount_trigger
after insert or update or delete on public.shared_expense_reimbursements
for each row execute function public.refresh_shared_expense_settled_amount();
