import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  BarChart3,
  Brain,
  CreditCard,
  Flame,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react';
import {
  clearStoredSession,
  createChallenge,
  createManualRoast,
  deleteChallenge,
  deleteManualRoast,
  deleteUser,
  fetchAdminPayload,
  getStoredSession,
  signInAdmin,
  updateChallenge,
  updateManualRoast,
  updateSubscription,
  updateUser,
} from './api';
import type { AdminChallenge, AdminManualRoast, AdminPayload, AdminTrafficMetric, AdminUserSummary, SubscriptionTier } from './types';
import './styles.css';

type Section = 'overview' | 'users' | 'subscriptions' | 'traffic' | 'ai' | 'challenges' | 'roasts';

const tiers: SubscriptionTier[] = ['free', 'healed', 'ascended', 'family', 'lifetime'];
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

  useEffect(() => {
    load();
  }, [session?.token]);

  if (!session) return <SignIn onSignedIn={setSession} />;

  const refreshAfter = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin action failed');
    }
  };

  const logout = () => {
    clearStoredSession();
    setSession(null);
    setPayload(null);
  };

  return (
    <main className="shell shell--admin">
      <aside className="sidebar">
        <div className="brand"><ShieldCheck size={18} /> BrainRot Admin</div>
        <nav>
          <NavButton active={section === 'overview'} onClick={() => setSection('overview')} icon={<BarChart3 />} label="Overview" />
          <NavButton active={section === 'users'} onClick={() => setSection('users')} icon={<Users />} label="Users" />
          <NavButton active={section === 'subscriptions'} onClick={() => setSection('subscriptions')} icon={<CreditCard />} label="Subscriptions" />
          <NavButton active={section === 'traffic'} onClick={() => setSection('traffic')} icon={<Smartphone />} label="Traffic" />
          <NavButton active={section === 'ai'} onClick={() => setSection('ai')} icon={<Sparkles />} label="AI Requests" />
          <NavButton active={section === 'challenges'} onClick={() => setSection('challenges')} icon={<Trophy />} label="Challenges" />
          <NavButton active={section === 'roasts'} onClick={() => setSection('roasts')} icon={<Flame />} label="Manual Roasts" />
        </nav>
        <button className="ghostButton" onClick={logout}>Sign out</button>
      </aside>

      <section className="workspace">
        <div className="topbar">
          <div>
            <p className="eyebrow">Production Console</p>
            <h1>{sectionTitle(section)}</h1>
          </div>
          <button className="iconButton iconButton--light" onClick={load} disabled={loading} aria-label="Refresh dashboard">
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
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
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      onSignedIn(await signInAdmin(email, password));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="authShell">
      <form className="authCard reveal" onSubmit={submit}>
        <div className="authMark"><ShieldCheck /></div>
        <p className="eyebrow">Administrator Authentication</p>
        <h1>BrainRot Operations</h1>
        <p className="authCopy">Authenticated administrators only. Access is verified by the production backend before any data is loaded.</p>
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
        <div><p className="eyebrow">Operational Control</p><h2>Users, subscriptions, traffic, AI, challenges, and roasts.</h2><p className="hero__copy">All records are loaded from authenticated admin endpoints backed by the application database.</p></div>
      </section>
      <section className="metrics">
        <Metric icon={<Users />} label="Users" value={String(overview.totalUsers)} delay="80ms" />
        <Metric icon={<CreditCard />} label="Subscriptions" value={String(overview.activeSubscriptions)} delay="140ms" />
        <Metric icon={<Smartphone />} label="Traffic" value={formatMinutes(overview.totalScreenTimeMinutes)} delay="200ms" />
        <Metric icon={<Lock />} label="Blocks" value={String(overview.blockedAttempts)} delay="260ms" />
        <Metric icon={<Brain />} label="Brain score" value={String(overview.averageBrainScore)} delay="320ms" />
        <Metric icon={<Sparkles />} label="AI requests" value={String(overview.aiRequests)} delay="380ms" />
      </section>
      <section className="grid">
        <Card title="Conversion" meta={`${conversion}% paid`} icon={<BarChart3 />}><div className="progress"><span style={{ width: `${conversion}%` }} /></div></Card>
        <Card title="Real Analytics" meta="Operational snapshot" icon={<Activity />}><AnalyticsRows payload={payload} /></Card>
      </section>
    </>
  );
}

function UsersPanel({ users, query, setQuery, refreshAfter }: { users: AdminUserSummary[]; query: string; setQuery: (value: string) => void; refreshAfter: (action: () => Promise<unknown>) => Promise<void> }) {
  const filtered = users.filter((user) => `${user.name} ${user.email} ${user.subscriptionTier}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="panel reveal">
      <div className="panel__head"><div><p className="eyebrow">User Management</p><h2>All users</h2></div><SearchBox value={query} onChange={setQuery} /></div>
      <div className="table table--users">
        <div className="table__head"><span>User</span><span>Tier</span><span>Brain</span><span>XP</span><span>Actions</span></div>
        {filtered.map((user) => <UserRow key={user.id} user={user} refreshAfter={refreshAfter} />)}
      </div>
    </section>
  );
}

function UserRow({ user, refreshAfter }: { user: AdminUserSummary; refreshAfter: (action: () => Promise<unknown>) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [tier, setTier] = useState<SubscriptionTier>(user.subscriptionTier);
  const [brainScore, setBrainScore] = useState(user.brainScore);
  if (editing) {
    return <div className="editRow"><input value={name} onChange={(e) => setName(e.target.value)} /><input value={email} onChange={(e) => setEmail(e.target.value)} /><select value={tier} onChange={(e) => setTier(e.target.value as SubscriptionTier)}>{tiers.map((t) => <option key={t}>{t}</option>)}</select><input type="number" value={brainScore} onChange={(e) => setBrainScore(Number(e.target.value))} /><button onClick={() => refreshAfter(() => updateUser(user.id, { name, email, subscriptionTier: tier, brainScore })).then(() => setEditing(false))}>Save</button><button className="ghostButton" onClick={() => setEditing(false)}>Cancel</button></div>;
  }
  return <div className="table__row"><span><b>{user.name}</b><small>{user.email}</small></span><span className="pill pill--active">{user.subscriptionTier}</span><span>{user.brainScore}</span><span>{user.xp}</span><span className="actions"><button onClick={() => setEditing(true)}>Edit</button><button className="dangerButton" onClick={() => confirm('Delete this user?') && refreshAfter(() => deleteUser(user.id))}><Trash2 size={14} /></button></span></div>;
}

function SubscriptionsPanel({ payload, refreshAfter }: { payload: AdminPayload; refreshAfter: (action: () => Promise<unknown>) => Promise<void> }) {
  return <section className="panel reveal"><div className="panel__head"><div><p className="eyebrow">Manual Billing Control</p><h2>Subscriptions</h2></div></div><div className="rows">{payload.subscriptions.map((sub) => <div className="row" key={sub.id}><span><b>{payload.users.find((u) => u.id === sub.userId)?.email ?? sub.userId}</b><small>{sub.revenueCatId || 'manual entitlement'}</small></span><select value={sub.tier} onChange={(e) => refreshAfter(() => updateSubscription(sub.userId, { tier: e.target.value as SubscriptionTier }))}>{tiers.map((tier) => <option key={tier}>{tier}</option>)}</select><label className="switch"><input type="checkbox" checked={sub.isActive} onChange={(e) => refreshAfter(() => updateSubscription(sub.userId, { isActive: e.target.checked }))} /> active</label></div>)}</div></section>;
}

function TrafficPanel({ traffic }: { traffic: AdminTrafficMetric[] }) {
  const topTraffic = [...traffic].sort((a, b) => b.minutesUsed - a.minutesUsed);
  return <section className="panel reveal"><div className="panel__head"><div><p className="eyebrow">Real Traffic</p><h2>Screen time and blocked attempts</h2></div></div><div className="trafficList">{topTraffic.map((metric) => <div className="traffic" key={metric.id}><div><strong>{metric.appName}</strong><span>{metric.userId} · {metric.date} · {metric.blockedAttempts} blocked · +{metric.overageMinutes}m over</span></div><b>{formatMinutes(metric.minutesUsed)}</b></div>)}</div></section>;
}

function AIRequestsPanel({ payload }: { payload: AdminPayload }) {
  const totalCost = payload.aiRequests.reduce((sum, req) => sum + req.costUsd, 0);
  return <section className="panel reveal"><div className="panel__head"><div><p className="eyebrow">AI Observability</p><h2>Requests and cost</h2></div><span className="pill pill--active">${totalCost.toFixed(2)}</span></div><div className="table table--ai"><div className="table__head"><span>Feature</span><span>Status</span><span>Model</span><span>Tokens</span><span>Cost</span></div>{payload.aiRequests.map((req) => <div className="table__row" key={req.id}><span><b>{req.feature}</b><small>{req.userId}</small></span><span className={req.status === 'success' ? 'pill pill--active' : 'pill'}>{req.status}</span><span>{req.model}</span><span>{req.promptTokens + req.completionTokens}</span><span>${req.costUsd.toFixed(3)}</span></div>)}</div></section>;
}

function ChallengesPanel({ challenges, refreshAfter }: { challenges: AdminChallenge[]; refreshAfter: (action: () => Promise<unknown>) => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  return <section className="panel reveal"><div className="panel__head"><div><p className="eyebrow">Challenge CMS</p><h2>Add/remove challenges</h2></div></div><div className="createBar"><input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} /><input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} /><button onClick={() => refreshAfter(() => createChallenge({ title, description, rewardXp: 100, durationDays: 7, isActive: true })).then(() => { setTitle(''); setDescription(''); })}><Plus size={15} /> Add</button></div><div className="rows">{challenges.map((challenge) => <div className="row" key={challenge.id}><span><b>{challenge.title}</b><small>{challenge.description}</small></span><label className="switch"><input type="checkbox" checked={challenge.isActive} onChange={(e) => refreshAfter(() => updateChallenge(challenge.id, { isActive: e.target.checked }))} /> active</label><button className="dangerButton" onClick={() => refreshAfter(() => deleteChallenge(challenge.id))}><Trash2 size={14} /></button></div>)}</div></section>;
}

function RoastsPanel({ roasts, refreshAfter }: { roasts: AdminManualRoast[]; refreshAfter: (action: () => Promise<unknown>) => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  return <section className="panel reveal"><div className="panel__head"><div><p className="eyebrow">Manual Roasting</p><h2>Add and manage roasts</h2></div></div><div className="createBar"><input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} /><input placeholder="Roast body" value={body} onChange={(e) => setBody(e.target.value)} /><button onClick={() => refreshAfter(() => createManualRoast({ title, body, persona: 'drill_sergeant', language: 'en', isActive: true })).then(() => { setTitle(''); setBody(''); })}><Plus size={15} /> Add</button></div><div className="rows">{roasts.map((roast) => <div className="row" key={roast.id}><span><b>{roast.title}</b><small>{roast.body}</small></span><label className="switch"><input type="checkbox" checked={roast.isActive} onChange={(e) => refreshAfter(() => updateManualRoast(roast.id, { isActive: e.target.checked }))} /> active</label><button className="dangerButton" onClick={() => refreshAfter(() => deleteManualRoast(roast.id))}><Trash2 size={14} /></button></div>)}</div></section>;
}

function AnalyticsRows({ payload }: { payload: AdminPayload }) {
  const analytics = payload.analytics;
  return <div className="rows"><div className="row"><span>DAU</span><b>{analytics.dau}</b></div><div className="row"><span>WAU</span><b>{analytics.wau}</b></div><div className="row"><span>Conversion</span><b>{analytics.conversionRate}%</b></div><div className="row"><span>Churn risk</span><b>{analytics.churnRiskUsers}</b></div></div>;
}

function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <label className="search"><Search size={17} /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search users" /></label>; }
function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) { return <button className={active ? 'navButton navButton--active' : 'navButton'} onClick={onClick}>{icon}{label}</button>; }
function Metric({ icon, label, value, delay }: { icon: React.ReactNode; label: string; value: string; delay: string }) { return <article className="metric reveal" style={{ animationDelay: delay }}><div className="metric__icon">{icon}</div><strong>{value}</strong><span>{label}</span></article>; }
function Card({ title, meta, icon, children }: { title: string; meta: string; icon: React.ReactNode; children: React.ReactNode }) { return <article className="card reveal reveal--late"><div className="card__head"><div className="card__icon">{icon}</div><div><h2>{title}</h2><p>{meta}</p></div></div>{children}</article>; }
function sectionTitle(section: Section) { return ({ overview: 'Overview', users: 'Users', subscriptions: 'Subscriptions', traffic: 'Traffic', ai: 'AI Requests', challenges: 'Challenges', roasts: 'Manual Roasts' } as const)[section]; }

createRoot(document.getElementById('root')!).render(<App />);
