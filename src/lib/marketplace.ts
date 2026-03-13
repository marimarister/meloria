// Marketplace scoring algorithm — pure TypeScript, no side effects
// Implements spec Sections 4, 6, 7

// ── Types ──────────────────────────────────────────────────────────

export interface BurnoutScores {
  emotionalExhaustion: number;
  depersonalization: number;
  personalAccomplishment: number;
  total: number;
}

export interface PerceptionScores {
  V: number;
  A: number;
  K: number;
  D: number;
}

export interface PreferenceScores {
  solo_group: number;
  online_offline: number;
  stability_flexibility: number;
  dynamic_harmony: number;
}

export interface Practice {
  id: string;
  title: string;
  title_lv: string | null;
  description: string | null;
  description_lv: string | null;
  provider: string | null;
  price_credits: number;
  duration_minutes: number | null;
  format: 'online' | 'offline' | 'hybrid' | null;
  social_fit_solo: number;
  social_fit_group: number;
  intensity: 'soft' | 'medium' | 'intensive' | null;
  targets_ee: number;
  targets_dp: number;
  targets_pa: number;
  fit_v: number;
  fit_a: number;
  fit_k: number;
  fit_d: number;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
}

export interface UserProfile {
  need_EE: number;
  need_DP: number;
  need_PA: number;
  vakd_weights: { V: number; A: number; K: number; D: number };
  pref: {
    solo_group: 'solo' | 'group';
    online_offline: 'online' | 'offline';
    stability_flexibility: 'stability' | 'flexibility';
    dynamic_harmony: 'dynamic' | 'harmony';
  };
  burnoutEELevel: 'low' | 'medium' | 'high';
}

export interface ScoredPractice extends Practice {
  compositeScore: number;
  mFit: number;
  vakdFit: number;
  prefFit: number;
  businessScore: number;
  reasons: string[];
}

export type MarketplaceSection = {
  key: string;
  practices: ScoredPractice[];
};

// ── Step 1: Build user profile ─────────────────────────────────────

function getEELevel(ee: number): 'low' | 'medium' | 'high' {
  if (ee <= 17) return 'low';
  if (ee <= 36) return 'medium';
  return 'high';
}

function getDPLevel(dp: number): 'low' | 'medium' | 'high' {
  if (dp <= 9) return 'low';
  if (dp <= 20) return 'medium';
  return 'high';
}

function getPALevel(pa: number): 'low' | 'medium' | 'high' {
  // Inverted: low score = high risk
  if (pa >= 33) return 'low';
  if (pa >= 17) return 'medium';
  return 'high';
}

export function buildUserProfile(
  burnout: BurnoutScores,
  perception: PerceptionScores,
  preference: PreferenceScores
): UserProfile {
  const eeLevel = getEELevel(burnout.emotionalExhaustion);
  const dpLevel = getDPLevel(burnout.depersonalization);
  const paLevel = getPALevel(burnout.personalAccomplishment);

  // Compute need weights (accumulate, clamp to 1.0)
  let need_EE = 0, need_DP = 0, need_PA = 0;

  if (eeLevel === 'high') { need_EE = Math.max(need_EE, 1.0); need_DP = Math.max(need_DP, 0.6); need_PA = Math.max(need_PA, 0.4); }
  if (dpLevel === 'high') { need_EE = Math.max(need_EE, 0.6); need_DP = Math.max(need_DP, 1.0); need_PA = Math.max(need_PA, 0.4); }
  if (paLevel === 'high') { need_EE = Math.max(need_EE, 0.5); need_DP = Math.max(need_DP, 0.5); need_PA = Math.max(need_PA, 1.0); }

  // If no high levels, check medium
  if (eeLevel !== 'high' && dpLevel !== 'high' && paLevel !== 'high') {
    if (eeLevel === 'medium') { need_EE = Math.max(need_EE, 0.6); }
    if (dpLevel === 'medium') { need_DP = Math.max(need_DP, 0.6); }
    if (paLevel === 'medium') { need_PA = Math.max(need_PA, 0.6); }
    // All medium — fallback
    if (need_EE === 0 && need_DP === 0 && need_PA === 0) {
      need_EE = 0.6; need_DP = 0.6; need_PA = 0.6;
    }
  }

  // VAKD weights
  const channels = { V: perception.V, A: perception.A, K: perception.K, D: perception.D };
  const maxVal = Math.max(channels.V, channels.A, channels.K, channels.D);
  const tiedKeys = (Object.keys(channels) as Array<keyof typeof channels>).filter(k => channels[k] === maxVal);

  const vakd_weights = { V: 0, A: 0, K: 0, D: 0 };
  if (tiedKeys.length === 1) {
    vakd_weights[tiedKeys[0]] = 1.0;
  } else if (tiedKeys.length === 2) {
    vakd_weights[tiedKeys[0]] = 0.6;
    vakd_weights[tiedKeys[1]] = 0.4;
  } else {
    const w = +(1 / tiedKeys.length).toFixed(2);
    tiedKeys.forEach(k => { vakd_weights[k] = w; });
  }

  // Preference binary derivation
  const pref = {
    solo_group: (preference.solo_group >= 5 ? 'solo' : 'group') as 'solo' | 'group',
    online_offline: (preference.online_offline >= 5 ? 'offline' : 'online') as 'online' | 'offline',
    stability_flexibility: (preference.stability_flexibility >= 5 ? 'stability' : 'flexibility') as 'stability' | 'flexibility',
    dynamic_harmony: (preference.dynamic_harmony >= 5 ? 'dynamic' : 'harmony') as 'dynamic' | 'harmony',
  };

  return { need_EE, need_DP, need_PA, vakd_weights, pref, burnoutEELevel: eeLevel };
}

// ── Step 2: Hard filters ───────────────────────────────────────────

export function isEligible(practice: Practice, profile: UserProfile): boolean {
  if (!practice.is_active) return false;

  // Format mismatch
  if (practice.format && practice.format !== 'hybrid') {
    if (profile.pref.online_offline === 'online' && practice.format === 'offline') return false;
    if (profile.pref.online_offline === 'offline' && practice.format === 'online') return false;
  }

  // Safety: high EE + intensive
  if (profile.burnoutEELevel === 'high' && practice.intensity === 'intensive') return false;

  return true;
}

// ── Step 3: Composite scoring ──────────────────────────────────────

function computeMFit(practice: Practice, profile: UserProfile): number {
  return profile.need_EE * Number(practice.targets_ee) +
         profile.need_DP * Number(practice.targets_dp) +
         profile.need_PA * Number(practice.targets_pa);
}

function computeVAKDFit(practice: Practice, profile: UserProfile): number {
  const fits = {
    V: Number(practice.fit_v),
    A: Number(practice.fit_a),
    K: Number(practice.fit_k),
    D: Number(practice.fit_d),
  };

  let vakdFit = 0;
  const w = profile.vakd_weights;
  vakdFit = w.V * fits.V + w.A * fits.A + w.K * fits.K + w.D * fits.D;
  return vakdFit;
}

function computePrefFit(practice: Practice, profile: UserProfile): number {
  let points = 0;

  if (profile.pref.solo_group === 'solo' && Number(practice.social_fit_solo) >= 0.5) points += 0.25;
  if (profile.pref.solo_group === 'group' && Number(practice.social_fit_group) >= 0.5) points += 0.25;

  if (profile.pref.online_offline === 'online' && (practice.format === 'online' || practice.format === 'hybrid')) points += 0.25;
  if (profile.pref.online_offline === 'offline' && (practice.format === 'offline' || practice.format === 'hybrid')) points += 0.25;

  if (profile.pref.stability_flexibility === 'stability' && practice.intensity === 'soft') points += 0.25;
  if (profile.pref.stability_flexibility === 'flexibility' && practice.intensity === 'intensive') points += 0.25;

  if (profile.pref.dynamic_harmony === 'dynamic' && practice.duration_minutes !== null && practice.duration_minutes <= 60) points += 0.25;
  if (profile.pref.dynamic_harmony === 'harmony' && Number(practice.social_fit_group) >= 0.5) points += 0.25;

  return points;
}

export function scorePractice(practice: Practice, profile: UserProfile): ScoredPractice {
  const mFit = computeMFit(practice, profile);
  const vakdFit = computeVAKDFit(practice, profile);
  const prefFit = computePrefFit(practice, profile);
  const businessScore = practice.is_featured ? 1.0 : 0.0;

  const compositeScore = 0.45 * mFit + 0.20 * vakdFit + 0.25 * prefFit + 0.10 * businessScore;

  const reasons = generateReasons(practice, profile, mFit, vakdFit, prefFit);

  return {
    ...practice,
    compositeScore: +compositeScore.toFixed(3),
    mFit: +mFit.toFixed(3),
    vakdFit: +vakdFit.toFixed(3),
    prefFit: +prefFit.toFixed(3),
    businessScore,
    reasons: reasons.slice(0, 3),
  };
}

function generateReasons(
  practice: Practice,
  profile: UserProfile,
  mFit: number,
  vakdFit: number,
  prefFit: number
): string[] {
  const reasons: string[] = [];

  if (mFit > 0.5) reasons.push('burnoutMatch');
  if (Number(practice.targets_ee) >= 0.5 && profile.need_EE >= 0.6) reasons.push('helpsExhaustion');
  if (Number(practice.targets_dp) >= 0.5 && profile.need_DP >= 0.6) reasons.push('helpsConnection');
  if (Number(practice.targets_pa) >= 0.5 && profile.need_PA >= 0.6) reasons.push('helpsAccomplishment');
  if (vakdFit >= 0.6) reasons.push('matchesLearningStyle');
  if (prefFit >= 0.5) reasons.push('matchesPreferences');
  if (practice.format === 'hybrid') reasons.push('flexibleFormat');
  if (practice.is_featured) reasons.push('featured');

  return reasons;
}

// ── Grouping into sections ─────────────────────────────────────────

export function groupPractices(
  scored: ScoredPractice[],
  profile: UserProfile
): MarketplaceSection[] {
  const sorted = [...scored].sort((a, b) => b.compositeScore - a.compositeScore);

  const sections: MarketplaceSection[] = [
    {
      key: 'recommendedForYou',
      practices: sorted.slice(0, 5),
    },
    {
      key: 'quickRelief',
      practices: sorted
        .filter(p => (p.duration_minutes ?? Infinity) <= 60 && p.intensity === 'soft')
        .slice(0, 6),
    },
    {
      key: 'focusClarity',
      practices: sorted
        .filter(p => Number(p.targets_pa) >= 0.5)
        .slice(0, 6),
    },
    {
      key: 'connectionSupport',
      practices: sorted
        .filter(p => Number(p.targets_dp) >= 0.5 && Number(p.social_fit_group) >= 0.5)
        .slice(0, 6),
    },
    {
      key: 'matchesYourStyle',
      practices: scored
        .filter(p => p.vakdFit >= 0.6)
        .sort((a, b) => b.vakdFit - a.vakdFit)
        .slice(0, 6),
    },
  ];

  return sections.filter(s => s.practices.length > 0);
}

// ── Cart period helpers ────────────────────────────────────────────

/** Get ISO Monday of the current 2-week period window */
export function getCurrentPeriodStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  // Align to 2-week blocks from a fixed epoch (Jan 1, 2024 was a Monday)
  const epoch = new Date(2024, 0, 1);
  const weeksSinceEpoch = Math.floor((monday.getTime() - epoch.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const periodWeeks = Math.floor(weeksSinceEpoch / 2) * 2;
  const periodStart = new Date(epoch);
  periodStart.setDate(epoch.getDate() + periodWeeks * 7);

  return periodStart.toISOString().split('T')[0];
}

export const SLOT_LIMITS: Record<string, number> = {
  core: 1,
  support: 1,
  optional: 1,
};
