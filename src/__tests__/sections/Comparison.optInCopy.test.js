import { describe, it, expect } from 'vitest';
import { getBenchmarkOptInCopy } from '../../sections/Comparison';

describe('getBenchmarkOptInCopy', () => {
  const benchmarkOverview = {
    optInTitle: 'Hosted title',
    optInDescription: 'Hosted description',
    optInTitleSelfHosted: 'Self-hosted title',
    optInDescriptionSelfHosted: 'Self-hosted description',
  };

  it('returns the hosted-community copy when not self-hosted', () => {
    expect(getBenchmarkOptInCopy(false, benchmarkOverview)).toEqual({
      title: 'Hosted title',
      description: 'Hosted description',
    });
  });

  it('returns the self-hosted-instance copy when self-hosted', () => {
    expect(getBenchmarkOptInCopy(true, benchmarkOverview)).toEqual({
      title: 'Self-hosted title',
      description: 'Self-hosted description',
    });
  });

  it('falls back to English defaults when translations are missing', () => {
    expect(getBenchmarkOptInCopy(true, undefined)).toEqual({
      title: 'Unlock comparison with other users of this instance',
      description: expect.stringContaining('planned feature'),
    });
    expect(getBenchmarkOptInCopy(false, undefined)).toEqual({
      title: 'Unlock comparison with similar users',
      description: expect.stringContaining('aggregated benchmarks'),
    });
  });
});
