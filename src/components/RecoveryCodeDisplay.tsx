import React, { useState } from 'react';
import { openPrintableRecoveryCard, downloadRecoveryCardText, type RecoveryCardLabels } from '../utils/recoveryCard';

// Belongs in components/ despite having no context: it's a generic, fully prop-driven
// recovery-code presentation reused by both sign-up and account-recovery flows, not tied
// to one business domain (see CONTRIBUTING.md's components/ vs sections/ rule).

interface RecoveryCodeDisplayProps {
  theme: { secondaryColor: string; mode: string };
  userId: string;
  base32: string;
  words: string;
  introText: string;
  blockLabel: string;
  wordsLabel: string;
  copyLabel: string;
  copiedLabel: string;
  downloadCardLabel: string;
  downloadTextLabel: string;
  cardLabels: RecoveryCardLabels;
}

export default function RecoveryCodeDisplay({
  theme, userId, base32, words, introText, blockLabel, wordsLabel,
  copyLabel, copiedLabel, downloadCardLabel, downloadTextLabel, cardLabels,
}: RecoveryCodeDisplayProps) {
  const [copiedField, setCopiedField] = useState<'block' | 'words' | null>(null);

  const copy = (field: 'block' | 'words') => {
    const value = field === 'block' ? base32 : words;
    if ('clipboard' in navigator) navigator.clipboard.writeText(value);
    setCopiedField(field);
  };

  const content = { userId, base32, words };

  return (
    <div
      className="p-4 rounded-lg border-2 text-center"
      style={{
        backgroundColor: theme.mode === 'dark' ? `${theme.secondaryColor}15` : `${theme.secondaryColor}10`,
        borderColor: theme.secondaryColor,
        borderStyle: 'dashed',
      }}
    >
      <div className="text-sm opacity-70 mb-2">{introText}</div>
      <div className="text-xs opacity-60 mb-1">{blockLabel}</div>
      <div className="text-base font-mono font-bold mb-3" style={{ color: theme.secondaryColor }}>
        {base32}
      </div>
      <button
        type="button"
        onClick={() => copy('block')}
        className="text-xs underline mb-3"
        style={{ color: theme.secondaryColor }}
      >
        {copiedField === 'block' ? copiedLabel : copyLabel}
      </button>
      <div className="text-xs opacity-60 mb-1">{wordsLabel}</div>
      <div className="text-sm font-mono font-bold mb-1" style={{ color: theme.secondaryColor }}>
        {words}
      </div>
      <button
        type="button"
        onClick={() => copy('words')}
        className="text-xs underline"
        style={{ color: theme.secondaryColor }}
      >
        {copiedField === 'words' ? copiedLabel : copyLabel}
      </button>

      <div className="flex gap-2 justify-center mt-4">
        <button
          type="button"
          onClick={() => openPrintableRecoveryCard(content, cardLabels)}
          className="text-xs px-3 py-2 rounded-lg font-semibold"
          style={{ backgroundColor: theme.secondaryColor, color: 'white' }}
        >
          {downloadCardLabel}
        </button>
        <button
          type="button"
          onClick={() => downloadRecoveryCardText(content, cardLabels)}
          className="text-xs px-3 py-2 rounded-lg font-semibold border"
          style={{ borderColor: theme.secondaryColor, color: theme.secondaryColor }}
        >
          {downloadTextLabel}
        </button>
      </div>
    </div>
  );
}
