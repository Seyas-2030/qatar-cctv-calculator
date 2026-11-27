import { i18n } from './i18n.js';

/**
 * Escapes a single CSV field according to RFC 4180.
 */
function csvCell(value) {
  const str = String(value ?? '');
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports Camera Schedule & HDD Bill of Quantities (BOQ) as UTF-8 BOM CSV (Excel-compatible).
 */
export const BOQExporter = {
  exportCsv(projectData, calcResults, lang = 'ar') {
    const dict = i18n[lang] || i18n.ar;
    const isAr = lang === 'ar';
    const lines = [];

    // Section 1: Project Summary
    lines.push([csvCell(dict.projectInfoTitle)].join(','));
    lines.push([csvCell(dict.projectName), csvCell(projectData.projectName || '—')].join(','));
    lines.push([csvCell(dict.clientName), csvCell(projectData.clientName || '—')].join(','));
    lines.push([csvCell(dict.moiRefNumber), csvCell(projectData.moiRefNumber || 'N/A')].join(','));
    lines.push([csvCell(dict.retentionDays), csvCell(projectData.retentionDays)].join(','));
    lines.push([csvCell(dict.raidLevel), csvCell((projectData.raidLevel || 'raid5').toUpperCase())].join(','));
    lines.push('');

    // Section 2: Camera Schedule
    lines.push([csvCell(dict.cameraGroupsTitle)].join(','));
    lines.push([
      '#',
      csvCell(dict.groupName),
      csvCell(dict.cameraQty),
      csvCell(dict.resolution),
      csvCell(dict.codec),
      csvCell(dict.fps),
      csvCell(dict.bitrate),
      csvCell(dict.motionFactor),
      csvCell(isAr ? 'صافي السعة (TiB)' : 'Net Storage (TiB)'),
      csvCell(isAr ? 'النطاق الترددي (Mbps)' : 'Bandwidth (Mbps)'),
      csvCell(dict.targetCoverage)
    ].join(','));

    calcResults.groupResults.forEach((g, idx) => {
      const resLabel = dict['res' + g.resolution] || g.resolution;
      const codecKey = 'codec' + (g.codec === 'h264' ? 'H264' : g.codec === 'h265' ? 'H265' : 'H265Plus');
      const codecLabel = dict[codecKey] || g.codec;
      const covLabel = dict[g.targetCoverage] || g.targetCoverage;

      lines.push([
        idx + 1,
        csvCell(g.name || `${dict.groupNameDefault} ${idx + 1}`),
        g.qty,
        csvCell(resLabel),
        csvCell(codecLabel),
        g.fps,
        g.bitrateMbps,
        `${g.motionFactor}%`,
        g.netTb.toFixed(2),
        g.bandwidthMbps.toFixed(1),
        csvCell(covLabel)
      ].join(','));
    });

    lines.push('');

    // Section 3: Recommended Storage & Hardware BOQ (16TB Reference)
    const reco = calcResults.hddRecommendations.find((h) => h.diskSizeTb === 16) || calcResults.hddRecommendations[0];
    lines.push([csvCell(isAr ? 'جدول كميات التخزين والطاقة (BOQ)' : 'Storage & Power Bill of Quantities (BOQ)')].join(','));
    lines.push([
      csvCell(isAr ? 'البند' : 'Item'),
      csvCell(isAr ? 'المواصفات' : 'Specification'),
      csvCell(isAr ? 'الكمية' : 'Quantity')
    ].join(','));
    lines.push([
      csvCell(isAr ? 'أقراص صلبة للمراقبة (Enterprise HDD)' : 'Enterprise Surveillance HDD'),
      csvCell(`${reco.diskSizeTb} TB (${reco.dataDisks} Data + ${reco.parityDisks} Parity + ${reco.hotSpares} Hot Spare)`),
      reco.disksNeeded
    ].join(','));
    lines.push([
      csvCell(dict.chassisNeeded),
      csvCell(reco.enclosureRecommendation),
      calcResults.powerUps.serverCount
    ].join(','));
    lines.push([
      csvCell(dict.poeSwitchesCount),
      csvCell('24-Port Gigabit PoE+ Managed Switch'),
      calcResults.powerUps.switchCount
    ].join(','));
    lines.push([
      csvCell(dict.recommendedUpsKva),
      csvCell(`${calcResults.powerUps.recommendedUpsKva} kVA Online UPS (${calcResults.powerUps.backupMinutes} min backup)`),
      projectData.hasUps !== false ? 1 : 0
    ].join(','));

    // UTF-8 BOM for proper Arabic rendering in Microsoft Excel
    const csvContent = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeFileName = (projectData.projectName || 'cctv_boq').replace(/[\\/:*?"<>|]/g, '_');
    link.download = `${safeFileName}_MOI_BOQ.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
};
