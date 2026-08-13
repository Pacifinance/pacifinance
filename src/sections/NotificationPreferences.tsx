import React, {useContext, useEffect, useState} from 'react';
import styled from 'styled-components';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import {LanguageContext} from '../contexts/LanguageContext';
import {useServices} from '../contexts/ServiceContext';
import type {NotificationPreferences as Preferences} from '../services/notificationService';
import {disableWebPush, enableWebPush, serializePushSubscription, supportsWebPush} from '../utils/pushNotifications';
import {detectPlatform, isStandalonePwa} from '../utils/platformDetection';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface NotificationPreferencesProps { theme: Record<string, string> & {mode: string} }

const Panel = styled.div`
  display: grid; gap: .9rem; padding: 1rem; border-radius: 14px;
  background: ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.035)' : 'rgba(248,250,252,.9)'};
  border: 1px solid ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.09)' : 'rgba(15,23,42,.08)'};
`;
const Hero = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
  h3 { margin: 0 0 .25rem; color: ${({theme}) => theme.textColor}; font-size: 1rem; }
  p { margin: 0; color: ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.78)' : 'rgba(15,23,42,.74)'}; line-height: 1.45; font-size: .8rem; }
  svg { color: ${({theme}) => theme.buttonBackgroundColor}; flex: 0 0 auto; }
`;
const ChoiceGrid = styled.div`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .55rem;
  @media (max-width: 620px) { grid-template-columns: 1fr; }
`;
const Choice = styled.label<{$disabled: boolean}>`
  display: flex; align-items: flex-start; gap: .65rem; padding: .75rem; border-radius: 10px; cursor: pointer;
  border: 1px solid ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.09)' : 'rgba(15,23,42,.08)'};
  background: ${({theme}) => theme.mode === 'dark' ? 'rgba(0,0,0,.12)' : '#fff'};
  color: ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.82)' : 'rgba(15,23,42,.8)'};
  opacity: ${({$disabled}) => $disabled ? .74 : 1};
  input { margin-top: .15rem; accent-color: ${({theme}) => theme.buttonBackgroundColor}; opacity: 1; }
  strong { display: block; color: ${({theme}) => theme.textColor}; font-size: .82rem; }
  span { display: block; font-size: .72rem; line-height: 1.4; margin-top: .15rem; }
`;
const ScheduleSection = styled.div`
  display: grid; gap: .5rem; padding-top: .2rem;
`;
const ScheduleCaption = styled.p`
  margin: 0; font-size: .72rem; line-height: 1.45;
  color: ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.6)' : 'rgba(15,23,42,.6)'};
`;
const Schedule = styled.div`
  display: flex; gap: .6rem; align-items: stretch; flex-wrap: wrap;
`;
const ScheduleField = styled.label`
  display: flex; align-items: center; gap: .55rem; padding: .55rem .75rem; border-radius: 10px;
  background: ${({theme}) => theme.mode === 'dark' ? 'rgba(0,0,0,.12)' : '#fff'};
  border: 1px solid ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.09)' : 'rgba(15,23,42,.08)'};
  svg { font-size: 1.15rem; color: ${({theme}) => theme.buttonBackgroundColor}; flex: 0 0 auto; }
`;
const ScheduleFieldText = styled.span`
  display: grid; gap: .2rem;
  strong { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; color: ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.55)' : 'rgba(15,23,42,.55)'}; }
`;
const ScheduleSelect = styled.select`
  min-height: 30px; border: none; background: transparent; padding: 0; margin: 0;
  color: ${({theme}) => theme.textColor}; font-weight: 700; font-size: .85rem; cursor: pointer;
  &:disabled { cursor: default; }
`;
const Timezone = styled.span`
  display: flex; align-items: center;
  color: ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.5)' : 'rgba(15,23,42,.5)'};
  font-size: .7rem;
`;
const ToggleRow = styled.div`display: flex; gap: .55rem; flex-wrap: wrap;`;
const MainToggle = styled.button<{$enabled: boolean}>`
  display: inline-flex; align-items: center; justify-content: center; gap: .45rem; border: 0; border-radius: 9px; padding: .6rem .8rem; cursor: pointer; font-weight: 700;
  color: ${({$enabled, theme}) => $enabled ? theme.textColor : '#fff'};
  background: ${({$enabled, theme}) => $enabled ? (theme.mode === 'dark' ? 'rgba(255,255,255,.1)' : '#e2e8f0') : theme.buttonBackgroundColor};
  &:disabled { opacity: .55; cursor: wait; }
`;
const Status = styled.p<{$error?: boolean}>`margin: 0; color: ${({$error, theme}) => $error ? (theme.mode === 'dark' ? '#fca5a5' : '#dc2626') : (theme.mode === 'dark' ? '#6ee7b7' : '#047857')}; font-size: .75rem; font-weight: 600;`;
const InfoNote = styled.div`
  display: flex; align-items: flex-start; gap: .5rem; padding: .65rem .8rem; border-radius: 10px; font-size: .75rem; line-height: 1.45;
  color: ${({theme}) => theme.mode === 'dark' ? 'rgba(255,255,255,.78)' : 'rgba(15,23,42,.74)'};
  background: ${({theme}) => theme.mode === 'dark' ? 'rgba(59,130,246,.1)' : 'rgba(59,130,246,.07)'};
  border: 1px solid ${({theme}) => theme.mode === 'dark' ? 'rgba(96,165,250,.25)' : 'rgba(59,130,246,.2)'};
  svg { font-size: 1.05rem; flex: 0 0 auto; margin-top: .05rem; color: ${({theme}) => theme.mode === 'dark' ? '#93c5fd' : '#2563eb'}; }
`;

const defaults = (language: string): Preferences => ({enabled: false, monthlySummary: true, dataUpdateReminder: true, recurringDue: true, sharedExpenseUpdates: true, communityPriceUpdates: true, reminderDay: 1, reminderHour: 18, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', language});

export default function NotificationPreferences({theme}: NotificationPreferencesProps) {
  const {language, translations} = useContext(LanguageContext);
  const {notificationService} = useServices();
  const t = translations.notifications;
  const [preferences, setPreferences] = useState<Preferences>(() => defaults(language));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushPublicKey, setPushPublicKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{text: string; error?: boolean} | null>(null);
  const [testing, setTesting] = useState(false);
  const supported = supportsWebPush();
  // iOS only delivers web push to an installed (home-screen) app, not an
  // ordinary Safari tab - flagged upfront so an iPhone/iPad visitor knows
  // what to do before hitting the generic "unavailable" error.
  const showIosInstallHint = detectPlatform() === 'ios' && !isStandalonePwa();

  useEffect(() => {
    Promise.all([notificationService.getPreferences(), notificationService.getPushPublicKey()])
      .then(([stored, serverPublicKey]) => {
        setPreferences({...stored, timezone: stored.timezone || defaults(language).timezone, language});
        setPushPublicKey(serverPublicKey || import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY || null);
      })
      .catch(() => setMessage({text: t.loadError, error: true}))
      .finally(() => setLoading(false));
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
    if (!pushPublicKey) { setMessage({text: t.configurationError, error: true}); return; }
    setSaving(true); setMessage(null);
    try {
      const subscription = await enableWebPush(pushPublicKey);
      await notificationService.saveSubscription(serializePushSubscription(subscription));
      await persist({...preferences, enabled: true, timezone: defaults(language).timezone, language});
    } catch (error) {
      const name = error instanceof DOMException || error instanceof Error ? error.name : undefined;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`NotificationPreferences: failed to enable push notifications (${name || 'unknown'}): ${message}`, error);
      const deniedByBrowser = message === 'Notification permission denied';
      // AbortError from pushManager.subscribe() almost always means the
      // browser's own push service refused the registration - most common
      // cause in the wild is Brave, which disables Google's push messaging
      // service by default (brave://settings/privacy). Not something a
      // retry fixes on its own, so point at the actual setting instead of
      // the generic "try again later".
      const blockedByBrowser = name === 'AbortError' || name === 'NotAllowedError';
      setMessage({
        text: deniedByBrowser ? t.permissionError : blockedByBrowser ? t.pushServiceError : t.enableError,
        error: true,
      });
      setSaving(false);
    }
  };

  const sendTest = async () => {
    setTesting(true); setMessage(null);
    try {
      const sent = await notificationService.sendTestNotification(language);
      setMessage(sent > 0 ? {text: t.testSent} : {text: t.testError, error: true});
    } catch {
      setMessage({text: t.testError, error: true});
    } finally {
      setTesting(false);
    }
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
    {showIosInstallHint && <InfoNote theme={theme}><InfoOutlinedIcon/><span>{t.iosInstallHint}</span></InfoNote>}
    <ToggleRow>
      <MainToggle type="button" theme={theme} $enabled={preferences.enabled} disabled={saving} onClick={toggleEnabled}>{preferences.enabled ? t.disable : t.enable}</MainToggle>
      {preferences.enabled && <MainToggle type="button" theme={theme} $enabled disabled={testing} onClick={sendTest}>{testing ? t.testSending : t.test}</MainToggle>}
    </ToggleRow>
    <ChoiceGrid>{choices.map((choice) => <Choice key={choice.key} theme={theme} $disabled={!preferences.enabled || saving}><input type="checkbox" checked={Boolean(preferences[choice.key])} disabled={!preferences.enabled || saving} onChange={(event) => persist({...preferences, [choice.key]: event.target.checked})}/><span><strong>{choice.title}</strong><span>{choice.description}</span></span></Choice>)}</ChoiceGrid>
    <ScheduleSection>
      <ScheduleCaption theme={theme}>{t.scheduleCaption}</ScheduleCaption>
      <Schedule>
        <ScheduleField theme={theme}>
          <AccessTimeOutlinedIcon />
          <ScheduleFieldText theme={theme}>
            <strong>{t.hour}</strong>
            <ScheduleSelect theme={theme} disabled={!preferences.enabled || saving} value={preferences.reminderHour} onChange={(event) => persist({...preferences, reminderHour: Number(event.target.value)})}>
              {Array.from({length: 24}, (_, hour) => <option key={hour} value={hour}>{String(hour).padStart(2, '0')}:00</option>)}
            </ScheduleSelect>
          </ScheduleFieldText>
        </ScheduleField>
        <ScheduleField theme={theme}>
          <CalendarMonthOutlinedIcon />
          <ScheduleFieldText theme={theme}>
            <strong>{t.day}</strong>
            <ScheduleSelect theme={theme} disabled={!preferences.enabled || saving} value={preferences.reminderDay} onChange={(event) => persist({...preferences, reminderDay: Number(event.target.value)})}>
              {Array.from({length: 28}, (_, index) => index + 1).map((day) => <option key={day} value={day}>{day}</option>)}
            </ScheduleSelect>
          </ScheduleFieldText>
        </ScheduleField>
        <Timezone theme={theme}>{preferences.timezone}</Timezone>
      </Schedule>
    </ScheduleSection>
    {message && <Status theme={theme} $error={message.error}>{message.text}</Status>}
  </Panel>;
}
