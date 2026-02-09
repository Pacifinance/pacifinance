/**
 * useAchievementNotifications Hook
 * 
 * Tracks unlocked badges in localStorage and fires toast notifications
 * when new badges are unlocked. Uses localStorage as the single source of
 * truth for "already seen" badges — no ref-based skipping.
 * 
 * Behavior:
 * - First time ever (no localStorage entry): shows a summary notification
 *   listing all currently unlocked achievements (for returning users after update).
 * - Normal usage: shows individual notifications for each newly unlocked badge.
 * - Each badge is only notified ONCE (persisted in localStorage).
 * - Within a single session/mount, a session ref prevents duplicate notifications
 *   in case the effect fires multiple times with the same data.
 */

import { useEffect, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';

const STORAGE_KEY = 'pacifinance-unlocked-badges';

export const useAchievementNotifications = (gamificationData, translations) => {
  const { showSuccess } = useToast();
  // Track which badge IDs we've already notified about in this mount/session
  // to avoid duplicates if the effect fires multiple times with the same data.
  const notifiedInSession = useRef(new Set());

  useEffect(() => {
    if (!gamificationData?.unlockedBadges || gamificationData.unlockedBadges.length === 0) return;

    const currentUnlockedIds = gamificationData.unlockedBadges.map(b => b.id);

    // Load previously seen badges from localStorage
    let previousIds = [];
    let isFirstTimeEver = false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        previousIds = JSON.parse(saved);
      } else {
        // No localStorage entry → first time after this feature was added
        isFirstTimeEver = true;
      }
    } catch {
      isFirstTimeEver = true;
    }

    // Find badges that are newly unlocked (not in localStorage AND not already notified this session)
    const newBadges = gamificationData.unlockedBadges.filter(
      b => !previousIds.includes(b.id) && !notifiedInSession.current.has(b.id)
    );

    if (newBadges.length > 0) {
      const t = translations?.gamification || {};

      if (isFirstTimeEver && newBadges.length > 1) {
        // First time after update with multiple existing achievements → show summary
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

      // Mark all new badges as notified in this session
      newBadges.forEach(b => notifiedInSession.current.add(b.id));
    }

    // Persist current unlocked badge IDs to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUnlockedIds));
    } catch {
      // ignore storage errors
    }
  }, [gamificationData?.unlockedBadges, showSuccess, translations]);
};
