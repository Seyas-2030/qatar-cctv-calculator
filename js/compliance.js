import { toInt } from './utils.js';

/**
 * Qatar MOI-SSD CCTV Compliance Validator
 * Evaluates designs against Qatar Law No. 9 of 2011 & MOI-SSD Technical Guidelines
 * with facility-specific security tiers.
 */

export const FACILITY_PROFILES = {
  commercial: {
    minRetentionDays: 120,
    allowedRaids: ['raid5', 'raid6', 'raid10'],
    minFps: 15,
    minUpsMinutes: 30,
    requireIdOrAnpr: true
  },
  hotel: {
    minRetentionDays: 120,
    allowedRaids: ['raid5', 'raid6', 'raid10'],
    minFps: 20,
    minUpsMinutes: 30,
    requireIdOrAnpr: true
  },
  bank: {
    minRetentionDays: 120,
    allowedRaids: ['raid6', 'raid10'],
    minFps: 25,
    minUpsMinutes: 60,
    requireIdOrAnpr: true
  },
  gov: {
    minRetentionDays: 120,
    allowedRaids: ['raid6', 'raid10'],
    minFps: 25,
    minUpsMinutes: 60,
    requireIdOrAnpr: true
  },
  residential: {
    minRetentionDays: 120,
    allowedRaids: ['raid5', 'raid6', 'raid10'],
    minFps: 15,
    minUpsMinutes: 30,
    requireIdOrAnpr: false
  },
  mall: {
    minRetentionDays: 120,
    allowedRaids: ['raid5', 'raid6', 'raid10'],
    minFps: 20,
    minUpsMinutes: 30,
    requireIdOrAnpr: true
  },
  other: {
    minRetentionDays: 120,
    allowedRaids: ['raid5', 'raid6', 'raid10'],
    minFps: 15,
    minUpsMinutes: 30,
    requireIdOrAnpr: false
  }
};

const VALID_COVERAGES = new Set(['covId', 'covAnpr', 'covRec', 'covDet', 'covGeneral']);

export const ComplianceValidator = {
  validate(projectData, calculationResults, lang = 'ar') {
    const isAr = lang === 'ar';
    const facilityType = projectData.facilityType ?? 'commercial';
    const profile = FACILITY_PROFILES[facilityType] ?? FACILITY_PROFILES.commercial;

    const rules = [];
    let passedCount = 0;
    const totalCount = 5;

    // Rule 1: Retention Period >= 120 Days
    const retentionDays = toInt(projectData.retentionDays, 120);
    const isRetentionPass = retentionDays >= profile.minRetentionDays;
    if (isRetentionPass) passedCount++;
    rules.push({
      id: 'ruleRetention',
      name: 'ruleRetention',
      status: isRetentionPass ? 'PASS' : 'FAIL',
      passMsg: 'ruleRetentionPass',
      failMsg: 'ruleRetentionFail',
      details: isAr
        ? `${retentionDays} يوم (الحد الأدنى للمنشأة: ≥ ${profile.minRetentionDays} يوم)`
        : `${retentionDays} Days (MOI Standard: >= ${profile.minRetentionDays} Days)`
    });

    // Rule 2: Minimum IP Resolution (1080p) & Facility Min FPS
    const groups = projectData.cameraGroups || [];
    const hasSub1080p = groups.some((g) => g.resolution === '720p');
    const hasLowFps = groups.some((g) => toInt(g.fps, 25) < profile.minFps);
    const isResolutionPass = groups.length > 0 && !hasSub1080p && !hasLowFps;
    if (isResolutionPass) passedCount++;

    let resDetails = '';
    if (groups.length === 0) {
      resDetails = isAr ? 'لا توجد مجموعات كاميرات مضافة' : 'No camera groups configured';
    } else if (hasSub1080p) {
      resDetails = isAr ? 'تم رصد كاميرات بدقة أقل من 1080p' : 'Low resolution cameras detected (< 1080p)';
    } else if (hasLowFps) {
      resDetails = isAr
        ? `بعض الكاميرات أقل من الحد الأدنى للإطارات (${profile.minFps} FPS) لهذا التصنيف`
        : `Some cameras are below facility minimum (${profile.minFps} FPS)`;
    } else {
      resDetails = isAr
        ? `جميع الكاميرات ≥ 1080p Full HD و ≥ ${profile.minFps} FPS`
        : `All cameras >= 1080p Full HD & >= ${profile.minFps} FPS`;
    }

    rules.push({
      id: 'ruleResolution',
      name: 'ruleResolution',
      status: isResolutionPass ? 'PASS' : 'FAIL',
      passMsg: 'ruleResolutionPass',
      failMsg: 'ruleResolutionFail',
      details: resDetails
    });

    // Rule 3: Storage Fault Tolerance (Facility-specific RAID requirement)
    const raid = projectData.raidLevel ?? 'raid5';
    const isRaidPass = profile.allowedRaids.includes(raid);
    if (isRaidPass) passedCount++;
    const allowedLabel = profile.allowedRaids.map((r) => r.toUpperCase()).join(' / ');
    rules.push({
      id: 'ruleRaid',
      name: 'ruleRaid',
      status: isRaidPass ? 'PASS' : 'FAIL',
      passMsg: 'ruleRaidPass',
      failMsg: 'ruleRaidFail',
      details: isAr
        ? `المُعدّ: ${raid.toUpperCase()} (المطلوب لهذا التصنيف: ${allowedLabel})`
        : `Configured: ${raid.toUpperCase()} (Required for facility: ${allowedLabel})`
    });

    // Rule 4: Resolution on Target Standard (ID / ANPR 50%, Detection 10%)
    const allValidCoverage = groups.length > 0 && groups.every((g) => VALID_COVERAGES.has(g.targetCoverage));
    const hasCriticalZoneCoverage = !profile.requireIdOrAnpr || groups.some((g) => g.targetCoverage === 'covId' || g.targetCoverage === 'covAnpr');
    const isCoveragePass = allValidCoverage && hasCriticalZoneCoverage;
    if (isCoveragePass) passedCount++;

    rules.push({
      id: 'ruleCoverage',
      name: 'ruleCoverage',
      status: isCoveragePass ? 'PASS' : 'FAIL',
      passMsg: 'ruleCoveragePass',
      failMsg: 'ruleCoverageFail',
      details: isCoveragePass
        ? (isAr ? 'نسب التغطية مطابقة (ANPR/ID ≥ 50%، الكشف ≥ 10%)' : 'Target ratios compliant (ANPR/ID >= 50%, Detection >= 10%)')
        : (isAr ? 'المنشآت التجارية/الحيوية تتطلب مجموعة ID أو ANPR (≥ 50%) على الأقل' : 'Facility requires at least one ID or ANPR (>= 50%) camera group')
    });

    // Rule 5: Power Backup / UPS Continuity
    const hasUps = projectData.hasUps !== false;
    const upsMinutes = toInt(projectData.upsBackupMinutes, 60);
    const isUpsPass = hasUps && upsMinutes >= profile.minUpsMinutes;
    if (isUpsPass) passedCount++;
    const upsKva = calculationResults?.powerUps?.recommendedUpsKva ?? 0;

    rules.push({
      id: 'ruleUps',
      name: 'ruleUps',
      status: isUpsPass ? 'PASS' : 'FAIL',
      passMsg: 'ruleUpsPass',
      failMsg: 'ruleUpsFail',
      details: isUpsPass
        ? (isAr ? `UPS مفعل (${upsMinutes} دقيقة احتياط | المقترح: ${upsKva} kVA)` : `UPS enabled (${upsMinutes} min backup | Recommended: ${upsKva} kVA)`)
        : (isAr ? `مطلوب UPS بمدة احتياط لا تقل عن ${profile.minUpsMinutes} دقيقة` : `UPS required with >= ${profile.minUpsMinutes} min backup for this facility`)
    });

    const isFullyCompliant = passedCount === totalCount;
    const scorePercentage = Math.round((passedCount / totalCount) * 100);

    return {
      isFullyCompliant,
      scorePercentage,
      passedCount,
      totalCount,
      facilityProfile: profile,
      rules
    };
  }
};
