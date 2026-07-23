/**
 * Tests for SettingsPage - Section Order Verification
 *
 * Sections are grouped into numbered SettingsGroup blocks (see the
 * "═══ N. Name ═══" comment markers in SettingsPage.tsx). This locks in the
 * intended reading order so a future edit can't silently reshuffle groups —
 * in particular, Danger Zone must always stay last.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const getGroupMarkerIndices = () => {
  const filePath = resolve(__dirname, '../../pages/SettingsPage.tsx');
  const content = readFileSync(filePath, 'utf-8');
  const markers = [...content.matchAll(/═══ (\d+)\. .*? ═══/g)];
  return markers.map((m) => ({ order: Number(m[1]), index: m.index }));
};

describe('SettingsPage section order', () => {
  it('lists every numbered group marker in ascending order', () => {
    const markers = getGroupMarkerIndices();

    expect(markers.length).toBeGreaterThan(0);
    for (let i = 1; i < markers.length; i++) {
      expect(markers[i].order).toBe(markers[i - 1].order + 1);
      expect(markers[i].index).toBeGreaterThan(markers[i - 1].index);
    }
  });

  it('keeps the Danger Zone group last', () => {
    const filePath = resolve(__dirname, '../../pages/SettingsPage.tsx');
    const content = readFileSync(filePath, 'utf-8');
    const markers = getGroupMarkerIndices();

    const dangerZoneIndex = content.indexOf('Zona Pericolosa');
    expect(dangerZoneIndex).toBeGreaterThan(-1);

    const lastMarker = markers[markers.length - 1];
    expect(lastMarker.index).toBeLessThan(dangerZoneIndex);
  });

  it('keeps custom categories before data export/import', () => {
    const filePath = resolve(__dirname, '../../pages/SettingsPage.tsx');
    const content = readFileSync(filePath, 'utf-8');

    const categoriesIndex = content.indexOf('Custom categories');
    const dataIndex = content.indexOf('Data Management');

    expect(categoriesIndex).toBeGreaterThan(-1);
    expect(dataIndex).toBeGreaterThan(-1);
    expect(categoriesIndex).toBeLessThan(dataIndex);
  });
});
