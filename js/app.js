import '@fontsource/cairo/400.css';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/800.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '../css/style.css';

import Chart from 'chart.js/auto';
import { registerSW } from 'virtual:pwa-register';

import { i18n } from './i18n.js';
import { Calculator } from './calculator.js';
import { ComplianceValidator } from './compliance.js';
import { PDFExporter } from './pdf-exporter.js';
import { BOQExporter } from './boq-exporter.js';
import { escapeHtml, toFloat, toInt, validateImportedProject } from './utils.js';

// Register Offline-First PWA Service Worker
try {
  registerSW({ immediate: true });
} catch {
  // Ignore in non-browser or test environments
}

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
    hasUps: true,
    upsBackupMinutes: 60,
    upsPowerFactor: 0.8,
    cameraPowerWatts: 12,
    nvrPowerWatts: 250,
    switchPowerWatts: 45,
    subStreamEnabled: false,
    subStreamBitrateMbps: 0.5,
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

const ProjectPresets = {
  commercial: {
    projectName: 'برج الأعمال والمكاتب - الدوحة',
    facilityType: 'commercial',
    retentionDays: 120,
    hoursPerDay: 24,
    raidLevel: 'raid5',
    safetyMargin: 15,
    hotSpareDrives: 1,
    hasUps: true,
    upsBackupMinutes: 60,
    cameraPowerWatts: 12,
    nvrPowerWatts: 250,
    switchPowerWatts: 45,
    subStreamEnabled: false,
    subStreamBitrateMbps: 0.5,
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
    hasUps: true,
    upsBackupMinutes: 60,
    cameraPowerWatts: 12,
    nvrPowerWatts: 250,
    switchPowerWatts: 45,
    subStreamEnabled: false,
    subStreamBitrateMbps: 0.5,
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
    hasUps: true,
    upsBackupMinutes: 60,
    cameraPowerWatts: 12,
    nvrPowerWatts: 250,
    switchPowerWatts: 45,
    subStreamEnabled: true,
    subStreamBitrateMbps: 0.5,
    cameraGroups: [
      { id: 1, name: 'أجهزة الصراف الآلي (ATM Cameras)', qty: 6, resolution: '4mp', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 3.2, motionFactor: 100, targetCoverage: 'covId' },
      { id: 2, name: 'صالات خدمة العملاء والخزائن (Vaults)', qty: 12, resolution: '4k', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 6.0, motionFactor: 100, targetCoverage: 'covId' },
      { id: 3, name: 'مداخل ومخارج الفروع الأمنية', qty: 6, resolution: '4mp', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 3.2, motionFactor: 100, targetCoverage: 'covId' },
      { id: 4, name: 'الممرات والمكاتب الخلفية', qty: 6, resolution: '1080p', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 2.0, motionFactor: 70, targetCoverage: 'covDet' }
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
    hasUps: true,
    upsBackupMinutes: 90,
    cameraPowerWatts: 15,
    nvrPowerWatts: 300,
    switchPowerWatts: 60,
    subStreamEnabled: true,
    subStreamBitrateMbps: 0.5,
    cameraGroups: [
      { id: 1, name: 'بوابات التفتيش الأمني والدخول (ANPR)', qty: 16, resolution: '4k', codec: 'h265', fps: 30, isAutoBitrate: true, customBitrate: 7.2, motionFactor: 100, targetCoverage: 'covAnpr' },
      { id: 2, name: 'كاميرات التعرف على الوجوه (Face ID)', qty: 34, resolution: '4k', codec: 'h265', fps: 30, isAutoBitrate: true, customBitrate: 7.2, motionFactor: 100, targetCoverage: 'covId' },
      { id: 3, name: 'الأسوار الخارجية وحماية المحيط (Perimeter)', qty: 40, resolution: '4mp', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 3.2, motionFactor: 100, targetCoverage: 'covDet' },
      { id: 4, name: 'الممرات الداخلية والقاعات الحيوية', qty: 80, resolution: '1080p', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 2.0, motionFactor: 80, targetCoverage: 'covDet' },
      { id: 5, name: 'كاميرات المراقبة البانورامية (360 Panoramas)', qty: 30, resolution: '12mp', codec: 'h265', fps: 25, isAutoBitrate: true, customBitrate: 9.0, motionFactor: 90, targetCoverage: 'covGeneral' }
    ]
  }
};

export const App = {
  init() {
    this.loadFromStorage();
    this.bindEvents();
    this.applyLanguage();
    this.calculateAndUpdate();
    this.updatePpmCalculator();
  },

  setLanguage(lang) {
    AppState.currentLang = lang;
    this.applyLanguage();
    this.calculateAndUpdate();
    this.updatePpmCalculator();
  },

  toggleLanguage() {
    const nextLang = AppState.currentLang === 'ar' ? 'en' : 'ar';
    this.setLanguage(nextLang);
  },

  applyLanguage() {
    const lang = AppState.currentLang;
    const dict = i18n[lang];
    const isAr = lang === 'ar';

    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (dict[key]) {
        el.setAttribute('title', dict[key]);
      }
    });

    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) {
      langBtn.innerHTML = `🌐 <span>${isAr ? 'English' : 'العربية'}</span>`;
    }

    this.renderFormInputs();
    this.renderCameraGroups();
  },

  renderFormInputs() {
    const p = AppState.project;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('inputProjectName', p.projectName ?? '');
    setVal('inputClientName', p.clientName ?? '');
    setVal('selectFacilityType', p.facilityType ?? 'commercial');
    setVal('inputConsultantName', p.consultantName ?? '');
    setVal('inputProjectDate', p.projectDate ?? '');
    setVal('inputMoiRef', p.moiRefNumber ?? '');

    setVal('inputRetentionDays', p.retentionDays ?? 120);
    setVal('inputHoursPerDay', p.hoursPerDay ?? 24);
    setVal('selectRaidLevel', p.raidLevel ?? 'raid5');
    setVal('inputSafetyMargin', p.safetyMargin ?? 15);
    setVal('inputHotSpares', p.hotSpareDrives ?? 1);

    const subEnable = document.getElementById('inputSubStreamEnable');
    if (subEnable) subEnable.checked = Boolean(p.subStreamEnabled);
    setVal('inputSubStreamBitrate', p.subStreamBitrateMbps ?? 0.5);

    const hasUpsEl = document.getElementById('inputHasUps');
    if (hasUpsEl) hasUpsEl.checked = p.hasUps !== false;
    setVal('inputUpsBackupMinutes', p.upsBackupMinutes ?? 60);
    setVal('inputCameraPowerWatts', p.cameraPowerWatts ?? 12);
    setVal('inputNvrPowerWatts', p.nvrPowerWatts ?? 250);
    setVal('inputSwitchPowerWatts', p.switchPowerWatts ?? 45);
  },

  bindEvents() {
    const bindField = (id, field, parser = (v) => v) => {
      const el = document.getElementById(id);
      if (!el) return;
      const evt = el.type === 'checkbox' ? 'change' : 'input';
      el.addEventListener(evt, (e) => {
        AppState.project[field] = el.type === 'checkbox' ? e.target.checked : parser(e.target.value);
        this.calculateAndUpdate();
      });
    };

    bindField('inputProjectName', 'projectName');
    bindField('inputClientName', 'clientName');
    bindField('selectFacilityType', 'facilityType');
    bindField('inputConsultantName', 'consultantName');
    bindField('inputProjectDate', 'projectDate');
    bindField('inputMoiRef', 'moiRefNumber');

    bindField('inputRetentionDays', 'retentionDays', (v) => toInt(v, 120));
    bindField('inputHoursPerDay', 'hoursPerDay', (v) => toFloat(v, 24));
    bindField('selectRaidLevel', 'raidLevel');
    bindField('inputSafetyMargin', 'safetyMargin', (v) => toFloat(v, 15));
    bindField('inputHotSpares', 'hotSpareDrives', (v) => toInt(v, 1));

    bindField('inputSubStreamEnable', 'subStreamEnabled');
    bindField('inputSubStreamBitrate', 'subStreamBitrateMbps', (v) => toFloat(v, 0.5));

    bindField('inputHasUps', 'hasUps');
    bindField('inputUpsBackupMinutes', 'upsBackupMinutes', (v) => toInt(v, 60));
    bindField('inputCameraPowerWatts', 'cameraPowerWatts', (v) => toFloat(v, 12));
    bindField('inputNvrPowerWatts', 'nvrPowerWatts', (v) => toFloat(v, 250));
    bindField('inputSwitchPowerWatts', 'switchPowerWatts', (v) => toFloat(v, 45));

    // PPM Calculator inputs
    ['ppmResolution', 'ppmSceneWidth', 'ppmDistance', 'ppmFocalLength'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.updatePpmCalculator());
        el.addEventListener('change', () => this.updatePpmCalculator());
      }
    });

    // Event delegation for Camera Groups Table (no inline onchange/onclick!)
    const tbody = document.getElementById('cameraGroupsTableBody');
    if (tbody) {
      tbody.addEventListener('input', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        const groupId = toInt(target.dataset.groupId, 0);
        if (!groupId || !action) return;

        if (action === 'motion') {
          const val = toInt(target.value, 100);
          const label = target.nextElementSibling;
          if (label) label.textContent = `${val}%`;
          this.updateGroupField(groupId, 'motionFactor', val, false);
        } else if (action === 'custom-bitrate') {
          this.updateGroupField(groupId, 'customBitrate', Math.max(0.1, toFloat(target.value, 2.0)), false);
        } else if (action === 'name') {
          this.updateGroupField(groupId, 'name', target.value, false);
        }
      });

      tbody.addEventListener('change', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        const groupId = toInt(target.dataset.groupId, 0);
        if (!groupId || !action) return;

        if (action === 'qty') {
          this.updateGroupField(groupId, 'qty', Math.max(1, toInt(target.value, 1)), false);
        } else if (action === 'resolution') {
          this.updateGroupField(groupId, 'resolution', target.value, true);
        } else if (action === 'codec') {
          this.updateGroupField(groupId, 'codec', target.value, true);
        } else if (action === 'fps') {
          this.updateGroupField(groupId, 'fps', Math.min(60, Math.max(1, toInt(target.value, 25))), true);
        } else if (action === 'coverage') {
          this.updateGroupField(groupId, 'targetCoverage', target.value, false);
        }
      });

      tbody.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const groupId = toInt(btn.dataset.groupId, 0);
        if (!groupId) return;

        if (action === 'duplicate') {
          this.duplicateGroup(groupId);
        } else if (action === 'delete') {
          this.deleteGroup(groupId);
        } else if (action === 'toggle-bitrate') {
          const group = AppState.project.cameraGroups.find((g) => g.id === groupId);
          if (group) {
            const nextAuto = group.isAutoBitrate === false;
            if (!nextAuto && !group.customBitrate) {
              group.customBitrate = Calculator.calculateRecommendedBitrate(group.resolution, group.codec, group.fps);
            }
            group.isAutoBitrate = nextAuto;
            this.renderCameraGroups();
            this.calculateAndUpdate();
          }
        }
      });
    }

    document.getElementById('langToggleBtn')?.addEventListener('click', () => this.toggleLanguage());
    document.getElementById('btnAddCameraGroup')?.addEventListener('click', () => this.addCameraGroup());
    document.getElementById('selectPreset')?.addEventListener('change', (e) => {
      if (e.target.value) {
        this.loadPreset(e.target.value);
        e.target.value = '';
      }
    });
    document.getElementById('btnExportPdf')?.addEventListener('click', () => this.exportPdf());
    document.getElementById('btnExportCsv')?.addEventListener('click', () => this.exportCsv());
    document.getElementById('btnExportJson')?.addEventListener('click', () => this.exportJson());

    const btnImportJson = document.getElementById('btnImportJson');
    const inputImportFile = document.getElementById('inputImportFile');
    if (btnImportJson && inputImportFile) {
      btnImportJson.addEventListener('click', () => inputImportFile.click());
      inputImportFile.addEventListener('change', (e) => this.handleFileImport(e));
    }

    document.getElementById('btnResetProject')?.addEventListener('click', () => this.resetProject());
  },

  renderCameraGroups() {
    const container = document.getElementById('cameraGroupsTableBody');
    if (!container) return;

    const dict = i18n[AppState.currentLang];
    container.innerHTML = '';

    AppState.project.cameraGroups.forEach((group, index) => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-700 hover:bg-slate-800/40 transition-colors';
      tr.dataset.rowGroupId = String(group.id);

      const res = Calculator.calculateGroupStorage(group, AppState.project.retentionDays, AppState.project.hoursPerDay);
      const isAuto = group.isAutoBitrate !== false;

      tr.innerHTML = `
        <td class="p-3 text-center text-slate-400 font-mono text-xs">${index + 1}</td>
        <td class="p-3">
          <input type="text" data-action="name" data-group-id="${group.id}"
            class="w-full bg-slate-900/80 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
            value="${escapeHtml(group.name || '')}" placeholder="${escapeHtml(dict.groupNameDefault)}" />
        </td>
        <td class="p-3" style="width:85px;">
          <input type="number" min="1" max="9999" data-action="qty" data-group-id="${group.id}"
            class="w-full bg-slate-900/80 border border-slate-700 rounded px-2 py-1.5 text-sm text-center text-slate-100 focus:border-blue-500 focus:outline-none"
            value="${escapeHtml(group.qty)}" />
        </td>
        <td class="p-3">
          <select data-action="resolution" data-group-id="${group.id}"
            class="w-full bg-slate-900/80 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none">
            <option value="720p" ${group.resolution === '720p' ? 'selected' : ''}>${escapeHtml(dict.res720p)}</option>
            <option value="1080p" ${group.resolution === '1080p' ? 'selected' : ''}>${escapeHtml(dict.res1080p)}</option>
            <option value="3mp" ${group.resolution === '3mp' ? 'selected' : ''}>${escapeHtml(dict.res3mp)}</option>
            <option value="4mp" ${group.resolution === '4mp' ? 'selected' : ''}>${escapeHtml(dict.res4mp)}</option>
            <option value="5mp" ${group.resolution === '5mp' ? 'selected' : ''}>${escapeHtml(dict.res5mp)}</option>
            <option value="4k" ${group.resolution === '4k' ? 'selected' : ''}>${escapeHtml(dict.res4k)}</option>
            <option value="12mp" ${group.resolution === '12mp' ? 'selected' : ''}>${escapeHtml(dict.res12mp)}</option>
          </select>
        </td>
        <td class="p-3">
          <select data-action="codec" data-group-id="${group.id}"
            class="w-full bg-slate-900/80 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none">
            <option value="h264" ${group.codec === 'h264' ? 'selected' : ''}>${escapeHtml(dict.codecH264)}</option>
            <option value="h265" ${group.codec === 'h265' ? 'selected' : ''}>${escapeHtml(dict.codecH265)}</option>
            <option value="h265plus" ${group.codec === 'h265plus' ? 'selected' : ''}>${escapeHtml(dict.codecH265Plus)}</option>
          </select>
        </td>
        <td class="p-3" style="width:75px;">
          <input type="number" min="1" max="60" data-action="fps" data-group-id="${group.id}"
            class="w-full bg-slate-900/80 border border-slate-700 rounded px-2 py-1.5 text-xs text-center text-slate-100 focus:border-blue-500 focus:outline-none"
            value="${escapeHtml(group.fps ?? 25)}" />
        </td>
        <td class="p-3 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button type="button" data-action="toggle-bitrate" data-group-id="${group.id}"
              class="px-1.5 py-1 rounded text-[10px] font-semibold border transition-colors ${isAuto ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-amber-950/70 border-amber-600 text-amber-300'}">
              ${escapeHtml(isAuto ? dict.bitrateAuto : dict.bitrateCustom)}
            </button>
            ${
              isAuto
                ? `<span data-role="bitrate-badge" class="inline-block px-2 py-1 rounded bg-blue-950/60 border border-blue-800 text-blue-300 font-mono text-xs font-semibold">${res.bitrateMbps} Mbps</span>`
                : `<input type="number" min="0.1" max="100" step="0.1" data-action="custom-bitrate" data-group-id="${group.id}"
                    class="w-16 bg-slate-900/90 border border-amber-600 rounded px-1.5 py-1 text-xs text-center text-amber-200 font-mono focus:outline-none"
                    value="${escapeHtml(group.customBitrate ?? res.bitrateMbps)}" />`
            }
          </div>
        </td>
        <td class="p-3" style="width:120px;">
          <div class="flex items-center space-x-1.5 rtl:space-x-reverse">
            <input type="range" min="10" max="100" step="5" data-action="motion" data-group-id="${group.id}"
              class="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              value="${escapeHtml(group.motionFactor ?? 100)}" />
            <span class="text-xs font-mono text-slate-300 w-9 text-right">${escapeHtml(group.motionFactor ?? 100)}%</span>
          </div>
        </td>
        <td class="p-3">
          <select data-action="coverage" data-group-id="${group.id}"
            class="w-full bg-slate-900/80 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none">
            <option value="covId" ${group.targetCoverage === 'covId' ? 'selected' : ''}>${escapeHtml(dict.covId)}</option>
            <option value="covAnpr" ${group.targetCoverage === 'covAnpr' ? 'selected' : ''}>${escapeHtml(dict.covAnpr)}</option>
            <option value="covRec" ${group.targetCoverage === 'covRec' ? 'selected' : ''}>${escapeHtml(dict.covRec)}</option>
            <option value="covDet" ${group.targetCoverage === 'covDet' ? 'selected' : ''}>${escapeHtml(dict.covDet)}</option>
            <option value="covGeneral" ${group.targetCoverage === 'covGeneral' ? 'selected' : ''}>${escapeHtml(dict.covGeneral)}</option>
          </select>
        </td>
        <td class="p-3 text-center">
          <div class="flex items-center justify-center space-x-1.5 rtl:space-x-reverse">
            <button type="button" data-action="duplicate" data-group-id="${group.id}" class="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors" title="${escapeHtml(dict.duplicate)}">
              📋
            </button>
            <button type="button" data-action="delete" data-group-id="${group.id}" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors" title="${escapeHtml(dict.delete)}">
              🗑️
            </button>
          </div>
        </td>
      `;

      container.appendChild(tr);
    });
  },

  addCameraGroup() {
    const nextId = Date.now();
    const dict = i18n[AppState.currentLang];
    const newGroup = {
      id: nextId,
      name: `${dict.groupNameDefault} ${AppState.project.cameraGroups.length + 1}`,
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
    const group = AppState.project.cameraGroups.find((g) => g.id === id);
    if (!group) return;
    const cloned = JSON.parse(JSON.stringify(group));
    cloned.id = Date.now();
    cloned.name = `${cloned.name} ${i18n[AppState.currentLang].copySuffix}`;
    AppState.project.cameraGroups.push(cloned);
    this.renderCameraGroups();
    this.calculateAndUpdate();
  },

  deleteGroup(id) {
    if (AppState.project.cameraGroups.length <= 1) {
      alert(i18n[AppState.currentLang].minOneGroupAlert);
      return;
    }
    AppState.project.cameraGroups = AppState.project.cameraGroups.filter((g) => g.id !== id);
    this.renderCameraGroups();
    this.calculateAndUpdate();
  },

  updateGroupField(id, field, value, refreshRowBitrate = false) {
    const group = AppState.project.cameraGroups.find((g) => g.id === id);
    if (!group) return;
    group[field] = value;

    if (refreshRowBitrate && group.isAutoBitrate !== false) {
      const row = document.querySelector(`tr[data-row-group-id="${id}"]`);
      const badge = row?.querySelector('[data-role="bitrate-badge"]');
      if (badge) {
        const nextBitrate = Calculator.calculateRecommendedBitrate(group.resolution, group.codec, group.fps);
        badge.textContent = `${nextBitrate} Mbps`;
      }
    }

    this.calculateAndUpdate();
  },

  calculateAndUpdate() {
    const calcResults = Calculator.calculateProjectTotals(AppState.project);
    const complianceResults = ComplianceValidator.validate(AppState.project, calcResults, AppState.currentLang);

    this.updateKpis(calcResults, complianceResults);
    this.updateHddTable(calcResults);
    this.updatePowerUpsSection(calcResults.powerUps);
    this.updateComplianceSection(complianceResults);
    this.updateCharts(calcResults);
    this.saveToStorage();
  },

  updateKpis(calc, comp) {
    const isAr = AppState.currentLang === 'ar';
    const setHtml = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = val;
    };

    setHtml('kpiValCameras', calc.totalCameras);
    setHtml('kpiValRetention', `${AppState.project.retentionDays} <span class="text-xs text-slate-400 font-normal">${isAr ? 'يوم' : 'Days'}</span>`);
    setHtml('kpiValNetStorage', `${calc.totalNetTb} <span class="text-xs text-slate-400 font-normal">TiB</span>`);
    setHtml('kpiValGrossStorage', `${calc.grossStorageTb} <span class="text-xs text-slate-400 font-normal">TB</span>`);
    setHtml('kpiValBandwidth', `${calc.totalBandwidthMbps} <span class="text-xs text-slate-400 font-normal">Mbps</span>`);

    const recoHdd = calc.hddRecommendations.find((h) => h.diskSizeTb === 16);
    setHtml('kpiValHdd', `${recoHdd ? recoHdd.disksNeeded : '—'} <span class="text-xs text-slate-400 font-normal">HDDs</span>`);

    const badgeEl = document.getElementById('kpiValCompliance');
    if (badgeEl) {
      if (comp.isFullyCompliant) {
        badgeEl.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-950/80 border border-emerald-600 text-emerald-300 flex items-center justify-center space-x-1.5 rtl:space-x-reverse';
        badgeEl.innerHTML = `<span>✔</span> <span>${escapeHtml(i18n[AppState.currentLang].kpiCompliant)}</span>`;
      } else {
        badgeEl.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-950/80 border border-rose-600 text-rose-300 flex items-center justify-center space-x-1.5 rtl:space-x-reverse';
        badgeEl.innerHTML = `<span>✖</span> <span>${escapeHtml(i18n[AppState.currentLang].kpiNonCompliant)}</span>`;
      }
    }
  },

  updateHddTable(calc) {
    const tbody = document.getElementById('hddTableBody');
    if (!tbody) return;

    const dict = i18n[AppState.currentLang];
    const isAr = AppState.currentLang === 'ar';
    tbody.innerHTML = '';

    calc.hddRecommendations.forEach((h) => {
      const isReco = h.diskSizeTb === 16;
      const tr = document.createElement('tr');
      tr.className = `border-b border-slate-750 ${isReco ? 'bg-emerald-950/20 font-semibold' : 'hover:bg-slate-800/30'}`;

      const breakdownLabel = isAr
        ? `${h.dataDisks} بيانات + ${h.parityDisks} تماثل + ${h.hotSpares} احتياط`
        : `${h.dataDisks} Data + ${h.parityDisks} Parity + ${h.hotSpares} Spare`;

      tr.innerHTML = `
        <td class="p-3 text-slate-200">
          <div class="flex items-center space-x-2 rtl:space-x-reverse">
            <span>${h.diskSizeTb} TB (${h.usableTiBPerDrive} TiB)</span>
            ${isReco ? `<span class="px-2 py-0.5 rounded text-[10px] bg-emerald-800 text-emerald-100">${escapeHtml(dict.recommendedBadge)}</span>` : ''}
          </div>
        </td>
        <td class="p-3 text-center text-slate-100 font-mono text-base font-bold">${h.disksNeeded}</td>
        <td class="p-3 text-center text-slate-300 font-mono text-xs">${escapeHtml(breakdownLabel)}</td>
        <td class="p-3 text-center text-slate-300 font-mono text-xs">${h.totalRawCapacityTb} TB (${h.totalUsableTiB} TiB)</td>
        <td class="p-3 text-slate-300 text-xs">${escapeHtml(h.enclosureRecommendation)}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  updatePowerUpsSection(ups) {
    if (!ups) return;
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setText('upsTotalWatts', `${ups.totalLoadWatts} W`);
    setText('upsRecommendedKva', `${ups.recommendedUpsKva} kVA`);
    setText('upsBatteryWh', `${ups.requiredBatteryWh} Wh`);
    setText('upsSwitchesCount', `${ups.switchCount}`);
  },

  updatePpmCalculator() {
    const resEl = document.getElementById('ppmResolution');
    const widthEl = document.getElementById('ppmSceneWidth');
    const distEl = document.getElementById('ppmDistance');
    const focalEl = document.getElementById('ppmFocalLength');
    if (!resEl || !widthEl) return;

    const result = Calculator.calculatePixelDensity({
      resolution: resEl.value,
      sceneWidthMeters: widthEl.value,
      distanceMeters: distEl?.value || null,
      focalLengthMm: focalEl?.value || null
    });

    const ppmValueEl = document.getElementById('ppmValue');
    if (ppmValueEl) {
      ppmValueEl.textContent = `${result.ppm} PPM / ${result.ppf} PPF`;
    }

    const classEl = document.getElementById('ppmClassification');
    if (classEl) {
      const dict = i18n[AppState.currentLang];
      classEl.textContent = dict[result.classification] || result.classification;
      const isStrong = result.classification === 'covId';
      classEl.className = `px-2.5 py-1 rounded-md text-xs font-bold border truncate ${
        isStrong
          ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
          : result.classification === 'covRec'
            ? 'bg-blue-950 border-blue-700 text-blue-300'
            : 'bg-amber-950 border-amber-700 text-amber-300'
      }`;
    }
  },

  updateComplianceSection(comp) {
    const listContainer = document.getElementById('complianceRulesList');
    if (!listContainer) return;

    const dict = i18n[AppState.currentLang];
    const isAr = AppState.currentLang === 'ar';
    listContainer.innerHTML = '';

    comp.rules.forEach((rule) => {
      const isPass = rule.status === 'PASS';
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
              ${escapeHtml(dict[rule.name] || rule.name)}
            </div>
            <div class="text-xs text-slate-400 mt-1">
              ${escapeHtml(isPass ? dict[rule.passMsg] : dict[rule.failMsg])}
            </div>
            <div class="text-[11px] font-mono text-slate-500 mt-1">
              ${escapeHtml(rule.details)}
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

  updateCharts(calc) {
    const dict = i18n[AppState.currentLang];
    const isAr = AppState.currentLang === 'ar';

    const ctxDonut = document.getElementById('chartStorageDonut');
    if (ctxDonut) {
      const labels = calc.groupResults.map((g) => g.name || dict.groupNameDefault);
      const dataValues = calc.groupResults.map((g) => parseFloat(g.netTb.toFixed(2)));

      if (AppState.charts.storageDonut) {
        AppState.charts.storageDonut.data.labels = labels;
        AppState.charts.storageDonut.data.datasets[0].data = dataValues;
        AppState.charts.storageDonut.update();
      } else {
        AppState.charts.storageDonut = new Chart(ctxDonut, {
          type: 'doughnut',
          data: {
            labels,
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

    const ctxBar = document.getElementById('chartBandwidthBar');
    if (ctxBar) {
      const labels = calc.groupResults.map((g) => g.name || dict.groupNameDefault);
      const dataValues = calc.groupResults.map((g) => parseFloat(g.bandwidthMbps.toFixed(1)));

      if (AppState.charts.bandwidthBar) {
        AppState.charts.bandwidthBar.data.labels = labels;
        AppState.charts.bandwidthBar.data.datasets[0].data = dataValues;
        AppState.charts.bandwidthBar.update();
      } else {
        AppState.charts.bandwidthBar = new Chart(ctxBar, {
          type: 'bar',
          data: {
            labels,
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
            plugins: { legend: { display: false } }
          }
        });
      }
    }

    const ctxTimeline = document.getElementById('chartRetentionTimeline');
    if (ctxTimeline) {
      const labels = calc.retentionComparison.map((c) => `${c.days} ${isAr ? 'يوم' : 'Days'}`);
      const grossData = calc.retentionComparison.map((c) => c.grossTb);

      if (AppState.charts.retentionTimeline) {
        AppState.charts.retentionTimeline.data.labels = labels;
        AppState.charts.retentionTimeline.data.datasets[0].data = grossData;
        AppState.charts.retentionTimeline.update();
      } else {
        AppState.charts.retentionTimeline = new Chart(ctxTimeline, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: isAr ? 'السعة الكلية (TB)' : 'Gross TB',
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
            plugins: { legend: { display: false } }
          }
        });
      }
    }
  },

  loadPreset(presetKey) {
    const preset = ProjectPresets[presetKey];
    if (!preset) return;
    AppState.project = {
      ...AppState.project,
      ...JSON.parse(JSON.stringify(preset)),
      projectDate: new Date().toISOString().split('T')[0]
    };
    this.renderFormInputs();
    this.renderCameraGroups();
    this.calculateAndUpdate();
  },

  exportPdf() {
    const calc = Calculator.calculateProjectTotals(AppState.project);
    const comp = ComplianceValidator.validate(AppState.project, calc, AppState.currentLang);
    PDFExporter.generateReport(AppState.project, calc, comp, AppState.currentLang);
  },

  exportCsv() {
    const calc = Calculator.calculateProjectTotals(AppState.project);
    BOQExporter.exportCsv(AppState.project, calc, AppState.currentLang);
  },

  exportJson() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(AppState.project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${AppState.project.projectName || 'cctv_project'}_moi_cctv.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const validation = validateImportedProject(parsed);
        if (validation.valid) {
          AppState.project = validation.project;
          this.renderFormInputs();
          this.renderCameraGroups();
          this.calculateAndUpdate();
          alert(i18n[AppState.currentLang].importSuccess);
        } else {
          alert(i18n[AppState.currentLang][validation.errorKey]);
        }
      } catch {
        alert(i18n[AppState.currentLang].importError);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  },

  resetProject() {
    if (confirm(i18n[AppState.currentLang].confirmReset)) {
      this.loadPreset('commercial');
    }
  },

  saveToStorage() {
    try {
      localStorage.setItem('moi_cctv_project', JSON.stringify(AppState.project));
      localStorage.setItem('moi_cctv_lang', AppState.currentLang);
    } catch {
      // Ignore storage quota errors
    }
  },

  loadFromStorage() {
    try {
      const savedLang = localStorage.getItem('moi_cctv_lang');
      if (savedLang === 'ar' || savedLang === 'en') {
        AppState.currentLang = savedLang;
      }
      const savedProj = localStorage.getItem('moi_cctv_project');
      if (savedProj) {
        const validation = validateImportedProject(JSON.parse(savedProj));
        if (validation.valid) {
          AppState.project = validation.project;
        }
      }
    } catch {
      // Fallback to default state
    }
  }
};

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
}
