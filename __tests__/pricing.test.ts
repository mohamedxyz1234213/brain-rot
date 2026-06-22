jest.mock('expo-localization', () => ({
  getLocales: () => [{ regionCode: 'US', currencyCode: 'USD' }],
  getCalendars: () => [{ timeZone: 'America/New_York' }],
}));

import { resolveTiers, resetPricingCache, setRegionOverride } from '../src/services/pricing';

beforeEach(() => {
  resetPricingCache();
  setRegionOverride(null);
});

describe('pricing', () => {
  it('returns tiers for all subscription levels', () => {
    const tiers = resolveTiers();
    const ids = tiers.map((t) => t.id);
    expect(ids).toContain('free');
    expect(ids).toContain('healed');
    expect(ids).toContain('ascended');
    expect(ids).toContain('family');
    expect(ids).toContain('lifetime');
  });

  it('computes yearlySavingsPercent when both monthly and yearly exist', () => {
    const tiers = resolveTiers();
    const healed = tiers.find((t) => t.id === 'healed');
    expect(healed?.yearlySavingsPercent).toBeGreaterThan(0);
    expect(healed?.yearlySavingsPercent).toBeLessThanOrEqual(100);
  });

  it('returns null yearlySavings for lifetime tier', () => {
    setRegionOverride('US');
    const tiers = resolveTiers();
    const lifetime = tiers.find((t) => t.id === 'lifetime');
    expect(lifetime?.yearlySavingsPercent).toBeNull();
  });

  it('applies region override to change currency and label', () => {
    setRegionOverride('EG');
    resetPricingCache();
    const tiers = resolveTiers();
    const healed = tiers.find((t) => t.id === 'healed');
    expect(healed?.region).toBe('EG');
    expect(healed?.currency).toBe('EGP');
    expect(healed?.monthly?.label).toContain('E£');
  });

  it('returns different prices for different regions', () => {
    setRegionOverride('US');
    const us = resolveTiers().find((t) => t.id === 'healed')?.monthly?.amount ?? 0;

    setRegionOverride('IN');
    resetPricingCache();
    const india = resolveTiers().find((t) => t.id === 'healed')?.monthly?.amount ?? 0;

    expect(us).not.toBe(india);
  });
});
