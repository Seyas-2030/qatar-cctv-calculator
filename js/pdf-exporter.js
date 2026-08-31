/**
 * Qatar MOI-SSD CCTV Storage Calculator - Technical Report Generator (PDF / Print)
 */

const PDFExporter = {
  generateReport(projectData, calcResults, complianceResults, lang) {
    const dict = i18n[lang] || i18n.ar;
    const isAr = (lang === 'ar');
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
      cameraRows += `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${g.name || dict.groupNameDefault + ' ' + (i + 1)}</strong></td>
          <td>${g.qty}</td>
          <td>${resLabel}</td>
          <td>${codecLabel}</td>
          <td>${g.fps} fps</td>
          <td>${g.bitrateMbps} Mbps</td>
          <td><strong>${(g.netTb).toFixed(2)} TB</strong></td>
          <td>${(g.bandwidthMbps).toFixed(1)} Mbps</td>
        </tr>
      `;
    });

    let hddRows = '';
    calcResults.hddRecommendations.slice(0, 5).forEach(h => {
      const isReco = (h.diskSizeTb === 16);
      hddRows += `
        <tr ${isReco ? "style='background:#f0fdf4; font-weight:bold;'" : ""}>
          <td>${h.diskSizeTb} TB Enterprise HDD ${isReco ? '⭐' : ''}</td>
          <td><strong>${h.disksNeeded}</strong> HDDs (${h.dataDisks} Data + ${h.hotSpares} Spare)</td>
          <td>${h.hotSpares} Hot Spares</td>
          <td>${h.totalRawCapacityTb} TB</td>
          <td>${h.enclosureRecommendation}</td>
        </tr>
      `;
    });

    let checkRows = '';
    complianceResults.rules.forEach(r => {
      const isPass = (r.status === 'PASS');
      checkRows += `
        <div class="check-item">
          <span><strong>${dict[r.name] || r.name}:</strong> ${r.details}</span>
          <span class="${isPass ? 'check-pass' : 'check-fail'}">
            ${isPass ? '✔ ' + (isAr ? 'مطابق' : 'PASSED') : '✖ ' + (isAr ? 'غير مطابق' : 'FAILED')}
          </span>
        </div>
      `;
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <title>${dict.appTitle} - ${projectData.projectName || 'MOI-SSD CCTV Report'}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 12mm 12mm 12mm; }
    body {
      font-family: ${isAr ? "'Segoe UI', Tahoma, Cairo, Arial, sans-serif" : "'Inter', 'Segoe UI', Arial, sans-serif"};
      color: #0f172a;
      background: #fff;
      margin: 0;
      padding: 15px;
      font-size: 10pt;
      line-height: 1.4;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 10px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-title h1 {
      font-size: 15pt;
      margin: 0 0 4px 0;
      color: #0f172a;
    }
    .logo-title p {
      font-size: 9pt;
      color: #475569;
      margin: 0;
    }
    .badge-status {
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 10pt;
      text-align: center;
      border: 1px solid;
    }
    .badge-pass { background: #ecfdf5; color: #065f46; border-color: #10b981; }
    .badge-fail { background: #fff1f2; color: #9f1239; border-color: #f43f5e; }

    .section-title {
      font-size: 11pt;
      font-weight: bold;
      color: #0f172a;
      background: #f1f5f9;
      padding: 5px 10px;
      border-${isAr ? 'right' : 'left'}: 4px solid #2563eb;
      margin: 14px 0 8px 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 9pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
      text-align: ${isAr ? 'right' : 'left'};
    }
    th {
      background: #f8fafc;
      color: #334155;
      font-weight: 600;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 10px;
    }
    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      text-align: center;
    }
    .kpi-val { font-size: 13pt; font-weight: bold; color: #1d4ed8; margin-top: 2px; }
    .kpi-lbl { font-size: 8pt; color: #64748b; }

    .check-item {
      display: flex;
      justify-content: space-between;
      padding: 5px 8px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 8.5pt;
    }
    .check-pass { color: #059669; font-weight: 600; }
    .check-fail { color: #dc2626; font-weight: 600; }

    .footer-sign {
      margin-top: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      page-break-inside: avoid;
    }
    .sign-box {
      border: 1px dashed #94a3b8;
      border-radius: 6px;
      padding: 10px;
      height: 60px;
    }
    .sign-title { font-size: 8.5pt; font-weight: 600; color: #475569; }

    .footer-note {
      margin-top: 16px;
      font-size: 8pt;
      color: #64748b;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-title">
      <h1>${dict.appTitle}</h1>
      <p>${dict.appSubtitle}</p>
    </div>
    <div>
      <div class="badge-status ${complianceResults.isFullyCompliant ? 'badge-pass' : 'badge-fail'}">
        ${complianceResults.isFullyCompliant ? dict.complianceBadgePass : dict.complianceBadgeFail}
      </div>
    </div>
  </div>

  <!-- Project Metadata Table -->
  <div class="section-title">${dict.projectInfoTitle}</div>
  <table>
    <tr>
      <th style="width:20%">${dict.projectName}</th>
      <td style="width:30%"><strong>${projectData.projectName || '—'}</strong></td>
      <th style="width:20%">${dict.clientName}</th>
      <td style="width:30%">${projectData.clientName || '—'}</td>
    </tr>
    <tr>
      <th>${dict.facilityType}</th>
      <td>${facilityLabel}</td>
      <th>${dict.projectDate}</th>
      <td>${projectData.projectDate || new Date().toISOString().split('T')[0]}</td>
    </tr>
    <tr>
      <th>${dict.consultantName}</th>
      <td>${projectData.consultantName || '—'}</td>
      <th>${dict.moiRefNumber}</th>
      <td>${projectData.moiRefNumber || 'N/A'}</td>
    </tr>
  </table>

  <!-- KPI Executive Summary -->
  <div class="section-title">${isAr ? 'الملخص التنفيذي والهندسي' : 'Executive Engineering Summary'}</div>
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-lbl">${dict.kpiTotalCameras}</div>
      <div class="kpi-val">${calcResults.totalCameras}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-lbl">${dict.retentionDays}</div>
      <div class="kpi-val" style="color:#047857;">${projectData.retentionDays} ${isAr ? 'يوم' : 'Days'}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-lbl">${dict.kpiNetStorage}</div>
      <div class="kpi-val">${calcResults.totalNetTb} TB</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-lbl">${dict.kpiGrossStorage}</div>
      <div class="kpi-val" style="color:#b91c1c;">${calcResults.grossStorageTb} TB</div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-lbl">${dict.kpiTotalBandwidth}</div>
      <div class="kpi-val">${calcResults.totalBandwidthMbps} Mbps</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-lbl">${dict.raidLevel}</div>
      <div class="kpi-val">${(projectData.raidLevel || 'RAID 5').toUpperCase()}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-lbl">${dict.safetyMargin}</div>
      <div class="kpi-val">${projectData.safetyMargin}%</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-lbl">${dict.kpiRecommendedHdd}</div>
      <div class="kpi-val">${calcResults.hddRecommendations.find(h => h.diskSizeTb === 16)?.disksNeeded || '—'} HDDs</div>
    </div>
  </div>

  <!-- Camera Schedule Table -->
  <div class="section-title">${dict.cameraGroupsTitle}</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>${dict.groupName}</th>
        <th>${dict.cameraQty}</th>
        <th>${dict.resolution}</th>
        <th>${dict.codec}</th>
        <th>${dict.fps}</th>
        <th>${dict.bitrate}</th>
        <th>${isAr ? 'صافي السعة' : 'Net Storage'}</th>
        <th>${isAr ? 'النطاق الترددي' : 'Bandwidth'}</th>
      </tr>
    </thead>
    <tbody>
      ${cameraRows}
    </tbody>
  </table>

  <!-- Hard Drive Sizing & Storage Pool -->
  <div class="section-title">${dict.hddSizingTitle}</div>
  <table>
    <thead>
      <tr>
        <th>${dict.diskSize}</th>
        <th>${dict.disksNeeded}</th>
        <th>${dict.hotSpareDrives}</th>
        <th>${isAr ? 'إجمالي السعة الخام' : 'Total Raw Capacity'}</th>
        <th>${dict.chassisNeeded}</th>
      </tr>
    </thead>
    <tbody>
      ${hddRows}
    </tbody>
  </table>

  <!-- MOI Compliance Checklist -->
  <div class="section-title">${dict.complianceTitle}</div>
  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px 10px; margin-bottom:10px;">
    ${checkRows}
  </div>

  <!-- Signoff block -->
  <div class="footer-sign">
    <div class="sign-box">
      <div class="sign-title">${isAr ? 'اعتماد مهندس التصميم والاستشاري' : 'Consultant / Lead Designer Sign-off'}:</div>
    </div>
    <div class="sign-box">
      <div class="sign-title">${isAr ? 'ختم واعتماد الجهة المنفذة / المقاول' : 'Security Contractor Stamp & Approval'}:</div>
    </div>
  </div>

  <div class="footer-note">
    ${dict.disclaimer}<br>
    ${dict.allRightsReserved} • Generated: ${new Date().toLocaleString()}
  </div>

  <div class="no-print" style="margin-top:20px; text-align:center;">
    <button onclick="window.print()" style="padding:10px 24px; background:#2563eb; color:#fff; border:none; border-radius:6px; font-size:11pt; cursor:pointer; font-weight:bold;">
      🖨️ ${isAr ? 'طباعة / حفظ كملف PDF' : 'Print / Save as PDF'}
    </button>
  </div>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
    }, 400);
  }
};
