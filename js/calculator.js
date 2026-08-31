/**
 * Qatar MOI-SSD CCTV Storage Calculator - Mathematical Engine
 */

const Calculator = {
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
    'h264': 1.0,
    'h265': 0.50,     // 50% savings
    'h265plus': 0.35  // 65% savings (Smart Codec)
  },

  // Calculate recommended bitrate based on parameters
  calculateRecommendedBitrate(resolution, codec, fps) {
    const base = this.baseBitrates[resolution] || 4.0;
    const codecMultiplier = this.codecMultipliers[codec] || 0.50;
    const fpsRatio = (fps || 25) / 25;
    const bitrate = base * codecMultiplier * fpsRatio;
    return Math.max(0.5, parseFloat(bitrate.toFixed(2)));
  },

  // Calculate storage for a single camera group
  calculateGroupStorage(group, retentionDays, hoursPerDay) {
    const qty = parseInt(group.qty) || 0;
    const fps = parseInt(group.fps) || 25;
    const hours = parseFloat(hoursPerDay) || 24;
    const days = parseInt(retentionDays) || 120;
    const motion = (parseFloat(group.motionFactor) || 100) / 100;

    let bitrateMbps = 0;
    if (group.isAutoBitrate !== false) {
      bitrateMbps = this.calculateRecommendedBitrate(group.resolution, group.codec, fps);
    } else {
      bitrateMbps = parseFloat(group.customBitrate) || 2.0;
    }

    // Formula: Storage (GB) = (Bitrate Mbps / 8) * 3600 * hours * days * qty * motionFactor
    const netGb = (bitrateMbps / 8) * 3600 * hours * days * qty * motion;
    const netTb = netGb / 1024;
    const bandwidthMbps = bitrateMbps * qty;

    return {
      bitrateMbps,
      netGb,
      netTb,
      bandwidthMbps,
      qty
    };
  },

  // Calculate project totals & RAID sizing
  calculateProjectTotals(projectData) {
    const groups = projectData.cameraGroups || [];
    const retentionDays = parseInt(projectData.retentionDays) || 120;
    const hoursPerDay = parseFloat(projectData.hoursPerDay) || 24;
    const raidLevel = projectData.raidLevel || 'raid5';
    const safetyMargin = (parseFloat(projectData.safetyMargin) || 15) / 100;
    const hotSpares = parseInt(projectData.hotSpareDrives) || 1;

    let totalCameras = 0;
    let totalNetGb = 0;
    let totalBandwidthMbps = 0;
    const groupResults = [];

    groups.forEach((group, index) => {
      const res = this.calculateGroupStorage(group, retentionDays, hoursPerDay);
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

    // RAID Usable Efficiency
    // RAID 0: 100%
    // RAID 5: ~85% (1 parity disk per 8-16 disk pool)
    // RAID 6: ~75% (2 parity disks per pool)
    // RAID 10: 50% (Mirroring)
    let raidEfficiency = 0.85;
    if (raidLevel === 'raid0') raidEfficiency = 1.0;
    if (raidLevel === 'raid5') raidEfficiency = 0.85;
    if (raidLevel === 'raid6') raidEfficiency = 0.75;
    if (raidLevel === 'raid10') raidEfficiency = 0.50;

    // Gross Storage = (Net TB / RAID Efficiency) * (1 + Safety Buffer)
    const grossStorageTb = (totalNetTb / raidEfficiency) * (1 + safetyMargin);
    const grossStoragePb = grossStorageTb / 1024;

    // HDD Sizing Matrix
    const hddSizes = [8, 10, 12, 14, 16, 18, 20, 24];
    const hddRecommendations = hddSizes.map(size => {
      const rawDrives = Math.ceil(grossStorageTb / size);
      const totalDrivesWithSpares = rawDrives + hotSpares;
      
      let enclosures = '';
      if (totalDrivesWithSpares <= 16) {
        enclosures = `1x 16-Bay Server (${totalDrivesWithSpares}/16 slots)`;
      } else if (totalDrivesWithSpares <= 24) {
        enclosures = `1x 24-Bay Server (${totalDrivesWithSpares}/24 slots)`;
      } else if (totalDrivesWithSpares <= 36) {
        enclosures = `1x 36-Bay Storage SAN (${totalDrivesWithSpares}/36 slots)`;
      } else {
        const units = Math.ceil(totalDrivesWithSpares / 24);
        enclosures = `${units}x 24-Bay Storage Units (${totalDrivesWithSpares} HDDs)`;
      }

      return {
        diskSizeTb: size,
        disksNeeded: totalDrivesWithSpares,
        dataDisks: rawDrives,
        hotSpares: hotSpares,
        enclosureRecommendation: enclosures,
        totalRawCapacityTb: totalDrivesWithSpares * size
      };
    });

    // Retention comparison points (30, 60, 90, 120, 180 days)
    const retentionComparison = [30, 60, 90, 120, 180].map(days => {
      let daysNetGb = 0;
      groups.forEach(group => {
        const res = this.calculateGroupStorage(group, days, hoursPerDay);
        daysNetGb += res.netGb;
      });
      const daysNetTb = daysNetGb / 1024;
      const daysGrossTb = (daysNetTb / raidEfficiency) * (1 + safetyMargin);
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
      grossStorageTb: parseFloat(grossStorageTb.toFixed(2)),
      grossStoragePb: parseFloat(grossStoragePb.toFixed(3)),
      totalBandwidthMbps: parseFloat(totalBandwidthMbps.toFixed(2)),
      totalBandwidthGbps: parseFloat(totalBandwidthGbps.toFixed(2)),
      raidEfficiency,
      groupResults,
      hddRecommendations,
      retentionComparison
    };
  }
};
