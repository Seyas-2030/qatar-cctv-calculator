import { describe, it, expect } from 'vitest';
import { Calculator, DECIMAL_TB_TO_BINARY_TIB } from '../js/calculator.js';
import { escapeHtml, validateImportedProject } from '../js/utils.js';

describe('Calculator Engine', () => {
  it('calculates recommended bitrate for 1080p H.265 at 25 FPS', () => {
    const bitrate = Calculator.calculateRecommendedBitrate('1080p', 'h265', 25);
    expect(bitrate).toBe(2.0);
  });

  it('preserves 0% safetyMargin and 0 hotSpareDrives (nullish coalescing fix)', () => {
    const project = {
      retentionDays: 120,
      hoursPerDay: 24,
      raidLevel: 'raid5',
      safetyMargin: 0,
      hotSpareDrives: 0,
      cameraGroups: [
        { id: 1, name: 'Test', qty: 10, resolution: '1080p', codec: 'h265', fps: 25, isAutoBitrate: true, motionFactor: 100 }
      ]
    };
    const result = Calculator.calculateProjectTotals(project);
    // requiredUsableTiB should equal totalNetTb exactly when safetyMargin is 0
    expect(result.requiredUsableTiB).toBe(result.totalNetTb);
    // hotSpares should be 0 in all HDD recommendations
    expect(result.hddRecommendations[0].hotSpares).toBe(0);
  });

  it('applies Decimal TB to Binary TiB conversion and enforces minimum RAID drive counts', () => {
    // 1 camera at 1080p H.265 = small capacity, but RAID 6 requires minimum 4 drives (2 data + 2 parity)
    const array = Calculator.calculateRaidArray(5, 16, 'raid6', 1, 1);
    expect(array.usableTiBPerDrive).toBeCloseTo(16 * DECIMAL_TB_TO_BINARY_TIB, 2);
    expect(array.dataDisks).toBeGreaterThanOrEqual(2);
    expect(array.parityDisks).toBe(2);
    expect(array.disksNeeded).toBe(array.dataDisks + array.parityDisks + 1);
  });

  it('includes continuous sub-stream in storage and bandwidth when enabled', () => {
    const baseGroup = { qty: 10, resolution: '1080p', codec: 'h265', fps: 25, isAutoBitrate: true, motionFactor: 50 };
    const mainOnly = Calculator.calculateGroupStorage(baseGroup, 120, 24, { enabled: false });
    const dualStream = Calculator.calculateGroupStorage(baseGroup, 120, 24, { enabled: true, bitrateMbps: 0.5 });

    expect(dualStream.netTb).toBeGreaterThan(mainOnly.netTb);
    expect(dualStream.bandwidthMbps).toBe(mainOnly.bandwidthMbps + 5);
  });

  it('calculates Power/UPS load and Pixel Density (PPM)', () => {
    const ups = Calculator.calculatePowerAndUps({
      cameraPowerWatts: 12,
      nvrPowerWatts: 250,
      switchPowerWatts: 45,
      upsBackupMinutes: 60,
      upsPowerFactor: 0.8
    }, 50, 1);

    // 50*12 (600) + 3*45 (135) + 250 = 985W
    expect(ups.totalLoadWatts).toBe(985);
    expect(ups.switchCount).toBe(3);
    expect(ups.recommendedUpsKva).toBeGreaterThanOrEqual(1.5);

    const ppm = Calculator.calculatePixelDensity({ resolution: '4k', sceneWidthMeters: 10 });
    expect(ppm.ppm).toBe(384);
    expect(ppm.classification).toBe('covId');
  });
});

describe('Security & Validation Utilities', () => {
  it('escapes HTML special characters to prevent XSS', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('rejects malformed JSON project imports', () => {
    expect(validateImportedProject(null).valid).toBe(false);
    expect(validateImportedProject({ cameraGroups: [] }).valid).toBe(false);
    expect(validateImportedProject({ cameraGroups: [{ qty: 0 }] }).valid).toBe(false);
  });
});
