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

// ──────────────────── Health ────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ──────────────────── Auth ────────────────────
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

// ──────────────────── Users ────────────────────
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

// ──────────────────── Screen Time ────────────────────
app.get('/api/screen-time/:userId', async (req, res) => {
  const logs = await db.collection('screen_time_logs').find({ userId: req.params.userId, date: req.query.date }).toArray();
  res.json(logs.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.post('/api/screen-time', async (req, res) => {
  const doc = { ...req.body, createdAt: new Date().toISOString() };
  const result = await db.collection('screen_time_logs').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

// ──────────────────── App Limits ────────────────────
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

// ──────────────────── Tasks ────────────────────
app.get('/api/tasks/:userId', async (req, res) => {
  const filter: Record<string, unknown> = { userId: req.params.userId };
  if (req.query.status) filter.status = req.query.status;
  const tasks = await db.collection('tasks').find(filter).sort({ createdAt: -1 }).toArray();
  res.json(tasks.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.post('/api/tasks', async (req, res) => {
  const now = new Date().toISOString();
  const doc = { ...req.body, createdAt: now, updatedAt: now };
  const result = await db.collection('tasks').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

app.patch('/api/tasks/:taskId', async (req, res) => {
  await db.collection('tasks').updateOne({ _id: objectId(req.params.taskId) }, { $set: { ...req.body, updatedAt: new Date().toISOString() } });
  const task = await db.collection('tasks').findOne({ _id: objectId(req.params.taskId) });
  res.json(publicId(task as WithId<Record<string, unknown>>));
});

app.delete('/api/tasks/:taskId', async (req, res) => {
  await db.collection('tasks').deleteOne({ _id: objectId(req.params.taskId) });
  res.status(204).end();
});

// ──────────────────── Focus Sessions ────────────────────
app.get('/api/focus-sessions/:userId', async (req, res) => {
  const filter: Record<string, unknown> = { userId: req.params.userId };
  if (req.query.date) filter.startedAt = { $regex: String(req.query.date) };
  const sessions = await db.collection('focus_sessions').find(filter).sort({ startedAt: -1 }).toArray();
  res.json(sessions.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.post('/api/focus-sessions', async (req, res) => {
  const doc = { ...req.body, createdAt: new Date().toISOString() };
  const result = await db.collection('focus_sessions').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

app.patch('/api/focus-sessions/:sessionId', async (req, res) => {
  await db.collection('focus_sessions').updateOne({ _id: objectId(req.params.sessionId) }, { $set: req.body });
  const session = await db.collection('focus_sessions').findOne({ _id: objectId(req.params.sessionId) });
  res.json(publicId(session as WithId<Record<string, unknown>>));
});

// ──────────────────── Roasts ────────────────────
app.get('/api/roasts/:userId', async (req, res) => {
  const limit = Number(req.query.limit || 10);
  const roasts = await db.collection('roast_logs').find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(limit).toArray();
  res.json(roasts.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.post('/api/roasts', async (req, res) => {
  const doc = { ...req.body, createdAt: new Date().toISOString() };
  const result = await db.collection('roast_logs').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

// ──────────────────── Prayers ────────────────────
app.get('/api/prayers/:userId', async (req, res) => {
  const filter: Record<string, unknown> = { userId: req.params.userId };
  if (req.query.date) filter.date = req.query.date;
  const logs = await db.collection('prayer_logs').find(filter).sort({ date: -1 }).toArray();
  res.json(logs.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.post('/api/prayers', async (req, res) => {
  const doc = { ...req.body, createdAt: new Date().toISOString() };
  const result = await db.collection('prayer_logs').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

// ──────────────────── Quran Progress ────────────────────
app.get('/api/quran/:userId', async (req, res) => {
  const progress = await db.collection('quran_progress').findOne({ userId: req.params.userId });
  res.json(progress ? publicId(progress as WithId<Record<string, unknown>>) : null);
});

app.patch('/api/quran/:userId', async (req, res) => {
  const now = new Date().toISOString();
  await db.collection('quran_progress').updateOne(
    { userId: req.params.userId },
    { $set: { ...req.body, updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true }
  );
  const progress = await db.collection('quran_progress').findOne({ userId: req.params.userId });
  res.json(publicId(progress as WithId<Record<string, unknown>>));
});

// ──────────────────── Streaks ────────────────────
app.get('/api/streaks/:userId', async (req, res) => {
  const streaks = await db.collection('streaks').find({ userId: req.params.userId }).toArray();
  res.json(streaks.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.patch('/api/streaks/:userId/:type', async (req, res) => {
  const now = new Date().toISOString();
  await db.collection('streaks').updateOne(
    { userId: req.params.userId, type: req.params.type },
    { $set: { ...req.body, updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true }
  );
  const streak = await db.collection('streaks').findOne({ userId: req.params.userId, type: req.params.type });
  res.json(publicId(streak as WithId<Record<string, unknown>>));
});

// ──────────────────── Brain Score ────────────────────
app.get('/api/brain-score/:userId', async (req, res) => {
  const limit = Number(req.query.days || 30);
  const scores = await db.collection('brain_scores').find({ userId: req.params.userId }).sort({ date: -1 }).limit(limit).toArray();
  res.json(scores.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.post('/api/brain-score/:userId/calculate', async (req, res) => {
  const doc = { ...req.body, userId: req.params.userId, createdAt: new Date().toISOString() };
  const result = await db.collection('brain_scores').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

// ──────────────────── Subscriptions ────────────────────
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

// ──────────────────── Notifications ────────────────────
app.get('/api/notifications/settings/:userId', async (req, res) => {
  const settings = await db.collection('notification_settings').findOne({ userId: req.params.userId });
  res.json(settings ? publicId(settings as WithId<Record<string, unknown>>) : null);
});

app.patch('/api/notifications/settings/:userId', async (req, res) => {
  const now = new Date().toISOString();
  await db.collection('notification_settings').updateOne(
    { userId: req.params.userId },
    { $set: { ...req.body, updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true }
  );
  const settings = await db.collection('notification_settings').findOne({ userId: req.params.userId });
  res.json(publicId(settings as WithId<Record<string, unknown>>));
});

// ──────────────────── Accountability Circles ────────────────────
app.get('/api/circles', async (req, res) => {
  const userId = req.query.userId as string | undefined;
  const filter = userId ? { memberIds: userId } : {};
  const circles = await db.collection('circles').find(filter).sort({ createdAt: -1 }).toArray();
  res.json(circles.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.post('/api/circles', async (req, res) => {
  const now = new Date().toISOString();
  const doc = { ...req.body, createdAt: now };
  const result = await db.collection('circles').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

app.post('/api/circles/:circleId/join', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).send('userId required');
  const circle = await db.collection('circles').findOne({ _id: objectId(req.params.circleId) });
  if (!circle) return res.status(404).send('Circle not found');
  const memberIds: string[] = (circle.memberIds as string[]) || [];
  if (memberIds.includes(userId)) return res.status(409).send('Already a member');
  if (memberIds.length >= (circle.maxMembers as number || 8)) return res.status(400).send('Circle is full');
  await db.collection('circles').updateOne({ _id: objectId(req.params.circleId) }, { $addToSet: { memberIds: userId } });
  const updated = await db.collection('circles').findOne({ _id: objectId(req.params.circleId) });
  res.json(publicId(updated as WithId<Record<string, unknown>>));
});

app.post('/api/circles/:circleId/leave', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).send('userId required');
  await db.collection('circles').updateOne({ _id: objectId(req.params.circleId) }, { $pull: { memberIds: userId } });
  const updated = await db.collection('circles').findOne({ _id: objectId(req.params.circleId) });
  res.json(publicId(updated as WithId<Record<string, unknown>>));
});

// ──────────────────── Challenges (public) ────────────────────
app.get('/api/challenges', requireAuth, async (_req, res) => {
  const challenges = await db.collection('challenges').find({ isActive: true }).sort({ createdAt: -1 }).toArray();
  res.json(challenges.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.post('/api/challenges/:id/join', requireAuth, async (req: AuthedRequest, res) => {
  const challengeId = req.params.id;
  const userId = req.userId!;
  const challenge = await db.collection('challenges').findOne({ _id: objectId(challengeId) });
  if (!challenge) return res.status(404).send('Challenge not found');
  const joinedUserIds: string[] = (challenge.joinedUserIds as string[]) || [];
  if (joinedUserIds.includes(userId)) return res.status(409).send('Already joined');
  await db.collection('challenges').updateOne(
    { _id: objectId(challengeId) },
    { $addToSet: { joinedUserIds: userId }, $inc: { participantCount: 1 } }
  );
  const updated = await db.collection('challenges').findOne({ _id: objectId(challengeId) });
  res.json(publicId(updated as WithId<Record<string, unknown>>));
});

// ──────────────────── Admin ────────────────────
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
  const now = new Date().toISOString();
  await db.collection('users').updateOne({ id: req.params.userId }, { $set: { ...req.body, updatedAt: now } });
  // Also sync subscription tier to subscriptions collection
  if (req.body.subscriptionTier) {
    await db.collection('subscriptions').updateOne(
      { userId: req.params.userId },
      { $set: { tier: req.body.subscriptionTier, updatedAt: now }, $setOnInsert: { userId: req.params.userId, createdAt: now, isActive: true } },
      { upsert: true }
    );
  }
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
    db.collection('tasks').deleteMany({ userId }),
    db.collection('focus_sessions').deleteMany({ userId }),
    db.collection('prayer_logs').deleteMany({ userId }),
    db.collection('streaks').deleteMany({ userId }),
    db.collection('roast_logs').deleteMany({ userId }),
    db.collection('circles').updateMany({ memberIds: userId } as any, { $pull: { memberIds: userId } } as any),
    db.collection('challenges').updateMany({ joinedUserIds: userId } as any, { $pull: { joinedUserIds: userId }, $inc: { participantCount: -1 } } as any),
  ]);
  res.status(204).end();
});

app.patch('/api/admin/subscriptions/:userId', requireAdmin, async (req, res) => {
  const now = new Date().toISOString();
  await db.collection('subscriptions').updateOne(
    { userId: req.params.userId },
    { $set: withoutCreatedAt({ ...req.body, userId: req.params.userId, updatedAt: now }), $setOnInsert: { createdAt: now } },
    { upsert: true }
  );
  if (req.body.tier) await db.collection('users').updateOne({ id: req.params.userId }, { $set: { subscriptionTier: req.body.tier, updatedAt: now } });
  res.json({ ok: true });
});

// ──────────────────── Admin Challenges ────────────────────
app.post('/api/admin/challenges', requireAdmin, async (req, res) => {
  const doc = { ...req.body, participantCount: 0, joinedUserIds: [], createdAt: new Date().toISOString() };
  const result = await db.collection('challenges').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

app.patch('/api/admin/challenges/:id', requireAdmin, async (req, res) => {
  await db.collection('challenges').updateOne({ _id: objectId(req.params.id) }, { $set: req.body });
  res.json({ ok: true });
});

app.delete('/api/admin/challenges/:id', requireAdmin, async (req, res) => {
  await db.collection('challenges').deleteOne({ _id: objectId(req.params.id) });
  res.status(204).end();
});

// ──────────────────── Admin Roasts ────────────────────
app.post('/api/admin/roasts', requireAdmin, async (req, res) => {
  const doc = { ...req.body, createdAt: new Date().toISOString() };
  const result = await db.collection('manual_roasts').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

app.patch('/api/admin/roasts/:id', requireAdmin, async (req, res) => {
  await db.collection('manual_roasts').updateOne({ _id: objectId(req.params.id) }, { $set: req.body });
  res.json({ ok: true });
});

app.delete('/api/admin/roasts/:id', requireAdmin, async (req, res) => {
  await db.collection('manual_roasts').deleteOne({ _id: objectId(req.params.id) });
  res.status(204).end();
});

// ──────────────────── Start ────────────────────
await client.connect();
await seedAdmin();
app.listen(PORT, () => console.log(`BrainRot API running on http://localhost:${PORT}/api`));
