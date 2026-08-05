// Belongs in components/ despite reading LanguageContext: it's a generic picker reused
// across income/outflow/recurring sections, not tied to one business domain (see
// CONTRIBUTING.md's components/ vs sections/ rule).
import React, { useContext, useState, useEffect } from 'react';
import { Select, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTag, faSpinner, faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { getMuiSelectMenuProps } from './ThemedSelect';
import {
  Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton,
  ModalBody, ModalFooter, FieldLabel, FieldInput, SubmitButton,
  getSelectSx, InfoHint,
} from './multiInsert/SharedStyles';
import { sortTagsByLanguage } from '../utils/sortingUtils';
import { translateTag } from '../data/tagTranslations';
import { getCategoryColor } from '../data/categoryColors';

const CREATE_NEW_VALUE = '__create_new__';

/**
 * CategoryPicker — official-category select that also surfaces the user's
 * own custom sub-categories (nested under their parent) and lets them create
 * a new one inline. The value sent to the backend for stats/rankings is
 * always the official parent tag (`categoryKey`); the custom category id is
 * a separate, purely-cosmetic field.
 *
 * @param {Object} props
 * @param {Object} props.theme
 * @param {Array<{index:number,label:string}>} props.officialTags
 * @param {Array<{id:number,parentIndex:number,parentType?:number,label:string}>} props.customCategories
 * @param {'expense'|'income'} props.categoryType
 * @param {number|''} props.categoryKey - selected official tag index
 * @param {number|null} props.userCategoryId - selected custom category id, if any
 * @param {(sel: {categoryKey:number, categoryValue:string, userCategoryId:number|null, userCategoryLabel:string|null}) => void} props.onSelect
 * @param {(parentIndex:number, label:string) => Promise<{id:number,parentIndex:number,label:string}>} props.onCreateCategory
 * @param {boolean} [props.disabled]
 * @param {string} props.placeholder
 */
export default function CategoryPicker({
  theme,
  officialTags,
  customCategories,
  categoryType,
  categoryKey,
  userCategoryId,
  onSelect,
  onCreateCategory,
  disabled,
  placeholder,
}) {
  const { language, translations } = useContext(LanguageContext);
  const t = translations.insert?.categoryPicker || {};
  const selectSx = getSelectSx(theme);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogParentIndex, setDialogParentIndex] = useState('');
  const [dialogLabel, setDialogLabel] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Parent categories are collapsed by default and expand on demand — with
  // many sub-categories, showing them all flattened made the currently-open
  // dropdown too long to scan. The parent of whatever is already selected
  // stays expanded so the current choice is visible in context.
  const [expandedParents, setExpandedParents] = useState(() => new Set());
  const toggleParentExpanded = (index, e) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const sortedTags = sortTagsByLanguage(officialTags || [], language, categoryType);
  const expectedParentType = categoryType === 'expense' ? 0 : 1;
  const safeCustomCategories = (customCategories || []).filter((category) =>
    category.parentType === undefined || category.parentType === expectedParentType
  );

  // Keep the parent of the currently-selected sub-category expanded, even if
  // the selection changes externally (e.g. opening the picker for a different
  // existing transaction) without remounting this component.
  useEffect(() => {
    if (userCategoryId == null) return;
    const custom = safeCustomCategories.find((c) => c.id === userCategoryId);
    if (!custom) return;
    setExpandedParents((prev) => (prev.has(custom.parentIndex) ? prev : new Set(prev).add(custom.parentIndex)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCategoryId]);

  // Composite select value so official tags and custom sub-categories never collide: "off:<index>" | "cus:<id>"
  const selectValue = userCategoryId != null
    ? `cus:${userCategoryId}`
    : (categoryKey === '' ? '' : `off:${categoryKey}`);

  const findOfficialLabel = (index) => {
    const tag = officialTags?.find((tg) => tg.index === index);
    return tag ? translateTag(tag.label, language, categoryType) : '';
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === CREATE_NEW_VALUE) {
      setDialogParentIndex(categoryKey !== '' ? categoryKey : (sortedTags[0]?.index ?? ''));
      setDialogLabel('');
      setDialogError('');
      setDialogOpen(true);
      return;
    }
    const [kind, idStr] = String(raw).split(':');
    if (kind === 'off') {
      const index = Number(idStr);
      onSelect({
        categoryKey: index,
        categoryValue: findOfficialLabel(index),
        userCategoryId: null,
        userCategoryLabel: null,
      });
    } else if (kind === 'cus') {
      const id = Number(idStr);
      const custom = safeCustomCategories.find((c) => c.id === id);
      if (!custom) return;
      onSelect({
        categoryKey: custom.parentIndex,
        categoryValue: findOfficialLabel(custom.parentIndex),
        userCategoryId: custom.id,
        userCategoryLabel: custom.label,
      });
    }
  };

  const renderSelectedLabel = () => {
    if (selectValue === '') return placeholder;
    if (userCategoryId != null) {
      const custom = safeCustomCategories.find((c) => c.id === userCategoryId);
      return custom ? custom.label : placeholder;
    }
    return findOfficialLabel(categoryKey) || placeholder;
  };

  const handleCreate = async () => {
    const label = dialogLabel.trim();
    if (label === '') {
      setDialogError(t.errorEmptyLabel);
      return;
    }
    if (dialogParentIndex === '') {
      setDialogError(t.errorNoParent);
      return;
    }
    setIsCreating(true);
    setDialogError('');
    try {
      const created = await onCreateCategory(Number(dialogParentIndex), label);
      onSelect({
        categoryKey: created.parentIndex,
        categoryValue: findOfficialLabel(created.parentIndex),
        userCategoryId: created.id,
        userCategoryLabel: created.label,
      });
      setDialogOpen(false);
    } catch {
      setDialogError(t.errorCreateFailed);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Select
        value={selectValue}
        onChange={handleChange}
        sx={selectSx}
        displayEmpty
        size="small"
        MenuProps={getMuiSelectMenuProps(theme)}
        disabled={disabled}
        renderValue={renderSelectedLabel}
      >
        <MenuItem
          value={CREATE_NEW_VALUE}
          sx={{
            color: theme.buttonBackgroundColor || '#3b82f6',
            fontWeight: 700,
            borderBottom: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
            mb: 0.5,
          }}
        >
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
          {t.createNew}
        </MenuItem>
        {sortedTags.flatMap((tag) => {
          const label = translateTag(tag.label, language, categoryType);
          const children = safeCustomCategories.filter((c) => c.parentIndex === tag.index);
          const isExpanded = expandedParents.has(tag.index);
          return [
            <MenuItem key={`off-${tag.index}`} value={`off:${tag.index}`} sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                background: getCategoryColor(label, language), marginRight: 8, flexShrink: 0,
              }} />
              <span style={{ flex: 1 }}>{label}</span>
              {children.length > 0 && (
                <span
                  role="button"
                  aria-label={isExpanded ? t.collapseCategory : t.expandCategory}
                  onClick={(e) => toggleParentExpanded(tag.index, e)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    marginLeft: 8, padding: '2px 6px', borderRadius: 6,
                    fontSize: '0.72rem', fontWeight: 500, opacity: 0.6,
                  }}
                >
                  {children.length}
                  <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} style={{ fontSize: 10 }} />
                </span>
              )}
            </MenuItem>,
            ...(isExpanded ? children.map((c) => (
              <MenuItem key={`cus-${c.id}`} value={`cus:${c.id}`} sx={{ pl: 4, fontSize: '0.85rem', opacity: 0.85 }}>
                <FontAwesomeIcon icon={faTag} style={{ fontSize: 10, marginRight: 8, opacity: 0.6 }} />
                <span style={{ opacity: 0.7, marginRight: 6 }}>↳</span>
                {c.label}
              </MenuItem>
            )) : []),
          ];
        })}
      </Select>

      {dialogOpen && (
        <Overlay onClick={(e) => { if (e.target === e.currentTarget && !isCreating) setDialogOpen(false); }}>
          <ModalContainer theme={theme} $maxWidth="420px">
            <ModalHeader theme={theme}>
              <ModalTitle theme={theme}>
                <h2>{t.dialogTitle}</h2>
                <p>{t.dialogSubtitle}</p>
              </ModalTitle>
              {!isCreating && <CloseButton theme={theme} onClick={() => setDialogOpen(false)}>✕</CloseButton>}
            </ModalHeader>
            <ModalBody>
              <div>
                <FieldLabel theme={theme}>{t.parentLabel}</FieldLabel>
                <Select
                  value={dialogParentIndex}
                  onChange={(e) => setDialogParentIndex(e.target.value)}
                  sx={selectSx}
                  size="small"
                  MenuProps={getMuiSelectMenuProps(theme)}
                  disabled={isCreating}
                >
                  {sortedTags.map((tag) => (
                    <MenuItem key={tag.index} value={tag.index}>
                      {translateTag(tag.label, language, categoryType)}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <div>
                <FieldLabel theme={theme}>{t.labelLabel}</FieldLabel>
                <FieldInput
                  theme={theme}
                  type="text"
                  value={dialogLabel}
                  onChange={(e) => setDialogLabel(e.target.value)}
                  maxLength={40}
                  placeholder={t.labelPlaceholder}
                  disabled={isCreating}
                  autoFocus
                />
              </div>
              {dialogError && <InfoHint theme={theme}>{dialogError}</InfoHint>}
            </ModalBody>
            <ModalFooter theme={theme}>
              <SubmitButton theme={theme} onClick={handleCreate} disabled={isCreating}>
                <FontAwesomeIcon icon={isCreating ? faSpinner : faPlus} spin={isCreating} />
                {t.createAction}
              </SubmitButton>
            </ModalFooter>
          </ModalContainer>
        </Overlay>
      )}
    </>
  );
}
