import { i18n } from './i18n.js';
import { escapeHtml } from './utils.js';

/**
 * Qatar MOI-SSD CCTV Storage Calculator - Technical Report Generator (PDF / Print)
 */
export const PDFExporter = {
  generateReport(projectData, calcResults, complianceResults, lang) {
    const dict = i18n[lang] || i18n.ar;
    const isAr = lang === 'ar';
    const dir = isAr ? 'rtl' : 'ltr';

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(isAr ? 'يرجى السماح بالنوافذ المنبثقة لفتح وطباعة التقرير الفني.' : 'Please allow popups to generate the official report.');
      return;
    }

    const facilityKey = 'facility' + (projectData.facilityType ? projectData.facilityType.charAt(0).toUpperCase() + projectData.facilityType.slice(1) : 'Commercial');
    const facilityLabel = dict[facilityKey] || projectData.facilityType || '—';

    let cameraRows = '';
    calcResults.groupResults.forEach((g, i) => {
      const resLabel = dict['res' + g.resolution] || g.resolution;
      const codecKey = 'codec' + (g.codec === 'h264' ? 'H264' : g.codec === 'h265' ? 'H265' : 'H265Plus');
      const codecLabel = dict[codecKey] || g.codec;
      const safeGroupName = escapeHtml(g.name || `${dict.groupNameDefault} ${i + 1}`);
      cameraRows += `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${safeGroupName}</strong></td>
          <td>${escapeHtml(g.qty)}</td>
          <td>${escapeHtml(resLabel)}</td>
          <td>${escapeHtml(codecLabel)}</td>
          <td>${escapeHtml(g.fps)} fps</td>
          <td>${escapeHtml(g.bitrateMbps)} Mbps</td>
          <td><strong>${g.netTb.toFixed(2)} TiB</strong></td>
          <td>${g.bandwidthMbps.toFixed(1)} Mbps</td>
        </tr>
      `;
    });

    let hddRows = '';
    calcResults.hddRecommendations.slice(0, 5).forEach((h) => {
      const isReco = h.diskSizeTb === 16;
      hddRows += `
        <tr ${isReco ? "style='background:#f0fdf4; font-weight:bold;'" : ''}>
          <td>${h.diskSizeTb} TB Enterprise HDD ${isReco ? '⭐' : ''}</td>
          <td><strong>${h.disksNeeded}</strong> HDDs (${h.dataDisks} Data + ${h.parityDisks} Parity + ${h.hotSpares} Spare)</td>
          <td>${h.hotSpares} Hot Spares</td>
          <td>${h.totalRawCapacityTb} TB (${h.totalUsableTiB} TiB)</td>
          <td>${escapeHtml(h.enclosureRecommendation)}</td>
        </tr>
      `;
    });

    let checkRows = '';
    complianceResults.rules.forEach((r) => {
      const isPass = r.status === 'PASS';
      checkRows += `
        <div class="check-item">
          <span><strong>${escapeHtml(dict[r.name] || r.name)}:</strong> ${escapeHtml(r.details)}</span>
          <span class="${isPass ? 'check-pass' : 'check-fail'}">
            ${isPass ? '✔ ' + (isAr ? 'مطابق' : 'PASSED') : '✖ ' + (isAr ? 'غير مطابق' : 'FAILED')}
          </span>
        </div>
      `;
    });

    const safeProjectName = escapeHtml(projectData.projectName || '—');
    const safeClientName = escapeHtml(projectData.clientName || '—');
    const safeConsultantName = escapeHtml(projectData.consultantName || '—');
    const safeProjectDate = escapeHtml(projectData.projectDate || new Date().toISOString().split('T')[0]);
    const safeMoiRef = escapeHtml(projectData.moiRefNumber || 'N/A');
    const ups = calcResults.powerUps;

    const htmlContent = `
<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(dict.appTitle)} - ${safeProjectName}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body {
      font-family: ${isAr ? "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif" : "'Inter', 'Segoe UI', Arial, sans-serif"};
      color: #0f172a;
      background: #fff;
      margin: 0;
      padding: 15px;
      font-size: 9.5pt;
      line-height: 1.4;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 10px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .logo-title h1 { font-size: 14pt; margin: 0 0 4px 0; color: #0f172a; }
    .logo-title p { font-size: 8.5pt; color: #475569; margin: 0; }
    .badge-status {
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 9pt;
      text-align: center;
      border: 1px solid;
      white-space: nowrap;
    }
    .badge-pass { background: #ecfdf5; color: #065f46; border-color: #10b981; }
    .badge-fail { background: #fff1f2; color: #9f1239; border-color: #f43f5e; }
    .section-title {
      font-size: 10.5pt;
      font-weight: bold;
      color: #0f172a;
      background: #f1f5f9;
      padding: 5px 10px;
      border-${isAr ? 'right' : 'left'}: 4px solid #2563eb;
      margin: 12px 0 8px 0;
    }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 8.5pt; }
    th, td { border: 1px solid #cbd5e1; padding: 5px 7px; text-align: ${isAr ? 'right' : 'left'}; }
    th { background: #f8fafc; color: #334155; font-weight: 600; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 8px; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 7px 9px; text-align: center; }
    .kpi-val { font-size: 12pt; font-weight: bold; color: #1d4ed8; margin-top: 2px; }
    .kpi-lbl { font-size: 7.5pt; color: #64748b; }
    .check-item { display: flex; justify-content: space-between; padding: 5px 8px; border-bottom: 1px solid #f1f5f9; font-size: 8.5pt; }
    .check-pass { color: #059669; font-weight: 600; }
    .check-fail { color: #dc2626; font-weight: 600; }
    .footer-sign { margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; page-break-inside: avoid; }
    .sign-box { border: 1px dashed #94a3b8; border-radius: 6px; padding: 10px; height: 55px; }
    .sign-title { font-size: 8.5pt; font-weight: 600; color: #475569; }
    .footer-note { margin-top: 14px; font-size: 7.5pt; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px; }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-title">
      <h1>${escapeHtml(dict.appTitle)}</h1>
      <p>${escapeHtml(dict.appSubtitle)}</p>
    </div>
    <div class="badge-status ${complianceResults.isFullyCompliant ? 'badge-pass' : 'badge-fail'}">
      ${escapeHtml(complianceResults.isFullyCompliant ? dict.complianceBadgePass : dict.complianceBadgeFail)}
    </div>
  </div>

  <div class="section-title">${escapeHtml(dict.projectInfoTitle)}</div>
  <table>
    <tr>
      <th style="width:20%">${escapeHtml(dict.projectName)}</th>
      <td style="width:30%"><strong>${safeProjectName}</strong></td>
      <th style="width:20%">${escapeHtml(dict.clientName)}</th>
      <td style="width:30%">${safeClientName}</td>
    </tr>
    <tr>
      <th>${escapeHtml(dict.facilityType)}</th>
      <td>${escapeHtml(facilityLabel)}</td>
      <th>${escapeHtml(dict.projectDate)}</th>
      <td>${safeProjectDate}</td>
    </tr>
    <tr>
      <th>${escapeHtml(dict.consultantName)}</th>
      <td>${safeConsultantName}</td>
      <th>${escapeHtml(dict.moiRefNumber)}</th>
      <td>${safeMoiRef}</td>
    </tr>
  </table>

  <div class="section-title">${isAr ? 'الملخص التنفيذي والهندسي' : 'Executive Engineering Summary'}</div>
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-lbl">${escapeHtml(dict.kpiTotalCameras)}</div>
      <div class="kpi-val">${calcResults.totalCameras}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-lbl">${escapeHtml(dict.retentionDays)}</div>
      <div class="kpi-val" style="color:#047857;">${escapeHtml(projectData.retentionDays)} ${isAr ? 'يوم' : 'Days'}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-lbl">${escapeHtml(dict.kpiNetStorage)}</div>
      <div class="kpi-val">${calcResults.totalNetTb} TiB</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-lbl">${escapeHtml(dict.kpiGrossStorage)}</div>
      <div class="kpi-val" style="color:#b91c1c;">${calcResults.grossStorageTb} TB</div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-lbl">${escapeHtml(dict.kpiTotalBandwidth)}</div>
      <div class="kpi-val">${calcResults.totalBandwidthMbps} Mbps</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-lbl">${escapeHtml(dict.raidLevel)}</div>
      <div class="kpi-val">${escapeHtml((projectData.raidLevel || 'RAID 5').toUpperCase())}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-lbl">${escapeHtml(dict.safetyMargin)}</div>
      <div class="kpi-val">${escapeHtml(projectData.safetyMargin)}%</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-lbl">${escapeHtml(dict.recommendedUpsKva)}</div>
      <div class="kpi-val">${ups.recommendedUpsKva} kVA (${ups.totalLoadWatts}W)</div>
    </div>
  </div>

  <div class="section-title">${escapeHtml(dict.cameraGroupsTitle)}</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>${escapeHtml(dict.groupName)}</th>
        <th>${escapeHtml(dict.cameraQty)}</th>
        <th>${escapeHtml(dict.resolution)}</th>
        <th>${escapeHtml(dict.codec)}</th>
        <th>${escapeHtml(dict.fps)}</th>
        <th>${escapeHtml(dict.bitrate)}</th>
        <th>${isAr ? 'صافي السعة' : 'Net Storage'}</th>
        <th>${isAr ? 'النطاق الترددي' : 'Bandwidth'}</th>
      </tr>
    </thead>
    <tbody>${cameraRows}</tbody>
  </table>

  <div class="section-title">${escapeHtml(dict.hddSizingTitle)}</div>
  <table>
    <thead>
      <tr>
        <th>${escapeHtml(dict.diskSize)}</th>
        <th>${escapeHtml(dict.disksNeeded)}</th>
        <th>${escapeHtml(dict.hotSpareDrives)}</th>
        <th>${escapeHtml(dict.totalRawCapacity)}</th>
        <th>${escapeHtml(dict.chassisNeeded)}</th>
      </tr>
    </thead>
    <tbody>${hddRows}</tbody>
  </table>

  <div class="section-title">${escapeHtml(dict.complianceTitle)}</div>
  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px 10px; margin-bottom:10px;">
    ${checkRows}
  </div>

  <div class="footer-sign">
    <div class="sign-box">
      <div class="sign-title">${isAr ? 'اعتماد مهندس التصميم والاستشاري' : 'Consultant / Lead Designer Sign-off'}:</div>
    </div>
    <div class="sign-box">
      <div class="sign-title">${isAr ? 'ختم واعتماد الجهة المنفذة / المقاول' : 'Security Contractor Stamp & Approval'}:</div>
    </div>
  </div>

  <div class="footer-note">
    ${escapeHtml(dict.disclaimer)}<br>
    ${escapeHtml(dict.allRightsReserved)} • Generated: ${escapeHtml(new Date().toLocaleString())}
  </div>

  <div class="no-print" style="margin-top:20px; text-align:center;">
    <button id="btnPrintNow" style="padding:10px 24px; background:#2563eb; color:#fff; border:none; border-radius:6px; font-size:11pt; cursor:pointer; font-weight:bold;">
      🖨️ ${isAr ? 'طباعة / حفظ كملف PDF' : 'Print / Save as PDF'}
    </button>
  </div>
  <script>
    document.getElementById('btnPrintNow').addEventListener('click', function () { window.print(); });
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
    }, 300);
  }
};
