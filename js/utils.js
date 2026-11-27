/**
 * Security & Validation Utilities
 */

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

/**
 * Escapes HTML special characters to prevent XSS in innerHTML and print templates.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

/**
 * Parses an integer safely, preserving 0 (uses nullish semantics instead of ||).
 * @param {unknown} value
 * @param {number} fallback
 * @returns {number}
 */
export function toInt(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Parses a float safely, preserving 0 (uses nullish semantics instead of ||).
 * @param {unknown} value
 * @param {number} fallback
 * @returns {number}
 */
export function toFloat(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const VALID_FACILITIES = new Set(['commercial', 'hotel', 'bank', 'gov', 'residential', 'mall', 'other']);
const VALID_RAIDS = new Set(['raid0', 'raid5', 'raid6', 'raid10']);
const VALID_RESOLUTIONS = new Set(['720p', '1080p', '3mp', '4mp', '5mp', '4k', '12mp']);
const VALID_CODECS = new Set(['h264', 'h265', 'h265plus']);
const VALID_COVERAGES = new Set(['covId', 'covAnpr', 'covRec', 'covDet', 'covGeneral']);

/**
 * Strictly validates and normalizes an imported JSON project object.
 * @param {unknown} data
 * @returns {{ valid: true, project: object } | { valid: false, errorKey: string }}
 */
export function validateImportedProject(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, errorKey: 'importError' };
  }

  if (!Array.isArray(data.cameraGroups) || data.cameraGroups.length === 0 || data.cameraGroups.length > 500) {
    return { valid: false, errorKey: 'importError' };
  }

  const normalizedGroups = [];
  for (let i = 0; i < data.cameraGroups.length; i++) {
    const g = data.cameraGroups[i];
    if (!g || typeof g !== 'object' || Array.isArray(g)) {
      return { valid: false, errorKey: 'importError' };
    }

    const qty = toInt(g.qty, -1);
    const fps = toInt(g.fps, 25);
    const motionFactor = toFloat(g.motionFactor, 100);
    const customBitrate = toFloat(g.customBitrate, 2.0);

    if (qty < 1 || qty > 9999) {
      return { valid: false, errorKey: 'importError' };
    }

    normalizedGroups.push({
      id: toInt(g.id, Date.now() + i),
      name: typeof g.name === 'string' ? g.name.slice(0, 120) : `Group ${i + 1}`,
      qty,
      resolution: VALID_RESOLUTIONS.has(g.resolution) ? g.resolution : '1080p',
      codec: VALID_CODECS.has(g.codec) ? g.codec : 'h265',
      fps: Math.min(60, Math.max(1, fps)),
      isAutoBitrate: g.isAutoBitrate !== false,
      customBitrate: Math.min(100, Math.max(0.1, customBitrate)),
      motionFactor: Math.min(100, Math.max(10, motionFactor)),
      targetCoverage: VALID_COVERAGES.has(g.targetCoverage) ? g.targetCoverage : 'covDet'
    });
  }

  const project = {
    projectName: typeof data.projectName === 'string' ? data.projectName.slice(0, 150) : '',
    clientName: typeof data.clientName === 'string' ? data.clientName.slice(0, 150) : '',
    facilityType: VALID_FACILITIES.has(data.facilityType) ? data.facilityType : 'commercial',
    consultantName: typeof data.consultantName === 'string' ? data.consultantName.slice(0, 150) : '',
    projectDate: typeof data.projectDate === 'string' ? data.projectDate.slice(0, 20) : new Date().toISOString().split('T')[0],
    moiRefNumber: typeof data.moiRefNumber === 'string' ? data.moiRefNumber.slice(0, 80) : '',
    retentionDays: Math.min(730, Math.max(1, toInt(data.retentionDays, 120))),
    hoursPerDay: Math.min(24, Math.max(1, toFloat(data.hoursPerDay, 24))),
    raidLevel: VALID_RAIDS.has(data.raidLevel) ? data.raidLevel : 'raid5',
    safetyMargin: Math.min(100, Math.max(0, toFloat(data.safetyMargin, 15))),
    hotSpareDrives: Math.min(20, Math.max(0, toInt(data.hotSpareDrives, 1))),
    hasUps: data.hasUps !== false,
    upsBackupMinutes: Math.min(1440, Math.max(0, toInt(data.upsBackupMinutes, 60))),
    upsPowerFactor: Math.min(1, Math.max(0.5, toFloat(data.upsPowerFactor, 0.8))),
    cameraPowerWatts: Math.min(100, Math.max(1, toFloat(data.cameraPowerWatts, 12))),
    nvrPowerWatts: Math.min(2000, Math.max(20, toFloat(data.nvrPowerWatts, 250))),
    switchPowerWatts: Math.min(1000, Math.max(10, toFloat(data.switchPowerWatts, 45))),
    subStreamEnabled: Boolean(data.subStreamEnabled),
    subStreamBitrateMbps: Math.min(10, Math.max(0.1, toFloat(data.subStreamBitrateMbps, 0.5))),
    cameraGroups: normalizedGroups
  };

  return { valid: true, project };
}
