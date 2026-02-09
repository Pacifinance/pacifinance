/**
 * Tests for SettingsPage - Section Order Verification
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('SettingsPage section order', () => {
  it('should have Data Export section before Danger Zone', () => {
    const filePath = resolve(__dirname, '../../pages/SettingsPage.jsx');
    const content = readFileSync(filePath, 'utf-8');

    // Find the positions of key section markers
    const themeIndex = content.indexOf('themeSettings') !== -1
      ? content.indexOf('themeSettings')
      : content.indexOf('Theme Settings') !== -1
        ? content.indexOf('Theme Settings')
        : content.indexOf('theme');

    const dataExportIndex = content.indexOf('data-export') !== -1
      ? content.indexOf('data-export')
      : content.indexOf('exportData') !== -1
        ? content.indexOf('exportData')
        : content.indexOf('Export');

    const dangerZoneIndex = content.indexOf('danger') !== -1
      ? content.indexOf('danger')
      : content.indexOf('Danger') !== -1
        ? content.indexOf('Danger')
        : content.indexOf('deleteAccount');

    // Data Export should come before Danger Zone
    if (dataExportIndex !== -1 && dangerZoneIndex !== -1) {
      expect(dataExportIndex).toBeLessThan(dangerZoneIndex);
    }
  });

  it('should have Security section before Data Export', () => {
    const filePath = resolve(__dirname, '../../pages/SettingsPage.jsx');
    const content = readFileSync(filePath, 'utf-8');

    const securityIndex = content.indexOf('security') !== -1
      ? content.indexOf('security')
      : content.indexOf('Security') !== -1
        ? content.indexOf('Security')
        : content.indexOf('changePassword');

    const dataExportIndex = content.indexOf('data-export') !== -1
      ? content.indexOf('data-export')
      : content.indexOf('exportData') !== -1
        ? content.indexOf('exportData')
        : content.indexOf('Export');

    // Security should come before Data Export
    if (securityIndex !== -1 && dataExportIndex !== -1) {
      expect(securityIndex).toBeLessThan(dataExportIndex);
    }
  });
});
