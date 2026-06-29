import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  BarChart3,
  Brain,
  CreditCard,
  Eye,
  EyeOff,
  Flame,
  Lock,
  MessageSquare,
  Moon,
  PenTool,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Timer,
  Trash2,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import {
  clearStoredSession,
  createChallenge,
  createManualRoast,
  deleteChallenge,
  deleteManualRoast,
  deleteReport,
  deleteUser,
  fetchAdminPayload,
  fetchBroadcasts,
  fetchReports,
  getStoredSession,
  sendBroadcast,
  signInAdmin,
  updateChallenge,
  updateManualRoast,
  updateReport,
  updateSubscription,
  updateUser,
} from './api';
import type { AdminBroadcast, AdminChallenge, AdminManualRoast, AdminPayload, AdminReport, AdminTrafficMetric, AdminUserSummary, ChallengeConfig, ChallengeType, SubscriptionTier } from './types';
import './styles.css';

type Section = 'overview' | 'users' | 'subscriptions' | 'traffic' | 'ai' | 'challenges' | 'roasts' | 'broadcasts' | 'reports';

const tiers: SubscriptionTier[] = ['free', 'healed', 'ascended', 'family', 'lifetime'];
const ICON_OPTIONS = ['flame-outline', 'musical-notes-outline', 'hardware-chip-outline', 'moon-outline', 'book-outline', 'leaf-outline', 'fitness-outline', 'bed-outline', 'cafe-outline', 'code-outline', 'game-controller-outline', 'heart-outline', 'notifications-off-outline', 'phone-portrait-outline', 'skull-outline', 'flash-outline', 'rocket-outline', 'star-outline', 'trophy-outline', 'wand-outline'];
const DIFFICULTY_OPTIONS: AdminChallenge['difficulty'][] = ['easy', 'medium', 'hard', 'extreme', 'legendary'];

const CHALLENGE_TYPES: { value: ChallengeType; label: string; description: string; icon: string; color: string; category: 'app' | 'wellness' | 'productivity' | 'spiritual' | 'custom' }[] = [
  { value: 'app_block', label: 'App Block', description: 'Completely block an app for X days', icon: 'lock-closed', color: '#b85c5c', category: 'app' },
  { value: 'screen_time_reduce', label: 'Screen Time Cut', description: 'Reduce daily limit of an app', icon: 'timer', color: '#c2914e', category: 'app' },
  { value: 'no_social', label: 'No Social Media', description: 'Block all social media apps', icon: 'eye-off', color: '#8E44AD', category: 'app' },
  { value: 'prayer', label: 'Prayer Challenge', description: 'Pray all selected salah on time', icon: 'moon', color: '#2E86AB', category: 'spiritual' },
  { value: 'focus_hours', label: 'Deep Focus', description: 'Complete X hours of focus sessions', icon: 'flash', color: '#E67E22', category: 'productivity' },
  { value: 'task_completion', label: 'Task Crusher', description: 'Complete X tasks in the duration', icon: 'target', color: '#27AE60', category: 'productivity' },
  { value: 'custom', label: 'Custom Challenge', description: 'Freeform custom challenge rules', icon: 'pen-tool', color: '#5B6D8E', category: 'custom' },
];

const CHALLENGE_TEMPLATES: { label: string; icon: string; type: ChallengeType; difficulty: AdminChallenge['difficulty']; durationDays: number; rewardXp: number; config: ChallengeConfig; description: string }[] = [
  { label: '7-Day TikTok Detox', icon: 'skull-outline', type: 'app_block', difficulty: 'hard', durationDays: 7, rewardXp: 200, config: { targetAppName: 'TikTok', targetAppBundleId: 'com.zhiliaoapp.musically' }, description: 'Complete TikTok blackout for one week' },
  { label: '30-Day No Social', icon: 'eye-off', type: 'no_social', difficulty: 'extreme', durationDays: 30, rewardXp: 500, config: { blockedAppIds: ['com.zhiliaoapp.musically', 'com.instagram.android', 'com.twitter.android', 'com.facebook.katana', 'com.snapchat.android', 'com.reddit.frontpage'] }, description: 'Full social media blackout for one month' },
  { label: 'Fajr Only Week', icon: 'moon-outline', type: 'prayer', difficulty: 'medium', durationDays: 7, rewardXp: 150, config: { requiredPrayers: ['fajr'] }, description: 'Never miss Fajr for 7 days straight' },
  { label: 'All 5 Prayers', icon: 'moon-outline', type: 'prayer', difficulty: 'hard', durationDays: 30, rewardXp: 400, config: { requiredPrayers: ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] }, description: 'Pray all 5 salah on time every day for a month' },
  { label: '2h Focus Daily', icon: 'flash-outline', type: 'focus_hours', difficulty: 'medium', durationDays: 14, rewardXp: 250, config: { requiredFocusHours: 2 }, description: 'At least 2 hours of deep focus every day' },
  { label: 'TikTok Diet', icon: 'timer-outline', type: 'screen_time_reduce', difficulty: 'easy', durationDays: 14, rewardXp: 150, config: { targetAppName: 'TikTok', targetAppBundleId: 'com.zhiliaoapp.musically', challengeLimitMinutes: 15 }, description: 'Reduce TikTok from unlimited to just 15 min/day' },
  { label: '5 Tasks Daily', icon: 'target-outline', type: 'task_completion', difficulty: 'medium', durationDays: 7, rewardXp: 200, config: { requiredTaskCount: 5 }, description: 'Complete at least 5 tasks every day for a week' },
  { label: 'Phone Down After 10pm', icon: 'bed-outline', type: 'app_block', difficulty: 'easy', durationDays: 30, rewardXp: 300, config: { targetAppName: 'All Apps', targetAppBundleId: 'phone_bedtime' }, description: 'No phone use after 10pm for a full month' },
];

const KNOWN_APPS = [
  { bundleId: 'com.zhiliaoapp.musically', name: 'TikTok' },
  { bundleId: 'com.instagram.android', name: 'Instagram' },
  { bundleId: 'com.twitter.android', name: 'X (Twitter)' },
  { bundleId: 'com.facebook.katana', name: 'Facebook' },
  { bundleId: 'com.snapchat.android', name: 'Snapchat' },
  { bundleId: 'com.reddit.frontpage', name: 'Reddit' },
  { bundleId: 'com.google.android.youtube', name: 'YouTube' },
  { bundleId: 'com.linkedin.android', name: 'LinkedIn' },
  { bundleId: 'com.pinterest.android', name: 'Pinterest' },
  { bundleId: 'com.discord', name: 'Discord' },
  { bundleId: 'com.whatsapp', name: 'WhatsApp' },
  { bundleId: 'com.netflix.mediaclient', name: 'Netflix' },
  { bundleId: 'com.spotify.music', name: 'Spotify' },
  { bundleId: 'com.twitch.android.app', name: 'Twitch' },
  { bundleId: 'com.vimeo.android.videoapp', name: 'Vimeo' },
  { bundleId: 'com.google.android.apps.maps', name: 'Google Maps' },
  { bundleId: 'com.google.android.gm', name: 'Gmail' },
  { bundleId: 'com.slack', name: 'Slack' },
  { bundleId: 'com.microsoft.teams', name: 'Microsoft Teams' },
  { bundleId: 'com.zoom.videomeetings', name: 'Zoom' },
];

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function BrainRotSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 64 192 C 64 227.346 35.346 256 0 256 L 0 192 C 0 156.654 28.654 128 64 128 Z" fill="url(#brandGrad)" />
      <path d="M 128 128 C 163.346 128 192 156.654 192 192 L 192 256 C 156.654 256 128 227.346 128 192 C 128 227.346 99.346 256 64 256 L 64 192 C 64 156.654 92.654 128 128 128 Z" fill="url(#brandGrad)" />
      <path d="M 192 128 C 227.346 128 256 156.654 256 192 L 256 256 C 220.654 256 192 227.346 192 192 Z" fill="url(#brandGrad)" />
      <path d="M 0 0 C 35.346 0 64 28.654 64 64 L 64 128 C 28.654 128 0 99.346 0 64 Z" fill="url(#brandGrad)" />
      <path d="M 192 64 C 192 99.346 163.346 128 128 128 C 92.654 128 64 99.346 64 64 L 64 0 C 99.346 0 128 28.654 128 64 C 128 28.654 156.654 0 192 0 Z" fill="url(#brandGrad)" />
      <path d="M 256 64 C 256 99.346 227.346 128 192 128 L 192 64 C 192 28.654 220.654 0 256 0 Z" fill="url(#brandGrad)" />
      <defs>
        <linearGradient id="brandGrad" x1="0" y1="0" x2="256" y2="256">
          <stop offset="0%" stopColor="#577e86" />
          <stop offset="50%" stopColor="#4b686e" />
          <stop offset="100%" stopColor="#324e54" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const DIFFICULTY_META: Record<string, { color: string; label: string }> = {
  easy: { color: '#27AE60', label: 'Easy' },
  medium: { color: '#F39C12', label: 'Medium' },
  hard: { color: '#E74C3C', label: 'Hard' },
  extreme: { color: '#8E44AD', label: 'Extreme' },
  legendary: { color: '#E67E22', label: 'Legendary' },
};

const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

function App() {
  const [session, setSession] = useState(getStoredSession());
  const [payload, setPayload] = useState<AdminPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [section, setSection] = useState<Section>('overview');

  const load = async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      setPayload(await fetchAdminPayload());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [session?.token]);

  if (!session) return <SignIn onSignedIn={setSession} />;

  const refreshAfter = async (action: () => Promise<unknown>) => {
    setError(null);
    try { await action(); await load(); } catch (err) { setError(err instanceof Error ? err.message : 'Admin action failed'); }
  };

  const logout = () => { clearStoredSession(); setSession(null); setPayload(null); };

  return (
    <main className="shell shell--admin">
      <aside className="sidebar">
        <div className="brand"><BrainRotSvg className="brandLogo" /> BrainRot Admin</div>
        <nav>
          <NavButton active={section === 'overview'} onClick={() => setSection('overview')} icon={<BarChart3 />} label="Overview" />
          <NavButton active={section === 'users'} onClick={() => setSection('users')} icon={<Users />} label="Users" />
          <NavButton active={section === 'subscriptions'} onClick={() => setSection('subscriptions')} icon={<CreditCard />} label="Subscriptions" />
          <NavButton active={section === 'traffic'} onClick={() => setSection('traffic')} icon={<Smartphone />} label="Traffic" />
          <NavButton active={section === 'ai'} onClick={() => setSection('ai')} icon={<Sparkles />} label="AI Requests" />
          <NavButton active={section === 'challenges'} onClick={() => setSection('challenges')} icon={<Trophy />} label="Challenges" />
          <NavButton active={section === 'roasts'} onClick={() => setSection('roasts')} icon={<Flame />} label="Manual Roasts" />
          <NavButton active={section === 'broadcasts'} onClick={() => setSection('broadcasts')} icon={<MessageSquare />} label="Broadcasts" />
          <NavButton active={section === 'reports'} onClick={() => setSection('reports')} icon={<PenTool />} label="Reports" />
        </nav>
        <button className="ghostButton" onClick={logout}>Sign out</button>
      </aside>
      <section className="workspace">
        <div className="topbar">
          <div><p className="eyebrow">Production Console</p><h1>{sectionTitle(section)}</h1></div>
          <button className="iconButton iconButton--light" onClick={load} disabled={loading} aria-label="Refresh dashboard"><RefreshCw size={18} className={loading ? 'spin' : ''} /></button>
        </div>
        {error && <div className="error">{error}</div>}
        {!payload && loading && <div className="loadingCard">Loading production data...</div>}
        {payload && section === 'overview' && <Overview payload={payload} />}
        {payload && section === 'users' && <UsersPanel users={payload.users} query={query} setQuery={setQuery} refreshAfter={refreshAfter} />}
        {payload && section === 'subscriptions' && <SubscriptionsPanel payload={payload} refreshAfter={refreshAfter} />}
        {payload && section === 'traffic' && <TrafficPanel traffic={payload.traffic} />}
        {payload && section === 'ai' && <AIRequestsPanel payload={payload} />}
        {payload && section === 'challenges' && <ChallengesPanel challenges={payload.challenges} refreshAfter={refreshAfter} />}
        {payload && section === 'roasts' && <RoastsPanel roasts={payload.manualRoasts} refreshAfter={refreshAfter} />}
        {payload && section === 'broadcasts' && <BroadcastsPanel refreshAfter={refreshAfter} />}
        {payload && section === 'reports' && <ReportsPanel refreshAfter={refreshAfter} />}
      </section>
    </main>
  );
}

function SignIn({ onSignedIn }: { onSignedIn: (session: NonNullable<ReturnType<typeof getStoredSession>>) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError(null);
    try { onSignedIn(await signInAdmin(email, password)); } catch (err) { setError(err instanceof Error ? err.message : 'Admin sign-in failed'); } finally { setLoading(false); }
  };
  return (
    <main className="authShell">
      <form className="authCard reveal" onSubmit={submit}>
        <div className="authMark authMark--logo"><BrainRotSvg className="logoSvg" /></div>
        <p className="eyebrow">Administrator Authentication</p>
        <h1>BrainRot Operations</h1>
        <p className="authCopy">Authenticated administrators only.</p>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@email.com" type="email" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
        {error && <div className="error">{error}</div>}
        <button className="primaryButton" disabled={loading}>{loading ? 'Verifying...' : 'Sign in'}</button>
      </form>
    </main>
  );
}

function Overview({ payload }: { payload: AdminPayload }) {
  const overview = payload.overview;
  const conversion = overview.totalUsers ? Math.round((overview.activeSubscriptions / overview.totalUsers) * 100) : 0;
  return (
    <>
      <section className="hero reveal">
        <div className="hero__top"><div className="brand"><ShieldCheck size={18} /> Production Backend</div><span>{new Date(overview.generatedAt).toLocaleString()}</span></div>
        <div><p className="eyebrow">Operational Control</p><h2>Users, subscriptions, traffic, AI, challenges, roasts, and broadcasts.</h2><p className="hero__copy">All records are loaded from authenticated admin endpoints backed by the application database.</p></div>
      </section>
      <section className="metrics">
        <Metric icon={<Users />} label="Users" value={String(overview.totalUsers)} delay="80ms" />
        <Metric icon={<CreditCard />} label="Subscriptions" value={String(overview.activeSubscriptions)} delay="140ms" />
        <Metric icon={<Smartphone />} label="Screen Time" value={formatMinutes(overview.totalScreenTimeMinutes)} delay="200ms" />
        <Metric icon={<Lock />} label="Blocks" value={String(overview.blockedAttempts)} delay="260ms" />
        <Metric icon={<Brain />} label="Brain Score" value={String(overview.averageBrainScore)} delay="320ms" />
        <Metric icon={<Sparkles />} label="AI Requests" value={String(overview.aiRequests)} delay="380ms" />
        <Metric icon={<Flame />} label="Roasts Today" value={String(overview.recentRoasts || 0)} delay="440ms" />
        <Metric icon={<Moon />} label="Prayers Today" value={String(overview.prayersToday || 0)} delay="500ms" />
        <Metric icon={<Zap />} label="Active Streaks" value={String(overview.activeStreaks || 0)} delay="560ms" />
      </section>
      <section className="grid">
        <Card title="Conversion" meta={`${conversion}% paid`} icon={<BarChart3 />}><div className="progress"><span style={{ width: `${conversion}%` }} /></div></Card>
        <Card title="Real Analytics" meta="Operational snapshot" icon={<Activity />}><AnalyticsRows payload={payload} /></Card>
        <Card title="Roast Distribution" meta="Persona usage breakdown" icon={<Flame />}><RoastDistributionRows payload={payload} /></Card>
      </section>
    </>
  );
}

function UsersPanel({ users, query, setQuery, refreshAfter }: { users: AdminUserSummary[]; query: string; setQuery: (v: string) => void; refreshAfter: (a: () => Promise<unknown>) => Promise<void> }) {
  const filtered = users.filter((u) => `${u.name} ${u.email} ${u.subscriptionTier}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="panel reveal">
      <div className="panel__head"><div><p className="eyebrow">User Management</p><h2>All users</h2></div><SearchBox value={query} onChange={setQuery} /></div>
      <div className="table table--users"><div className="table__head"><span>User</span><span>Tier</span><span>Brain</span><span>XP</span><span>Actions</span></div>{filtered.map((u) => <UserRow key={u.id} user={u} refreshAfter={refreshAfter} />)}</div>
    </section>
  );
}

function UserRow({ user, refreshAfter }: { user: AdminUserSummary; refreshAfter: (a: () => Promise<unknown>) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [tier, setTier] = useState<SubscriptionTier>(user.subscriptionTier);
  const [brainScore, setBrainScore] = useState(user.brainScore);
  if (editing) {
    return <div className="editRow"><input value={name} onChange={(e) => setName(e.target.value)} /><input value={email} onChange={(e) => setEmail(e.target.value)} /><select value={tier} onChange={(e) => setTier(e.target.value as SubscriptionTier)}>{tiers.map((t) => <option key={t}>{t}</option>)}</select><input type="number" value={brainScore} onChange={(e) => setBrainScore(Number(e.target.value))} /><button onClick={() => refreshAfter(() => updateUser(user.id, { name, email, subscriptionTier: tier, brainScore })).then(() => setEditing(false))}>Save</button><button className="ghostButton" onClick={() => setEditing(false)}>Cancel</button></div>;
  }
  return <div className="table__row"><span className="userCell">{user.avatar && <img className="userAvatar" src={`data:image/svg+xml,${encodeURIComponent(user.avatar)}`} alt="" width={32} height={32} />}<div><b>{user.name}</b><small>{user.email}</small></div></span><span className="pill pill--active">{user.subscriptionTier}</span><span>{user.brainScore}</span><span>{user.xp}</span><span className="actions"><button onClick={() => setEditing(true)}>Edit</button><button className="dangerButton" onClick={() => confirm('Delete?') && refreshAfter(() => deleteUser(user.id))}><Trash2 size={14} /></button></span></div>;
}

function SubscriptionsPanel({ payload, refreshAfter }: { payload: AdminPayload; refreshAfter: (a: () => Promise<unknown>) => Promise<void> }) {
  return <section className="panel reveal"><div className="panel__head"><div><p className="eyebrow">Manual Billing Control</p><h2>Subscriptions</h2></div></div><div className="rows">{payload.subscriptions.map((sub) => <div className="row" key={sub.id}><span><b>{payload.users.find((u) => u.id === sub.userId)?.email ?? sub.userId}</b><small>{sub.revenueCatId || 'manual'}</small></span><select value={sub.tier} onChange={(e) => refreshAfter(() => updateSubscription(sub.userId, { tier: e.target.value as SubscriptionTier }))}>{tiers.map((t) => <option key={t}>{t}</option>)}</select><label className="switch"><input type="checkbox" checked={sub.isActive} onChange={(e) => refreshAfter(() => updateSubscription(sub.userId, { isActive: e.target.checked }))} /> active</label></div>)}</div></section>;
}

function TrafficPanel({ traffic }: { traffic: AdminTrafficMetric[] }) {
  const top = [...traffic].sort((a, b) => b.minutesUsed - a.minutesUsed);
  return <section className="panel reveal"><div className="panel__head"><div><p className="eyebrow">Real Traffic</p><h2>Screen time and blocked attempts</h2></div></div><div className="trafficList">{top.map((m) => <div className="traffic" key={m.id}><div><strong>{m.appName}</strong><span>{m.userId} · {m.date} · {m.blockedAttempts} blocked · +{m.overageMinutes}m over</span></div><b>{formatMinutes(m.minutesUsed)}</b></div>)}</div></section>;
}

function AIRequestsPanel({ payload }: { payload: AdminPayload }) {
  const totalCost = payload.aiRequests.reduce((s, r) => s + r.costUsd, 0);
  return <section className="panel reveal"><div className="panel__head"><div><p className="eyebrow">AI Observability</p><h2>Requests and cost</h2></div><span className="pill pill--active">${totalCost.toFixed(2)}</span></div><div className="table table--ai"><div className="table__head"><span>Feature</span><span>Status</span><span>Model</span><span>Tokens</span><span>Cost</span></div>{payload.aiRequests.map((r) => <div className="table__row" key={r.id}><span><b>{r.feature}</b><small>{r.userId}</small></span><span className={r.status === 'success' ? 'pill pill--active' : 'pill'}>{r.status}</span><span>{r.model}</span><span>{r.promptTokens + r.completionTokens}</span><span>${r.costUsd.toFixed(3)}</span></div>)}</div></section>;
}

/* ─── Challenge Config Form ─── */
function ChallengeConfigForm({ challengeType, config, setConfig }: { challengeType: ChallengeType; config: ChallengeConfig; setConfig: (c: ChallengeConfig) => void }) {
  const update = (patch: Partial<ChallengeConfig>) => setConfig({ ...config, ...patch });

  if (challengeType === 'app_block') {
    const selected = KNOWN_APPS.find((a) => a.bundleId === config.targetAppBundleId);
    return (
      <div className="configSection">
        <label className="configLabel">Choose an app to block</label>
        <div className="appGrid">
          {KNOWN_APPS.map((app) => (
            <label key={app.bundleId} className={`appChip ${config.targetAppBundleId === app.bundleId ? 'appChip--selected' : ''}`}>
              <input type="radio" className="srOnly" name="app_block_target" checked={config.targetAppBundleId === app.bundleId} onChange={() => update({ targetAppName: app.name, targetAppBundleId: app.bundleId })} />
              <span>{app.name}</span>
            </label>
          ))}
        </div>
        {selected && <p className="configHint">Bundle ID: {selected.bundleId}</p>}
      </div>
    );
  }

  if (challengeType === 'screen_time_reduce') {
    const selected = KNOWN_APPS.find((a) => a.bundleId === config.targetAppBundleId);
    return (
      <div className="configSection">
        <label className="configLabel">Choose an app to limit</label>
        <div className="appGrid">
          {KNOWN_APPS.map((app) => (
            <label key={app.bundleId} className={`appChip ${config.targetAppBundleId === app.bundleId ? 'appChip--selected' : ''}`}>
              <input type="radio" className="srOnly" name="screentime_target" checked={config.targetAppBundleId === app.bundleId} onChange={() => update({ targetAppName: app.name, targetAppBundleId: app.bundleId })} />
              <span>{app.name}</span>
            </label>
          ))}
        </div>
        {selected && <p className="configHint">Bundle ID: {selected.bundleId}</p>}
        <div className="configRow">
          <div><label className="configLabel">Current limit (min)</label><input type="number" placeholder="e.g. 60" value={config.originalLimitMinutes || ''} onChange={(e) => update({ originalLimitMinutes: Number(e.target.value) })} min={1} /></div>
          <div><label className="configLabel">Challenge limit (min)</label><input type="number" placeholder="e.g. 15" value={config.challengeLimitMinutes || ''} onChange={(e) => update({ challengeLimitMinutes: Number(e.target.value) })} min={0} /></div>
        </div>
      </div>
    );
  }

  if (challengeType === 'no_social') {
    return (
      <div className="configSection">
        <label className="configLabel">Select apps to block</label>
        <div className="appGrid">
          {KNOWN_APPS.map((app) => (
            <label key={app.bundleId} className={`appChip ${(config.blockedAppIds || []).includes(app.bundleId) ? 'appChip--selected' : ''}`}>
              <input type="checkbox" className="srOnly" checked={(config.blockedAppIds || []).includes(app.bundleId)} onChange={(e) => {
                const current = config.blockedAppIds || [];
                update({ blockedAppIds: e.target.checked ? [...current, app.bundleId] : current.filter((id) => id !== app.bundleId) });
              }} />
              <span>{app.name}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (challengeType === 'prayer') {
    return (
      <div className="configSection">
        <label className="configLabel">Required Prayers</label>
        <div className="appGrid">
          {PRAYERS.map((prayer) => (
            <label key={prayer} className={`appChip ${(config.requiredPrayers || []).includes(prayer) ? 'appChip--selected' : ''}`}>
              <input type="checkbox" className="srOnly" checked={(config.requiredPrayers || []).includes(prayer)} onChange={(e) => {
                const current = config.requiredPrayers || [];
                update({ requiredPrayers: e.target.checked ? [...current, prayer] : current.filter((p) => p !== prayer) });
              }} />
              <span>{prayer.charAt(0).toUpperCase() + prayer.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (challengeType === 'focus_hours') {
    return (
      <div className="configSection">
        <label className="configLabel">Required focus hours per day</label>
        <input type="number" placeholder="e.g. 2" value={config.requiredFocusHours || ''} onChange={(e) => update({ requiredFocusHours: Number(e.target.value) })} min={1} />
      </div>
    );
  }

  if (challengeType === 'task_completion') {
    return (
      <div className="configSection">
        <label className="configLabel">Required tasks to complete</label>
        <input type="number" placeholder="e.g. 5" value={config.requiredTaskCount || ''} onChange={(e) => update({ requiredTaskCount: Number(e.target.value) })} min={1} />
      </div>
    );
  }

  return (
    <div className="configSection">
      <label className="configLabel">Custom instructions for participants</label>
      <textarea placeholder="Describe the challenge rules, goals, and any special instructions..." value={config.customInstructions || ''} onChange={(e) => update({ customInstructions: e.target.value })} rows={4} />
    </div>
  );
}

/* ─── Challenges Panel ─── */
function ChallengesPanel({ challenges, refreshAfter }: { challenges: AdminChallenge[]; refreshAfter: (a: () => Promise<unknown>) => Promise<void> }) {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('flame-outline');
  const [challengeType, setChallengeType] = useState<ChallengeType>('app_block');
  const [difficulty, setDifficulty] = useState<AdminChallenge['difficulty']>('medium');
  const [durationDays, setDurationDays] = useState(7);
  const [rewardXp, setRewardXp] = useState(100);
  const [config, setConfig] = useState<ChallengeConfig>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editType, setEditType] = useState<ChallengeType>('app_block');
  const [editDifficulty, setEditDifficulty] = useState<AdminChallenge['difficulty']>('medium');
  const [editDurationDays, setEditDurationDays] = useState(7);
  const [editRewardXp, setEditRewardXp] = useState(100);
  const [editConfig, setEditConfig] = useState<ChallengeConfig>({});

  const startEdit = (ch: AdminChallenge) => {
    setEditingId(ch.id); setEditTitle(ch.title); setEditDescription(ch.description); setEditIcon(ch.icon);
    setEditType(ch.challengeType); setEditDifficulty(ch.difficulty); setEditDurationDays(ch.durationDays);
    setEditRewardXp(ch.rewardXp); setEditConfig(ch.config || {});
  };

  const saveEdit = (id: string) => {
    refreshAfter(() => updateChallenge(id, { title: editTitle, description: editDescription, icon: editIcon, challengeType: editType, difficulty: editDifficulty, durationDays: editDurationDays, rewardXp: editRewardXp, config: editConfig })).then(() => setEditingId(null));
  };

  const handleCreate = () => {
    refreshAfter(() => createChallenge({ title, description, icon, challengeType, difficulty, durationDays, rewardXp, config, isActive: true })).then(() => {
      setTitle(''); setDescription(''); setIcon('flame-outline'); setChallengeType('app_block'); setDifficulty('medium');
      setDurationDays(7); setRewardXp(100); setConfig({}); setShowCreate(false);
    });
  };

  const applyTemplate = (template: typeof CHALLENGE_TEMPLATES[0]) => {
    setTitle(template.label); setDescription(template.description); setIcon(template.icon);
    setChallengeType(template.type); setDifficulty(template.difficulty); setDurationDays(template.durationDays);
    setRewardXp(template.rewardXp); setConfig(template.config); setShowCreate(true);
  };

  const typeInfo = (t: ChallengeType) => CHALLENGE_TYPES.find((ct) => ct.value === t);
  const activeChallenges = challenges.filter((c) => c.isActive);
  const inactiveChallenges = challenges.filter((c) => !c.isActive);

  return (
    <section className="panel reveal">
      <div className="panel__head">
        <div><p className="eyebrow">Challenge CMS</p><h2>Create and manage challenges</h2></div>
        <button className="primaryButton" onClick={() => setShowCreate(!showCreate)} style={{ marginTop: 0 }}><Plus size={15} /> {showCreate ? 'Close' : 'New Challenge'}</button>
      </div>

      {/* Quick Templates */}
      {!showCreate && (
        <div className="templatesSection">
          <p className="sectionSubhead">Quick Start Templates</p>
          <div className="templateGrid">
            {CHALLENGE_TEMPLATES.map((t, i) => (
              <button key={i} className="templateCard" onClick={() => applyTemplate(t)}>
                <span className="templateIcon">{t.icon}</span>
                <span className="templateLabel">{t.label}</span>
                <span className="templateMeta">{t.durationDays}d · {DIFFICULTY_META[t.difficulty]?.label} · {t.rewardXp} XP</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="createForm">
          <div className="createFormHeader">
            <h3>New Challenge</h3>
            <button className="ghostButton" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>

          <div className="formGrid">
            <div className="formGroup">
              <label className="formLabel">Challenge Type</label>
              <div className="typeSelector">
                {CHALLENGE_TYPES.map((ct) => (
                  <button key={ct.value} className={`typeCard ${challengeType === ct.value ? 'typeCard--selected' : ''}`} onClick={() => { setChallengeType(ct.value); setConfig({}); }} style={{ '--type-color': ct.color } as any}>
                    <span className="typeCardIcon" style={{ color: ct.color }}>{ct.label.charAt(0)}</span>
                    <span className="typeCardLabel">{ct.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="formRow2">
              <div className="formGroup"><label className="formLabel">Title</label><input placeholder="e.g. TikTok Detox Week" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div className="formGroup"><label className="formLabel">Description</label><input placeholder="Short description of the challenge" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            </div>

            <div className="formRow4">
              <div className="formGroup"><label className="formLabel">Icon</label><select value={icon} onChange={(e) => setIcon(e.target.value)}>{ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}</select></div>
              <div className="formGroup"><label className="formLabel">Difficulty</label><select value={difficulty} onChange={(e) => setDifficulty(e.target.value as AdminChallenge['difficulty'])}>{DIFFICULTY_OPTIONS.map((d) => <option key={d}>{d}</option>)}</select></div>
              <div className="formGroup"><label className="formLabel">Duration (days)</label><input type="number" value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} min={1} /></div>
              <div className="formGroup"><label className="formLabel">XP Reward</label><input type="number" value={rewardXp} onChange={(e) => setRewardXp(Number(e.target.value))} min={0} /></div>
            </div>

            <ChallengeConfigForm challengeType={challengeType} config={config} setConfig={setConfig} />

            <div className="createFormActions">
              <button className="primaryButton" onClick={handleCreate} style={{ marginTop: 0 }}><Plus size={15} /> Create Challenge</button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge List */}
      {activeChallenges.length > 0 && (
        <div className="challengeList">
          <p className="sectionSubhead">Active Challenges ({activeChallenges.length})</p>
          {activeChallenges.map((challenge) => (
            editingId === challenge.id ? (
              <div className="editCard" key={challenge.id}>
                <div className="editCardGrid">
                  <div className="formGroup"><label className="formLabel">Title</label><input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /></div>
                  <div className="formGroup"><label className="formLabel">Description</label><input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} /></div>
                  <div className="formRow4">
                    <div className="formGroup"><label className="formLabel">Type</label><select value={editType} onChange={(e) => setEditType(e.target.value as ChallengeType)}>{CHALLENGE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                    <div className="formGroup"><label className="formLabel">Icon</label><select value={editIcon} onChange={(e) => setEditIcon(e.target.value)}>{ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}</select></div>
                    <div className="formGroup"><label className="formLabel">Difficulty</label><select value={editDifficulty} onChange={(e) => setEditDifficulty(e.target.value as AdminChallenge['difficulty'])}>{DIFFICULTY_OPTIONS.map((d) => <option key={d}>{d}</option>)}</select></div>
                    <div className="formGroup"><label className="formLabel">Days</label><input type="number" value={editDurationDays} onChange={(e) => setEditDurationDays(Number(e.target.value))} min={1} /></div>
                  </div>
                  <ChallengeConfigForm challengeType={editType} config={editConfig} setConfig={(c) => setEditConfig(c)} />
                </div>
                <div className="editCardActions">
                  <button className="primaryButton" onClick={() => saveEdit(challenge.id)} style={{ marginTop: 0 }}>Save</button>
                  <button className="ghostButton" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="challengeCard" key={challenge.id}>
                <div className="challengeCardLeft">
                  <div className="challengeTypeBadge" style={{ background: `${typeInfo(challenge.challengeType)?.color}18`, color: typeInfo(challenge.challengeType)?.color }}>{typeInfo(challenge.challengeType)?.label || challenge.challengeType}</div>
                  <h4 className="challengeCardTitle">{challenge.icon} {challenge.title}</h4>
                  <p className="challengeCardDesc">{challenge.description}</p>
                  <div className="challengeCardMeta">
                    <span className="metaTag" style={{ color: DIFFICULTY_META[challenge.difficulty]?.color }}>{DIFFICULTY_META[challenge.difficulty]?.label}</span>
                    <span className="metaDot">·</span>
                    <span>{challenge.durationDays} days</span>
                    <span className="metaDot">·</span>
                    <span>{challenge.rewardXp} XP</span>
                    <span className="metaDot">·</span>
                    <span>{challenge.participantCount ?? 0} joined</span>
                    {challenge.config?.targetAppName && <><span className="metaDot">·</span><span>App: {challenge.config.targetAppName}</span></>}
                    {challenge.config?.blockedAppIds && <><span className="metaDot">·</span><span>{challenge.config.blockedAppIds.length} apps blocked</span></>}
                  </div>
                </div>
                <div className="challengeCardActions">
                  <button className="ghostButton" onClick={() => startEdit(challenge)}>Edit</button>
                  <button className="dangerButton" onClick={() => refreshAfter(() => deleteChallenge(challenge.id))}><Trash2 size={14} /></button>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {inactiveChallenges.length > 0 && (
        <div className="challengeList">
          <p className="sectionSubhead">Inactive ({inactiveChallenges.length})</p>
          {inactiveChallenges.map((challenge) => (
            <div className="challengeCard challengeCard--inactive" key={challenge.id}>
              <div className="challengeCardLeft">
                <div className="challengeTypeBadge" style={{ background: `${typeInfo(challenge.challengeType)?.color}18`, color: typeInfo(challenge.challengeType)?.color }}>{typeInfo(challenge.challengeType)?.label || challenge.challengeType}</div>
                <h4 className="challengeCardTitle">{challenge.icon} {challenge.title}</h4>
                <div className="challengeCardMeta">
                  <span>{challenge.durationDays}d · {challenge.rewardXp} XP · {challenge.participantCount ?? 0} joined</span>
                </div>
              </div>
              <div className="challengeCardActions">
                <label className="switch"><input type="checkbox" checked={challenge.isActive} onChange={(e) => refreshAfter(() => updateChallenge(challenge.id, { isActive: e.target.checked }))} /> enable</label>
                <button className="dangerButton" onClick={() => refreshAfter(() => deleteChallenge(challenge.id))}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {challenges.length === 0 && !showCreate && (
        <div className="emptyState">
          <Trophy size={48} style={{ color: 'var(--muted)' }} />
          <p>No challenges yet. Create one above or use a template.</p>
        </div>
      )}
    </section>
  );
}

function RoastsPanel({ roasts, refreshAfter }: { roasts: AdminManualRoast[]; refreshAfter: (a: () => Promise<unknown>) => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  return <section className="panel reveal"><div className="panel__head"><div><p className="eyebrow">Manual Roasting</p><h2>Add and manage roasts</h2></div></div><div className="createBar"><input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} /><input placeholder="Roast body" value={body} onChange={(e) => setBody(e.target.value)} /><button onClick={() => refreshAfter(() => createManualRoast({ title, body, persona: 'random', language: 'en', isActive: true })).then(() => { setTitle(''); setBody(''); })}><Plus size={15} /> Add</button></div><div className="rows">{roasts.map((r) => <div className="row" key={r.id}><span><b>{r.title}</b><small>{r.body}</small></span><label className="switch"><input type="checkbox" checked={r.isActive} onChange={(e) => refreshAfter(() => updateManualRoast(r.id, { isActive: e.target.checked }))} /> active</label><button className="dangerButton" onClick={() => refreshAfter(() => deleteManualRoast(r.id))}><Trash2 size={14} /></button></div>)}</div></section>;
}

function BroadcastsPanel({ refreshAfter }: { refreshAfter: (a: () => Promise<unknown>) => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetTier, setTargetTier] = useState<'all' | SubscriptionTier>('all');
  const [broadcasts, setBroadcasts] = useState<AdminBroadcast[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBroadcasts = async () => {
    setLoading(true);
    try { setBroadcasts(await fetchBroadcasts()); } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { loadBroadcasts(); }, []);

  const handleSend = () => {
    if (!title.trim() || !body.trim()) return;
    refreshAfter(() => sendBroadcast({ title, body, targetTier })).then(() => {
      setTitle(''); setBody(''); setTargetTier('all');
      loadBroadcasts();
    });
  };

  return (
    <section className="panel reveal">
      <div className="panel__head">
        <div><p className="eyebrow">Notification Broadcasts</p><h2>Send push notifications to users</h2></div>
      </div>
      <div className="createForm">
        <div className="formGrid">
          <div className="formRow2">
            <div className="formGroup"><label className="formLabel">Title</label><input placeholder="e.g. New Challenge Available!" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="formGroup"><label className="formLabel">Message</label><input placeholder="Notification body text..." value={body} onChange={(e) => setBody(e.target.value)} /></div>
          </div>
          <div className="formRow2">
            <div className="formGroup"><label className="formLabel">Target</label><select value={targetTier} onChange={(e) => setTargetTier(e.target.value as 'all' | SubscriptionTier)}><option value="all">All Users</option>{tiers.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}</select></div>
            <div className="formGroup" style={{ display: 'flex', alignItems: 'flex-end' }}><button className="primaryButton" onClick={handleSend} style={{ marginTop: 0, width: '100%' }}><Send size={15} /> Send Broadcast</button></div>
          </div>
        </div>
      </div>
      {broadcasts.length > 0 && (
        <div className="challengeList">
          <p className="sectionSubhead">Recent Broadcasts ({broadcasts.length})</p>
          {broadcasts.map((b) => (
            <div className="challengeCard" key={b.id}>
              <div className="challengeCardLeft">
                <h4 className="challengeCardTitle">{b.title}</h4>
                <p className="challengeCardDesc">{b.body}</p>
                <div className="challengeCardMeta">
                  <span className="metaTag">Target: {b.targetTier}</span>
                  <span className="metaDot">·</span>
                  <span>Sent by {b.sentBy}</span>
                  <span className="metaDot">·</span>
                  <span>{new Date(b.sentAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AnalyticsRows({ payload }: { payload: AdminPayload }) {
  const a = payload.analytics;
  return <div className="rows"><div className="row"><span>DAU</span><b>{a.dau}</b></div><div className="row"><span>WAU</span><b>{a.wau}</b></div><div className="row"><span>Conversion</span><b>{a.conversionRate}%</b></div><div className="row"><span>Churn risk</span><b>{a.churnRiskUsers}</b></div><div className="row"><span>Avg session</span><b>{formatMinutes(a.averageSessionMinutes)}</b></div></div>;
}

function RoastDistributionRows({ payload }: { payload: AdminPayload }) {
  const dist = payload.analytics.roastDistribution || {};
  const entries = Object.entries(dist).sort(([, a], [, b]) => b.count - a.count);
  if (entries.length === 0) return <div className="rows"><div className="row"><span>No roast data yet</span></div></div>;
  return <div className="rows">{entries.map(([persona, data]) => <div className="row" key={persona}><span>{persona.replace(/_/g, ' ')}</span><b>{data.count}</b></div>)}</div>;
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) { return <label className="search"><Search size={17} /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search users" /></label>; }
function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) { return <button className={active ? 'navButton navButton--active' : 'navButton'} onClick={onClick}>{icon}{label}</button>; }
function Metric({ icon, label, value, delay }: { icon: React.ReactNode; label: string; value: string; delay: string }) { return <article className="metric reveal" style={{ animationDelay: delay }}><div className="metric__icon">{icon}</div><strong>{value}</strong><span>{label}</span></article>; }
function Card({ title, meta, icon, children }: { title: string; meta: string; icon: React.ReactNode; children: React.ReactNode }) { return <article className="card reveal reveal--late"><div className="card__head"><div className="card__icon">{icon}</div><div><h2>{title}</h2><p>{meta}</p></div></div>{children}</article>; }
function ReportsPanel({ refreshAfter }: { refreshAfter: (a: () => Promise<unknown>) => Promise<void> }) {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    try { setReports(await fetchReports()); } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { loadReports(); }, []);

  const handleStatusChange = (id: string, status: AdminReport['status']) => {
    refreshAfter(() => updateReport(id, { status })).then(() => loadReports());
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this report?')) {
      refreshAfter(() => deleteReport(id)).then(() => loadReports());
    }
  };

  const openReports = reports.filter((r) => r.status === 'open');
  const otherReports = reports.filter((r) => r.status !== 'open');

  return (
    <section className="panel reveal">
      <div className="panel__head">
        <div><p className="eyebrow">User Feedback</p><h2>Bug reports and feature requests</h2></div>
      </div>

      {openReports.length > 0 && (
        <div className="challengeList">
          <p className="sectionSubhead">Open ({openReports.length})</p>
          {openReports.map((report) => (
            <div className="challengeCard" key={report.id}>
              <div className="challengeCardLeft">
                <div className="challengeTypeBadge" style={{ background: report.type === 'bug' ? '#b85c5c18' : '#27AE6018', color: report.type === 'bug' ? '#b85c5c' : '#27AE60' }}>{report.type === 'bug' ? 'Bug' : 'Feature'}</div>
                <h4 className="challengeCardTitle">{report.title}</h4>
                <p className="challengeCardDesc">{report.description}</p>
                <div className="challengeCardMeta">
                  <span>User: {report.userId}</span>
                  <span className="metaDot">·</span>
                  <span>{new Date(report.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="challengeCardActions">
                <select value={report.status} onChange={(e) => handleStatusChange(report.id, e.target.value as AdminReport['status'])}>
                  <option value="open">Open</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="fixed">Fixed</option>
                  <option value="closed">Closed</option>
                </select>
                <button className="dangerButton" onClick={() => handleDelete(report.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {otherReports.length > 0 && (
        <div className="challengeList">
          <p className="sectionSubhead">Processed ({otherReports.length})</p>
          {otherReports.map((report) => (
            <div className="challengeCard challengeCard--inactive" key={report.id}>
              <div className="challengeCardLeft">
                <div className="challengeTypeBadge" style={{ background: report.type === 'bug' ? '#b85c5c18' : '#27AE6018', color: report.type === 'bug' ? '#b85c5c' : '#27AE60' }}>{report.type === 'bug' ? 'Bug' : 'Feature'}</div>
                <h4 className="challengeCardTitle">{report.title}</h4>
                <p className="challengeCardDesc">{report.description}</p>
                <div className="challengeCardMeta">
                  <span className="pill">{report.status}</span>
                  <span className="metaDot">·</span>
                  <span>User: {report.userId}</span>
                  <span className="metaDot">·</span>
                  <span>{new Date(report.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="challengeCardActions">
                <select value={report.status} onChange={(e) => handleStatusChange(report.id, e.target.value as AdminReport['status'])}>
                  <option value="open">Open</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="fixed">Fixed</option>
                  <option value="closed">Closed</option>
                </select>
                <button className="dangerButton" onClick={() => handleDelete(report.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {reports.length === 0 && (
        <div className="emptyState">
          <PenTool size={48} style={{ color: 'var(--muted)' }} />
          <p>No reports yet. User submissions will appear here.</p>
        </div>
      )}
    </section>
  );
}

function sectionTitle(section: Section) { return ({ overview: 'Overview', users: 'Users', subscriptions: 'Subscriptions', traffic: 'Traffic', ai: 'AI Requests', challenges: 'Challenges', roasts: 'Manual Roasts', broadcasts: 'Broadcasts', reports: 'User Reports' } as const)[section]; }

createRoot(document.getElementById('root')!).render(<App />);
