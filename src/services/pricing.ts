/**
 * Region-aware subscription pricing.
 *
 * Real localized prices come from the App Store / Play Store IAP products
 * when the IAP SDK (RevenueCat / react-native-iap) is wired in. Until then,
 * we approximate by:
 *
 *   1. Detecting the user's region + currency via expo-localization.
 *   2. Looking up a PPP-style multiplier for that region.
 *   3. Converting the USD base price into the local currency at a baked-in
 *      reference rate (good enough for in-app display; the actual charge
 *      happens through the store anyway).
 *
 * Prices are rounded to a "charm" ending per currency (e.g. .99 for USD,
 * .00 for JPY which has no minor unit) so they look like real store prices.
 *
 * To plug RevenueCat in later:
 *   - resolve(tierId, period) returns the store price string when available
 *   - fall back to the computed price otherwise
 */

import * as Localization from 'expo-localization';

export type TierId = 'free' | 'healed' | 'ascended' | 'family' | 'lifetime';
export type Period = 'monthly' | 'yearly' | 'lifetime';

interface BasePrice {
  monthly?: number; // USD
  yearly?: number; // USD
  lifetime?: number; // USD
}

const BASE_USD: Record<TierId, BasePrice> = {
  free: {},
  healed: { monthly: 4.99, yearly: 39.99 },
  ascended: { monthly: 9.99, yearly: 79.99 },
  family: { monthly: 14.99 },
  lifetime: { lifetime: 79.99 },
};

interface CurrencyInfo {
  code: string;
  symbol: string;
  /** Position of the symbol relative to the digits. */
  position: 'prefix' | 'suffix';
  /** Minor unit digits (e.g. 2 for USD cents, 0 for JPY). */
  decimals: number;
  /** Where prices charm-round to (e.g. .99 for USD, .00 for JPY). */
  charm: number;
  /** Reference rate: 1 USD = `rate` units of this currency (rough, for display). */
  rate: number;
}

const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', position: 'prefix', decimals: 2, charm: 0.99, rate: 1 },
  CAD: { code: 'CAD', symbol: 'CA$', position: 'prefix', decimals: 2, charm: 0.99, rate: 1.36 },
  AUD: { code: 'AUD', symbol: 'A$', position: 'prefix', decimals: 2, charm: 0.99, rate: 1.51 },
  GBP: { code: 'GBP', symbol: '£', position: 'prefix', decimals: 2, charm: 0.99, rate: 0.79 },
  EUR: { code: 'EUR', symbol: '€', position: 'prefix', decimals: 2, charm: 0.99, rate: 0.92 },
  JPY: { code: 'JPY', symbol: '¥', position: 'prefix', decimals: 0, charm: 0, rate: 156 },
  KRW: { code: 'KRW', symbol: '₩', position: 'prefix', decimals: 0, charm: 0, rate: 1340 },
  CNY: { code: 'CNY', symbol: '¥', position: 'prefix', decimals: 2, charm: 0.99, rate: 7.2 },
  HKD: { code: 'HKD', symbol: 'HK$', position: 'prefix', decimals: 2, charm: 0.99, rate: 7.8 },
  SGD: { code: 'SGD', symbol: 'S$', position: 'prefix', decimals: 2, charm: 0.99, rate: 1.35 },
  AED: { code: 'AED', symbol: 'AED', position: 'prefix', decimals: 2, charm: 0.99, rate: 3.67 },
  SAR: { code: 'SAR', symbol: 'SAR', position: 'prefix', decimals: 2, charm: 0.99, rate: 3.75 },
  EGP: { code: 'EGP', symbol: 'E£', position: 'prefix', decimals: 2, charm: 0.99, rate: 48 },
  TRY: { code: 'TRY', symbol: '₺', position: 'prefix', decimals: 2, charm: 0.99, rate: 32 },
  INR: { code: 'INR', symbol: '₹', position: 'prefix', decimals: 0, charm: 0, rate: 83 },
  PKR: { code: 'PKR', symbol: '₨', position: 'prefix', decimals: 0, charm: 0, rate: 278 },
  IDR: { code: 'IDR', symbol: 'Rp', position: 'prefix', decimals: 0, charm: 0, rate: 15800 },
  MYR: { code: 'MYR', symbol: 'RM', position: 'prefix', decimals: 2, charm: 0.99, rate: 4.7 },
  PHP: { code: 'PHP', symbol: '₱', position: 'prefix', decimals: 2, charm: 0.99, rate: 58 },
  THB: { code: 'THB', symbol: '฿', position: 'prefix', decimals: 2, charm: 0.99, rate: 36 },
  VND: { code: 'VND', symbol: '₫', position: 'suffix', decimals: 0, charm: 0, rate: 25000 },
  NGN: { code: 'NGN', symbol: '₦', position: 'prefix', decimals: 0, charm: 0, rate: 1450 },
  ZAR: { code: 'ZAR', symbol: 'R', position: 'prefix', decimals: 2, charm: 0.99, rate: 18.5 },
  KES: { code: 'KES', symbol: 'KSh', position: 'prefix', decimals: 0, charm: 0, rate: 130 },
  BRL: { code: 'BRL', symbol: 'R$', position: 'prefix', decimals: 2, charm: 0.99, rate: 5.4 },
  MXN: { code: 'MXN', symbol: 'MX$', position: 'prefix', decimals: 2, charm: 0.99, rate: 18 },
  ARS: { code: 'ARS', symbol: 'AR$', position: 'prefix', decimals: 0, charm: 0, rate: 980 },
  CLP: { code: 'CLP', symbol: 'CL$', position: 'prefix', decimals: 0, charm: 0, rate: 940 },
  COP: { code: 'COP', symbol: 'CO$', position: 'prefix', decimals: 0, charm: 0, rate: 4000 },
  RUB: { code: 'RUB', symbol: '₽', position: 'suffix', decimals: 0, charm: 0, rate: 90 },
  UAH: { code: 'UAH', symbol: '₴', position: 'suffix', decimals: 0, charm: 0, rate: 41 },
  PLN: { code: 'PLN', symbol: 'zł', position: 'suffix', decimals: 2, charm: 0.99, rate: 3.95 },
  CZK: { code: 'CZK', symbol: 'Kč', position: 'suffix', decimals: 0, charm: 0, rate: 23 },
  SEK: { code: 'SEK', symbol: 'kr', position: 'suffix', decimals: 0, charm: 0, rate: 10.6 },
  NOK: { code: 'NOK', symbol: 'kr', position: 'suffix', decimals: 0, charm: 0, rate: 10.8 },
  DKK: { code: 'DKK', symbol: 'kr', position: 'suffix', decimals: 2, charm: 0.95, rate: 6.85 },
  CHF: { code: 'CHF', symbol: 'CHF', position: 'prefix', decimals: 2, charm: 0.95, rate: 0.88 },
};

// Region (ISO 3166-1 alpha-2) → currency + PPP multiplier (1.0 = full US price).
// Multipliers loosely follow App Store regional pricing tiers.
interface RegionEntry {
  currency: string;
  multiplier: number;
}

const REGION_TABLE: Record<string, RegionEntry> = {
  // Full-price markets
  US: { currency: 'USD', multiplier: 1.0 },
  CA: { currency: 'CAD', multiplier: 1.0 },
  AU: { currency: 'AUD', multiplier: 1.0 },
  GB: { currency: 'GBP', multiplier: 1.0 },
  IE: { currency: 'EUR', multiplier: 1.0 },
  DE: { currency: 'EUR', multiplier: 1.0 },
  FR: { currency: 'EUR', multiplier: 1.0 },
  IT: { currency: 'EUR', multiplier: 1.0 },
  ES: { currency: 'EUR', multiplier: 1.0 },
  NL: { currency: 'EUR', multiplier: 1.0 },
  BE: { currency: 'EUR', multiplier: 1.0 },
  AT: { currency: 'EUR', multiplier: 1.0 },
  FI: { currency: 'EUR', multiplier: 1.0 },
  PT: { currency: 'EUR', multiplier: 1.0 },
  GR: { currency: 'EUR', multiplier: 1.0 },
  CH: { currency: 'CHF', multiplier: 1.0 },
  DK: { currency: 'DKK', multiplier: 1.0 },
  SE: { currency: 'SEK', multiplier: 1.0 },
  NO: { currency: 'NOK', multiplier: 1.0 },
  JP: { currency: 'JPY', multiplier: 1.0 },
  KR: { currency: 'KRW', multiplier: 0.9 },
  SG: { currency: 'SGD', multiplier: 1.0 },
  HK: { currency: 'HKD', multiplier: 1.0 },
  TW: { currency: 'USD', multiplier: 1.0 },
  NZ: { currency: 'AUD', multiplier: 1.0 },

  // Gulf — close to US pricing
  AE: { currency: 'AED', multiplier: 1.0 },
  SA: { currency: 'SAR', multiplier: 1.0 },
  QA: { currency: 'USD', multiplier: 1.0 },
  KW: { currency: 'USD', multiplier: 1.0 },
  BH: { currency: 'USD', multiplier: 1.0 },
  OM: { currency: 'USD', multiplier: 1.0 },

  // Mid-tier emerging markets
  PL: { currency: 'PLN', multiplier: 0.65 },
  CZ: { currency: 'CZK', multiplier: 0.65 },
  RU: { currency: 'RUB', multiplier: 0.55 },
  UA: { currency: 'UAH', multiplier: 0.45 },
  TR: { currency: 'TRY', multiplier: 0.5 },
  MX: { currency: 'MXN', multiplier: 0.6 },
  BR: { currency: 'BRL', multiplier: 0.55 },
  AR: { currency: 'ARS', multiplier: 0.45 },
  CL: { currency: 'CLP', multiplier: 0.55 },
  CO: { currency: 'COP', multiplier: 0.5 },
  ZA: { currency: 'ZAR', multiplier: 0.55 },
  MY: { currency: 'MYR', multiplier: 0.6 },
  TH: { currency: 'THB', multiplier: 0.6 },
  PH: { currency: 'PHP', multiplier: 0.5 },
  CN: { currency: 'CNY', multiplier: 0.7 },

  // Lower-income / heavy-discount tiers
  EG: { currency: 'EGP', multiplier: 0.35 },
  MA: { currency: 'USD', multiplier: 0.4 },
  DZ: { currency: 'USD', multiplier: 0.4 },
  TN: { currency: 'USD', multiplier: 0.4 },
  JO: { currency: 'USD', multiplier: 0.45 },
  LB: { currency: 'USD', multiplier: 0.45 },
  IQ: { currency: 'USD', multiplier: 0.4 },
  IN: { currency: 'INR', multiplier: 0.35 },
  PK: { currency: 'PKR', multiplier: 0.3 },
  BD: { currency: 'USD', multiplier: 0.3 },
  ID: { currency: 'IDR', multiplier: 0.45 },
  VN: { currency: 'VND', multiplier: 0.4 },
  NG: { currency: 'NGN', multiplier: 0.3 },
  KE: { currency: 'KES', multiplier: 0.4 },
};

const DEFAULT_REGION: RegionEntry = { currency: 'USD', multiplier: 1.0 };

// Timezone → ISO country code. Locale-based region detection is unreliable
// (a device set to "English" reports no regionCode even when physically in
// Egypt). The timezone, on the other hand, is set automatically by the OS
// from the SIM / network / GPS and is rarely tampered with — so it's the
// most trustworthy local signal we have without a network call.
const TIMEZONE_TO_REGION: Record<string, string> = {
  'Africa/Cairo': 'EG',
  'Africa/Algiers': 'DZ',
  'Africa/Tunis': 'TN',
  'Africa/Casablanca': 'MA',
  'Africa/Tripoli': 'LY',
  'Africa/Khartoum': 'SD',
  'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE',
  'Africa/Johannesburg': 'ZA',
  'Africa/Addis_Ababa': 'ET',
  'Africa/Accra': 'GH',
  'Asia/Riyadh': 'SA',
  'Asia/Dubai': 'AE',
  'Asia/Qatar': 'QA',
  'Asia/Kuwait': 'KW',
  'Asia/Bahrain': 'BH',
  'Asia/Muscat': 'OM',
  'Asia/Baghdad': 'IQ',
  'Asia/Beirut': 'LB',
  'Asia/Amman': 'JO',
  'Asia/Damascus': 'SY',
  'Asia/Jerusalem': 'IL',
  'Asia/Tehran': 'IR',
  'Asia/Karachi': 'PK',
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Dhaka': 'BD',
  'Asia/Jakarta': 'ID',
  'Asia/Manila': 'PH',
  'Asia/Bangkok': 'TH',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Singapore': 'SG',
  'Asia/Hong_Kong': 'HK',
  'Asia/Shanghai': 'CN',
  'Asia/Taipei': 'TW',
  'Asia/Tokyo': 'JP',
  'Asia/Seoul': 'KR',
  'Asia/Istanbul': 'TR',
  'Europe/Istanbul': 'TR',
  'Europe/London': 'GB',
  'Europe/Dublin': 'IE',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'Europe/Vienna': 'AT',
  'Europe/Lisbon': 'PT',
  'Europe/Athens': 'GR',
  'Europe/Helsinki': 'FI',
  'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK',
  'Europe/Zurich': 'CH',
  'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ',
  'Europe/Moscow': 'RU',
  'Europe/Kyiv': 'UA',
  'Europe/Kiev': 'UA',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Phoenix': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Montreal': 'CA',
  'America/Mexico_City': 'MX',
  'America/Sao_Paulo': 'BR',
  'America/Buenos_Aires': 'AR',
  'America/Santiago': 'CL',
  'America/Bogota': 'CO',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Perth': 'AU',
  'Pacific/Auckland': 'NZ',
};

// User-pickable list for the region override UI.
export const SUPPORTED_REGIONS: { code: string; label: string }[] = [
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'CA', label: 'Canada' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'JP', label: 'Japan' },
  { code: 'KR', label: 'South Korea' },
  { code: 'SG', label: 'Singapore' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'SA', label: 'Saudi Arabia' },
  { code: 'EG', label: 'Egypt' },
  { code: 'MA', label: 'Morocco' },
  { code: 'JO', label: 'Jordan' },
  { code: 'LB', label: 'Lebanon' },
  { code: 'TR', label: 'Turkey' },
  { code: 'IN', label: 'India' },
  { code: 'PK', label: 'Pakistan' },
  { code: 'ID', label: 'Indonesia' },
  { code: 'MY', label: 'Malaysia' },
  { code: 'PH', label: 'Philippines' },
  { code: 'TH', label: 'Thailand' },
  { code: 'VN', label: 'Vietnam' },
  { code: 'CN', label: 'China' },
  { code: 'NG', label: 'Nigeria' },
  { code: 'KE', label: 'Kenya' },
  { code: 'ZA', label: 'South Africa' },
  { code: 'BR', label: 'Brazil' },
  { code: 'MX', label: 'Mexico' },
  { code: 'AR', label: 'Argentina' },
  { code: 'RU', label: 'Russia' },
  { code: 'UA', label: 'Ukraine' },
  { code: 'PL', label: 'Poland' },
];

let manualOverride: string | null = null;

export function setRegionOverride(code: string | null) {
  manualOverride = code ? code.toUpperCase() : null;
  resetPricingCache();
}

export interface ResolvedPrice {
  amount: number;
  currency: string;
  label: string;
}

export interface ResolvedTier {
  id: TierId;
  region: string;
  currency: string;
  monthly: ResolvedPrice | null;
  yearly: ResolvedPrice | null;
  lifetime: ResolvedPrice | null;
  /** % saved when buying yearly vs paying monthly 12× (null if not applicable). */
  yearlySavingsPercent: number | null;
}

function detectRegion(): { region: string; currency: string; entry: RegionEntry; source: 'override' | 'locale' | 'timezone' | 'currency' | 'default' } {
  // 1. Explicit user override always wins.
  if (manualOverride && REGION_TABLE[manualOverride]) {
    const entry = REGION_TABLE[manualOverride];
    return { region: manualOverride, currency: entry.currency, entry, source: 'override' };
  }

  let localeRegion: string | undefined;
  let localeCurrency: string | undefined;
  let timezone: string | undefined;
  try {
    const locales = Localization.getLocales();
    localeRegion = locales[0]?.regionCode ?? undefined;
    localeCurrency = locales[0]?.currencyCode ?? undefined;
  } catch {}
  try {
    const cal = Localization.getCalendars();
    timezone = cal[0]?.timeZone ?? undefined;
  } catch {}

  // 2. Locale region code, if present AND known to us.
  if (localeRegion && REGION_TABLE[localeRegion.toUpperCase()]) {
    const code = localeRegion.toUpperCase();
    const entry = REGION_TABLE[code];
    return { region: code, currency: entry.currency, entry, source: 'locale' };
  }

  // 3. Timezone fallback — robust against "English (US)" device language
  //    while physically in another country.
  if (timezone && TIMEZONE_TO_REGION[timezone]) {
    const code = TIMEZONE_TO_REGION[timezone];
    const entry = REGION_TABLE[code] ?? DEFAULT_REGION;
    return { region: code, currency: entry.currency, entry, source: 'timezone' };
  }

  // 4. Currency-only fallback — at least format prices in the right symbol.
  if (localeCurrency && CURRENCIES[localeCurrency.toUpperCase()]) {
    const cur = localeCurrency.toUpperCase();
    // Find any region in our table that matches this currency to inherit the
    // right multiplier; otherwise default multiplier.
    const matched = Object.entries(REGION_TABLE).find(([, e]) => e.currency === cur);
    const entry: RegionEntry = matched ? matched[1] : { currency: cur, multiplier: 1 };
    const region = matched ? matched[0] : (localeRegion?.toUpperCase() ?? 'US');
    return { region, currency: cur, entry, source: 'currency' };
  }

  return { region: 'US', currency: 'USD', entry: DEFAULT_REGION, source: 'default' };
}

function charmRound(amount: number, info: CurrencyInfo): number {
  if (info.decimals === 0) {
    // Round to a nice integer ending (e.g. 199 -> 199, 247 -> 249 with a 9-tail).
    const stepped = Math.round(amount / 10) * 10;
    return Math.max(1, stepped - 1);
  }
  // For decimal currencies, round down to the nearest whole unit then add charm.
  const whole = Math.max(0, Math.floor(amount));
  const candidate = whole + info.charm;
  // If the candidate would be way under the raw amount, bump a unit.
  return candidate < amount - 0.4 ? whole + 1 + info.charm : candidate;
}

function format(amount: number, info: CurrencyInfo): string {
  const fixed = amount.toFixed(info.decimals);
  const digits = info.decimals === 0
    ? Number(fixed).toLocaleString('en-US')
    : Number(fixed).toLocaleString('en-US', { minimumFractionDigits: info.decimals, maximumFractionDigits: info.decimals });
  return info.position === 'prefix' ? `${info.symbol}${digits}` : `${digits} ${info.symbol}`;
}

function buildPrice(usdAmount: number | undefined, multiplier: number, info: CurrencyInfo): ResolvedPrice | null {
  if (usdAmount == null) return null;
  const raw = usdAmount * multiplier * info.rate;
  const final = charmRound(raw, info);
  return { amount: final, currency: info.code, label: format(final, info) };
}

let cached: ResolvedTier[] | null = null;
let cachedRegion: string | null = null;

export function resolveTiers(): ResolvedTier[] {
  const { region, currency } = detectRegion();
  if (cached && cachedRegion === `${region}-${currency}`) return cached;

  const entry = REGION_TABLE[region] ?? DEFAULT_REGION;
  const info = CURRENCIES[currency] ?? CURRENCIES.USD;
  const multiplier = entry.multiplier;

  const tiers: ResolvedTier[] = (Object.keys(BASE_USD) as TierId[]).map((id) => {
    const base = BASE_USD[id];
    const monthly = buildPrice(base.monthly, multiplier, info);
    const yearly = buildPrice(base.yearly, multiplier, info);
    const lifetime = buildPrice(base.lifetime, multiplier, info);
    let yearlySavingsPercent: number | null = null;
    if (monthly && yearly) {
      const monthly12 = monthly.amount * 12;
      yearlySavingsPercent = Math.round(((monthly12 - yearly.amount) / monthly12) * 100);
    }
    return { id, region, currency: info.code, monthly, yearly, lifetime, yearlySavingsPercent };
  });

  cached = tiers;
  cachedRegion = `${region}-${currency}`;
  return tiers;
}

export function getRegionInfo() {
  const { region, currency, source } = detectRegion();
  return { region, currency, source };
}

/** Clears the in-memory cache. Call when language / region changes. */
export function resetPricingCache() {
  cached = null;
  cachedRegion = null;
}
