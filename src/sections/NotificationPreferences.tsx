import React, {useContext, useEffect, useState} from 'react';
import styled from 'styled-components';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';
import {LanguageContext} from '../contexts/LanguageContext';
import {useServices} from '../contexts/ServiceContext';
import type {NotificationPreferences as Preferences} from '../services/notificationService';
import {disableWebPush, enableWebPush, serializePushSubscription, supportsWebPush} from '../utils/pushNotifications';

interface NotificationPreferencesProps { theme: Record<string, string> & {mode: string} }

const Panel = styled.div`
  display: grid; gap: .9rem; padding: 1rem; border-radius: 14px;
  background: ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.035)' : 'rgba(248,250,252,.9)'};
  border: 1px solid ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.09)' : 'rgba(15,23,42,.08)'};
`;
const Hero = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
  h3 { margin: 0 0 .25rem; color: ${({theme}) => theme.textColor}; font-size: 1rem; }
  p { margin: 0; opacity: .68; line-height: 1.45; font-size: .8rem; }
  svg { color: ${({theme}) => theme.buttonBackgroundColor}; flex: 0 0 auto; }
`;
const ChoiceGrid = styled.div`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .55rem;
  @media (max-width: 620px) { grid-template-columns: 1fr; }
`;
const Choice = styled.label`
  display: flex; align-items: flex-start; gap: .65rem; padding: .75rem; border-radius: 10px; cursor: pointer;
  border: 1px solid ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.09)' : 'rgba(15,23,42,.08)'};
  background: ${({theme}) => theme.mode === 'dark' ? 'rgba(0,0,0,.12)' : '#fff'};
  input { margin-top: .15rem; accent-color: ${({theme}) => theme.buttonBackgroundColor}; }
  strong { display: block; color: ${({theme}) => theme.textColor}; font-size: .82rem; }
  span { display: block; opacity: .62; font-size: .72rem; line-height: 1.4; margin-top: .15rem; }
`;
const Schedule = styled.div`
  display: flex; gap: .65rem; align-items: end; flex-wrap: wrap;
  label { display: grid; gap: .25rem; color: ${({theme}) => theme.textColor}; font-size: .72rem; }
  select { min-height: 36px; border-radius: 8px; padding: 0 .55rem; color: ${({theme}) => theme.textColor}; background: ${({theme}) => theme.backgroundColor}; border: 1px solid ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.15)' : 'rgba(15,23,42,.13)'}; }
`;
const MainToggle = styled.button<{$enabled: boolean}>`
  display: inline-flex; align-items: center; justify-content: center; gap: .45rem; border: 0; border-radius: 9px; padding: .6rem .8rem; cursor: pointer; font-weight: 700;
  color: ${({$enabled, theme}) => $enabled ? theme.textColor : '#fff'};
  background: ${({$enabled, theme}) => $enabled ? (theme.mode === 'dark' ? 'rgba(255,255,255,.1)' : '#e2e8f0') : theme.buttonBackgroundColor};
  &:disabled { opacity: .55; cursor: wait; }
`;
const Status = styled.p<{$error?: boolean}>`margin: 0; color: ${({$error}) => $error ? '#ef4444' : '#10b981'}; font-size: .75rem;`;

const defaults = (language: string): Preferences => ({enabled: false, monthlySummary: true, dataUpdateReminder: true, recurringDue: true, sharedExpenseUpdates: true, communityPriceUpdates: true, reminderDay: 1, reminderHour: 18, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', language});

export default function NotificationPreferences({theme}: NotificationPreferencesProps) {
  const {language, translations} = useContext(LanguageContext);
  const {notificationService} = useServices();
  const t = translations.notifications;
  const [preferences, setPreferences] = useState<Preferences>(() => defaults(language));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{text: string; error?: boolean} | null>(null);
  const supported = supportsWebPush() && Boolean(import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY);

  useEffect(() => {
    notificationService.getPreferences().then((stored) => setPreferences({...stored, timezone: stored.timezone || defaults(language).timezone, language})).catch(() => setMessage({text: t.loadError, error: true})).finally(() => setLoading(false));
  }, [language, notificationService, t.loadError]);

  const persist = async (next: Preferences) => {
    setPreferences(next); setSaving(true); setMessage(null);
    try { setPreferences(await notificationService.savePreferences(next)); setMessage({text: t.saved}); }
    catch { setMessage({text: t.saveError, error: true}); }
    finally { setSaving(false); }
  };

  const toggleEnabled = async () => {
    if (preferences.enabled) {
      setSaving(true);
      try { const endpoint = await disableWebPush(); if (endpoint) await notificationService.deleteSubscription(endpoint); await persist({...preferences, enabled: false}); }
      catch { setMessage({text: t.disableError, error: true}); setSaving(false); }
      return;
    }
    if (!supported) { setMessage({text: t.unsupported, error: true}); return; }
    setSaving(true); setMessage(null);
    try {
      const subscription = await enableWebPush(import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY);
      await notificationService.saveSubscription(serializePushSubscription(subscription));
      await persist({...preferences, enabled: true, timezone: defaults(language).timezone, language});
    } catch { setMessage({text: t.permissionError, error: true}); setSaving(false); }
  };

  const choices: Array<{key: keyof Preferences; title: string; description: string}> = [
    {key: 'monthlySummary', title: t.monthlySummary, description: t.monthlySummaryDescription},
    {key: 'dataUpdateReminder', title: t.dataUpdate, description: t.dataUpdateDescription},
    {key: 'recurringDue', title: t.recurring, description: t.recurringDescription},
    {key: 'sharedExpenseUpdates', title: t.sharedExpenses, description: t.sharedExpensesDescription},
    {key: 'communityPriceUpdates', title: t.communityPrices, description: t.communityPricesDescription},
  ];

  if (loading) return <Panel theme={theme}>{t.loading}</Panel>;
  return <Panel theme={theme}>
    <Hero theme={theme}><div><h3>{t.title}</h3><p>{t.description}</p></div>{preferences.enabled ? <NotificationsActiveOutlinedIcon/> : <NotificationsOffOutlinedIcon/>}</Hero>
    <MainToggle type="button" theme={theme} $enabled={preferences.enabled} disabled={saving} onClick={toggleEnabled}>{preferences.enabled ? t.disable : t.enable}</MainToggle>
    <ChoiceGrid>{choices.map((choice) => <Choice key={choice.key} theme={theme}><input type="checkbox" checked={Boolean(preferences[choice.key])} disabled={!preferences.enabled || saving} onChange={(event) => persist({...preferences, [choice.key]: event.target.checked})}/><span><strong>{choice.title}</strong><span>{choice.description}</span></span></Choice>)}</ChoiceGrid>
    <Schedule theme={theme}><label>{t.day}<select disabled={!preferences.enabled || saving} value={preferences.reminderDay} onChange={(event) => persist({...preferences, reminderDay: Number(event.target.value)})}>{Array.from({length: 28}, (_, index) => index + 1).map((day) => <option key={day} value={day}>{day}</option>)}</select></label><label>{t.hour}<select disabled={!preferences.enabled || saving} value={preferences.reminderHour} onChange={(event) => persist({...preferences, reminderHour: Number(event.target.value)})}>{Array.from({length: 24}, (_, hour) => <option key={hour} value={hour}>{String(hour).padStart(2, '0')}:00</option>)}</select></label><span style={{fontSize: '.7rem', opacity: .6}}>{preferences.timezone}</span></Schedule>
    {message && <Status $error={message.error}>{message.text}</Status>}
  </Panel>;
}
