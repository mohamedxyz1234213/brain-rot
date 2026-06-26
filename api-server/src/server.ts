import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId, WithId } from 'mongodb';
import { z } from 'zod';

const PORT = Number(process.env.PORT || 3001);
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'brainrot';
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

if (!MONGODB_URI) throw new Error('MONGODB_URI is required');
if (!JWT_SECRET) throw new Error('JWT_SECRET is required');
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');

const mongoUri = MONGODB_URI;
const jwtSecret = JWT_SECRET;
const adminEmail = ADMIN_EMAIL;
const adminPassword = ADMIN_PASSWORD;

const app = express();
const client = new MongoClient(mongoUri);
const db = client.db(MONGODB_DB);

app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: (process.env.CORS_ORIGIN || '').split(',').filter(Boolean), credentials: true }));

type AuthedRequest = Request & { admin?: { id: string; email: string; role: 'admin' }; userId?: string };

type AuthUser = {
  id: string;
  email: string;
  role?: 'admin' | 'user';
};

function createToken(user: AuthUser): string {
  return jwt.sign(user, jwtSecret, { expiresIn: '7d' });
}

function verifyToken(token: string): AuthUser {
  return jwt.verify(token, jwtSecret) as AuthUser;
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).send('Missing auth token');
  try {
    const user = verifyToken(token);
    req.userId = user.id;
    next();
  } catch {
    res.status(401).send('Invalid auth token');
  }
}

const userSchema = z.object({
  id: z.string().optional(),
  clerkId: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().optional(),
  brainScore: z.number().default(0),
  xp: z.number().default(0),
  level: z.string().default('Zombie'),
  streakDays: z.number().default(0),
  roastPersona: z.string().default('drill_sergeant'),
  language: z.enum(['en', 'ar']).default('en'),
  religion: z.enum(['muslim', 'christian']).default('muslim'),
  religionEnabled: z.boolean().default(false),
  subscriptionTier: z.enum(['free', 'healed', 'ascended', 'family', 'lifetime']).default('free'),
  role: z.enum(['user', 'admin']).default('user'),
});

const emailAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function publicId(doc: WithId<Record<string, unknown>>) {
  return { ...doc, id: String(doc._id), _id: undefined };
}

function objectId(value: string | string[]) {
  return new ObjectId(Array.isArray(value) ? value[0] : value);
}

function withoutCreatedAt<T extends Record<string, unknown>>(value: T) {
  const { createdAt: _createdAt, ...rest } = value;
  return rest;
}

function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).send('Missing admin token');
  try {
    const decoded = jwt.verify(token, jwtSecret) as unknown as { id: string; email: string; role: 'admin' };
    if (decoded.role !== 'admin') return res.status(403).send('Admin role required');
    req.admin = decoded;
    next();
  } catch {
    res.status(401).send('Invalid admin token');
  }
}

async function seedAdmin() {
  const admins = db.collection('admins');
  const existing = await admins.findOne({ email: adminEmail });
  if (existing) return;
  await admins.insertOne({
    email: adminEmail,
    name: ADMIN_NAME,
    passwordHash: await bcrypt.hash(adminPassword, 12),
    role: 'admin',
    createdAt: new Date().toISOString(),
  });
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/admin/auth/sign-in', async (req, res) => {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).send('Invalid credentials payload');
  const admin = await db.collection('admins').findOne({ email: parsed.data.email });
  if (!admin || typeof admin.passwordHash !== 'string') return res.status(401).send('Invalid email or password');
  const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!ok) return res.status(401).send('Invalid email or password');
  const id = String(admin._id);
  const token = jwt.sign({ id, email: admin.email, role: 'admin' }, jwtSecret, { expiresIn: '8h' });
  res.json({ token, admin: { id, email: admin.email, name: admin.name, role: 'admin' } });
});

app.post('/api/auth/email/sign-up', async (req, res) => {
  const parsed = emailAuthSchema.extend({ name: z.string().min(1), user: userSchema }).safeParse(req.body);
  if (!parsed.success) return res.status(400).send('Invalid sign-up payload');
  const email = parsed.data.email.toLowerCase();
  const existing = await db.collection('users').findOne({ email });
  if (existing?.passwordHash) return res.status(409).send('An account with this email already exists');

  const now = new Date().toISOString();
  const user = {
    ...parsed.data.user,
    id: parsed.data.user.id || `email_${email.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
    clerkId: parsed.data.user.clerkId || `email_${email}`,
    name: parsed.data.name,
    email,
    passwordHash: await bcrypt.hash(parsed.data.password, 12),
    authProvider: 'email',
    updatedAt: now,
    createdAt: now,
  };
  await db.collection('users').updateOne({ email }, { $set: withoutCreatedAt(user), $setOnInsert: { createdAt: now } }, { upsert: true });
  const saved = await db.collection('users').findOne({ email });
  const publicUser = publicId(saved as WithId<Record<string, unknown>>);
  delete (publicUser as Record<string, unknown>).passwordHash;
  res.json({ user: publicUser, token: createToken({ id: String(publicUser.id), email, role: 'user' }) });
});

app.post('/api/auth/email/sign-in', async (req, res) => {
  const parsed = emailAuthSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).send('Invalid sign-in payload');
  const email = parsed.data.email.toLowerCase();
  const user = await db.collection('users').findOne({ email });
  if (!user || typeof user.passwordHash !== 'string') return res.status(401).send('Invalid email or password');
  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return res.status(401).send('Invalid email or password');
  const publicUser = publicId(user as WithId<Record<string, unknown>>);
  delete (publicUser as Record<string, unknown>).passwordHash;
  res.json({ user: publicUser, token: createToken({ id: String(publicUser.id), email, role: 'user' }) });
});

app.post('/api/auth/oauth', async (req, res) => {
  const parsed = z.object({
    provider: z.enum(['google', 'apple']),
    token: z.string().min(1),
    user: userSchema,
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).send('Invalid OAuth payload');
  const now = new Date().toISOString();
  const user = {
    ...parsed.data.user,
    authProvider: parsed.data.provider,
    oauthTokenPreview: parsed.data.token.slice(0, 12),
    updatedAt: now,
  };
  await db.collection('users').updateOne(
    { clerkId: user.clerkId },
    { $set: withoutCreatedAt(user), $setOnInsert: { createdAt: now } },
    { upsert: true }
  );
  const saved = await db.collection('users').findOne({ clerkId: user.clerkId });
  const publicUser = publicId(saved as WithId<Record<string, unknown>>);
  delete (publicUser as Record<string, unknown>).passwordHash;
  res.json({ user: publicUser, token: createToken({ id: String(publicUser.id), email: String(user.email), role: 'user' }) });
});

app.post('/api/users/sync', async (req, res) => {
  const parsed = userSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).send(parsed.error.message);
  const now = new Date().toISOString();
  const data = { ...parsed.data, updatedAt: now };
  await db.collection('users').updateOne(
    { clerkId: data.clerkId },
    { $set: withoutCreatedAt(data), $setOnInsert: { createdAt: now } },
    { upsert: true }
  );
  const user = await db.collection('users').findOne({ clerkId: data.clerkId });
  res.json(publicId(user as WithId<Record<string, unknown>>));
});

app.get('/api/users/:userId', async (req, res) => {
  const user = await db.collection('users').findOne({ id: req.params.userId });
  res.json(user ? publicId(user as WithId<Record<string, unknown>>) : null);
});

app.patch('/api/users/:userId', async (req, res) => {
  await db.collection('users').updateOne({ id: req.params.userId }, { $set: { ...req.body, updatedAt: new Date().toISOString() } });
  const user = await db.collection('users').findOne({ id: req.params.userId });
  res.json(user ? publicId(user as WithId<Record<string, unknown>>) : null);
});

app.get('/api/screen-time/:userId', async (req, res) => {
  const logs = await db.collection('screen_time_logs').find({ userId: req.params.userId, date: req.query.date }).toArray();
  res.json(logs.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.post('/api/screen-time', async (req, res) => {
  const doc = { ...req.body, createdAt: new Date().toISOString() };
  const result = await db.collection('screen_time_logs').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

app.get('/api/app-limits/:userId', async (req, res) => {
  const limits = await db.collection('app_limits').find({ userId: req.params.userId }).toArray();
  res.json(limits.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.post('/api/app-limits', async (req, res) => {
  const doc = { ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const result = await db.collection('app_limits').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

app.patch('/api/app-limits/:limitId', async (req, res) => {
  await db.collection('app_limits').updateOne({ _id: objectId(req.params.limitId) }, { $set: { ...req.body, updatedAt: new Date().toISOString() } });
  const limit = await db.collection('app_limits').findOne({ _id: objectId(req.params.limitId) });
  res.json(publicId(limit as WithId<Record<string, unknown>>));
});

app.delete('/api/app-limits/:limitId', async (req, res) => {
  await db.collection('app_limits').deleteOne({ _id: objectId(req.params.limitId) });
  res.status(204).end();
});

app.get('/api/subscriptions/:userId', async (req, res) => {
  const sub = await db.collection('subscriptions').findOne({ userId: req.params.userId });
  res.json(sub ? publicId(sub as WithId<Record<string, unknown>>) : null);
});

app.patch('/api/subscriptions/:userId', async (req, res) => {
  const now = new Date().toISOString();
  await db.collection('subscriptions').updateOne(
    { userId: req.params.userId },
    { $set: withoutCreatedAt({ ...req.body, userId: req.params.userId, updatedAt: now }), $setOnInsert: { createdAt: now } },
    { upsert: true }
  );
  if (req.body.tier) await db.collection('users').updateOne({ id: req.params.userId }, { $set: { subscriptionTier: req.body.tier, updatedAt: now } });
  const sub = await db.collection('subscriptions').findOne({ userId: req.params.userId });
  res.json(publicId(sub as WithId<Record<string, unknown>>));
});

app.get('/api/brain-score/:userId', async (req, res) => {
  const limit = Number(req.query.days || 30);
  const scores = await db.collection('brain_scores').find({ userId: req.params.userId }).sort({ date: -1 }).limit(limit).toArray();
  res.json(scores.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.get('/api/admin/dashboard', requireAdmin, async (_req, res) => {
  const [users, subscriptions, traffic, aiRequests, challenges, manualRoasts] = await Promise.all([
    db.collection('users').find().sort({ updatedAt: -1 }).limit(500).toArray(),
    db.collection('subscriptions').find().sort({ updatedAt: -1 }).limit(500).toArray(),
    db.collection('screen_time_logs').find().sort({ date: -1 }).limit(1000).toArray(),
    db.collection('ai_requests').find().sort({ createdAt: -1 }).limit(500).toArray(),
    db.collection('challenges').find().sort({ createdAt: -1 }).limit(500).toArray(),
    db.collection('manual_roasts').find().sort({ createdAt: -1 }).limit(500).toArray(),
  ]);
  const totalScreenTimeMinutes = traffic.reduce((sum, item) => sum + Number(item.minutesUsed || 0), 0);
  const blockedAttempts = traffic.reduce((sum, item) => sum + Number(item.blockedAttempts || 0), 0);
  const averageBrainScore = users.length ? Math.round(users.reduce((sum, user) => sum + Number(user.brainScore || 0), 0) / users.length) : 0;
  const activeSubscriptions = subscriptions.filter((sub) => sub.isActive).length;
  res.json({
    overview: {
      totalUsers: users.length,
      activeSubscriptions,
      freeUsers: users.filter((user) => (user.subscriptionTier || 'free') === 'free').length,
      totalScreenTimeMinutes,
      blockedAttempts,
      averageBrainScore,
      focusMinutes: 0,
      aiRequests: aiRequests.length,
      activeChallenges: challenges.filter((challenge) => challenge.isActive).length,
      generatedAt: new Date().toISOString(),
    },
    users: users.map((doc) => publicId(doc as WithId<Record<string, unknown>>)),
    subscriptions: subscriptions.map((doc) => publicId(doc as WithId<Record<string, unknown>>)),
    traffic: traffic.map((doc) => publicId(doc as WithId<Record<string, unknown>>)),
    aiRequests: aiRequests.map((doc) => publicId(doc as WithId<Record<string, unknown>>)),
    challenges: challenges.map((doc) => publicId(doc as WithId<Record<string, unknown>>)),
    manualRoasts: manualRoasts.map((doc) => publicId(doc as WithId<Record<string, unknown>>)),
    analytics: {
      dau: new Set(traffic.filter((item) => item.date === new Date().toISOString().split('T')[0]).map((item) => item.userId)).size,
      wau: new Set(traffic.map((item) => item.userId)).size,
      conversionRate: users.length ? Math.round((activeSubscriptions / users.length) * 100) : 0,
      churnRiskUsers: users.filter((user) => Number(user.brainScore || 0) < 40).length,
      averageSessionMinutes: traffic.length ? Math.round(totalScreenTimeMinutes / traffic.length) : 0,
      topBlockedApps: Object.values(traffic.reduce<Record<string, { appName: string; blockedAttempts: number; minutesUsed: number }>>((acc, item) => {
        const key = String(item.appBundleId || item.appName);
        acc[key] ||= { appName: String(item.appName), blockedAttempts: 0, minutesUsed: 0 };
        acc[key].blockedAttempts += Number(item.blockedAttempts || 0);
        acc[key].minutesUsed += Number(item.minutesUsed || 0);
        return acc;
      }, {})).sort((a, b) => b.blockedAttempts - a.blockedAttempts).slice(0, 8),
    },
  });
});

app.patch('/api/admin/users/:userId', requireAdmin, async (req, res) => {
  await db.collection('users').updateOne({ id: req.params.userId }, { $set: { ...req.body, updatedAt: new Date().toISOString() } });
  res.json({ ok: true });
});

app.delete('/api/admin/users/:userId', requireAdmin, async (req, res) => {
  const userId = req.params.userId;
  await Promise.all([
    db.collection('users').deleteOne({ id: userId }),
    db.collection('subscriptions').deleteMany({ userId }),
    db.collection('screen_time_logs').deleteMany({ userId }),
    db.collection('app_limits').deleteMany({ userId }),
    db.collection('brain_scores').deleteMany({ userId }),
  ]);
  res.status(204).end();
});

app.patch('/api/admin/subscriptions/:userId', requireAdmin, async (req, res) => {
  const now = new Date().toISOString();
  await db.collection('subscriptions').updateOne({ userId: req.params.userId }, { $set: withoutCreatedAt({ ...req.body, userId: req.params.userId, updatedAt: now }), $setOnInsert: { createdAt: now } }, { upsert: true });
  if (req.body.tier) await db.collection('users').updateOne({ id: req.params.userId }, { $set: { subscriptionTier: req.body.tier, updatedAt: now } });
  res.json({ ok: true });
});

app.post('/api/admin/challenges', requireAdmin, async (req, res) => {
  const doc = { ...req.body, createdAt: new Date().toISOString() };
  const result = await db.collection('challenges').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});
app.patch('/api/admin/challenges/:id', requireAdmin, async (req, res) => { await db.collection('challenges').updateOne({ _id: objectId(req.params.id) }, { $set: req.body }); res.json({ ok: true }); });
app.delete('/api/admin/challenges/:id', requireAdmin, async (req, res) => { await db.collection('challenges').deleteOne({ _id: objectId(req.params.id) }); res.status(204).end(); });

app.post('/api/admin/roasts', requireAdmin, async (req, res) => {
  const doc = { ...req.body, createdAt: new Date().toISOString() };
  const result = await db.collection('manual_roasts').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});
app.patch('/api/admin/roasts/:id', requireAdmin, async (req, res) => { await db.collection('manual_roasts').updateOne({ _id: objectId(req.params.id) }, { $set: req.body }); res.json({ ok: true }); });
app.delete('/api/admin/roasts/:id', requireAdmin, async (req, res) => { await db.collection('manual_roasts').deleteOne({ _id: objectId(req.params.id) }); res.status(204).end(); });

await client.connect();
await seedAdmin();
app.listen(PORT, () => console.log(`BrainRot API running on http://localhost:${PORT}/api`));
