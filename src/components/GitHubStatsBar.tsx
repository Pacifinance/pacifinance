import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

/**
 * Public GitHub repo stats (stars/forks/contributors) for the landing page -
 * a real, verifiable signal instead of the generic "trusted by users
 * worldwide" claim it replaces in the hero. Backed by /api/github-stats,
 * which is publicly accessible (no auth) and server-cached (see
 * server/src/cache/items/githubStats.ts), so this never hits GitHub's own
 * rate limit no matter how many visitors load the page.
 *
 * Renders nothing while loading or on failure - a missing stats bar is far
 * less damaging than a broken/empty one flashing on a marketing page.
 */
interface GitHubStats {
  stars: number;
  forks: number;
  contributors: number;
}

interface GitHubStatsBarProps {
  accentColor: string;
  repoUrl: string;
  labels: {
    stars: string;
    forks: string;
    contributors: string;
    viewOnGithub: string;
  };
}

export default function GitHubStatsBar({ accentColor, repoUrl, labels }: GitHubStatsBarProps) {
  const [stats, setStats] = useState<GitHubStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient.get<GitHubStats | null>('/api/github-stats')
      .then((res) => { if (!cancelled && res.data) setStats(res.data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <a
      href={repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex flex-wrap items-center gap-3 md:gap-4 px-4 py-2 rounded-full border transition-transform hover:scale-105"
      style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}12` }}
      data-umami-event="landing-github-stats-click"
    >
      <span className="text-xs md:text-sm font-semibold" style={{ color: accentColor }}>
        {labels.viewOnGithub}
      </span>
      {stats && (
        <span className="flex items-center gap-3 text-xs md:text-sm opacity-80">
          <span>⭐ {stats.stars.toLocaleString()} {labels.stars}</span>
          <span>🍴 {stats.forks.toLocaleString()} {labels.forks}</span>
          <span>👥 {stats.contributors.toLocaleString()} {labels.contributors}</span>
        </span>
      )}
    </a>
  );
}
