/**
 * Qatar MOI-SSD CCTV Storage & Compliance Calculator
 * Main Application Controller (Bilingual UI, Reactive State, Chart.js Integration)
 */

const AppState = {
  currentLang: 'ar',
  project: {
    projectName: 'مشروع برج الأعمال - لوسيل',
    clientName: 'شركة قطر للاستثمار والتطوير',
    facilityType: 'commercial',
    consultantName: 'م. خالد المنصوري',
    projectDate: new Date().toISOString().split('T')[0],
    moiRefNumber: 'MOI-SSD-2026-0842',
    retentionDays: 120,
    hoursPerDay: 24,
    raidLevel: 'raid5',
    safetyMargin: 15,
    hotSpareDrives: 1,
    cameraGroups: [
      { id: 1, name: 'كاميرات المداخل والبوابات (ANPR)', qty: 6, resolution: '4mp', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 3.2, motionFactor: 100, targetCoverage: 'covAnpr' },
      { id: 2, name: 'كاميرات البهو والاستقبال (ID)', qty: 14, resolution: '1080p', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 2.0, motionFactor: 80, targetCoverage: 'covId' },
      { id: 3, name: 'كاميرات الممرات والأدوار (Overview)', qty: 20, resolution: '1080p', codec: 'h265', fps: 20, isAutoBitrate: true, customBitrate: 1.6, motionFactor: 60, targetCoverage: 'covDet' },
      { id: 4, name: 'كاميرات محيط المبنى والأسوار', qty: 10, resolution: '4mp', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 3.2, motionFactor: 90, targetCoverage: 'covDet' }
    ]
  },
  charts: {
    storageDonut: null,
    bandwidthBar: null,
    retentionTimeline: null
  }
};

// Preset Templates
const ProjectPresets = {
  commercial: {
    projectName: 'برج الأعمال والمكاتب - الدوحة',
    facilityType: 'commercial',
    retentionDays: 120,
    hoursPerDay: 24,
    raidLevel: 'raid5',
    safetyMargin: 15,
    hotSpareDrives: 1,
    cameraGroups: [
      { id: 1, name: 'بوابات المركبات (ANPR)', qty: 4, resolution: '4mp', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 3.2, motionFactor: 100, targetCoverage: 'covAnpr' },
      { id: 2, name: 'مداخل ومخارج المبنى (ID)', qty: 8, resolution: '1080p', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 2.0, motionFactor: 80, targetCoverage: 'covId' },
      { id: 3, name: 'ممرات المكاتب والمصاعد', qty: 26, resolution: '1080p', codec: 'h265', fps: 15, isAutoBitrate: true, customBitrate: 1.2, motionFactor: 50, targetCoverage: 'covDet' },
      { id: 4, name: 'مواقف السيارات والمحيط', qty: 12, resolution: '4mp', codec: 'h265', fps: 20, isAutoBitrate: true, customBitrate: 2.5, motionFactor: 70, targetCoverage: 'covDet' }
    ]
  },
  hotel: {
    projectName: 'فندق ومنتجع لوسيل الفاخر (5 نجوم)',
    facilityType: 'hotel',
    retentionDays: 120,
    hoursPerDay: 24,
    raidLevel: 'raid6',
    safetyMargin: 20,
    hotSpareDrives: 2,
    cameraGroups: [
      { id: 1, name: 'بوابات ومواقف VIP (ANPR)', qty: 8, resolution: '4mp', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 3.2, motionFactor: 100, targetCoverage: 'covAnpr' },
      { id: 2, name: 'البهو الرئيسي والاستقبال (Face ID)', qty: 24, resolution: '4k', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 6.0, motionFactor: 90, targetCoverage: 'covId' },
      { id: 3, name: 'ممرات الغرف والمصاعد', qty: 60, resolution: '1080p', codec: 'h265', fps: 20, isAutoBitrate: true, customBitrate: 1.6, motionFactor: 60, targetCoverage: 'covDet' },
      { id: 4, name: 'المسابح والمطاعم والشاطئ', qty: 18, resolution: '4mp', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 3.2, motionFactor: 80, targetCoverage: 'covGeneral' },
      { id: 5, name: 'الأسوار ومحيط المنتجع', qty: 10, resolution: '4k', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 6.0, motionFactor: 90, targetCoverage: 'covDet' }
    ]
  },
  bank: {
    projectName: 'المقر الرئيسي للبنك التجاري',
    facilityType: 'bank',
    retentionDays: 120,
    hoursPerDay: 24,
    raidLevel: 'raid6',
    safetyMargin: 20,
    hotSpareDrives: 2,
    cameraGroups: [
      { id: 1, name: 'أجهزة الصراف الآلي (ATM Cameras)', qty: 6, resolution: '4mp', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 3.2, motionFactor: 100, targetCoverage: 'covId' },
      { id: 2, name: 'صالات خدمة العملاء والخزائن (Vaults)', qty: 12, resolution: '4k', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 6.0, motionFactor: 100, targetCoverage: 'covId' },
      { id: 3, name: 'مداخل ومخارج الفروع الأمنية', qty: 6, resolution: '4mp', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 3.2, motionFactor: 100, targetCoverage: 'covId' },
      { id: 4, name: 'الممرات والمكاتب الخلفية', qty: 6, resolution: '1080p', codec: 'h265', fps: 20, isAutoBitrate: true, customBitrate: 1.6, motionFactor: 70, targetCoverage: 'covDet' }
    ]
  },
  gov: {
    projectName: 'مجمع المنشآت الحكومية الحيوية',
    facilityType: 'gov',
    retentionDays: 120,
    hoursPerDay: 24,
    raidLevel: 'raid6',
    safetyMargin: 20,
    hotSpareDrives: 4,
    cameraGroups: [
      { id: 1, name: 'بوابات التفتيش الأمني والدخول (ANPR)', qty: 16, resolution: '4k', codec: 'h265', fps: 30, isAutoBitrate: true, customBitrate: 7.2, motionFactor: 100, targetCoverage: 'covAnpr' },
      { id: 2, name: 'كاميرات التعرف على الوجوه (Face ID)', qty: 34, resolution: '4k', codec: 'h265', fps: 30, isAutoBitrate: true, customBitrate: 7.2, motionFactor: 100, targetCoverage: 'covId' },
      { id: 3, name: 'الأسوار الخارجية وحماية المحيط (Perimeter)', qty: 40, resolution: '4mp', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 3.2, motionFactor: 100, targetCoverage: 'covDet' },
      { id: 4, name: 'الممرات الداخلية والقاعات الحيوية', qty: 80, resolution: '1080p', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 2.0, motionFactor: 80, targetCoverage: 'covDet' },
      { id: 5, name: 'كاميرات المراقبة البانورامية (360 Panoramas)', qty: 30, resolution: '12mp', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 9.0, motionFactor: 90, targetCoverage: 'covGeneral' }
    ]
  }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  init() {
    this.loadFromStorage();
    this.bindEvents();
    this.applyLanguage();
    this.calculateAndUpdate();
  },

  // Language management
  setLanguage(lang) {
    AppState.currentLang = lang;
    this.applyLanguage();
    this.calculateAndUpdate();
  },

  toggleLanguage() {
    const nextLang = (AppState.currentLang === 'ar') ? 'en' : 'ar';
    this.setLanguage(nextLang);
  },

  applyLanguage() {
    const lang = AppState.currentLang;
    const dict = i18n[lang];
    const isAr = (lang === 'ar');

    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';

    // Update text elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // Language toggle button text
    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) {
      langBtn.innerHTML = `🌐 <span>${isAr ? 'English' : 'العربية'}</span>`;
    }

    this.renderFormInputs();
    this.renderCameraGroups();
  },

  // Render static form inputs values
  renderFormInputs() {
    const p = AppState.project;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('inputProjectName', p.projectName || '');
    setVal('inputClientName', p.clientName || '');
    setVal('selectFacilityType', p.facilityType || 'commercial');
    setVal('inputConsultantName', p.consultantName || '');
    setVal('inputProjectDate', p.projectDate || '');
    setVal('inputMoiRef', p.moiRefNumber || '');

    setVal('inputRetentionDays', p.retentionDays || 120);
    setVal('inputHoursPerDay', p.hoursPerDay || 24);
    setVal('selectRaidLevel', p.raidLevel || 'raid5');
    setVal('inputSafetyMargin', p.safetyMargin || 15);
    setVal('inputHotSpares', p.hotSpareDrives || 1);
  },

  // Bind UI Events
  bindEvents() {
    // Project info inputs
    const bindInput = (id, field) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          AppState.project[field] = e.target.value;
          this.calculateAndUpdate();
        });
      }
    };

    bindInput('inputProjectName', 'projectName');
    bindInput('inputClientName', 'clientName');
    bindInput('selectFacilityType', 'facilityType');
    bindInput('inputConsultantName', 'consultantName');
    bindInput('inputProjectDate', 'projectDate');
    bindInput('inputMoiRef', 'moiRefNumber');

    bindInput('inputRetentionDays', 'retentionDays');
    bindInput('inputHoursPerDay', 'hoursPerDay');
    bindInput('selectRaidLevel', 'raidLevel');
    bindInput('inputSafetyMargin', 'safetyMargin');
    bindInput('inputHotSpares', 'hotSpareDrives');

    // Language Toggle
    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) {
      langBtn.addEventListener('click', () => this.toggleLanguage());
    }

    // Add Camera Group Button
    const addGroupBtn = document.getElementById('btnAddCameraGroup');
    if (addGroupBtn) {
      addGroupBtn.addEventListener('click', () => this.addCameraGroup());
    }

    // Presets Dropdown
    const presetSelect = document.getElementById('selectPreset');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        if (e.target.value) {
          this.loadPreset(e.target.value);
          e.target.value = '';
        }
      });
    }

    // Action Buttons
    const btnExportPdf = document.getElementById('btnExportPdf');
    if (btnExportPdf) {
      btnExportPdf.addEventListener('click', () => this.exportPdf());
    }

    const btnExportJson = document.getElementById('btnExportJson');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => this.exportJson());
    }

    const btnImportJson = document.getElementById('btnImportJson');
    const inputImportFile = document.getElementById('inputImportFile');
    if (btnImportJson && inputImportFile) {
      btnImportJson.addEventListener('click', () => inputImportFile.click());
      inputImportFile.addEventListener('change', (e) => this.handleFileImport(e));
    }

    const btnReset = document.getElementById('btnResetProject');
    if (btnReset) {
      btnReset.addEventListener('click', () => this.resetProject());
    }
  },

  // Render Camera Matrix
  renderCameraGroups() {
    const container = document.getElementById('cameraGroupsTableBody');
    if (!container) return;

    const dict = i18n[AppState.currentLang];
    const isAr = (AppState.currentLang === 'ar');
    container.innerHTML = '';

    AppState.project.cameraGroups.forEach((group, index) => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-700 hover:bg-slate-800/40 transition-colors';

      const res = Calculator.calculateGroupStorage(group, AppState.project.retentionDays, AppState.project.hoursPerDay);

      tr.innerHTML = `
        <td class="p-3 text-center text-slate-400 font-mono text-xs">${index + 1}</td>
        <td class="p-3">
          <input type="text" class="w-full bg-slate-900/80 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
            value="${group.name || ''}" placeholder="${dict.groupNameDefault}"
            onchange="App.updateGroupField(${group.id}, 'name', this.value)" />
        </td>
        <td class="p-3" style="width:90px;">
          <input type="number" min="1" max="999" class="w-full bg-slate-900/80 border border-slate-700 rounded px-2 py-1.5 text-sm text-center text-slate-100 focus:border-blue-500 focus:outline-none"
            value="${group.qty}"
            onchange="App.updateGroupField(${group.id}, 'qty', parseInt(this.value) || 1)" />
        </td>
        <td class="p-3">
          <select class="w-full bg-slate-900/80 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
            onchange="App.updateGroupField(${group.id}, 'resolution', this.value)">
            <option value="720p" ${group.resolution === '720p' ? 'selected' : ''}>${dict.res720p}</option>
            <option value="1080p" ${group.resolution === '1080p' ? 'selected' : ''}>${dict.res1080p}</option>
            <option value="3mp" ${group.resolution === '3mp' ? 'selected' : ''}>${dict.res3mp}</option>
            <option value="4mp" ${group.resolution === '4mp' ? 'selected' : ''}>${dict.res4mp}</option>
            <option value="5mp" ${group.resolution === '5mp' ? 'selected' : ''}>${dict.res5mp}</option>
            <option value="4k" ${group.resolution === '4k' ? 'selected' : ''}>${dict.res4k}</option>
            <option value="12mp" ${group.resolution === '12mp' ? 'selected' : ''}>${dict.res12mp}</option>
          </select>
        </td>
        <td class="p-3">
          <select class="w-full bg-slate-900/80 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
            onchange="App.updateGroupField(${group.id}, 'codec', this.value)">
            <option value="h264" ${group.codec === 'h264' ? 'selected' : ''}>${dict.codecH264}</option>
            <option value="h265" ${group.codec === 'h265' ? 'selected' : ''}>${dict.codecH265}</option>
            <option value="h265plus" ${group.codec === 'h265plus' ? 'selected' : ''}>${dict.codecH265Plus}</option>
          </select>
        </td>
        <td class="p-3" style="width:80px;">
          <input type="number" min="5" max="60" class="w-full bg-slate-900/80 border border-slate-700 rounded px-2 py-1.5 text-xs text-center text-slate-100 focus:border-blue-500 focus:outline-none"
            value="${group.fps || 25}"
            onchange="App.updateGroupField(${group.id}, 'fps', parseInt(this.value) || 25)" />
        </td>
        <td class="p-3 text-center">
          <span class="inline-block px-2.5 py-1 rounded bg-blue-950/60 border border-blue-800 text-blue-300 font-mono text-xs font-semibold">
            ${res.bitrateMbps} Mbps
          </span>
        </td>
        <td class="p-3" style="width:110px;">
          <div class="flex items-center space-x-1.5 rtl:space-x-reverse">
            <input type="range" min="20" max="100" step="5" class="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              value="${group.motionFactor || 100}"
              oninput="this.nextElementSibling.textContent = this.value + '%'; App.updateGroupField(${group.id}, 'motionFactor', parseInt(this.value))" />
            <span class="text-xs font-mono text-slate-300 w-9 text-right">${group.motionFactor || 100}%</span>
          </div>
        </td>
        <td class="p-3">
          <select class="w-full bg-slate-900/80 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
            onchange="App.updateGroupField(${group.id}, 'targetCoverage', this.value)">
            <option value="covId" ${group.targetCoverage === 'covId' ? 'selected' : ''}>${dict.covId}</option>
            <option value="covAnpr" ${group.targetCoverage === 'covAnpr' ? 'selected' : ''}>${dict.covAnpr}</option>
            <option value="covRec" ${group.targetCoverage === 'covRec' ? 'selected' : ''}>${dict.covRec}</option>
            <option value="covDet" ${group.targetCoverage === 'covDet' ? 'selected' : ''}>${dict.covDet}</option>
            <option value="covGeneral" ${group.targetCoverage === 'covGeneral' ? 'selected' : ''}>${dict.covGeneral}</option>
          </select>
        </td>
        <td class="p-3 text-center">
          <div class="flex items-center justify-center space-x-1.5 rtl:space-x-reverse">
            <button class="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors" title="${dict.duplicate}" onclick="App.duplicateGroup(${group.id})">
              📋
            </button>
            <button class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors" title="${dict.delete}" onclick="App.deleteGroup(${group.id})">
              🗑️
            </button>
          </div>
        </td>
      `;

      container.appendChild(tr);
    });
  },

  // Group modifications
  addCameraGroup() {
    const nextId = Date.now();
    const newGroup = {
      id: nextId,
      name: `${i18n[AppState.currentLang].groupNameDefault} ${AppState.project.cameraGroups.length + 1}`,
      qty: 8,
      resolution: '1080p',
      codec: 'h265',
      fps: 25,
      isAutoBitrate: true,
      customBitrate: 2.0,
      motionFactor: 80,
      targetCoverage: 'covDet'
    };
    AppState.project.cameraGroups.push(newGroup);
    this.renderCameraGroups();
    this.calculateAndUpdate();
  },

  duplicateGroup(id) {
    const group = AppState.project.cameraGroups.find(g => g.id === id);
    if (!group) return;
    const cloned = JSON.parse(JSON.stringify(group));
    cloned.id = Date.now();
    cloned.name += ' (Copy)';
    AppState.project.cameraGroups.push(cloned);
    this.renderCameraGroups();
    this.calculateAndUpdate();
  },

  deleteGroup(id) {
    if (AppState.project.cameraGroups.length <= 1) {
      alert('At least one camera group is required.');
      return;
    }
    AppState.project.cameraGroups = AppState.project.cameraGroups.filter(g => g.id !== id);
    this.renderCameraGroups();
    this.calculateAndUpdate();
  },

  updateGroupField(id, field, value) {
    const group = AppState.project.cameraGroups.find(g => g.id === id);
    if (group) {
      group[field] = value;
      this.calculateAndUpdate();
    }
  },

  // Main Calculation & UI Update
  calculateAndUpdate() {
    const calcResults = Calculator.calculateProjectTotals(AppState.project);
    const complianceResults = ComplianceValidator.validate(AppState.project, calcResults);

    this.updateKpis(calcResults, complianceResults);
    this.updateHddTable(calcResults);
    this.updateComplianceSection(complianceResults);
    this.updateCharts(calcResults);
    this.saveToStorage();
  },

  updateKpis(calc, comp) {
    const isAr = (AppState.currentLang === 'ar');
    const setHtml = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = val;
    };

    setHtml('kpiValCameras', calc.totalCameras);
    setHtml('kpiValRetention', `${AppState.project.retentionDays} <span class="text-xs text-slate-400 font-normal">${isAr ? 'يوم' : 'Days'}</span>`);
    setHtml('kpiValNetStorage', `${calc.totalNetTb} <span class="text-xs text-slate-400 font-normal">TB</span>`);
    setHtml('kpiValGrossStorage', `${calc.grossStorageTb} <span class="text-xs text-slate-400 font-normal">TB</span>`);
    setHtml('kpiValBandwidth', `${calc.totalBandwidthMbps} <span class="text-xs text-slate-400 font-normal">Mbps</span>`);

    const recoHdd = calc.hddRecommendations.find(h => h.diskSizeTb === 16);
    setHtml('kpiValHdd', `${recoHdd ? recoHdd.disksNeeded : '—'} <span class="text-xs text-slate-400 font-normal">HDDs</span>`);

    // Compliance Badge
    const badgeEl = document.getElementById('kpiValCompliance');
    if (badgeEl) {
      if (comp.isFullyCompliant) {
        badgeEl.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-950/80 border border-emerald-600 text-emerald-300 flex items-center justify-center space-x-1.5 rtl:space-x-reverse';
        badgeEl.innerHTML = `<span>✔</span> <span>${i18n[AppState.currentLang].kpiCompliant}</span>`;
      } else {
        badgeEl.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-950/80 border border-rose-600 text-rose-300 flex items-center justify-center space-x-1.5 rtl:space-x-reverse';
        badgeEl.innerHTML = `<span>✖</span> <span>${i18n[AppState.currentLang].kpiNonCompliant}</span>`;
      }
    }
  },

  updateHddTable(calc) {
    const tbody = document.getElementById('hddTableBody');
    if (!tbody) return;

    const dict = i18n[AppState.currentLang];
    const isAr = (AppState.currentLang === 'ar');
    tbody.innerHTML = '';

    calc.hddRecommendations.forEach(h => {
      const isReco = (h.diskSizeTb === 16);
      const tr = document.createElement('tr');
      tr.className = `border-b border-slate-750 ${isReco ? 'bg-emerald-950/20 font-semibold' : 'hover:bg-slate-800/30'}`;

      tr.innerHTML = `
        <td class="p-3 text-slate-200">
          <div class="flex items-center space-x-2 rtl:space-x-reverse">
            <span>${h.diskSizeTb} TB Enterprise SATA/SAS</span>
            ${isReco ? `<span class="px-2 py-0.5 rounded text-[10px] bg-emerald-800 text-emerald-100">${isAr ? 'موصى به' : 'Recommended'}</span>` : ''}
          </div>
        </td>
        <td class="p-3 text-center text-slate-100 font-mono text-base font-bold">${h.disksNeeded}</td>
        <td class="p-3 text-center text-slate-300 font-mono text-xs">${h.dataDisks} Data + ${h.hotSpares} Parity/Spare</td>
        <td class="p-3 text-center text-slate-300 font-mono text-xs">${h.totalRawCapacityTb} TB</td>
        <td class="p-3 text-slate-300 text-xs">${h.enclosureRecommendation}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  updateComplianceSection(comp) {
    const listContainer = document.getElementById('complianceRulesList');
    if (!listContainer) return;

    const dict = i18n[AppState.currentLang];
    const isAr = (AppState.currentLang === 'ar');
    listContainer.innerHTML = '';

    comp.rules.forEach(rule => {
      const isPass = (rule.status === 'PASS');
      const item = document.createElement('div');
      item.className = `p-3.5 rounded-xl border flex items-start justify-between space-x-3 rtl:space-x-reverse transition-colors ${
        isPass ? 'bg-emerald-950/20 border-emerald-800/60' : 'bg-rose-950/20 border-rose-800/60'
      }`;

      item.innerHTML = `
        <div class="flex items-start space-x-3 rtl:space-x-reverse">
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 ${
            isPass ? 'bg-emerald-800/80 text-emerald-100' : 'bg-rose-800/80 text-rose-100'
          }">
            ${isPass ? '✔' : '✖'}
          </div>
          <div>
            <div class="font-semibold text-sm ${isPass ? 'text-emerald-300' : 'text-rose-300'}">
              ${dict[rule.name] || rule.name}
            </div>
            <div class="text-xs text-slate-400 mt-1">
              ${isPass ? dict[rule.passMsg] : dict[rule.failMsg]}
            </div>
            <div class="text-[11px] font-mono text-slate-500 mt-1">
              ${rule.details}
            </div>
          </div>
        </div>
        <div class="shrink-0">
          <span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
            isPass ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' : 'bg-rose-900/60 text-rose-300 border border-rose-700'
          }">
            ${isPass ? (isAr ? 'مطابق' : 'PASS') : (isAr ? 'تنبيه' : 'FAIL')}
          </span>
        </div>
      `;
      listContainer.appendChild(item);
    });
  },

  // Chart.js Visualizations
  updateCharts(calc) {
    if (typeof Chart === 'undefined') return;

    const dict = i18n[AppState.currentLang];
    const isAr = (AppState.currentLang === 'ar');

    // 1. Donut Chart - Storage by Group
    const ctxDonut = document.getElementById('chartStorageDonut');
    if (ctxDonut) {
      const labels = calc.groupResults.map(g => g.name || dict.groupNameDefault);
      const dataValues = calc.groupResults.map(g => parseFloat(g.netTb.toFixed(2)));

      if (AppState.charts.storageDonut) {
        AppState.charts.storageDonut.data.labels = labels;
        AppState.charts.storageDonut.data.datasets[0].data = dataValues;
        AppState.charts.storageDonut.update();
      } else {
        AppState.charts.storageDonut = new Chart(ctxDonut, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: dataValues,
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'],
              borderColor: '#0f172a',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } }
            }
          }
        });
      }
    }

    // 2. Bar Chart - Bandwidth by Group
    const ctxBar = document.getElementById('chartBandwidthBar');
    if (ctxBar) {
      const labels = calc.groupResults.map(g => g.name || dict.groupNameDefault);
      const dataValues = calc.groupResults.map(g => parseFloat(g.bandwidthMbps.toFixed(1)));

      if (AppState.charts.bandwidthBar) {
        AppState.charts.bandwidthBar.data.labels = labels;
        AppState.charts.bandwidthBar.data.datasets[0].data = dataValues;
        AppState.charts.bandwidthBar.update();
      } else {
        AppState.charts.bandwidthBar = new Chart(ctxBar, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Mbps',
              data: dataValues,
              backgroundColor: '#06b6d4',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#334155' } },
              y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
            },
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
    }

    // 3. Line/Bar Chart - Retention Timeline Comparison
    const ctxTimeline = document.getElementById('chartRetentionTimeline');
    if (ctxTimeline) {
      const labels = calc.retentionComparison.map(c => `${c.days} ${isAr ? 'يوم' : 'Days'}`);
      const grossData = calc.retentionComparison.map(c => c.grossTb);

      if (AppState.charts.retentionTimeline) {
        AppState.charts.retentionTimeline.data.labels = labels;
        AppState.charts.retentionTimeline.data.datasets[0].data = grossData;
        AppState.charts.retentionTimeline.update();
      } else {
        AppState.charts.retentionTimeline = new Chart(ctxTimeline, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: `${isAr ? 'السعة الكلية (TB)' : 'Gross TB'}`,
              data: grossData,
              backgroundColor: ['#64748b', '#64748b', '#64748b', '#10b981', '#64748b'],
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
              y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
            },
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
    }
  },

  // Preset Template Loader
  loadPreset(presetKey) {
    const preset = ProjectPresets[presetKey];
    if (!preset) return;

    AppState.project = JSON.parse(JSON.stringify(preset));
    AppState.project.projectDate = new Date().toISOString().split('T')[0];
    this.renderFormInputs();
    this.renderCameraGroups();
    this.calculateAndUpdate();
  },

  // Export PDF Report
  exportPdf() {
    const calc = Calculator.calculateProjectTotals(AppState.project);
    const comp = ComplianceValidator.validate(AppState.project, calc);
    PDFExporter.generateReport(AppState.project, calc, comp, AppState.currentLang);
  },

  // Export JSON
  exportJson() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(AppState.project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${AppState.project.projectName || 'cctv_project'}_moi_cctv.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  // Import JSON
  handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.cameraGroups && Array.isArray(imported.cameraGroups)) {
          AppState.project = imported;
          this.renderFormInputs();
          this.renderCameraGroups();
          this.calculateAndUpdate();
          alert(i18n[AppState.currentLang].importSuccess);
        } else {
          alert(i18n[AppState.currentLang].importError);
        }
      } catch (err) {
        alert(i18n[AppState.currentLang].importError);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  },

  // Reset to default
  resetProject() {
    if (confirm(i18n[AppState.currentLang].confirmReset)) {
      this.loadPreset('commercial');
    }
  },

  // LocalStorage Persistence
  saveToStorage() {
    try {
      localStorage.setItem('moi_cctv_project', JSON.stringify(AppState.project));
      localStorage.setItem('moi_cctv_lang', AppState.currentLang);
    } catch (e) {}
  },

  loadFromStorage() {
    try {
      const savedLang = localStorage.getItem('moi_cctv_lang');
      if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
        AppState.currentLang = savedLang;
      }
      const savedProj = localStorage.getItem('moi_cctv_project');
      if (savedProj) {
        AppState.project = JSON.parse(savedProj);
      }
    } catch (e) {}
  }
};
