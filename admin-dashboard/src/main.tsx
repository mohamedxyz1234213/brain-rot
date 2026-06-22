import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, BarChart3, Brain, CreditCard, Lock, RefreshCw, Search, ShieldCheck, Smartphone, Users } from 'lucide-react';
import { fetchAdminPayload } from './api';
import type { AdminPayload, AdminTrafficMetric } from './types';
import './styles.css';

const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

function App() {
  const [payload, setPayload] = useState<AdminPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminPayload();
      setPayload(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredUsers = useMemo(() => {
    const users = payload?.users ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((user) => `${user.name} ${user.email} ${user.subscriptionTier}`.toLowerCase().includes(needle));
  }, [payload?.users, query]);

  const topTraffic = useMemo(() => {
    const grouped = new Map<string, AdminTrafficMetric>();
    for (const metric of payload?.traffic ?? []) {
      const existing = grouped.get(metric.appBundleId);
      if (!existing) {
        grouped.set(metric.appBundleId, { ...metric });
      } else {
        grouped.set(metric.appBundleId, {
          ...existing,
          minutesUsed: existing.minutesUsed + metric.minutesUsed,
          overageMinutes: existing.overageMinutes + metric.overageMinutes,
          blockedAttempts: existing.blockedAttempts + metric.blockedAttempts,
        });
      }
    }
    return [...grouped.values()].sort((a, b) => b.minutesUsed - a.minutesUsed).slice(0, 6);
  }, [payload?.traffic]);

  const overview = payload?.overview;
  const conversion = overview?.totalUsers ? Math.round((overview.activeSubscriptions / overview.totalUsers) * 100) : 0;

  return (
    <main className="shell">
      <section className="hero reveal">
        <div className="hero__top">
          <div className="brand"><ShieldCheck size={18} /> BrainRot Admin</div>
          <button className="iconButton" onClick={load} disabled={loading} aria-label="Refresh dashboard">
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
        </div>
        <div>
          <p className="eyebrow">Unified Production Console</p>
          <h1>Same data. Same visual system. Separate admin app.</h1>
          <p className="hero__copy">Track users, subscriptions, blocked attempts, and traffic from the shared backend used by the mobile app.</p>
        </div>
      </section>

      {error && <div className="error">{error}</div>}

      <section className="metrics">
        <Metric icon={<Users />} label="Total users" value={String(overview?.totalUsers ?? 0)} delay="80ms" />
        <Metric icon={<CreditCard />} label="Active subscriptions" value={String(overview?.activeSubscriptions ?? 0)} delay="140ms" />
        <Metric icon={<Smartphone />} label="Screen traffic" value={formatMinutes(overview?.totalScreenTimeMinutes ?? 0)} delay="200ms" />
        <Metric icon={<Lock />} label="Blocked attempts" value={String(overview?.blockedAttempts ?? 0)} delay="260ms" />
        <Metric icon={<Brain />} label="Avg brain score" value={String(overview?.averageBrainScore ?? 0)} delay="320ms" />
        <Metric icon={<Activity />} label="Focus minutes" value={formatMinutes(overview?.focusMinutes ?? 0)} delay="380ms" />
      </section>

      <section className="grid">
        <Card title="Subscription Health" meta={`${conversion}% conversion`} icon={<BarChart3 />}>
          <div className="progress"><span style={{ width: `${conversion}%` }} /></div>
          <div className="rows">
            {(payload?.subscriptions ?? []).slice(0, 8).map((subscription) => (
              <div className="row" key={subscription.id}>
                <span className="row__title">{subscription.tier}</span>
                <span className={subscription.isActive ? 'pill pill--active' : 'pill'}>{subscription.isActive ? 'active' : 'inactive'}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Traffic Metrics" meta="Last 7 days" icon={<Smartphone />}>
          <div className="trafficList">
            {topTraffic.map((metric) => (
              <div className="traffic" key={metric.appBundleId}>
                <div>
                  <strong>{metric.appName}</strong>
                  <span>{metric.blockedAttempts} blocked · +{metric.overageMinutes}m over</span>
                </div>
                <b>{formatMinutes(metric.minutesUsed)}</b>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="panel reveal reveal--late">
        <div className="panel__head">
          <div>
            <p className="eyebrow">User Sync</p>
            <h2>Synced mobile users</h2>
          </div>
          <label className="search">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users, email, tier" />
          </label>
        </div>
        <div className="table">
          <div className="table__head"><span>User</span><span>Tier</span><span>Brain</span><span>Streak</span><span>XP</span></div>
          {filteredUsers.map((user) => (
            <div className="table__row" key={user.id}>
              <span><b>{user.name}</b><small>{user.email}</small></span>
              <span className="pill pill--active">{user.subscriptionTier}</span>
              <span>{user.brainScore}</span>
              <span>{user.streakDays}d</span>
              <span>{user.xp}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, delay }: { icon: React.ReactNode; label: string; value: string; delay: string }) {
  return (
    <article className="metric reveal" style={{ animationDelay: delay }}>
      <div className="metric__icon">{icon}</div>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function Card({ title, meta, icon, children }: { title: string; meta: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="card reveal reveal--late">
      <div className="card__head">
        <div className="card__icon">{icon}</div>
        <div>
          <h2>{title}</h2>
          <p>{meta}</p>
        </div>
      </div>
      {children}
    </article>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
