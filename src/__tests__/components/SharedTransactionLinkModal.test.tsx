import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import SharedTransactionLinkModal from '../../components/SharedTransactionLinkModal';

const theme = {mode: 'dark', backgroundColor: '#202833', textColor: '#fff', buttonBackgroundColor: '#079164'};
const labels = {
  outflowTitle: 'Split expense', editOutflowTitle: 'Edit shared expense', incomeTitle: 'Link reimbursement',
  splitByPeople: 'Split by people', specifyShare: 'Enter my share', people: 'People', ownShare: 'My share',
  owed: 'Owed', chooseExpense: 'Expense', cancel: 'Cancel', confirm: 'Confirm', update: 'Update',
  noReceivables: 'None', reimbursementHelp: 'Help',
};

describe('SharedTransactionLinkModal existing split', () => {
  it('shows and updates the inferred people count instead of offering a second split', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<SharedTransactionLinkModal
      theme={theme}
      mode="outflow"
      transaction={{id: 7, amount: 40, notes: 'Taxi'}}
      receivables={[]}
      existingReceivable={{id: 3, date: '2026-07-01', notes: 'Taxi', totalAmount: 40, ownShare: 10, receivableAmount: 30, settledAmount: 0, status: 'pending', expenseId: 7}}
      currencySymbol="€"
      labels={labels}
      onClose={vi.fn()}
      onConfirm={onConfirm}
    />);

    expect(screen.getByRole('heading', {name: 'Edit shared expense'})).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveValue(4);
    fireEvent.change(screen.getByRole('spinbutton'), {target: {value: ''}});
    expect(screen.getByRole('spinbutton')).toHaveValue(null);
    fireEvent.change(screen.getByRole('spinbutton'), {target: {value: '5'}});
    fireEvent.click(screen.getByRole('button', {name: 'Update'}));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith(8));
  });
});
