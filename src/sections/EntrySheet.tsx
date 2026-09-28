/**
 * EntrySheet — the detailed add form (outflow / income / balance), opened on
 * top of any page from the "+" menu or any `?add=` link (see
 * utils/entrySheet.ts). It renders InsertValues in "entry" mode, so every
 * save path (balance deltas, past-month choices, duplicate checks, multi
 * insert, vouchers) is the exact same code the old insert page used.
 *
 * Desktop: centered dialog. Mobile (≤600px): full-height bottom sheet
 * (SharedStyles' Overlay/ModalContainer already switch layout there).
 * Deliberately NOT closed by a backdrop click: a long, half-filled form
 * shouldn't vanish on a stray tap — close button, Escape or back button only.
 */
import React, { lazy, Suspense, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { UserContext } from '../contexts/UserContext';
import { PrivacyContext } from '../contexts/PrivacyContext';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody,
} from '../components/multiInsert/SharedStyles';
import type { SheetEntryType } from '../utils/entrySheet';

const InsertValues = lazy(() => import('./InsertValues'));

export interface EntryPrefill {
  amount?: string;
  categoryIndex?: number | string;
  userCategoryId?: number | null;
  note?: string;
}

interface EntrySheetProps {
  theme: { textColor?: string; mode?: string; [key: string]: unknown };
  type: SheetEntryType;
  month?: { month: number; year: number } | null;
  prefill?: EntryPrefill | null;
  onClose: () => void;
}

export default function EntrySheet({ theme, type, month = null, prefill = null, onClose }: EntrySheetProps) {
  const { translations } = useContext(LanguageContext);
  const { userData, handleSetIsUpdated } = useContext(UserContext) || {};
  const { isHidden } = useContext(PrivacyContext) || {};

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <Overlay theme={theme} role="dialog" aria-modal="true" aria-label={translations?.transactionsPage?.entrySheetTitle}>
      <ModalContainer theme={theme} $maxWidth="1100px">
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <h2>{translations?.transactionsPage?.entrySheetTitle}</h2>
          </ModalTitle>
          <CloseButton theme={theme} onClick={onClose} aria-label={translations?.general?.close || 'Close'}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </ModalHeader>
        <ModalBody theme={theme}>
          <Suspense fallback={null}>
            <InsertValues
              theme={theme}
              userData={userData}
              handleSetIsUpdated={handleSetIsUpdated}
              isHidden={isHidden}
              mode="entry"
              entryType={type}
              initialBalanceMonth={month}
              prefill={prefill}
            />
          </Suspense>
        </ModalBody>
      </ModalContainer>
    </Overlay>
  );
}
