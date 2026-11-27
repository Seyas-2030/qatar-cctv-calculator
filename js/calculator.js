import { toFloat, toInt } from './utils.js';

/**
 * Qatar MOI-SSD CCTV Storage, Bandwidth, Power/UPS & Pixel Density Mathematical Engine
 */

// Decimal TB (1000^4 bytes) to Binary TiB (1024^4 bytes) conversion factor (~0.90949)
export const DECIMAL_TB_TO_BINARY_TIB = Math.pow(1000, 4) / Math.pow(1024, 4);

export const RESOLUTION_PIXELS = {
  '720p': { w: 1280, h: 720 },
  '1080p': { w: 1920, h: 1080 },
  '3mp': { w: 2048, h: 1536 },
  '4mp': { w: 2688, h: 1520 },
  '5mp': { w: 2592, h: 1944 },
  '4k': { w: 3840, h: 2160 },
  '12mp': { w: 4000, h: 3000 }
};

export const RAID_CONFIGS = {
  raid0: { minDrives: 1, parityDrivesPerPool: 0, mirrorFactor: 1, maxPoolDrives: 24 },
  raid5: { minDrives: 3, parityDrivesPerPool: 1, mirrorFactor: 1, maxPoolDrives: 16 },
  raid6: { minDrives: 4, parityDrivesPerPool: 2, mirrorFactor: 1, maxPoolDrives: 16 },
  raid10: { minDrives: 4, parityDrivesPerPool: 0, mirrorFactor: 2, maxPoolDrives: 16 }
};

export const Calculator = {
  // Baseline bitrates for resolutions at 25 FPS with H.264 (AVC)
  baseBitrates: {
    '720p': 2.0,
    '1080p': 4.0,
    '3mp': 5.5,
    '4mp': 6.5,
    '5mp': 8.0,
    '4k': 12.0,
    '12mp': 18.0
  },

  // Compression savings multipliers
  codecMultipliers: {
    h264: 1.0,
    h265: 0.50,
    h265plus: 0.35
  },

  /**
   * Calculates recommended bitrate (Mbps) based on resolution, codec, and FPS.
   */
  calculateRecommendedBitrate(resolution, codec, fps) {
    const base = this.baseBitrates[resolution] ?? 4.0;
    const codecMultiplier = this.codecMultipliers[codec] ?? 0.50;
    const safeFps = toInt(fps, 25);
    const fpsRatio = safeFps / 25;
    const bitrate = base * codecMultiplier * fpsRatio;
    return Math.max(0.5, parseFloat(bitrate.toFixed(2)));
  },

  /**
   * Calculates storage and bandwidth for a single camera group (supports Dual-Stream).
   */
  calculateGroupStorage(group, retentionDays, hoursPerDay, subStreamOptions = {}) {
    const qty = Math.max(0, toInt(group.qty, 0));
    const fps = Math.max(1, toInt(group.fps, 25));
    const hours = Math.max(1, toFloat(hoursPerDay, 24));
    const days = Math.max(1, toInt(retentionDays, 120));
    const motion = Math.max(0, toFloat(group.motionFactor, 100)) / 100;

    let bitrateMbps = 0;
    if (group.isAutoBitrate !== false) {
      bitrateMbps = this.calculateRecommendedBitrate(group.resolution, group.codec, fps);
    } else {
      bitrateMbps = Math.max(0.1, toFloat(group.customBitrate, 2.0));
    }

    // Main stream storage (GB/GiB)
    const mainNetGb = (bitrateMbps / 8) * 3600 * hours * days * qty * motion;

    // Optional continuous Sub-stream (100% activity)
    const subStreamEnabled = Boolean(subStreamOptions.enabled);
    const subStreamBitrate = subStreamEnabled ? Math.max(0.1, toFloat(subStreamOptions.bitrateMbps, 0.5)) : 0;
    const subNetGb = subStreamEnabled ? (subStreamBitrate / 8) * 3600 * hours * days * qty : 0;

    const netGb = mainNetGb + subNetGb;
    const netTb = netGb / 1024;
    const bandwidthMbps = (bitrateMbps + subStreamBitrate) * qty;

    return {
      bitrateMbps,
      subStreamBitrate,
      mainNetGb,
      subNetGb,
      netGb,
      netTb,
      bandwidthMbps,
      qty
    };
  },

  /**
   * Calculates dynamic RAID drive layout for a given required usable TiB and HDD decimal size.
   */
  calculateRaidArray(requiredUsableTiB, diskSizeTb, raidLevel, hotSpares, totalCameras) {
    const cfg = RAID_CONFIGS[raidLevel] ?? RAID_CONFIGS.raid5;
    const usableTiBPerDrive = diskSizeTb * DECIMAL_TB_TO_BINARY_TIB;
    const safeHotSpares = Math.max(0, toInt(hotSpares, 1));

    if (totalCameras <= 0 || requiredUsableTiB <= 0) {
      return {
        diskSizeTb,
        usableTiBPerDrive: parseFloat(usableTiBPerDrive.toFixed(2)),
        dataDisks: 0,
        parityDisks: 0,
        hotSpares: safeHotSpares,
        disksNeeded: safeHotSpares,
        raidEfficiency: 1,
        totalRawCapacityTb: safeHotSpares * diskSizeTb,
        totalUsableTiB: 0,
        enclosureRecommendation: this.getEnclosureRecommendation(safeHotSpares)
      };
    }

    const minDataForCapacity = Math.max(1, Math.ceil(requiredUsableTiB / usableTiBPerDrive));

    let dataDisks = minDataForCapacity;
    let parityDisks = 0;

    if (raidLevel === 'raid0') {
      dataDisks = Math.max(cfg.minDrives, minDataForCapacity);
      parityDisks = 0;
    } else if (raidLevel === 'raid10') {
      dataDisks = Math.max(2, minDataForCapacity);
      parityDisks = dataDisks; // 100% mirroring
    } else {
      // RAID 5 or RAID 6: distribute across pools of maxPoolDrives
      const maxDataPerPool = cfg.maxPoolDrives - cfg.parityDrivesPerPool;
      const minDataAllowed = cfg.minDrives - cfg.parityDrivesPerPool;
      dataDisks = Math.max(minDataAllowed, minDataForCapacity);
      const pools = Math.max(1, Math.ceil(dataDisks / maxDataPerPool));
      parityDisks = pools * cfg.parityDrivesPerPool;
    }

    const arrayDisks = dataDisks + parityDisks;
    const disksNeeded = arrayDisks + safeHotSpares;
    const raidEfficiency = arrayDisks > 0 ? dataDisks / arrayDisks : 1;

    return {
      diskSizeTb,
      usableTiBPerDrive: parseFloat(usableTiBPerDrive.toFixed(2)),
      dataDisks,
      parityDisks,
      hotSpares: safeHotSpares,
      disksNeeded,
      raidEfficiency: parseFloat(raidEfficiency.toFixed(4)),
      totalRawCapacityTb: disksNeeded * diskSizeTb,
      totalUsableTiB: parseFloat((dataDisks * usableTiBPerDrive).toFixed(2)),
      enclosureRecommendation: this.getEnclosureRecommendation(disksNeeded)
    };
  },

  getEnclosureRecommendation(totalDrivesWithSpares) {
    if (totalDrivesWithSpares <= 16) {
      return `1x 16-Bay Server (${totalDrivesWithSpares}/16 slots)`;
    }
    if (totalDrivesWithSpares <= 24) {
      return `1x 24-Bay Server (${totalDrivesWithSpares}/24 slots)`;
    }
    if (totalDrivesWithSpares <= 36) {
      return `1x 36-Bay Storage SAN (${totalDrivesWithSpares}/36 slots)`;
    }
    const units = Math.ceil(totalDrivesWithSpares / 24);
    return `${units}x 24-Bay Storage Units (${totalDrivesWithSpares} HDDs)`;
  },

  /**
   * Calculates Power & UPS Sizing for PoE cameras, switches, and NVR/storage servers.
   */
  calculatePowerAndUps(projectData, totalCameras, serverCount = 1) {
    const cameraPowerWatts = Math.max(0, toFloat(projectData.cameraPowerWatts, 12));
    const nvrPowerWatts = Math.max(0, toFloat(projectData.nvrPowerWatts, 250));
    const switchPowerWatts = Math.max(0, toFloat(projectData.switchPowerWatts, 45));
    const backupMinutes = Math.max(0, toInt(projectData.upsBackupMinutes, 60));
    const powerFactor = Math.min(1, Math.max(0.5, toFloat(projectData.upsPowerFactor, 0.8)));

    const switchCount = totalCameras > 0 ? Math.ceil(totalCameras / 24) : 0;
    const activeServers = totalCameras > 0 ? Math.max(1, serverCount) : 0;

    const camerasTotalWatts = totalCameras * cameraPowerWatts;
    const switchesTotalWatts = switchCount * switchPowerWatts;
    const serversTotalWatts = activeServers * nvrPowerWatts;
    const totalLoadWatts = camerasTotalWatts + switchesTotalWatts + serversTotalWatts;

    const apparentPowerVA = totalLoadWatts / powerFactor;
    const recommendedUpsKva = totalLoadWatts > 0
      ? Math.ceil((apparentPowerVA * 1.25) / 500) * 0.5
      : 0;
    const requiredBatteryWh = (totalLoadWatts * (backupMinutes / 60)) / 0.85;

    return {
      switchCount,
      serverCount: activeServers,
      camerasTotalWatts: Math.round(camerasTotalWatts),
      switchesTotalWatts: Math.round(switchesTotalWatts),
      serversTotalWatts: Math.round(serversTotalWatts),
      totalLoadWatts: Math.round(totalLoadWatts),
      apparentPowerVA: Math.round(apparentPowerVA),
      recommendedUpsKva: parseFloat(recommendedUpsKva.toFixed(1)),
      backupMinutes,
      requiredBatteryWh: Math.round(requiredBatteryWh)
    };
  },

  /**
   * Calculates Pixel Density (PPM / PPF) per IEC 62676-4 & MOI-SSD Target Coverage.
   */
  calculatePixelDensity({ resolution = '1080p', sceneWidthMeters = 4, focalLengthMm = null, distanceMeters = null, sensorWidthMm = 5.14 }) {
    const pixels = RESOLUTION_PIXELS[resolution] ?? RESOLUTION_PIXELS['1080p'];
    let effectiveSceneWidth = toFloat(sceneWidthMeters, 4);

    if (focalLengthMm && distanceMeters && sensorWidthMm) {
      const fl = toFloat(focalLengthMm, 0);
      const dist = toFloat(distanceMeters, 0);
      const sw = toFloat(sensorWidthMm, 5.14);
      if (fl > 0 && dist > 0 && sw > 0) {
        effectiveSceneWidth = (dist * sw) / fl;
      }
    }

    effectiveSceneWidth = Math.max(0.2, effectiveSceneWidth);
    const ppm = pixels.w / effectiveSceneWidth;
    const ppf = ppm / 3.28084;

    let classification = 'covGeneral';
    if (ppm >= 250) classification = 'covId';
    else if (ppm >= 125) classification = 'covRec';
    else if (ppm >= 25) classification = 'covDet';

    return {
      horizontalPixels: pixels.w,
      effectiveSceneWidth: parseFloat(effectiveSceneWidth.toFixed(2)),
      ppm: Math.round(ppm),
      ppf: Math.round(ppf),
      classification
    };
  },

  /**
   * Calculates project totals, dynamic RAID sizing, HDD matrix, and Power/UPS.
   */
  calculateProjectTotals(projectData) {
    const groups = projectData.cameraGroups || [];
    const retentionDays = Math.max(1, toInt(projectData.retentionDays, 120));
    const hoursPerDay = Math.max(1, toFloat(projectData.hoursPerDay, 24));
    const raidLevel = projectData.raidLevel ?? 'raid5';
    const safetyMargin = Math.max(0, toFloat(projectData.safetyMargin, 15)) / 100;
    const hotSpares = Math.max(0, toInt(projectData.hotSpareDrives, 1));

    const subStreamOptions = {
      enabled: Boolean(projectData.subStreamEnabled),
      bitrateMbps: toFloat(projectData.subStreamBitrateMbps, 0.5)
    };

    let totalCameras = 0;
    let totalNetGb = 0;
    let totalBandwidthMbps = 0;
    const groupResults = [];

    groups.forEach((group, index) => {
      const res = this.calculateGroupStorage(group, retentionDays, hoursPerDay, subStreamOptions);
      totalCameras += res.qty;
      totalNetGb += res.netGb;
      totalBandwidthMbps += res.bandwidthMbps;
      groupResults.push({
        ...group,
        ...res,
        index
      });
    });

    const totalNetTb = totalNetGb / 1024;
    const totalBandwidthGbps = totalBandwidthMbps / 1000;
    const requiredUsableTiB = totalNetTb * (1 + safetyMargin);

    // HDD Sizing Matrix with Decimal-to-Binary conversion and dynamic RAID efficiency
    const hddSizes = [8, 10, 12, 14, 16, 18, 20, 24];
    const hddRecommendations = hddSizes.map((size) =>
      this.calculateRaidArray(requiredUsableTiB, size, raidLevel, hotSpares, totalCameras)
    );

    // Use 16TB pool as the reference for Gross Storage & Server count
    const ref16Tb = hddRecommendations.find((h) => h.diskSizeTb === 16) ?? hddRecommendations[0];
    const effectiveRaidEfficiency = ref16Tb.raidEfficiency || 0.85;
    const grossStorageTb = totalCameras > 0
      ? (requiredUsableTiB / effectiveRaidEfficiency) / DECIMAL_TB_TO_BINARY_TIB
      : 0;
    const grossStoragePb = grossStorageTb / 1024;

    const serverCount = ref16Tb.disksNeeded > 36 ? Math.ceil(ref16Tb.disksNeeded / 24) : 1;
    const powerUps = this.calculatePowerAndUps(projectData, totalCameras, serverCount);

    // Retention comparison points (30, 60, 90, 120, 180 days)
    const retentionComparison = [30, 60, 90, 120, 180].map((days) => {
      let daysNetGb = 0;
      groups.forEach((group) => {
        const res = this.calculateGroupStorage(group, days, hoursPerDay, subStreamOptions);
        daysNetGb += res.netGb;
      });
      const daysNetTb = daysNetGb / 1024;
      const daysUsableTiB = daysNetTb * (1 + safetyMargin);
      const daysGrossTb = totalCameras > 0
        ? (daysUsableTiB / effectiveRaidEfficiency) / DECIMAL_TB_TO_BINARY_TIB
        : 0;
      return {
        days,
        netTb: parseFloat(daysNetTb.toFixed(1)),
        grossTb: parseFloat(daysGrossTb.toFixed(1))
      };
    });

    return {
      totalCameras,
      totalNetGb: parseFloat(totalNetGb.toFixed(2)),
      totalNetTb: parseFloat(totalNetTb.toFixed(2)),
      requiredUsableTiB: parseFloat(requiredUsableTiB.toFixed(2)),
      grossStorageTb: parseFloat(grossStorageTb.toFixed(2)),
      grossStoragePb: parseFloat(grossStoragePb.toFixed(3)),
      totalBandwidthMbps: parseFloat(totalBandwidthMbps.toFixed(2)),
      totalBandwidthGbps: parseFloat(totalBandwidthGbps.toFixed(2)),
      raidEfficiency: effectiveRaidEfficiency,
      groupResults,
      hddRecommendations,
      retentionComparison,
      powerUps
    };
  }
};
