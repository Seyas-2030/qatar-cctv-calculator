/**
 * Qatar MOI-SSD CCTV Storage & Compliance Calculator
 * Internationalization (i18n) Dictionary - Arabic & English
 */

const i18n = {
  ar: {
    appTitle: "حاسبة تخزين CCTV ومطابقة لوائح MOI-SSD قطر",
    appSubtitle: "الأداة الهندسية لحساب سعات التخزين والتحقق من لوائح وزارة الداخلية القطرية (قانون رقم 9 لسنة 2011)",
    langToggle: "English",
    exportPdf: "تصدير التقرير الفني (PDF)",
    exportJson: "حفظ المشروع (JSON)",
    importJson: "استيراد مشروع",
    resetProject: "إعادة ضبط",
    presetTitle: "نماذج مشاريع جاهزة",
    presetCommercial: "برج تجاري / مكاتب (50 كاميرا)",
    presetHotel: "فندق ومنتجع 5 نجوم (120 كاميرا)",
    presetBank: "فرع بنكي رئيسي (30 كاميرا)",
    presetGov: "منشأة حيوية / حكومية (200 كاميرا)",

    // Project Info
    projectInfoTitle: "بيانات المشروع والمنشأة",
    projectName: "اسم المشروع",
    projectNamePlaceholder: "مثال: برج الأعمال - لوسيل",
    clientName: "اسم العميل / المالك",
    clientNamePlaceholder: "مثال: شركة قطر للاستثمار والتطوير",
    facilityType: "نوع المنشأة / التصنيف",
    facilityCommercial: "تجاري / مكاتب (Commercial)",
    facilityHotel: "فندقي / سياحي (Hospitality)",
    facilityBank: "مؤسسة مالية / بنك (Financial/Banking)",
    facilityGov: "منشأة حكومية / بنية حيوية (Government/Critical)",
    facilityResidential: "مجمع سكني (Residential Compound)",
    facilityMall: "مركز تسوق / تجزئة (Shopping Mall)",
    facilityOther: "أخرى (Other)",
    consultantName: "المهندس الاستشاري / المصمم",
    consultantPlaceholder: "اسم مهندس التصميم",
    projectDate: "تاريخ الدراسة",
    moiRefNumber: "رقم رخصة / طلب MOI-SSD",
    moiRefPlaceholder: "مثال: MOI-SSD-2026-XXXX",

    // Global Settings
    globalSettingsTitle: "المعايير العامة للنظام وحسابات التخزين",
    retentionDays: "مدة الاحتفاظ بالتسجيلات (بالأيام)",
    retentionDaysHelp: "تشترط وزارة الداخلية القطرية 120 يوماً كحد أدنى إلزامي لمعظم المنشآت",
    recordingHours: "ساعات التسجيل اليومية",
    hoursPerDay: "ساعة / يوم (24 ساعة للتسجيل المستمر)",
    raidLevel: "نوع مصفوفة التخزين (RAID)",
    safetyMargin: "هامش الأمان الهندسي (Safety Buffer)",
    hotSpareDrives: "أقراص الاحتياط الساخنة (Hot Spares)",

    // KPI Cards
    kpiTotalCameras: "إجمالي الكاميرات",
    kpiNetStorage: "صافي التخزين (Net Storage)",
    kpiGrossStorage: "السعة الإجمالية المطلوبة (Gross)",
    kpiTotalBandwidth: "إجمالي النطاق الترددي",
    kpiRecommendedHdd: "الأقراص المقترحة (16TB)",
    kpiMoiStatus: "حالة الامتثال لـ MOI-SSD",
    kpiCompliant: "مطابق للاشتراطات",
    kpiNonCompliant: "تنبيهات عدم مطابقة",

    // Camera Groups
    cameraGroupsTitle: "جدول ومواصفات مجموعات الكاميرات",
    addCameraGroup: "إضافة مجموعة كاميرات",
    groupName: "اسم المجموعة / الموقع",
    groupNameDefault: "مجموعة كاميرات",
    cameraQty: "العدد",
    resolution: "الدقة (Resolution)",
    codec: "الترميز (Codec)",
    fps: "معدل الإطارات (FPS)",
    bitrate: "معدل البت (Mbps)",
    bitrateAuto: "آلي (محسوب)",
    bitrateCustom: "يدوي (Mbps)",
    motionFactor: "نسبة الحركة / النشاط",
    targetCoverage: "نسبة التغطية والغرض (Resolution on Target)",
    actions: "الإجراءات",
    duplicate: "تكرار",
    delete: "حذف",

    // Resolutions
    res720p: "720p HD (1.0 MP)",
    res1080p: "1080p Full HD (2.0 MP) - معيار MOI",
    res3mp: "3.0 Megapixel",
    res4mp: "4.0 Megapixel (2K)",
    res5mp: "5.0 Megapixel",
    res4k: "4K UHD (8.0 MP)",
    res12mp: "12.0 Megapixel / Panoramic",

    // Codecs
    codecH264: "H.264 (Standard AVC)",
    codecH265: "H.265 (HEVC - وفر 50%)",
    codecH265Plus: "H.265+ / Smart Codec (وفر 65%)",

    // Coverage Types
    covId: "التعرف على الأشخاص (ID >= 50% من الارتفاع) - شرط MOI",
    covAnpr: "قراءة لوحات السيارات (ANPR >= 50% للوحة) - شرط MOI",
    covRec: "التمييز والتحقق (Recognition >= 20%)",
    covDet: "الكشف العام (Detection >= 10%) - شرط MOI",
    covGeneral: "مراقبة عامة للموقع",

    // Storage Breakdown & Sizing
    storageBreakdownTitle: "تحليل وتوزيع مساحات التخزين",
    hddSizingTitle: "توزيع الأقراص الصلبة وسيرفرات التخزين الموصى بها (Enterprise HDDs)",
    diskSize: "سعة القرص الصلب",
    disksNeeded: "عدد الأقراص المطلوبة (Data + RAID Parity)",
    chassisNeeded: "سيرفرات التخزين المقترحة (Enclosures)",
    storagePoolNet: "صافي السعة القابلة للاستخدام",
    storagePoolGross: "السعة الخام الكلية مع الهامش والـ RAID",

    // MOI Compliance Section
    complianceTitle: "سجل التدقيق والمطابقة لاشتراطات MOI-SSD (وزارة الداخلية القطرية)",
    complianceBadgePass: "معتمد ومطابق للاشتراطات الفنية (MOI COMPLIANT)",
    complianceBadgeFail: "يتطلب تعديلات للمطابقة (NON-COMPLIANT)",
    ruleRetention: "مدة الاحتفاظ بالتسجيلات (>= 120 يوماً متواصلة)",
    ruleRetentionPass: "مطابق: تم استيفاء شرط الـ 120 يوماً الإلزامي بموجب القانون رقم (9) لسنة 2011.",
    ruleRetentionFail: "مخالف: مدة التسجيل المحددة أقل من 120 يوماً. تشترط وزارة الداخلية 120 يوماً كحد أدنى.",
    ruleResolution: "الحد الأدنى لدقة الكاميرات الشبكية (Full HD / IP)",
    ruleResolutionPass: "مطابق: جميع الكاميرات تحقق أو تتجاوز دقة 1080p Full HD المعتمدة لدى إدارة النظم الأمنية.",
    ruleResolutionFail: "مخالف: توجد كاميرات بدقة أقل من 1080p IP، يُشترط استخدام كاميرات شبكية عالية الدقة.",
    ruleRaid: "حماية البيانات ومصفوفة التخزين (RAID Redundancy)",
    ruleRaidPass: "مطابق: تم تفعيل مصفوفة تخزين موثوقة (RAID 5 / RAID 6) لحماية التسجيلات من تلف الأقراص.",
    ruleRaidFail: "مخالف: تشترط إدارة النظم الأمنية استخدام مصفوفات تخزين آمنة (RAID 5 أو RAID 6 على الأقل).",
    ruleUps: "استمرارية الطاقة وتأمين مصدر UPS",
    ruleUpsPass: "مطابق: يجب تزويد غرف الخوادم والكاميرات بوحدات طاقة غير منقطعة (UPS) لتأمين العمل في الطوارئ.",
    ruleCoverage: "معايير نسب التغطية بالهدف (Target Resolution)",
    ruleCoveragePass: "مطابق: تم تحديد أهداف الرصد بنسب 50% للوحات والتعرف على الأشخاص و10% للكشف العام.",

    // Visual Charts
    chartStorageByGroup: "توزيع السعة التخزينية حسب المجموعات (TB)",
    chartBandwidthByGroup: "توزيع استهلاك النطاق الترددي (Mbps)",
    chartRetentionTimeline: "مقارنة السعة عبر مدد التخزين المختلفة (TB)",

    // Footer & Notes
    disclaimer: "ملاحظة هندسية: هذه الحسابات استرشادية وتخضع للمراجعة والاعتماد النهائي من قِبل إدارة النظم الأمنية بوزارة الداخلية القطرية (MOI-SSD).",
    allRightsReserved: "تم التطوير وفقاً لأحدث المعايير الهندسية للأمن والمراقبة الذكية في دولة قطر.",
    
    // Notifications & Prompts
    confirmReset: "هل أنت متأكد من رغبتك في إعادة ضبط جميع بيانات المشروع؟",
    importSuccess: "تم استيراد بيانات المشروع بنجاح!",
    importError: "حدث خطأ أثناء استيراد الملف، يرجى التأكد من صحة تنسيق JSON.",
    pdfGenerating: "جاري تجهيز وطباعة التقرير الفني المعتمد..."
  },

  en: {
    appTitle: "Qatar MOI-SSD CCTV Storage & Compliance Calculator",
    appSubtitle: "Engineering Tool for Video Storage Sizing & Qatar MOI-SSD Regulatory Verification (Law No. 9 of 2011)",
    langToggle: "العربية",
    exportPdf: "Export Technical Report (PDF)",
    exportJson: "Save Project (JSON)",
    importJson: "Import Project",
    resetProject: "Reset Project",
    presetTitle: "Preset Project Templates",
    presetCommercial: "Commercial Office Tower (50 Cams)",
    presetHotel: "5-Star Hotel & Resort (120 Cams)",
    presetBank: "Bank Main Branch (30 Cams)",
    presetGov: "Gov / Critical Infrastructure (200 Cams)",

    // Project Info
    projectInfoTitle: "Project & Facility Details",
    projectName: "Project Name",
    projectNamePlaceholder: "e.g., Lusail Commercial Tower",
    clientName: "Client / Owner Name",
    clientNamePlaceholder: "e.g., Qatar Real Estate Development Co.",
    facilityType: "Facility Classification / Type",
    facilityCommercial: "Commercial / Offices",
    facilityHotel: "Hospitality / Hotels",
    facilityBank: "Financial / Banking Institution",
    facilityGov: "Government / Critical Infrastructure",
    facilityResidential: "Residential Compound",
    facilityMall: "Shopping Mall / Retail",
    facilityOther: "Other Facility",
    consultantName: "Consultant / Lead Designer",
    consultantPlaceholder: "Designer / Engineer Name",
    projectDate: "Design Date",
    moiRefNumber: "MOI-SSD License / Application Ref",
    moiRefPlaceholder: "e.g., MOI-SSD-2026-XXXX",

    // Global Settings
    globalSettingsTitle: "Global System Parameters & Sizing",
    retentionDays: "Video Retention Period (Days)",
    retentionDaysHelp: "Qatar MOI-SSD strictly requires a minimum retention of 120 continuous days",
    recordingHours: "Daily Recording Hours",
    hoursPerDay: "Hours / Day (24 hrs for 24/7 continuous)",
    raidLevel: "Storage Array Architecture (RAID)",
    safetyMargin: "Engineering Safety Margin (Buffer)",
    hotSpareDrives: "Hot Spare Drives Count",

    // KPI Cards
    kpiTotalCameras: "Total Cameras",
    kpiNetStorage: "Net Usable Storage",
    kpiGrossStorage: "Total Gross Storage Required",
    kpiTotalBandwidth: "Total Network Bandwidth",
    kpiRecommendedHdd: "Recommended HDDs (16TB)",
    kpiMoiStatus: "MOI-SSD Compliance Status",
    kpiCompliant: "Fully Compliant",
    kpiNonCompliant: "Non-Compliant Alerts",

    // Camera Groups
    cameraGroupsTitle: "Camera Profiles & Groups Schedule",
    addCameraGroup: "Add Camera Group",
    groupName: "Group / Location Name",
    groupNameDefault: "Camera Group",
    cameraQty: "Qty",
    resolution: "Resolution",
    codec: "Compression (Codec)",
    fps: "Frame Rate (FPS)",
    bitrate: "Bitrate (Mbps)",
    bitrateAuto: "Auto (Calculated)",
    bitrateCustom: "Manual (Mbps)",
    motionFactor: "Motion / Activity Factor",
    targetCoverage: "Target Coverage & Purpose",
    actions: "Actions",
    duplicate: "Duplicate",
    delete: "Delete",

    // Resolutions
    res720p: "720p HD (1.0 MP)",
    res1080p: "1080p Full HD (2.0 MP) - MOI Baseline",
    res3mp: "3.0 Megapixel",
    res4mp: "4.0 Megapixel (2K)",
    res5mp: "5.0 Megapixel",
    res4k: "4K UHD (8.0 MP)",
    res12mp: "12.0 Megapixel / Panoramic",

    // Codecs
    codecH264: "H.264 (Standard AVC)",
    codecH265: "H.265 (HEVC - 50% Savings)",
    codecH265Plus: "H.265+ / Smart Codec (65% Savings)",

    // Coverage Types
    covId: "Identification (ID >= 50% Screen Height) - MOI",
    covAnpr: "ANPR / License Plate (>= 50% Plate Height) - MOI",
    covRec: "Recognition (>= 20% Screen Height)",
    covDet: "General Detection (>= 10% Screen Height) - MOI",
    covGeneral: "General Area Overview",

    // Storage Breakdown & Sizing
    storageBreakdownTitle: "Storage & Bandwidth Analysis",
    hddSizingTitle: "Enterprise Hard Drive Sizing & Chassis Matrix",
    diskSize: "Drive Capacity",
    disksNeeded: "Disks Required (Data + RAID Parity)",
    chassisNeeded: "Recommended Storage Enclosures",
    storagePoolNet: "Net Usable Capacity",
    storagePoolGross: "Total Raw Capacity with RAID & Buffer",

    // MOI Compliance Section
    complianceTitle: "Qatar MOI-SSD Audit & Regulatory Checklist",
    complianceBadgePass: "MOI-SSD COMPLIANT - APPROVED DESIGN",
    complianceBadgeFail: "REQUIREMENTS PENDING (NON-COMPLIANT)",
    ruleRetention: "Video Retention Duration (>= 120 Days Continuous)",
    ruleRetentionPass: "Passed: Complies with the mandatory 120-day retention period mandated by Qatar Law No. 9 of 2011.",
    ruleRetentionFail: "Failed: Selected retention period is below 120 days. This violates Qatar MOI-SSD regulations.",
    ruleResolution: "Minimum Camera Resolution Standard (Full HD / IP)",
    ruleResolutionPass: "Passed: All camera streams meet or exceed the 1080p Full HD baseline standard.",
    ruleResolutionFail: "Failed: Low-resolution cameras (<1080p IP) detected. MOI mandates megapixel IP cameras.",
    ruleRaid: "Storage Fault Tolerance (RAID Redundancy)",
    ruleRaidPass: "Passed: Fault-tolerant storage array (RAID 5/6) configured to safeguard against disk failures.",
    ruleRaidFail: "Failed: MOI-SSD requires fault-tolerant RAID storage (RAID 5 or RAID 6 minimum).",
    ruleUps: "Emergency Power Continuity (UPS System)",
    ruleUpsPass: "Passed: Central UPS backup system must be specified for all CCTV servers, switches, and critical cameras.",
    ruleCoverage: "Resolution on Target Criteria",
    ruleCoveragePass: "Passed: Target height coverage criteria comply with MOI 50% ID and 10% Detection rules.",

    // Visual Charts
    chartStorageByGroup: "Storage Distribution by Camera Group (TB)",
    chartBandwidthByGroup: "Network Bandwidth Consumption (Mbps)",
    chartRetentionTimeline: "Storage Capacity Growth Across Retention Periods (TB)",

    // Footer & Notes
    disclaimer: "Engineering Disclaimer: Sizing results are for design guidance and are subject to final review and approval by Qatar Ministry of Interior - Security Systems Department (MOI-SSD).",
    allRightsReserved: "Engineered in accordance with Qatar MOI-SSD Technical Guidelines and Standards.",

    // Notifications & Prompts
    confirmReset: "Are you sure you want to reset all project data to defaults?",
    importSuccess: "Project configuration imported successfully!",
    importError: "Error importing file. Please verify the JSON file format.",
    pdfGenerating: "Generating official technical report..."
  }
};
