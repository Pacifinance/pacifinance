import React, {useEffect, useMemo, useState} from 'react';
import styled from 'styled-components';
import ThemedSelect from './ThemedSelect';
import type {SharedExpenseReceivableDto} from '../types/api';

interface TransactionRow { id: number; amount: number; notes?: string; }
interface ModalLabels {
  outflowTitle: string; incomeTitle: string; splitByPeople: string; specifyShare: string;
  people: string; ownShare: string; owed: string; chooseExpense: string; cancel: string;
  confirm: string; noReceivables: string; reimbursementHelp: string;
  editOutflowTitle?: string; update?: string;
}
interface SharedTransactionLinkModalProps {
  theme: Record<string, string> & {mode: string};
  mode: 'outflow' | 'income'; transaction: TransactionRow;
  receivables: SharedExpenseReceivableDto[]; currencySymbol: string; labels: ModalLabels;
  existingReceivable?: SharedExpenseReceivableDto | null;
  onClose: () => void; onConfirm: (value: number) => Promise<void>;
}

const Backdrop = styled.div`position:fixed;inset:0;z-index:1400;display:grid;place-items:center;padding:1rem;background:rgba(2,6,23,.66);backdrop-filter:blur(3px);`;
const Dialog = styled.div`width:min(460px,100%);display:grid;gap:1rem;padding:1.1rem;border-radius:14px;background:${p => p.theme.backgroundColor};color:${p => p.theme.textColor};border:1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,.14)' : 'rgba(15,23,42,.12)'};box-shadow:0 24px 70px rgba(0,0,0,.35);`;
const Title = styled.h3`margin:0;font-size:1rem;`;
const Summary = styled.div`padding:.7rem;border-radius:9px;background:${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,.05)' : 'rgba(15,23,42,.04)'};font-size:.8rem;overflow-wrap:anywhere;`;
const Segments = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:.4rem;`;
const Segment = styled.button<{$active:boolean}>`border:1px solid ${p => p.$active ? p.theme.buttonBackgroundColor : (p.theme.mode === 'dark' ? 'rgba(255,255,255,.13)' : 'rgba(15,23,42,.12)')};border-radius:8px;padding:.55rem;background:${p => p.$active ? `${p.theme.buttonBackgroundColor}22` : 'transparent'};color:${p => p.theme.textColor};font-weight:650;cursor:pointer;`;
const Field = styled.label`display:grid;gap:.35rem;font-size:.78rem;font-weight:650;`;
const Control = styled.input`width:100%;box-sizing:border-box;padding:.6rem .7rem;border-radius:8px;border:1px solid ${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,.17)' : 'rgba(15,23,42,.14)'};background:${p => p.theme.mode === 'dark' ? 'rgba(255,255,255,.07)' : '#fff'};color:${p => p.theme.textColor};`;
const Preview = styled.div`font-size:.78rem;opacity:.78;`;
const Help = styled.p`margin:0;font-size:.75rem;line-height:1.45;opacity:.7;`;
const Actions = styled.div`display:flex;justify-content:flex-end;gap:.5rem;`;
const Button = styled.button<{$primary?:boolean}>`border:0;border-radius:8px;padding:.6rem .85rem;background:${p => p.$primary ? p.theme.buttonBackgroundColor : (p.theme.mode === 'dark' ? 'rgba(255,255,255,.1)' : '#e2e8f0')};color:${p => p.$primary ? '#fff' : p.theme.textColor};font-weight:700;cursor:pointer;&:disabled{opacity:.5;cursor:not-allowed;}`;

export default function SharedTransactionLinkModal({theme, mode, transaction, receivables, existingReceivable, currencySymbol, labels, onClose, onConfirm}: SharedTransactionLinkModalProps) {
  const ratio = existingReceivable ? existingReceivable.totalAmount / existingReceivable.ownShare : 2;
  const inferredPeople = Number.isInteger(ratio) && ratio >= 2 ? ratio : null;
  const [method, setMethod] = useState<'people'|'share'>(inferredPeople ? 'people' : 'share');
  const [people, setPeople] = useState<number | string>(inferredPeople ?? 2);
  const [share, setShare] = useState((existingReceivable?.ownShare ?? transaction.amount / 2).toFixed(2));
  const [receivableId, setReceivableId] = useState('');
  const [saving, setSaving] = useState(false);
  const peopleNumber = Number(people);
  const validPeople = Number.isInteger(peopleNumber) && peopleNumber >= 2;
  useEffect(() => {
    if (method === 'people' && validPeople) setShare((transaction.amount / peopleNumber).toFixed(2));
  }, [method, peopleNumber, transaction.amount, validPeople]);
  const ownShare = method === 'people' ? (validPeople ? transaction.amount / peopleNumber : Number.NaN) : Number(share);
  const valid = mode === 'outflow' ? Number.isFinite(ownShare) && ownShare >= 0 && ownShare < transaction.amount : Boolean(receivableId);
  const pending = useMemo(() => receivables.filter(item => item.status !== 'settled'), [receivables]);
  const submit = async () => { if (!valid) return; setSaving(true); try { await onConfirm(mode === 'outflow' ? ownShare : Number(receivableId)); } finally { setSaving(false); } };

  return <Backdrop role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <Dialog theme={theme} role="dialog" aria-modal="true" aria-labelledby="shared-link-title">
      <Title id="shared-link-title">{mode === 'outflow' ? (existingReceivable ? labels.editOutflowTitle : labels.outflowTitle) : labels.incomeTitle}</Title>
      <Summary theme={theme}>{transaction.notes || '—'} · {currencySymbol}{transaction.amount.toFixed(2)}</Summary>
      {mode === 'outflow' ? <>
        <Segments><Segment type="button" theme={theme} $active={method === 'people'} onClick={() => setMethod('people')}>{labels.splitByPeople}</Segment><Segment type="button" theme={theme} $active={method === 'share'} onClick={() => setMethod('share')}>{labels.specifyShare}</Segment></Segments>
        {method === 'people' ? <Field>{labels.people}<Control theme={theme} type="number" min="2" step="1" value={people} onChange={e => setPeople(e.target.value)} onBlur={() => { if (!validPeople) setPeople(2); }}/></Field> : <Field>{labels.ownShare}<Control theme={theme} type="number" min="0" max={transaction.amount} step="0.01" value={share} onChange={e => setShare(e.target.value)}/></Field>}
        <Preview>{labels.ownShare}: {Number.isFinite(ownShare) ? `${currencySymbol}${ownShare.toFixed(2)}` : '—'} · {labels.owed}: {Number.isFinite(ownShare) ? `${currencySymbol}${Math.max(0, transaction.amount - ownShare).toFixed(2)}` : '—'}</Preview>
      </> : <>
        <Field>{labels.chooseExpense}<ThemedSelect style={{width: '100%'}} value={receivableId} onChange={e => setReceivableId(e.target.value)}><option value="">{pending.length ? `— ${labels.chooseExpense} —` : labels.noReceivables}</option>{pending.map(item => <option key={item.id} value={item.id}>{item.notes || '—'} · {currencySymbol}{Math.max(0, item.receivableAmount - item.settledAmount).toFixed(2)}</option>)}</ThemedSelect></Field>
        <Help>{labels.reimbursementHelp}</Help>
      </>}
      <Actions><Button theme={theme} type="button" onClick={onClose}>{labels.cancel}</Button><Button theme={theme} type="button" $primary disabled={!valid || saving} onClick={submit}>{existingReceivable ? labels.update : labels.confirm}</Button></Actions>
    </Dialog>
  </Backdrop>;
}
