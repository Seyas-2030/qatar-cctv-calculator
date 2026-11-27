<img width="1391" height="1034" alt="Screenshot 2026-11-25 204341" src="https://github.com/user-attachments/assets/291a7d92-c07b-41bc-aad3-ba3a49475f20" />
<img width="1409" height="1031" alt="Screenshot 2026-11-25 204331" src="https://github.com/user-attachments/assets/3d25d39f-2f8b-4b46-b667-cede8fcd2fce" />
<img width="1411" height="1031" alt="Screenshot 2026-11-25 204319" src="https://github.com/user-attachments/assets/3c3e2e8e-1bba-4e95-9e26-23fa0ba8d1f8" />

# حاسبة سعة التخزين ومطابقة اشتراطات MOI-SSD لأنظمة CCTV
## Qatar MOI-SSD CCTV Storage & Compliance Calculator

تطبيق ويب هندسي ثنائي اللغة (العربية والإنجليزية) يعمل دون اتصال بالإنترنت (Offline-First PWA)، مخصص لمهندسي الأنظمة الأمنية لحساب سعات التخزين المطلوبة، والنطاق الترددي للشبكة، وأحمال الطاقة الكهربائية و الـ UPS، وكثافة البكسل (PPM/PPF)، مع التحقق التلقائي من مطابقة التصميم لاشتراطات **إدارة النظم الأمنية بوزارة الداخلية القطرية (MOI-SSD)** وفق القانون رقم (9) لسنة 2011، وتصدير التقارير الفنية (PDF) وجداول الكميات (CSV).

---

### مثال على اختبار البرنامج (Test Example)

```js
import { describe, it, expect } from 'vitest';
import { Calculator } from './js/calculator.js';
import { ComplianceValidator } from './js/compliance.js';

describe('Qatar MOI-SSD Compliance Check', () => {
  it('validates a compliant commercial CCTV project', () => {
    const project = {
      facilityType: 'commercial',
      retentionDays: 120,
      hoursPerDay: 24,
      raidLevel: 'raid5',
      safetyMargin: 15,
      hotSpareDrives: 1,
      hasUps: true,
      upsBackupMinutes: 60,
      cameraGroups: [
        { id: 1, name: 'Gate ANPR', qty: 4, resolution: '4mp', codec: 'h265', fps: 25, isAutoBitrate: true, motionFactor: 100, targetCoverage: 'covAnpr' }
      ]
    };

    const calc = Calculator.calculateProjectTotals(project);
    const compliance = ComplianceValidator.validate(project, calc, 'en');

    expect(compliance.isFullyCompliant).toBe(true);
    expect(compliance.passedCount).toBe(5);
  });
});
```

لتشغيل الاختبارات:
```bash
npm install
npm test
```
