import React, { useContext, useState } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useServices } from '../contexts/ServiceContext';
import type { FeedbackType } from '../services/feedbackService';

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 1000;

export default function FeedbackForm() {
  const { theme } = useContext(ThemeContext);
  const { translations } = useContext(LanguageContext);
  const { showError } = useToast();
  const { feedbackService } = useServices();
  const t = translations.feedback;

  const [type, setType] = useState<FeedbackType>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [issueUrl, setIssueUrl] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.7rem',
    borderRadius: '8px',
    border: `1px solid ${theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
    background: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
    color: theme.textColor,
    fontSize: '0.85rem',
    marginBottom: '0.6rem',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || submitting) return;

    setSubmitting(true);
    try {
      const result = await feedbackService.submitFeedback({
        type,
        title: title.trim().slice(0, TITLE_MAX),
        description: description.trim().slice(0, DESCRIPTION_MAX),
        page: window.location.pathname,
      });
      setIssueUrl(result.issueUrl);
      setTitle('');
      setDescription('');
    } catch (_error) {
      showError(t.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (issueUrl) {
    return (
      <div style={{ fontSize: '0.85rem' }}>
        <p style={{ marginBottom: '0.5rem' }}>{t.success}</p>
        <a href={issueUrl} target="_blank" rel="noopener noreferrer" style={{ color: theme.secondaryColor, fontWeight: 600 }}>
          {t.viewIssue}
        </a>
        <div style={{ marginTop: '0.75rem' }}>
          <button
            type="button"
            className="link-button"
            onClick={() => setIssueUrl(null)}
            style={{ color: theme.secondaryColor, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
          >
            {t.sendAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-umami-event="feedback-form-submit">
      <select
        value={type}
        onChange={(e) => setType(e.target.value as FeedbackType)}
        style={inputStyle}
      >
        <option value="bug">{t.typeBug}</option>
        <option value="idea">{t.typeIdea}</option>
        <option value="other">{t.typeOther}</option>
      </select>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t.titlePlaceholder}
        maxLength={TITLE_MAX}
        style={inputStyle}
        required
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t.descriptionPlaceholder}
        maxLength={DESCRIPTION_MAX}
        rows={3}
        style={{ ...inputStyle, resize: 'vertical' }}
        required
      />

      <button
        type="submit"
        disabled={submitting || !title.trim() || !description.trim()}
        style={{
          padding: '0.5rem 1.1rem',
          borderRadius: '8px',
          border: 'none',
          background: theme.secondaryColor,
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.85rem',
          cursor: submitting ? 'default' : 'pointer',
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? t.submitting : t.submit}
      </button>
    </form>
  );
}
