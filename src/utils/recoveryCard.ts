// A "recovery card" the user can print/save right after generating a
// recovery code (at signup, or from Settings) — reduces the human-error
// failure mode of "I copied it but didn't save it anywhere". No PDF library
// is used: this mirrors the existing PDF-export convention in
// dataExport.tsx (build an HTML document, open a window, call print(),
// let the browser's native print-to-PDF handle the rest) rather than
// introducing a second one.
import { saveAs } from 'file-saver';
// qrcode is loaded on demand (same reasoning as exceljs in dataImport.ts):
// this card is only generated on a deferred, infrequent action (signup
// success, or from Settings), so it shouldn't land in the eagerly-loaded
// entry chunk.

export interface RecoveryCardContent {
  userId: string;
  base32: string;
  words: string;
  generatedAt?: Date;
}

export interface RecoveryCardLabels {
  documentTitle: string;
  userIdLabel: string;
  blockCodeLabel: string;
  wordPhraseLabel: string;
  qrHint: string;
  warningTitle: string;
  warningBody: string;
  generatedOnLabel: string;
}

const fileBaseName = (userId: string) => `Pacifinance-RecoveryCard-${userId}`;

/**
 * A deep link encoding the recovery ID + code as a URL *fragment* (after
 * `#`), never a query string — fragments are never sent to any server (not
 * even a static host's access log), only readable by client-side JS, while
 * still letting a phone camera's QR scan land straight on a pre-filled
 * recovery form.
 */
export function buildRecoveryDeepLink({ userId, base32 }: { userId: string; base32: string }): string {
  const origin = window.location.origin;
  return `${origin}/auth#recover&id=${encodeURIComponent(userId)}&code=${encodeURIComponent(base32)}`;
}

/** Parses the `#recover&id=...&code=...` fragment produced by buildRecoveryDeepLink. */
export function parseRecoveryDeepLink(hash: string): { userId: string; base32: string } | null {
  if (!hash.startsWith('#recover')) return null;
  const params = new URLSearchParams(hash.replace(/^#recover&?/, ''));
  const userId = params.get('id');
  const base32 = params.get('code');
  if (!userId || !base32) return null;
  return { userId, base32 };
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Opens a printable HTML document (Pacifinance-RecoveryCard-<id>) with both code formats and a QR deep link — the user's browser print dialog handles saving it as a PDF. */
export async function openPrintableRecoveryCard(content: RecoveryCardContent, labels: RecoveryCardLabels): Promise<void> {
  const deepLink = buildRecoveryDeepLink(content);
  const { default: QRCode } = await import('qrcode');
  const qrDataUrl = await QRCode.toDataURL(deepLink, { width: 220, margin: 1 });
  const generatedAt = (content.generatedAt ?? new Date()).toLocaleString();
  const title = fileBaseName(content.userId);

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; padding: 2.5rem; color: #111; }
  h1 { color: #079164; margin-bottom: 0.2rem; }
  .sub { color: #555; margin-bottom: 2rem; }
  .row { margin-bottom: 1.4rem; }
  .label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #555; margin-bottom: 0.3rem; }
  .code { font-family: "Courier New", monospace; font-size: 1.4rem; font-weight: 700; letter-spacing: 0.05em; word-break: break-all; }
  .qr { margin: 1.5rem 0; }
  .warning { border: 2px solid #ff9800; background: #fff8e1; padding: 1rem 1.2rem; border-radius: 8px; margin-top: 2rem; }
  .warning h2 { color: #b45309; font-size: 1rem; margin: 0 0 0.4rem; }
  .footer { margin-top: 2rem; font-size: 0.75rem; color: #888; }
</style>
</head>
<body>
  <h1>Pacifinance</h1>
  <div class="sub">${escapeHtml(labels.documentTitle)}</div>

  <div class="row">
    <div class="label">${escapeHtml(labels.userIdLabel)}</div>
    <div class="code">${escapeHtml(content.userId)}</div>
  </div>

  <div class="row">
    <div class="label">${escapeHtml(labels.blockCodeLabel)}</div>
    <div class="code">${escapeHtml(content.base32)}</div>
  </div>

  <div class="row">
    <div class="label">${escapeHtml(labels.wordPhraseLabel)}</div>
    <div class="code">${escapeHtml(content.words)}</div>
  </div>

  <div class="qr">
    <img src="${qrDataUrl}" width="180" height="180" alt="QR" />
    <div class="label">${escapeHtml(labels.qrHint)}</div>
  </div>

  <div class="warning">
    <h2>${escapeHtml(labels.warningTitle)}</h2>
    <p>${escapeHtml(labels.warningBody)}</p>
  </div>

  <div class="footer">${escapeHtml(labels.generatedOnLabel)}: ${escapeHtml(generatedAt)}</div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 500);
}

/** Plain-text sibling download — deterministic filename, no print-dialog variability. */
export function downloadRecoveryCardText(content: RecoveryCardContent, labels: RecoveryCardLabels): void {
  const generatedAt = (content.generatedAt ?? new Date()).toLocaleString();
  const lines = [
    'PACIFINANCE',
    labels.documentTitle,
    '',
    `${labels.userIdLabel}: ${content.userId}`,
    `${labels.blockCodeLabel}: ${content.base32}`,
    `${labels.wordPhraseLabel}: ${content.words}`,
    '',
    labels.warningTitle,
    labels.warningBody,
    '',
    `${labels.generatedOnLabel}: ${generatedAt}`,
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${fileBaseName(content.userId)}.txt`);
}
