import { describe, it, expect } from 'vitest';
import { ComplianceValidator } from '../js/compliance.js';
import { Calculator } from '../js/calculator.js';

describe('Qatar MOI-SSD Compliance Validator', () => {
  const baseProject = {
    facilityType: 'commercial',
    retentionDays: 120,
    hoursPerDay: 24,
    raidLevel: 'raid5',
    safetyMargin: 15,
    hotSpareDrives: 1,
    hasUps: true,
    upsBackupMinutes: 60,
    cameraGroups: [
      { id: 1, name: 'Gate ANPR', qty: 4, resolution: '4mp', codec: 'h265', fps: 25, isAutoBitrate: true, motionFactor: 100, targetCoverage: 'covAnpr' }
    ]
  };

  it('passes all 5 rules for a compliant commercial project', () => {
    const calc = Calculator.calculateProjectTotals(baseProject);
    const comp = ComplianceValidator.validate(baseProject, calc, 'en');
    expect(comp.isFullyCompliant).toBe(true);
    expect(comp.passedCount).toBe(5);
  });

  it('enforces stricter RAID 6/10 and FPS rules for banking/government facilities', () => {
    const bankProject = { ...baseProject, facilityType: 'bank', raidLevel: 'raid5' };
    const calc = Calculator.calculateProjectTotals(bankProject);
    const comp = ComplianceValidator.validate(bankProject, calc, 'en');

    expect(comp.isFullyCompliant).toBe(false);
    const raidRule = comp.rules.find((r) => r.id === 'ruleRaid');
    expect(raidRule.status).toBe('FAIL');
  });

  it('fails UPS rule when UPS is disabled or backup runtime is below minimum', () => {
    const noUpsProject = { ...baseProject, hasUps: false };
    const calc = Calculator.calculateProjectTotals(noUpsProject);
    const comp = ComplianceValidator.validate(noUpsProject, calc, 'en');

    expect(comp.isFullyCompliant).toBe(false);
    const upsRule = comp.rules.find((r) => r.id === 'ruleUps');
    expect(upsRule.status).toBe('FAIL');
  });

  it('fails target coverage rule when commercial facility has no ID or ANPR group', () => {
    const noIdProject = {
      ...baseProject,
      cameraGroups: [
        { id: 1, name: 'Overview', qty: 10, resolution: '1080p', codec: 'h265', fps: 20, isAutoBitrate: true, motionFactor: 80, targetCoverage: 'covGeneral' }
      ]
    };
    const calc = Calculator.calculateProjectTotals(noIdProject);
    const comp = ComplianceValidator.validate(noIdProject, calc, 'en');

    const covRule = comp.rules.find((r) => r.id === 'ruleCoverage');
    expect(covRule.status).toBe('FAIL');
  });
});
