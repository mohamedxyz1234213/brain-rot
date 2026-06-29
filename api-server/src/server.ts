import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: (process.env.CORS_ORIGIN || '').split(',').filter(Boolean), credentials: true }));

// Rate limiting
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false, message: 'Too many requests, please try again later.' });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: 'Too many auth attempts, please try again later.' });
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/admin/auth/', authLimiter);

// Sanitize MongoDB queries to prevent NoSQL injection
function sanitize<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitize) as T;
  if (obj instanceof Date) return obj;
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (key.startsWith('$')) continue;
    if (value && typeof value === 'object') {
      clean[key] = sanitize(value);
    } else {
      clean[key] = value;
    }
  }
  return clean as T;
}

// Auth middleware that also sets userId
function requireAuthUser(req: AuthedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.userId) return res.status(401).send('Missing user context');
    next();
  });
}

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
  pushToken: z.string().optional(),
  brainScore: z.number().default(0),
  xp: z.number().default(0),
  level: z.string().default('Zombie'),
  streakDays: z.number().default(0),
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

function objectId(value: string | string[]): ObjectId {
  const str = Array.isArray(value) ? value[0] : value;
  if (!ObjectId.isValid(str)) throw new Error('Invalid ObjectId');
  return new ObjectId(str);
}

function withoutCreatedAt<T extends Record<string, unknown>>(value: T) {
  const { createdAt: _createdAt, ...rest } = value;
  return rest;
}

// ──────────────────── Expo Push Notifications ────────────────────
const EXPO_ACCESS_TOKEN = process.env.EXPO_ACCESS_TOKEN;

const EXPO_PUSH_TOKEN_RE = /^ExponentPushToken\[.+\]$/;

function isValidExpoPushToken(token: string): boolean {
  return EXPO_PUSH_TOKEN_RE.test(token);
}

async function sendExpoPushNotification(pushToken: string, title: string, body: string, data: Record<string, unknown> = {}): Promise<boolean> {
  if (!pushToken || !EXPO_ACCESS_TOKEN) return false;
  if (!isValidExpoPushToken(pushToken)) return false;
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EXPO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: pushToken,
        title,
        body,
        data,
        sound: 'default',
        priority: 'high',
      }),
    });
    const result = await response.json();
    if (result.data?.status === 'ok') return true;
    console.warn('Expo push notification failed:', result);
    return false;
  } catch (err) {
    console.warn('Failed to send push notification:', err);
    return false;
  }
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

app.patch('/api/users/:userId', requireAuthUser, async (req: AuthedRequest, res) => {
  if (req.params.userId !== req.userId) return res.status(403).send('Forbidden');
  const allowed = ['name', 'avatar', 'language', 'religion', 'religionEnabled', 'pushToken'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) filtered[key] = req.body[key];
  }
  await db.collection('users').updateOne({ id: req.params.userId }, { $set: { ...sanitize(filtered), updatedAt: new Date().toISOString() } });
  const user = await db.collection('users').findOne({ id: req.params.userId });
  res.json(user ? publicId(user as WithId<Record<string, unknown>>) : null);
});

// ──────────────────── Screen Time ────────────────────
app.get('/api/screen-time/:userId', async (req, res) => {
  const logs = await db.collection('screen_time_logs').find({ userId: req.params.userId, date: req.query.date }).toArray();
  res.json(logs.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.post('/api/screen-time', requireAuthUser, async (req, res) => {
  const allowed = ['userId', 'date', 'appName', 'appBundleId', 'minutesUsed', 'blockedAttempts'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) { if (key in req.body) filtered[key] = req.body[key]; }
  const doc = { ...sanitize(filtered), createdAt: new Date().toISOString() };
  const result = await db.collection('screen_time_logs').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

// ──────────────────── App Limits ────────────────────
app.get('/api/app-limits/:userId', async (req, res) => {
  const limits = await db.collection('app_limits').find({ userId: req.params.userId }).toArray();
  res.json(limits.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.post('/api/app-limits', requireAuthUser, async (req, res) => {
  const allowed = ['userId', 'appBundleId', 'appName', 'dailyLimitMinutes', 'isHardBlock', 'isEnabled'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) { if (key in req.body) filtered[key] = req.body[key]; }
  const doc = { ...sanitize(filtered), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const result = await db.collection('app_limits').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

app.patch('/api/app-limits/:limitId', requireAuthUser, async (req, res) => {
  const allowed = ['appName', 'dailyLimitMinutes', 'isHardBlock', 'isEnabled'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) filtered[key] = req.body[key];
  }
  await db.collection('app_limits').updateOne({ _id: objectId(req.params.limitId) }, { $set: { ...sanitize(filtered), updatedAt: new Date().toISOString() } });
  const limit = await db.collection('app_limits').findOne({ _id: objectId(req.params.limitId) });
  res.json(publicId(limit as WithId<Record<string, unknown>>));
});

app.delete('/api/app-limits/:limitId', requireAuthUser, async (req, res) => {
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

app.post('/api/tasks', requireAuthUser, async (req, res) => {
  const allowed = ['userId', 'title', 'description', 'priority', 'category', 'isEatTheFrog', 'estimatedMinutes', 'status'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) { if (key in req.body) filtered[key] = req.body[key]; }
  const now = new Date().toISOString();
  const doc = { ...sanitize(filtered), createdAt: now, updatedAt: now };
  const result = await db.collection('tasks').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

app.patch('/api/tasks/:taskId', requireAuthUser, async (req, res) => {
  const allowed = ['title', 'description', 'priority', 'status', 'isEatTheFrog', 'category', 'estimatedMinutes'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) filtered[key] = req.body[key];
  }
  await db.collection('tasks').updateOne({ _id: objectId(req.params.taskId) }, { $set: { ...sanitize(filtered), updatedAt: new Date().toISOString() } });
  const task = await db.collection('tasks').findOne({ _id: objectId(req.params.taskId) });
  res.json(publicId(task as WithId<Record<string, unknown>>));
});

app.delete('/api/tasks/:taskId', requireAuthUser, async (req, res) => {
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

app.post('/api/focus-sessions', requireAuthUser, async (req, res) => {
  const allowed = ['userId', 'taskId', 'mode', 'targetMinutes', 'startedAt'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) { if (key in req.body) filtered[key] = req.body[key]; }
  const doc = { ...sanitize(filtered), createdAt: new Date().toISOString() };
  const result = await db.collection('focus_sessions').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

app.patch('/api/focus-sessions/:sessionId', requireAuthUser, async (req, res) => {
  const allowed = ['endedAt', 'actualMinutes', 'distractionCount', 'completed'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) filtered[key] = req.body[key];
  }
  await db.collection('focus_sessions').updateOne({ _id: objectId(req.params.sessionId) }, { $set: sanitize(filtered) });
  const session = await db.collection('focus_sessions').findOne({ _id: objectId(req.params.sessionId) });
  res.json(publicId(session as WithId<Record<string, unknown>>));
});

// ──────────────────── Roasts ────────────────────
app.get('/api/roasts/:userId', async (req, res) => {
  const limit = Number(req.query.limit || 10);
  const roasts = await db.collection('roast_logs').find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(limit).toArray();
  res.json(roasts.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.post('/api/roasts', requireAuthUser, async (req, res) => {
  const allowed = ['userId', 'text', 'persona', 'trigger', 'app'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) { if (key in req.body) filtered[key] = req.body[key]; }
  const doc = { ...sanitize(filtered), createdAt: new Date().toISOString() };
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

app.post('/api/prayers', requireAuthUser, async (req, res) => {
  const allowed = ['userId', 'name', 'date', 'status', 'time'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) { if (key in req.body) filtered[key] = req.body[key]; }
  const doc = { ...sanitize(filtered), createdAt: new Date().toISOString() };
  const result = await db.collection('prayer_logs').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

// ──────────────────── Quran Progress ────────────────────
app.get('/api/quran/:userId', async (req, res) => {
  const progress = await db.collection('quran_progress').findOne({ userId: req.params.userId });
  res.json(progress ? publicId(progress as WithId<Record<string, unknown>>) : null);
});

app.patch('/api/quran/:userId', requireAuthUser, async (req: AuthedRequest, res) => {
  if (req.params.userId !== req.userId) return res.status(403).send('Forbidden');
  const now = new Date().toISOString();
  const allowed = ['currentJuz', 'currentPage', 'lastReadAt'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) filtered[key] = req.body[key];
  }
  await db.collection('quran_progress').updateOne(
    { userId: req.params.userId },
    { $set: { ...sanitize(filtered), updatedAt: now }, $setOnInsert: { createdAt: now } },
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

app.patch('/api/streaks/:userId/:type', requireAuthUser, async (req: AuthedRequest, res) => {
  if (req.params.userId !== req.userId) return res.status(403).send('Forbidden');
  const now = new Date().toISOString();
  const allowed = ['count', 'lastDate'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) filtered[key] = req.body[key];
  }
  await db.collection('streaks').updateOne(
    { userId: req.params.userId, type: req.params.type },
    { $set: { ...sanitize(filtered), updatedAt: now }, $setOnInsert: { createdAt: now } },
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

app.post('/api/brain-score/:userId/calculate', requireAuthUser, async (req: AuthedRequest, res) => {
  if (req.params.userId !== req.userId) return res.status(403).send('Forbidden');
  const allowed = ['date', 'score', 'breakdown'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) { if (key in req.body) filtered[key] = req.body[key]; }
  const doc = { ...sanitize(filtered), userId: req.params.userId, createdAt: new Date().toISOString() };
  const result = await db.collection('brain_scores').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

// ──────────────────── Subscriptions ────────────────────
app.get('/api/subscriptions/:userId', async (req, res) => {
  const sub = await db.collection('subscriptions').findOne({ userId: req.params.userId });
  res.json(sub ? publicId(sub as WithId<Record<string, unknown>>) : null);
});

app.patch('/api/subscriptions/:userId', requireAuthUser, async (req: AuthedRequest, res) => {
  if (req.params.userId !== req.userId) return res.status(403).send('Forbidden');
  const now = new Date().toISOString();
  await db.collection('subscriptions').updateOne(
    { userId: req.params.userId },
    { $set: withoutCreatedAt({ ...sanitize(req.body), userId: req.params.userId, updatedAt: now }), $setOnInsert: { createdAt: now } },
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

app.patch('/api/notifications/settings/:userId', requireAuthUser, async (req: AuthedRequest, res) => {
  if (req.params.userId !== req.userId) return res.status(403).send('Forbidden');
  const now = new Date().toISOString();
  const allowed = ['roastNotifications', 'prayerReminders', 'focusReminders', 'dailyDigest'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) filtered[key] = req.body[key];
  }
  await db.collection('notification_settings').updateOne(
    { userId: req.params.userId },
    { $set: { ...sanitize(filtered), updatedAt: now }, $setOnInsert: { createdAt: now } },
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

app.post('/api/circles', requireAuthUser, async (req: AuthedRequest, res) => {
  const allowed = ['name', 'maxMembers'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) { if (key in req.body) filtered[key] = req.body[key]; }
  const now = new Date().toISOString();
  const doc = { ...sanitize(filtered), ownerId: req.userId, memberIds: [req.userId], createdAt: now };
  const result = await db.collection('circles').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

app.post('/api/circles/:circleId/join', requireAuthUser, async (req, res) => {
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

app.post('/api/circles/:circleId/leave', requireAuthUser, async (req, res) => {
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
  const [users, subscriptions, traffic, aiRequests, challenges, manualRoasts, reports, roastLogs, focusSessions, prayerLogs, streaks] = await Promise.all([
    db.collection('users').find().sort({ updatedAt: -1 }).limit(500).toArray(),
    db.collection('subscriptions').find().sort({ updatedAt: -1 }).limit(500).toArray(),
    db.collection('screen_time_logs').find().sort({ date: -1 }).limit(1000).toArray(),
    db.collection('ai_requests').find().sort({ createdAt: -1 }).limit(500).toArray(),
    db.collection('challenges').find().sort({ createdAt: -1 }).limit(500).toArray(),
    db.collection('manual_roasts').find().sort({ createdAt: -1 }).limit(500).toArray(),
    db.collection('reports').find().sort({ createdAt: -1 }).limit(500).toArray(),
    db.collection('roast_logs').find().sort({ createdAt: -1 }).limit(200).toArray(),
    db.collection('focus_sessions').find().sort({ startedAt: -1 }).limit(200).toArray(),
    db.collection('prayer_logs').find().sort({ date: -1 }).limit(200).toArray(),
    db.collection('streaks').find().sort({ updatedAt: -1 }).limit(200).toArray(),
  ]);
  const totalScreenTimeMinutes = traffic.reduce((sum, item) => sum + Number(item.minutesUsed || 0), 0);
  const blockedAttempts = traffic.reduce((sum, item) => sum + Number(item.blockedAttempts || 0), 0);
  const averageBrainScore = users.length ? Math.round(users.reduce((sum, user) => sum + Number(user.brainScore || 0), 0) / users.length) : 0;
  const activeSubscriptions = subscriptions.filter((sub) => sub.isActive).length;
  const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + Number(s.actualMinutes || 0), 0);
  const today = new Date().toISOString().split('T')[0];
  const recentRoasts = roastLogs.filter((r) => String(r.createdAt || '').startsWith(today)).length;
  const prayersToday = prayerLogs.filter((p) => p.date === today).length;
  const activeStreaks = streaks.filter((s) => Number(s.currentDays || 0) > 0).length;

  res.json({
    overview: {
      totalUsers: users.length,
      activeSubscriptions,
      freeUsers: users.filter((user) => (user.subscriptionTier || 'free') === 'free').length,
      totalScreenTimeMinutes,
      blockedAttempts,
      averageBrainScore,
      focusMinutes: totalFocusMinutes,
      aiRequests: aiRequests.length,
      activeChallenges: challenges.filter((challenge) => challenge.isActive).length,
      recentRoasts,
      prayersToday,
      activeStreaks,
      generatedAt: new Date().toISOString(),
    },
    users: users.map((doc) => publicId(doc as WithId<Record<string, unknown>>)),
    subscriptions: subscriptions.map((doc) => publicId(doc as WithId<Record<string, unknown>>)),
    traffic: traffic.map((doc) => publicId(doc as WithId<Record<string, unknown>>)),
    aiRequests: aiRequests.map((doc) => publicId(doc as WithId<Record<string, unknown>>)),
    challenges: challenges.map((doc) => publicId(doc as WithId<Record<string, unknown>>)),
    manualRoasts: manualRoasts.map((doc) => publicId(doc as WithId<Record<string, unknown>>)),
    reports: reports.map((doc) => publicId(doc as WithId<Record<string, unknown>>)),
    analytics: {
      dau: new Set(traffic.filter((item) => item.date === today).map((item) => item.userId)).size,
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
      roastDistribution: Object.values(roastLogs.reduce<Record<string, { count: number }>>((acc, r) => {
        const persona = String(r.persona || 'unknown');
        acc[persona] ||= { count: 0 };
        acc[persona].count++;
        return acc;
      }, {})).sort((a, b) => b.count - a.count),
    },
  });
});

app.patch('/api/admin/users/:userId', requireAdmin, async (req, res) => {
  const now = new Date().toISOString();
  const allowed = ['name', 'avatar', 'subscriptionTier', 'role', 'brainScore', 'xp', 'level'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) filtered[key] = req.body[key];
  }
  await db.collection('users').updateOne({ id: req.params.userId }, { $set: { ...sanitize(filtered), updatedAt: now } });
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
  const allowed = ['tier', 'isActive', 'expiresAt'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) filtered[key] = req.body[key];
  }
  await db.collection('subscriptions').updateOne(
    { userId: req.params.userId },
    { $set: withoutCreatedAt({ ...sanitize(filtered), userId: req.params.userId, updatedAt: now }), $setOnInsert: { createdAt: now } },
    { upsert: true }
  );
  if (req.body.tier) await db.collection('users').updateOne({ id: req.params.userId }, { $set: { subscriptionTier: req.body.tier, updatedAt: now } });
  res.json({ ok: true });
});

// ──────────────────── Admin Challenges ────────────────────
app.post('/api/admin/challenges', requireAdmin, async (req, res) => {
  const allowed = ['title', 'description', 'icon', 'challengeType', 'difficulty', 'durationDays', 'rewardXp', 'maxParticipants', 'config', 'rules', 'isActive'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) { if (key in req.body) filtered[key] = req.body[key]; }
  const doc = { ...sanitize(filtered), participantCount: 0, joinedUserIds: [], createdAt: new Date().toISOString() };
  const result = await db.collection('challenges').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

app.patch('/api/admin/challenges/:id', requireAdmin, async (req, res) => {
  await db.collection('challenges').updateOne({ _id: objectId(req.params.id) }, { $set: sanitize(req.body) });
  res.json({ ok: true });
});

app.delete('/api/admin/challenges/:id', requireAdmin, async (req, res) => {
  await db.collection('challenges').deleteOne({ _id: objectId(req.params.id) });
  res.status(204).end();
});

// ──────────────────── Admin Roasts ────────────────────
app.post('/api/admin/roasts', requireAdmin, async (req, res) => {
  const allowed = ['userId', 'text', 'persona', 'trigger'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) { if (key in req.body) filtered[key] = req.body[key]; }
  const doc = { ...sanitize(filtered), createdAt: new Date().toISOString() };
  const result = await db.collection('manual_roasts').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

app.patch('/api/admin/roasts/:id', requireAdmin, async (req, res) => {
  await db.collection('manual_roasts').updateOne({ _id: objectId(req.params.id) }, { $set: sanitize(req.body) });
  res.json({ ok: true });
});

app.delete('/api/admin/roasts/:id', requireAdmin, async (req, res) => {
  await db.collection('manual_roasts').deleteOne({ _id: objectId(req.params.id) });
  res.status(204).end();
});

// ──────────────────── Admin Notification Broadcast ────────────────────
app.post('/api/admin/broadcast', requireAdmin, async (req: AuthedRequest, res) => {
  const parsed = z.object({ title: z.string().min(1), body: z.string().min(1), targetTier: z.enum(['all', 'free', 'healed', 'ascended', 'family', 'lifetime']).default('all') }).safeParse(req.body);
  if (!parsed.success) return res.status(400).send('Invalid broadcast payload');
  const now = new Date().toISOString();
  const doc = { ...parsed.data, sentAt: now, sentBy: req.admin?.email };
  const result = await db.collection('broadcasts').insertOne(doc);

  // Send push notifications to matching users (fire-and-forget)
  const { title, body, targetTier } = parsed.data;
  const userFilter: Record<string, unknown> = {};
  if (targetTier !== 'all') userFilter.subscriptionTier = targetTier;
  const users = await db.collection('users').find(userFilter).toArray();
  const pushTokens = users.map((u) => u.pushToken).filter((t): t is string => typeof t === 'string' && isValidExpoPushToken(t));

  if (pushTokens.length > 0) {
    // Expo batch API supports up to 100 messages per request
    const BATCH_SIZE = 100;
    for (let i = 0; i < pushTokens.length; i += BATCH_SIZE) {
      const batch = pushTokens.slice(i, i + BATCH_SIZE);
      try {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(EXPO_ACCESS_TOKEN ? { Authorization: `Bearer ${EXPO_ACCESS_TOKEN}` } : {}),
          },
          body: JSON.stringify(
            batch.map((token) => ({
              to: token,
              title,
              body,
              data: { type: 'broadcast', broadcastId: String(result.insertedId) },
              sound: 'default',
              priority: 'high',
            }))
          ),
        });
      } catch (err) {
        console.warn('Failed to send broadcast batch:', err);
      }
    }
  }

  res.json({ ...doc, id: String(result.insertedId), recipientCount: pushTokens.length });
});

app.get('/api/admin/broadcasts', requireAdmin, async (_req, res) => {
  const broadcasts = await db.collection('broadcasts').find().sort({ sentAt: -1 }).limit(100).toArray();
  res.json(broadcasts.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

// ──────────────────── User Reports (Bug / Feature Request) ────────────────────
app.post('/api/reports', requireAuthUser, async (req: AuthedRequest, res) => {
  const parsed = z.object({
    type: z.enum(['bug', 'feature']),
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(2000),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).send('Invalid report payload');
  const now = new Date().toISOString();
  const doc = { ...parsed.data, userId: req.userId, status: 'open' as const, createdAt: now, updatedAt: now };
  const result = await db.collection('reports').insertOne(doc);
  res.json({ ...doc, id: String(result.insertedId) });
});

app.get('/api/reports/mine', requireAuthUser, async (req: AuthedRequest, res) => {
  const reports = await db.collection('reports').find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50).toArray();
  res.json(reports.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.get('/api/admin/reports', requireAdmin, async (_req, res) => {
  const reports = await db.collection('reports').find().sort({ createdAt: -1 }).limit(500).toArray();
  res.json(reports.map((doc) => publicId(doc as WithId<Record<string, unknown>>)));
});

app.patch('/api/admin/reports/:id', requireAdmin, async (req, res) => {
  const allowed = ['status'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) filtered[key] = req.body[key];
  }
  const now = new Date().toISOString();
  await db.collection('reports').updateOne({ _id: objectId(req.params.id) }, { $set: { ...sanitize(filtered), updatedAt: now } });
  const report = await db.collection('reports').findOne({ _id: objectId(req.params.id) });

  // Send push notification to user when report status changes (skip 'open' — it's the default)
  if (req.body.status && report && req.body.status !== 'open') {
    const reportDoc = report as WithId<Record<string, unknown>>;
    const userId = reportDoc.userId as string;
    const user = await db.collection('users').findOne({ id: userId });
    if (user && user.pushToken) {
      const lang = (user.language as string) || 'en';
      const titles: Record<string, { en: string; ar: string }> = {
        bug: { en: 'Bug Report Updated', ar: 'تم تحديث بلاغ الخلل' },
        feature: { en: 'Feature Request Updated', ar: 'تم تحديث طلب الميزة' },
      };
      const statusLabels: Record<string, { en: string; ar: string }> = {
        open: { en: 'Open', ar: 'مفتوح' },
        acknowledged: { en: 'Acknowledged', ar: 'تم الاستلام' },
        fixed: { en: 'Fixed', ar: 'تم الإصلاح' },
        closed: { en: 'Closed', ar: 'مغلق' },
      };
      const notifTitle = titles[reportDoc.type as string]?.[lang as 'en' | 'ar'] || titles.bug.en;
      const statusLabel = statusLabels[req.body.status]?.[lang as 'en' | 'ar'] || req.body.status;
      const notifBody = lang === 'ar'
        ? `بلاغك "${reportDoc.title}" أصبح الآن ${statusLabel}.`
        : `Your report "${reportDoc.title}" is now ${statusLabel}.`;
      await sendExpoPushNotification(
        user.pushToken as string,
        notifTitle,
        notifBody,
        { type: 'report_status', reportId: req.params.id, status: req.body.status }
      );
    }
  }

  res.json(publicId(report as WithId<Record<string, unknown>>));
});

app.delete('/api/admin/reports/:id', requireAdmin, async (req, res) => {
  await db.collection('reports').deleteOne({ _id: objectId(req.params.id) });
  res.status(204).end();
});

// ──────────────────── Global Error Handler ────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err.message === 'Invalid ObjectId') return res.status(400).send('Invalid ID format');
  console.error('Unhandled error:', err.message);
  res.status(500).send('Internal server error');
});

// ──────────────────── Start ────────────────────
await client.connect();
await seedAdmin();
if (!EXPO_ACCESS_TOKEN) console.warn('⚠️  EXPO_ACCESS_TOKEN is not set — push notifications will not be sent. Set it in your .env to enable push notifications.');
app.listen(PORT, () => console.log(`BrainRot API running on http://localhost:${PORT}/api`));
