import type { PrayerName } from '../stores/religionStore';

export type CalculationMethod = 'MWL' | 'ISNA' | 'Egypt' | 'Makkah' | 'Tehran';

const BASE_TIMES: Record<PrayerName, string> = {
  fajr: '05:12',
  dhuhr: '12:30',
  asr: '15:45',
  maghrib: '18:22',
  isha: '19:50',
};

const OFFSETS: Record<CalculationMethod, Record<PrayerName, number>> = {
  MWL: { fajr: -5, dhuhr: 0, asr: 10, maghrib: 5, isha: 10 },
  ISNA: { fajr: -10, dhuhr: -5, asr: 5, maghrib: 0, isha: 5 },
  Egypt: { fajr: 0, dhuhr: 5, asr: 15, maghrib: 8, isha: 12 },
  Makkah: { fajr: 3, dhuhr: -3, asr: 8, maghrib: 3, isha: 7 },
  Tehran: { fajr: -8, dhuhr: -2, asr: 12, maghrib: 6, isha: 15 },
};

export function getPrayerTimes(method: CalculationMethod): Record<PrayerName, string> {
  const offset = OFFSETS[method] ?? OFFSETS.Makkah;
  const result: Record<PrayerName, string> = {} as any;
  for (const p of Object.keys(BASE_TIMES) as PrayerName[]) {
    const [h, m] = BASE_TIMES[p].split(':').map(Number);
    const total = h * 60 + m + (offset[p] ?? 0);
    result[p] = `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
  }
  return result;
}
