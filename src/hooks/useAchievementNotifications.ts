/**
 * useAchievementNotifications Hook
 *
 * Tracks unlocked badges and fires toast notifications when new ones are
 * unlocked. "Already seen" badge IDs are persisted server-side (userData.seenBadges,
 * via userService.setSeenBadges) rather than in localStorage, so the state is
 * consistent across devices/browsers instead of replaying on every new one.
 *
 * Behavior:
 * - First time ever (no seenBadges on the account): shows a summary notification
 *   listing all currently unlocked achievements (for returning users after update).
 * - Normal usage: shows individual notifications for each newly unlocked badge.
 * - Each badge is only notified ONCE per account (persisted server-side).
 * - Within a single mount, a session ref prevents duplicate notifications
 *   in case the effect fires multiple times with the same data.
 */

import { useEffect, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from './useAuth';
import { useDemoServices } from './useDemoServices';
import { getSeenBadges } from '../utils/userDataSelectors';

export const useAchievementNotifications = (gamificationData, translations) => {
  const { showSuccess } = useToast();
  const auth = useAuth();
  const { userService } = useDemoServices();
  // Track which badge IDs we've already notified about in this mount
  // to avoid duplicates if the effect fires multiple times with the same data.
  const notifiedInSession = useRef(new Set());

  useEffect(() => {
    if (!gamificationData?.unlockedBadges || gamificationData.unlockedBadges.length === 0) return;
    if (!auth.userData) return;

    const currentUnlockedIds = gamificationData.unlockedBadges.map(b => b.id);
    const previousIds = getSeenBadges(auth.userData);
    const isFirstTimeEver = previousIds.length === 0;

    // Find badges that are newly unlocked (not seen server-side AND not already notified this mount)
    const newBadges = gamificationData.unlockedBadges.filter(
      b => !previousIds.includes(b.id) && !notifiedInSession.current.has(b.id)
    );

    if (newBadges.length === 0) return;

    const t = translations?.gamification || {};

    if (isFirstTimeEver && newBadges.length > 1) {
      // First time ever on this account with multiple existing achievements → show summary
      const icons = newBadges.map(b => b.icon).join(' ');
      const summaryMsg = `🏅 ${newBadges.length} ${t.achievementsSummary || 'achievements already unlocked!'} ${icons}`;
      showSuccess(summaryMsg, 8000);
    } else {
      // Normal case: show individual notifications (staggered)
      newBadges.forEach((badge, index) => {
        setTimeout(() => {
          const msg = `${badge.icon} ${t.badgeUnlocked || 'Achievement unlocked!'} ${badge.name}`;
          showSuccess(msg, 6000);
        }, index * 1500);
      });
    }

    // Mark all new badges as notified in this mount
    newBadges.forEach(b => notifiedInSession.current.add(b.id));

    // Persist the updated unlocked set server-side (best-effort — a failure
    // here just means these badges may be re-notified next session, which is
    // far cheaper than blocking the UI on it).
    if (userService?.setSeenBadges) {
      userService.setSeenBadges(currentUnlockedIds)
        .then((result) => {
          auth.setUserData?.(prev => prev ? { ...prev, seenBadges: result?.seenBadges ?? currentUnlockedIds } : prev);
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamificationData?.unlockedBadges, showSuccess, translations, auth.userData, userService]);
};
