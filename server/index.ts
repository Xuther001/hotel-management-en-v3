import 'dotenv/config';
import express from 'express';
import webpush from 'web-push';
import ExcelJS from 'exceljs';
import nodemailer from 'nodemailer';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, scryptSync, timingSafeEqual, createHmac, createHash } from 'node:crypto';

const app = express();
app.use(cors());
app.use(express.json());
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = process.env.DATA_FILE || path.join(__dirname, 'data.json');

type AnyRecord = Record<string, any>;

const pushSubscriptionsPath = process.env.PUSH_SUBSCRIPTIONS_FILE || path.join(__dirname, 'push-subscriptions.json');

function readPushSubscriptions(): any[] {
  try {
    if (!fs.existsSync(pushSubscriptionsPath)) return [];
    const value = JSON.parse(fs.readFileSync(pushSubscriptionsPath, 'utf8'));
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.error('Could not read push subscriptions:', error);
    return [];
  }
}

function writePushSubscriptions(subscriptions: any[]) {
  fs.writeFileSync(pushSubscriptionsPath, JSON.stringify(subscriptions, null, 2), 'utf8');
}

function removePushSubscription(endpoint: string) {
  writePushSubscriptions(
    readPushSubscriptions().filter((s: any) => s.endpoint !== endpoint)
  );
}

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

function initialData() {
  return {
    properties: [
      { id: 'hotel-a', name: 'Hotel A', city: 'Ho Chi Minh City', rooms: 34, occupancy: 82, revenue: 1400000000 },
      { id: 'hotel-b', name: 'Hotel B', city: 'Ho Chi Minh City', rooms: 0, occupancy: 69, revenue: 1000000000 }
    ],
    reservations: [
      { id: 'RES-1048', guest: 'Nguyen Minh Anh', room: '305', propertyId: 'hotel-a', checkIn: '2026-10-19', checkOut: '2026-10-22', guests: 2, status: 'Checked in', source: 'Direct', amount: 4500000 },
      { id: 'RES-1049', guest: 'Tran Quoc Bao', room: '212', propertyId: 'hotel-b', checkIn: '2026-10-19', checkOut: '2026-10-21', guests: 1, status: 'Confirmed', source: 'Booking.com', amount: 2600000 },
      { id: 'RES-1050', guest: 'Le Thu Ha', room: '408', propertyId: 'hotel-a', checkIn: '2026-10-19', checkOut: '2026-10-20', guests: 2, status: 'Arriving today', source: 'Phone', amount: 1800000 },
      { id: 'RES-1051', guest: 'Pham Gia Huy', room: '118', propertyId: 'hotel-b', checkIn: '2026-10-20', checkOut: '2026-10-24', guests: 3, status: 'Confirmed', source: 'Agoda', amount: 5200000 },
      { id: 'RES-1052', guest: 'Vo Ngoc Linh', room: '501', propertyId: 'hotel-a', checkIn: '2026-10-21', checkOut: '2026-10-23', guests: 2, status: 'Confirmed', source: 'Direct', amount: 3100000 }
    ],
    rooms: [
      {
        "id": "A-G01",
        "number": "G01",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": "G"
      },
      {
        "id": "A-G02",
        "number": "G02",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": "G"
      },
      {
        "id": "A-101",
        "number": "101",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 1
      },
      {
        "id": "A-102",
        "number": "102",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 1
      },
      {
        "id": "A-103",
        "number": "103",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 1
      },
      {
        "id": "A-104",
        "number": "104",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 1
      },
      {
        "id": "A-105",
        "number": "105",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 1
      },
      {
        "id": "A-106",
        "number": "106",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 1
      },
      {
        "id": "A-201",
        "number": "201",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 2
      },
      {
        "id": "A-202",
        "number": "202",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 2
      },
      {
        "id": "A-203",
        "number": "203",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 2
      },
      {
        "id": "A-204",
        "number": "204",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 2
      },
      {
        "id": "A-205",
        "number": "205",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 2
      },
      {
        "id": "A-206",
        "number": "206",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 2
      },
      {
        "id": "A-301",
        "number": "301",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 3
      },
      {
        "id": "A-302",
        "number": "302",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 3
      },
      {
        "id": "A-303",
        "number": "303",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 3
      },
      {
        "id": "A-304",
        "number": "304",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 3
      },
      {
        "id": "A-305",
        "number": "305",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 3
      },
      {
        "id": "A-401",
        "number": "401",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 4
      },
      {
        "id": "A-402",
        "number": "402",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 4
      },
      {
        "id": "A-403",
        "number": "403",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 4
      },
      {
        "id": "A-404",
        "number": "404",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 4
      },
      {
        "id": "A-405",
        "number": "405",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 4
      },
      {
        "id": "A-501",
        "number": "501",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 5
      },
      {
        "id": "A-502",
        "number": "502",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 5
      },
      {
        "id": "A-503",
        "number": "503",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 5
      },
      {
        "id": "A-504",
        "number": "504",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 5
      },
      {
        "id": "A-505",
        "number": "505",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 5
      },
      {
        "id": "A-601",
        "number": "601",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 6
      },
      {
        "id": "A-602",
        "number": "602",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 6
      },
      {
        "id": "A-603",
        "number": "603",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 6
      },
      {
        "id": "A-604",
        "number": "604",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 6
      },
      {
        "id": "A-605",
        "number": "605",
        "type": "Standard Room",
        "propertyId": "hotel-a",
        "status": "Clean",
        "floor": 6
      }
    ],
    employees: [
      { id: 'EMP-001', name: 'Nguyen Thi Mai', jobTitle: 'Receptionist', property: 'Hotel A', status: 'On shift', department: 'Front Office', salary: 12000000 },
      { id: 'EMP-002', name: 'Tran Van Duc', jobTitle: 'Housekeeper', property: 'Hotel A', status: 'On shift', department: 'Housekeeping', salary: 9000000 },
      { id: 'EMP-003', name: 'Le Thanh Vy', jobTitle: 'Hotel Manager', property: 'Hotel B', status: 'On shift', department: 'Management', salary: 22000000 },
      { id: 'EMP-004', name: 'Pham Hoang Nam', jobTitle: 'Accountant', property: 'Group', status: 'On leave', department: 'Finance', salary: 16000000 },
    ],
    expenses: [
      { id: 'EXP-021', date: '2026-10-18', category: 'Utilities', property: 'Hotel A', description: 'Electricity bill', amount: 28500000, status: 'Approved' },
      { id: 'EXP-022', date: '2026-10-18', category: 'Supplies', property: 'Hotel B', description: 'Guest amenities', amount: 7400000, status: 'Pending' },
      { id: 'EXP-023', date: '2026-10-17', category: 'Maintenance', property: 'Hotel A', description: 'Air conditioning service', amount: 5200000, status: 'Approved' },
    ],
    tasks: [
      { id: 'TASK-01', title: 'Inspect room 304 air conditioner', property: 'Hotel A', priority: 'High', status: 'Overdue', assignee: 'Maintenance team' },
      { id: 'TASK-02', title: 'Prepare rooms 303 and 203', property: 'Both hotels', priority: 'Normal', status: 'In progress', assignee: 'Housekeeping' },
      { id: 'TASK-03', title: 'Renew employee contract', property: 'Hotel B', priority: 'Normal', status: 'Pending', assignee: 'HR' }
    ],
    activity: [
      { id: 1, text: 'Reservation RES-1048 checked in', by: 'Front Desk', time: '09:12' },
      { id: 2, text: 'Expense EXP-022 submitted for approval', by: 'Hotel B', time: '08:45' },
      { id: 3, text: 'Room 303 marked for cleaning', by: 'Housekeeping', time: '08:20' }
    ]
  };
}
function readData(): AnyRecord {
  if (!fs.existsSync(dataPath)) {
    if (process.env.DATA_FILE) {
      throw new Error(`Configured data file does not exist: ${dataPath}. Restore the hotel data before starting the service.`);
    }
    fs.writeFileSync(dataPath, JSON.stringify(initialData(), null, 2));
  }
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}
function writeData(data: AnyRecord) { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2)); }

function activityValue(data: AnyRecord, field: string, value: any): string {
  if (value === undefined || value === null || value === '') return '(empty)';
  if (field === 'propertyId') {
    return String(data.properties.find((p: AnyRecord) => p.id === value)?.name || value);
  }
  if (field === 'amount') {
    return new Intl.NumberFormat('en-US').format(Number(value));
  }
  return String(value);
}

function activityChanges(
  data: AnyRecord,
  before: AnyRecord | null,
  after: AnyRecord,
  fields: Array<{ key: string; label: string }>
) {
  return fields
    .filter(({ key }) => before === null || String(before[key] ?? '') !== String(after[key] ?? ''))
    .map(({ key, label }) => ({
      field: label,
      from: before === null ? '(new)' : activityValue(data, key, before[key]),
      to: activityValue(data, key, after[key])
    }));
}

function activityActor(req: express.Request): string {
  const user = (req as any).authUser;
  return String(user?.username || user?.name || 'Unknown user');
}

function addActivity(
  data: AnyRecord,
  text: string,
  details: any[] = [],
  by = 'Unknown user'
) {
  data.activity.unshift({
    id: Date.now() + Math.random(),
    text,
    by,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ...(details.length ? { details } : {})
  });
}

function list<T extends AnyRecord>(items: T[], req: express.Request) {
  const q = String(req.query.q || '').toLowerCase();
  const propertyId = String(req.query.property_id || '');
  const filtered = items.filter(x => (!q || JSON.stringify(x).toLowerCase().includes(q)) &&
    (!propertyId || x.propertyId === propertyId || x.property === propertyId || propertyId === 'all'));
  return { data: filtered, total: filtered.length };
}
app.get('/api/v1/health', (_req, res) =>
  res.json({ status: 'ok', mode: 'authenticated-api' })
);

type AuthUser = {
  id: string;
  username: string;
  name: string;
  jobTitle?: string;
  role: string;
  propertyIds: string[];
  salt: string;
  passwordHash: string;
  createdAt: string;
};

const authUsersPath = process.env.AUTH_USERS_FILE || path.join(__dirname, 'users.json');
const authSecretPath = process.env.AUTH_SECRET_FILE || path.join(__dirname, '.auth-secret');
const sessionsPath = process.env.AUTH_SESSIONS_FILE || path.join(__dirname, 'sessions.json');

function saveAuthUsers(users: AuthUser[]) {
  fs.writeFileSync(authUsersPath, JSON.stringify(users, null, 2), { mode: 0o600 });
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString('hex');
}

function publicUser(user: AuthUser) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    jobTitle: user.jobTitle || '',
    role: user.role,
    propertyIds: user.propertyIds,
    createdAt: user.createdAt
  };
}

function readAuthUsers(): AuthUser[] {
  if (!fs.existsSync(authUsersPath)) {
    throw new Error('Authentication users file is missing.');
  }
  const users = JSON.parse(fs.readFileSync(authUsersPath, 'utf8'));
  if (!Array.isArray(users)) {
    throw new Error('Authentication users file is invalid.');
  }
  return users;
}

function initializeAuth() {
  // Fail closed: never create an account with a hard-coded default password.
  // The existing users file must be provisioned securely before startup.
  readAuthUsers();

  if (!fs.existsSync(authSecretPath)) {
    fs.writeFileSync(authSecretPath, randomBytes(48).toString('hex'), { mode: 0o600, flag: 'wx' });
  }

  const secret = fs.readFileSync(authSecretPath, 'utf8').trim();
  if (!secret) {
    throw new Error('Authentication secret file is empty.');
  }
  return secret;
}

const authSecret = initializeAuth();

type AuthSession = {
  sessionHash: string;
  userId: string;
  createdAt: string;
};

function hashSessionId(sessionId: string) {
  return createHash('sha256').update(sessionId).digest('hex');
}

function readSessions(): AuthSession[] {
  if (!fs.existsSync(sessionsPath)) return [];
  const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
  if (!Array.isArray(sessions)) {
    throw new Error('Authentication sessions file is invalid.');
  }
  return sessions;
}

function saveSessions(sessions: AuthSession[]) {
  fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2), {
    encoding: 'utf8',
    mode: 0o600
  });
}

function revokeSessionsForUser(userId: string) {
  saveSessions(readSessions().filter(session => session.userId !== userId));
}

function makeToken(user: AuthUser) {
  const sessionId = randomBytes(32).toString('base64url');
  const sessionHash = hashSessionId(sessionId);

  // Store only a hash of the random session ID on the server.
  saveSessions([
    ...readSessions(),
    {
      sessionHash,
      userId: user.id,
      createdAt: new Date().toISOString()
    }
  ]);

  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    sid: sessionId
  })).toString('base64url');

  const signature = createHmac('sha256', authSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function requireAuthentication(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const parts = token.split('.');
    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Please sign in to continue.' });
    }

    const expected = createHmac('sha256', authSecret).update(parts[0]).digest();
    const actual = Buffer.from(parts[1], 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      return res.status(401).json({ error: 'Invalid authentication token.' });
    }

    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (typeof payload.sub !== 'string' || typeof payload.sid !== 'string') {
      return res.status(401).json({ error: 'Invalid authentication token.' });
    }

    const sessionHash = hashSessionId(payload.sid);
    const session = readSessions().find(
      item => item.sessionHash === sessionHash && item.userId === payload.sub
    );
    if (!session) {
      return res.status(401).json({ error: 'This session has been signed out. Please sign in again.' });
    }

    const user = readAuthUsers().find(u => u.id === payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'This account is no longer available.' });
    }

    (req as any).authUser = publicUser(user);
    (req as any).authSessionHash = sessionHash;
    next();
  } catch {
    return res.status(401).json({ error: 'Authentication failed. Please sign in again.' });
  }
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if ((req as any).authUser?.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin permission is required.' });
  }
  next();
}

app.post('/api/v1/auth/login', (req, res) => {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!username || !password) {
    return res.status(400).json({ error: 'Enter your username and password.' });
  }

  const user = readAuthUsers().find(u => u.username.toLowerCase() === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const candidate = Buffer.from(hashPassword(password, user.salt), 'hex');
  const stored = Buffer.from(user.passwordHash, 'hex');
  if (candidate.length !== stored.length || !timingSafeEqual(candidate, stored)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  res.json({ data: { user: publicUser(user), token: makeToken(user) } });
});

// Every business API route declared below this point requires authentication.
app.use('/api/v1', requireAuthentication);

app.post('/api/v1/auth/logout', (req, res) => {
  const sessionHash = (req as any).authSessionHash as string;
  saveSessions(readSessions().filter(session => session.sessionHash !== sessionHash));
  res.json({ message: 'Signed out successfully.' });
});

app.get('/api/v1/auth/me', (req, res) => {
  res.json({ data: (req as any).authUser });
});

app.get('/api/v1/admin/users', requireAdmin, (_req, res) => {
  res.json({ data: readAuthUsers().map(publicUser) });
});

app.post('/api/v1/admin/users', requireAdmin, (req, res) => {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const name = String(req.body?.name || '').trim();
  const jobTitle = String(req.body?.jobTitle || '').trim();
  const password = String(req.body?.password || '');
  const role = String(req.body?.role || 'Receptionist');
  const allowedRoles = ['Admin', 'Manager', 'Receptionist', 'Housekeeping', 'Finance'];

  if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
    return res.status(400).json({ error: 'Username must be 3–32 characters using letters, numbers, dots, underscores, or hyphens.' });
  }
  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'Enter a name between 2 and 100 characters.' });
  }
  if (password.length < 8 || password.length > 200) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  if (jobTitle.length > 100) {
    return res.status(400).json({ error: 'Job title must be 100 characters or fewer.' });
  }
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  const users = readAuthUsers();
  if (users.some(u => u.username.toLowerCase() === username)) {
    return res.status(409).json({ error: 'That username already exists.' });
  }

  const salt = randomBytes(16).toString('hex');
  const propertyIds: string[] = Array.isArray(req.body?.propertyIds)
    ? [...new Set<string>(req.body.propertyIds.map((v: unknown) => String(v).trim()).filter((v: string) => Boolean(v)))]
    : ['all'];

  const user: AuthUser = {
    id: `user-${randomBytes(12).toString('hex')}`,
    username,
    name,
    jobTitle,
    role,
    propertyIds: propertyIds.length ? propertyIds : ['all'],
    salt,
    passwordHash: hashPassword(password, salt),
    createdAt: new Date().toISOString()
  };

  users.push(user);
  saveAuthUsers(users);
  res.status(201).json({ data: publicUser(user) });
});

app.patch('/api/v1/admin/users/:id', requireAdmin, (req, res) => {
  const users = readAuthUsers();
  const currentUser = (req as any).authUser;
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const name = String(req.body?.name ?? user.name).trim();
  const jobTitle = String(req.body?.jobTitle ?? user.jobTitle ?? '').trim();
  const role = String(req.body?.role ?? user.role);
  const allowedRoles = ['Admin', 'Manager', 'Receptionist', 'Housekeeping', 'Finance'];

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'Enter a name between 2 and 100 characters.' });
  }
  if (jobTitle.length > 100) {
    return res.status(400).json({ error: 'Job title must be 100 characters or fewer.' });
  }
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  const rawPropertyIds = req.body?.propertyIds;
  if (!Array.isArray(rawPropertyIds)) {
    return res.status(400).json({ error: 'Select at least one valid hotel assignment.' });
  }

  const propertyIds = [...new Set<string>(
    rawPropertyIds
      .map((value: unknown) => String(value).trim())
      .filter((value: string) => Boolean(value))
  )];

  const validPropertyIds = new Set(
    (readData().properties || []).map((property: AnyRecord) => String(property.id))
  );
  if (
    propertyIds.length === 0 ||
    (propertyIds.includes('all') && propertyIds.length !== 1) ||
    propertyIds.some(id => id !== 'all' && !validPropertyIds.has(id))
  ) {
    return res.status(400).json({ error: 'Select valid hotel assignments.' });
  }

  if (user.id === currentUser.id && role !== 'Admin') {
    return res.status(400).json({ error: 'You cannot remove Admin access from your own account.' });
  }

  if (user.role === 'Admin' && role !== 'Admin' &&
      users.filter(u => u.role === 'Admin').length <= 1) {
    return res.status(400).json({ error: 'At least one Admin account must remain.' });
  }

  if (user.id === currentUser.id &&
      (role !== user.role ||
       JSON.stringify([...propertyIds].sort()) !== JSON.stringify([...(user.propertyIds || ['all'])].sort()))) {
    return res.status(400).json({
      error: 'You cannot change your own role or hotel assignments. Ask another Admin to do this.'
    });
  }

  const accessChanged =
    role !== user.role ||
    JSON.stringify([...propertyIds].sort()) !==
      JSON.stringify([...(user.propertyIds || ['all'])].sort());

  user.name = name;
  user.jobTitle = jobTitle;
  user.role = role;
  user.propertyIds = propertyIds;
  saveAuthUsers(users);

  if (accessChanged) revokeSessionsForUser(user.id);

  res.json({ data: publicUser(user), message: 'User profile updated successfully.' });
});

app.patch('/api/v1/admin/users/:id/password', requireAdmin, (req, res) => {
  const password = String(req.body?.password || '');
  if (password.length < 8 || password.length > 200) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const users = readAuthUsers();
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  user.salt = randomBytes(16).toString('hex');
  user.passwordHash = hashPassword(password, user.salt);
  saveAuthUsers(users);
  revokeSessionsForUser(user.id);
  res.json({ message: 'Password updated successfully.' });
});

app.delete('/api/v1/admin/users/:id', requireAdmin, (req, res) => {
  const users = readAuthUsers();
  const currentUser = (req as any).authUser;
  if (req.params.id === currentUser.id) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }

  const target = users.find(u => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found.' });

  if (target.role === 'Admin' && users.filter(u => u.role === 'Admin').length <= 1) {
    return res.status(400).json({ error: 'At least one Admin account must remain.' });
  }

  saveAuthUsers(users.filter(u => u.id !== target.id));
  revokeSessionsForUser(target.id);
  res.json({ message: 'User deleted successfully.' });
});

app.get('/api/v1/properties', (_req, res) => res.json({ data: readData().properties }));
app.get('/api/v1/dashboard/room-popularity', (req, res) => {
  const d = readData();
  const selectedId = String(req.query.property_id || 'all');
  const periodParam = String(req.query.period || '30');
  const period = ['30', '90', 'all'].includes(periodParam) ? periodParam : '30';

  const properties = (d.properties || []).filter((p: AnyRecord) =>
    selectedId === 'all' || p.id === selectedId
  );
  const propertyIds = new Set(properties.map((p: AnyRecord) => p.id));
  const rooms = (d.rooms || []).filter((r: AnyRecord) => propertyIds.has(r.propertyId));

  const dateParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const datePart = (type: string) => dateParts.find((part: any) => part.type === type)?.value || '';
  const today = `${datePart('year')}-${datePart('month')}-${datePart('day')}`;
  const dayMs = 86400000;
  const toDay = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return NaN;
    const [y, m, day] = value.split('-').map(Number);
    const ts = Date.UTC(y, m - 1, day);
    const date = new Date(ts);
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 &&
      date.getUTCDate() === day ? ts : NaN;
  };
  const todayTs = toDay(today);
  const tomorrowTs = todayTs + dayMs;
  const roomByKey = new Map<string, AnyRecord>(
    rooms.map((room: AnyRecord) => [`${room.propertyId}:${room.number}`, room])
  );

  const stays = (d.reservations || []).filter((r: AnyRecord) => {
    if (!propertyIds.has(r.propertyId)) return false;
    if (!['Checked in', 'Checked out'].includes(r.status)) return false;
    const room = roomByKey.get(`${r.propertyId}:${r.room}`);
    const start = toDay(r.checkIn);
    const end = toDay(r.checkOut);
    return Boolean(room) && Number.isFinite(start) && Number.isFinite(end) &&
      start < tomorrowTs && end > start;
  });

  let startTs = period === 'all'
    ? (stays.length
        ? Math.min(...stays.map((r: AnyRecord) => toDay(r.checkIn)))
        : todayTs)
    : todayTs - (Number(period) - 1) * dayMs;
  startTs = Math.min(startTs, todayTs);

  const totals = new Map<string, number>();
  for (const room of rooms) totals.set(room.id, 0);

  for (const stay of stays) {
    const room = roomByKey.get(`${stay.propertyId}:${stay.room}`);
    if (!room) continue;
    const stayStart = toDay(stay.checkIn);
    const stayEnd = Math.min(toDay(stay.checkOut), tomorrowTs);
    const overlapStart = Math.max(stayStart, startTs);
    const overlapEnd = Math.min(stayEnd, tomorrowTs);
    if (overlapEnd > overlapStart) {
      totals.set(room.id, (totals.get(room.id) || 0) +
        Math.round((overlapEnd - overlapStart) / dayMs));
    }
  }

  const roomResults: Array<{
    id: string;
    propertyId: string;
    room: string;
    occupiedDays: number;
  }> = rooms.map((room: AnyRecord) => ({
    id: String(room.id),
    propertyId: String(room.propertyId),
    room: String(room.number),
    occupiedDays: totals.get(String(room.id)) || 0
  }));
  const ranked = [...roomResults].sort((a, b) =>
    b.occupiedDays - a.occupiedDays || a.room.localeCompare(b.room, undefined, { numeric: true })
  );

  res.json({ data: {
    period,
    startDate: new Date(startTs).toISOString().slice(0, 10),
    endDate: today,
    rooms: roomResults,
    totalOccupiedDays: roomResults.reduce((sum: number, room: { occupiedDays: number }) => sum + room.occupiedDays, 0),
    mostPopular: ranked.length && ranked[0].occupiedDays > 0
      ? ranked.filter((room: AnyRecord) => room.occupiedDays === ranked[0].occupiedDays)
      : [],
    leastPopular: ranked.length
      ? ranked.filter((room: AnyRecord) => room.occupiedDays === ranked[ranked.length - 1].occupiedDays)
      : []
  }});
});
app.get('/api/v1/dashboard/overview', (req, res) => {
  const d = readData();
  const allProperties = d.properties || [];
  const selectedId = String(req.query.property_id || 'all');
  const properties = selectedId === 'all'
    ? allProperties
    : allProperties.filter((p: AnyRecord) => p.id === selectedId);
  const propertyIds = new Set(properties.map((p: AnyRecord) => p.id));
  const allRooms = (d.rooms || []).filter((r: AnyRecord) => propertyIds.has(r.propertyId));
  const reservations = (d.reservations || []).filter((r: AnyRecord) => propertyIds.has(r.propertyId));
  const employees = d.employees || [];

  // Use the hotel's local date, regardless of the server's timezone.
  const dateParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const datePart = (type: string) => dateParts.find((part: any) => part.type === type)?.value || '';
  const today = `${datePart('year')}-${datePart('month')}-${datePart('day')}`;
  const currentMonth = today.slice(0, 7);

  // Revenue here means recorded amounts for completed stays by checkout month,
  // not cash received or the value of future/in-progress bookings.
  const completed = reservations.filter((r: AnyRecord) =>
    r.status === 'Checked out' && typeof r.checkOut === 'string'
  );
  const revenue = completed
    .filter((r: AnyRecord) => r.checkOut.slice(0, 7) === currentMonth)
    .reduce((sum: number, r: AnyRecord) => sum + Number(r.amount || 0), 0);

  // Occupancy is based on actual room records; maintenance rooms are excluded.
  const roomStats = properties.map((p: AnyRecord) => {
    const propertyRooms = allRooms.filter((r: AnyRecord) => r.propertyId === p.id);
    const availableRooms = propertyRooms.filter((r: AnyRecord) => r.occupancyStatus !== 'Maintenance');
    const occupiedRooms = availableRooms.filter((r: AnyRecord) => r.occupancyStatus === 'Occupied').length;
    return {
      ...p,
      rooms: propertyRooms.length,
      occupancy: availableRooms.length ? Math.round(occupiedRooms / availableRooms.length * 100) : 0
    };
  });
  const availableRooms = allRooms.filter((r: AnyRecord) => r.occupancyStatus !== 'Maintenance');
  const occupiedRooms = availableRooms.filter((r: AnyRecord) => r.occupancyStatus === 'Occupied').length;
  const occupancy = availableRooms.length ? Math.round(occupiedRooms / availableRooms.length * 100) : 0;

  // Build the last six months from completed reservation amounts, not sample figures.
  const monthKeys: string[] = [];
  const firstOfCurrentMonth = new Date(Number(currentMonth.slice(0, 4)), Number(currentMonth.slice(5, 7)) - 1, 1);
  for (let offset = 5; offset >= 0; offset--) {
    const date = new Date(firstOfCurrentMonth.getFullYear(), firstOfCurrentMonth.getMonth() - offset, 1);
    monthKeys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }
  const firstPropertyId = allProperties[0]?.id;
  const secondPropertyId = allProperties[1]?.id;
  const revenueTrend = monthKeys.map((month: string) => {
    const monthCompleted = completed.filter((r: AnyRecord) => r.checkOut.slice(0, 7) === month);
    return {
      month: new Date(`${month}-01T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
      hotelA: monthCompleted.filter((r: AnyRecord) => r.propertyId === firstPropertyId)
        .reduce((sum: number, r: AnyRecord) => sum + Number(r.amount || 0), 0) / 1_000_000,
      hotelB: secondPropertyId
        ? monthCompleted.filter((r: AnyRecord) => r.propertyId === secondPropertyId)
            .reduce((sum: number, r: AnyRecord) => sum + Number(r.amount || 0), 0) / 1_000_000
        : 0
    };
  });

  const activeStatuses = new Set(['active', 'employed']);
  const employeeCount = employees.filter((e: AnyRecord) =>
    !e.status || activeStatuses.has(String(e.status).toLowerCase())
  ).length;

  res.json({ data: {
    revenue,
    // Profit cannot be calculated reliably until same-period expenses and revenue are reconciled.
    operatingProfit: null,
    occupancy,
    employeeCount,
    arrivals: reservations.filter((r: AnyRecord) =>
      r.checkIn === today && ['Confirmed', 'Arriving today'].includes(r.status)
    ).length,
    departures: reservations.filter((r: AnyRecord) =>
      r.checkOut === today && !['Checked out', 'Cancelled', 'No-show'].includes(r.status)
    ).length,
    properties: roomStats,
    reservations: reservations.slice(0, 5),
    tasks: d.tasks || [],
    activity: d.activity || [],
    revenueTrend
  }});
});
app.get('/api/v1/reservations', (req, res) => res.json(list(readData().reservations, req)));
app.post('/api/v1/reservations', (req, res) => {
  const d = readData();
  const body = req.body || {};

  if (!body.guest || !body.checkIn || !body.checkOut || !body.propertyId || !body.room) {
    return res.status(400).json({ error: 'Guest, hotel, room, check-in, and check-out are required.' });
  }
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (body.checkIn < today) {
    return res.status(400).json({ error: 'Check-in cannot be in the past.' });
  }
  if (body.checkOut <= body.checkIn) {
    return res.status(400).json({ error: 'Check-out must be after check-in.' });
  }

  const room = d.rooms.find((r: AnyRecord) =>
    String(r.number) === String(body.room) &&
    r.propertyId === body.propertyId
  );

  if (!room) {
    return res.status(400).json({ error: 'The selected room does not belong to this hotel.' });
  }
  if (room.occupancyStatus === 'Maintenance') {
    return res.status(400).json({ error: 'This room is under maintenance and cannot be reserved.' });
  }

  const conflict = d.reservations.find((r: AnyRecord) => {
    const status = String(r.status || '').toLowerCase();
    const released = ['cancelled', 'canceled', 'no-show', 'no show'].includes(status);
    return !released &&
      r.propertyId === body.propertyId &&
      String(r.room) === String(body.room) &&
      r.checkIn < body.checkOut &&
      r.checkOut > body.checkIn;
  });

  if (conflict) {
    return res.status(409).json({
      error: `Cannot create reservation: Room ${body.room} is already reserved for ${conflict.guest} (${conflict.checkIn} to ${conflict.checkOut}). Your requested stay is ${body.checkIn} to ${body.checkOut}. Please choose another room or dates.`
    });
  }

  const id = `RES-${1053 + d.reservations.length}`;
  const item = {
    id,
    guest: String(body.guest).trim(),
    room: String(body.room),
    propertyId: body.propertyId,
    checkIn: body.checkIn,
    checkOut: body.checkOut,
    guests: Number(body.guests || 1),
    status: 'Confirmed',
    source: body.source || 'Direct',
    amount: Number(body.amount || 0),
    note: String(body.note || '').trim()
  };

  d.reservations.unshift(item);
  addActivity(d, `Reservation ${id} created for ${item.guest}`, activityChanges(d, null, item, [
    { key: 'guest', label: 'Guest' },
    { key: 'propertyId', label: 'Hotel' },
    { key: 'room', label: 'Room' },
    { key: 'checkIn', label: 'Check-in' },
    { key: 'checkOut', label: 'Check-out' },
    { key: 'guests', label: 'Guests' },
    { key: 'status', label: 'Status' },
    { key: 'source', label: 'Booking source' },
    { key: 'amount', label: 'Amount' },
    { key: 'note', label: 'Reservation note' }
  ]), activityActor(req));
  writeData(d);
  res.status(201).json({ data: item });
});
app.patch('/api/v1/reservations/:id', (req, res) => {
  const d = readData();
  const item = d.reservations.find((x: AnyRecord) => x.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Reservation not found.' });

  const before = { ...item };
  const body = req.body || {};
  const detailFields = [
    'guest', 'propertyId', 'room', 'checkIn', 'checkOut',
    'guests', 'amount', 'source', 'note'
  ];
  const editingDetails = detailFields.some(key =>
    Object.prototype.hasOwnProperty.call(body, key)
  );
  const currentStatus = String(item.status || '').toLowerCase();
  const lockedStatuses = ['checked out', 'cancelled', 'canceled', 'no-show', 'no show'];

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (editingDetails && lockedStatuses.includes(currentStatus)) {
    return res.status(400).json({
      error: 'This reservation can no longer be edited because it is checked out or closed.'
    });
  }

  if (editingDetails && item.checkOut < today) {
    return res.status(400).json({
      error: 'This reservation can no longer be edited because its stay has ended.'
    });
  }

  const allowedStatuses = ['Confirmed', 'Arriving today', 'Checked in', 'Checked out', 'Cancelled', 'No-show'];

  if (body.status !== undefined && !allowedStatuses.includes(body.status)) {
    return res.status(400).json({ error: 'Invalid reservation status.' });
  }

  const updated = { ...item, ...body };

  if (!updated.guest || !updated.propertyId || !updated.room || !updated.checkIn || !updated.checkOut) {
    return res.status(400).json({ error: 'Guest, hotel, room, check-in, and check-out are required.' });
  }
  if (updated.checkOut <= updated.checkIn) {
    return res.status(400).json({ error: 'Check-out must be after check-in.' });
  }

  const status = String(updated.status || '').toLowerCase();
  const releasedStatuses = ['cancelled', 'canceled', 'no-show', 'no show'];
  const roomOrDatesChanged =
    body.room !== undefined ||
    body.propertyId !== undefined ||
    body.checkIn !== undefined ||
    body.checkOut !== undefined;

  if (!releasedStatuses.includes(status) && (roomOrDatesChanged || body.status !== undefined)) {
    const room = d.rooms.find((r: AnyRecord) =>
      String(r.number) === String(updated.room) &&
      r.propertyId === updated.propertyId
    );

    if (!room) {
      return res.status(400).json({ error: 'The selected room does not belong to this hotel.' });
    }
    if (room.occupancyStatus === 'Maintenance' && updated.status !== 'Checked out') {
      return res.status(400).json({ error: 'This room is under maintenance and cannot be assigned to an active reservation.' });
    }

    const conflict = d.reservations.some((r: AnyRecord) => {
      if (r.id === item.id) return false;
      const otherStatus = String(r.status || '').toLowerCase();
      return !releasedStatuses.includes(otherStatus) &&
        r.propertyId === updated.propertyId &&
        String(r.room) === String(updated.room) &&
        r.checkIn < updated.checkOut &&
        r.checkOut > updated.checkIn;
    });

    if (conflict) {
      return res.status(409).json({
        error: 'This room is already booked for some or all of those dates.'
      });
    }
  }

  Object.assign(item, updated);

  const reservationChanges = activityChanges(d, before, item, [
    { key: 'guest', label: 'Guest' },
    { key: 'propertyId', label: 'Hotel' },
    { key: 'room', label: 'Room' },
    { key: 'checkIn', label: 'Check-in' },
    { key: 'checkOut', label: 'Check-out' },
    { key: 'guests', label: 'Guests' },
    { key: 'status', label: 'Status' },
    { key: 'source', label: 'Booking source' },
    { key: 'amount', label: 'Amount' },
    { key: 'note', label: 'Reservation note' }
  ]);

  const automaticRoomChanges: any[] = [];
  if (body.status === 'Checked in' || body.status === 'Checked out') {
    const room = d.rooms.find((r: AnyRecord) =>
      String(r.number) === String(item.room) &&
      r.propertyId === item.propertyId
    );
    if (room) {
      const roomBefore = { ...room };
      if (body.status === 'Checked in') {
        room.occupancyStatus = 'Occupied';
      } else {
        room.occupancyStatus = 'Vacant';
        room.housekeepingStatus = 'Dirty';
      }
      automaticRoomChanges.push(...activityChanges(d, roomBefore, room, [
        { key: 'occupancyStatus', label: 'Occupancy' },
        { key: 'housekeepingStatus', label: 'Housekeeping' }
      ]));
      if (automaticRoomChanges.length) {
        addActivity(d, `Room ${room.number} updated automatically after reservation ${item.id} was ${body.status.toLowerCase()}`, automaticRoomChanges, activityActor(req));
      }
    }
  }

  if (reservationChanges.length) {
    const statusChanged = reservationChanges.some(change => change.field === 'Status');
    addActivity(
      d,
      statusChanged
        ? `Reservation ${item.id} status updated`
        : `Reservation ${item.id} details edited for ${item.guest}`,
      reservationChanges,
      activityActor(req)
    );
  }

  writeData(d);
  res.json({ data: item });
});
app.delete('/api/v1/reservations/:id', (req, res) => {
  const d = readData();
  const index = d.reservations.findIndex(
    (x: AnyRecord) => x.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({ error: 'Reservation not found.' });
  }

  const [deleted] = d.reservations.splice(index, 1);

  addActivity(d, `Reservation ${deleted.id} for ${deleted.guest} permanently deleted`, [
    { field: 'Guest', from: activityValue(d, 'guest', deleted.guest), to: 'Deleted' },
    { field: 'Hotel', from: activityValue(d, 'propertyId', deleted.propertyId), to: 'Deleted' },
    { field: 'Room', from: activityValue(d, 'room', deleted.room), to: 'Deleted' },
    { field: 'Check-in', from: activityValue(d, 'checkIn', deleted.checkIn), to: 'Deleted' },
    { field: 'Check-out', from: activityValue(d, 'checkOut', deleted.checkOut), to: 'Deleted' },
    { field: 'Status', from: activityValue(d, 'status', deleted.status), to: 'Deleted' }
  ], activityActor(req));

  writeData(d);
  res.json({ message: 'Reservation permanently deleted.', data: deleted });
});

app.get('/api/v1/push/public-key', (_req, res) => {
  if (!process.env.VAPID_PUBLIC_KEY || !configureWebPush()) {
    return res.status(503).json({ error: 'Push notifications are not configured on the server.' });
  }
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

app.post('/api/v1/push/subscribe', (req, res) => {
  if (!configureWebPush()) {
    return res.status(503).json({ error: 'Push notifications are not configured on the server.' });
  }

  const subscription = req.body;
  if (
    !subscription ||
    typeof subscription.endpoint !== 'string' ||
    !subscription.endpoint.startsWith('https://') ||
    typeof subscription.keys?.p256dh !== 'string' ||
    typeof subscription.keys?.auth !== 'string'
  ) {
    return res.status(400).json({ error: 'Invalid push subscription.' });
  }

  try {
    const subscriptions = readPushSubscriptions();
    const index = subscriptions.findIndex((s: any) => s.endpoint === subscription.endpoint);
    if (index >= 0) subscriptions[index] = subscription;
    else subscriptions.push(subscription);
    writePushSubscriptions(subscriptions);
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Could not save push subscription:', error);
    res.status(500).json({ error: 'Could not save push subscription.' });
  }
});

app.post('/api/v1/push/unsubscribe', (req, res) => {
  if (typeof req.body?.endpoint !== 'string') {
    return res.status(400).json({ error: 'Subscription endpoint is required.' });
  }
  try {
    removePushSubscription(req.body.endpoint);
    res.json({ ok: true });
  } catch (error) {
    console.error('Could not remove push subscription:', error);
    res.status(500).json({ error: 'Could not remove push subscription.' });
  }
});

app.get('/api/v1/rooms', (req, res) => res.json(list(readData().rooms, req)));
app.patch('/api/v1/rooms/:id/status', async (req, res) => {
  const d = readData();
  const item = d.rooms.find((x: AnyRecord) => x.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Room not found.' });

  const hasOccupancy = Object.prototype.hasOwnProperty.call(req.body, 'occupancyStatus');
  const hasHousekeeping = Object.prototype.hasOwnProperty.call(req.body, 'housekeepingStatus');

  if (hasOccupancy === hasHousekeeping) {
    return res.status(400).json({ error: 'Update either occupancyStatus or housekeepingStatus, not both.' });
  }

  const field = hasOccupancy ? 'occupancyStatus' : 'housekeepingStatus';
  const value = hasOccupancy ? req.body.occupancyStatus : req.body.housekeepingStatus;
  const allowed = hasOccupancy
    ? ['Occupied', 'Vacant', 'Maintenance']
    : ['Clean', 'Dirty'];

  if (!allowed.includes(value)) {
    return res.status(400).json({ error: `Invalid ${field}.` });
  }

  const previousValue = item[field];
  const changed = previousValue !== value;
  if (changed) {
    item[field] = value;
    const label = field === 'occupancyStatus' ? 'Occupancy' : 'Housekeeping';
    addActivity(d, `Room ${item.number} ${label.toLowerCase()} updated`, [
      { field: label, from: String(previousValue ?? '(empty)'), to: String(value) }
    ], activityActor(req));
    writeData(d);
  }

  const isTransitionToClean =
    changed &&
    field === 'housekeepingStatus' &&
    previousValue !== 'Clean' &&
    item.housekeepingStatus === 'Clean';
  const pushConfigured = isTransitionToClean ? configureWebPush() : false;
  const subscriptions = isTransitionToClean ? readPushSubscriptions() : [];

  if (isTransitionToClean && pushConfigured) {
    const property = d.properties.find((x: AnyRecord) => x.id === item.propertyId);
    const payload = JSON.stringify({
      title: 'Room marked Clean',
      body: `Room ${item.number} at ${property?.name || 'your hotel'} is now Clean.`,
      url: '/rooms'
    });

    await Promise.all(subscriptions.map(async (subscription: any) => {
      try {
        await webpush.sendNotification(subscription, payload);
      } catch (error: any) {
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          try { removePushSubscription(subscription.endpoint); }
          catch (removeError) { console.error('Could not remove expired subscription:', removeError); }
        } else {
          console.error('Push notification failed:', error?.message || error);
        }
      }
    }));
  }

  res.json({ data: item });
});
app.patch('/api/v1/rooms/:id/note', (req, res) => {
  const d = readData();
  const item = d.rooms.find((x: AnyRecord) => x.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Room not found.' });
  if (typeof req.body.note !== 'string') {
    return res.status(400).json({ error: 'Note must be text.' });
  }
  if (req.body.note.length > 2000) {
    return res.status(400).json({ error: 'Room notes cannot exceed 2000 characters.' });
  }
  const previousNote = String(item.note || '');
  if (previousNote !== req.body.note) {
    item.note = req.body.note;
    addActivity(d, `Room ${item.number} notes updated`, [
      { field: 'Room notes', from: previousNote || '(empty)', to: req.body.note || '(empty)' }
    ], activityActor(req));
    writeData(d);
  }
  res.json({ data: item });
});

app.get('/api/v1/employees', (req, res) => res.json(list(readData().employees, req)));
app.post('/api/v1/employees', (req, res) => {
  const d = readData(); if (!req.body.name || !String(req.body.name).trim()) return res.status(400).json({ error: 'Employee name is required.' }); const approvedJobTitles: Record<string, string> = { 'Front Office': 'Receptionist', Housekeeping: 'Housekeeper', Management: 'Hotel Manager', Finance: 'Accountant' }; if (!req.body.department || !Object.prototype.hasOwnProperty.call(approvedJobTitles, req.body.department) || req.body.jobTitle !== approvedJobTitles[req.body.department]) return res.status(400).json({ error: 'Select a valid department and its approved job title.' });
  const item = { id: `EMP-${String(d.employees.length + 1).padStart(3, '0')}`, name: req.body.name, jobTitle: req.body.jobTitle, property: req.body.property || 'Group', status: 'Active', department: req.body.department || 'General', salary: Number(req.body.salary || 0) };
  d.employees.push(item); writeData(d); res.status(201).json({ data: item });
});
app.delete('/api/v1/employees/:id', (req, res) => {
  const d = readData();
  const index = d.employees.findIndex((employee: any) => employee.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Employee not found.' });
  const [deleted] = d.employees.splice(index, 1);
  writeData(d);
  res.json({ data: deleted, message: 'Employee deleted.' });
});
app.get('/api/v1/finance/expenses', (req, res) => res.json(list(readData().expenses, req)));
app.post('/api/v1/finance/expenses', (req, res) => {
  const d = readData(); const item = { id: `EXP-${String(Date.now()).slice(-5)}`, date: req.body.date || new Date().toISOString().slice(0,10), category: req.body.category || 'Other', property: req.body.property || 'Hotel A', description: req.body.description || 'New expense', amount: Number(req.body.amount || 0), status: 'Pending' };
  d.expenses.unshift(item); writeData(d); res.status(201).json({ data: item });
});

function getBillingRows(d: AnyRecord) {
  const today = new Date().toISOString().slice(0, 10);
  const settings = Array.isArray(d.billingSettings) ? d.billingSettings : [];
  const payments = Array.isArray(d.payments) ? d.payments : [];

  return (d.reservations || [])
    .filter((r: AnyRecord) => !['Cancelled', 'No-show'].includes(String(r.status || '')))
    .map((r: AnyRecord) => {
      const cfg = settings.find((x: AnyRecord) => x.reservationId === r.id) || {};
      const rentalType = cfg.rentalType === 'Monthly' ? 'Monthly' : 'Daily';
      const monthlyRate = Math.max(0, Number(cfg.monthlyRate || 0));
      const installments: AnyRecord[] = [];

      if (rentalType === 'Daily') {
        const amount = Math.max(0, Number(r.amount || 0));
        installments.push({
          dueDate: String(r.checkIn || today),
          charge: amount,
          paid: 0,
          balance: amount
        });
      } else if (monthlyRate > 0 && r.checkIn && r.checkOut) {
        const start = new Date(`${r.checkIn}T00:00:00Z`).getTime();
        const end = new Date(`${r.checkOut}T00:00:00Z`).getTime();
        const nightsByMonth: Record<string, number> = {};

        // Count each overnight stay; the checkout date is excluded.
        for (let t = start; t < end; t += 86400000) {
          const month = new Date(t).toISOString().slice(0, 7);
          nightsByMonth[month] = (nightsByMonth[month] || 0) + 1;
        }

        for (const [month, nights] of Object.entries(nightsByMonth)) {
          const [year, monthNo] = month.split('-').map(Number);
          const days = new Date(Date.UTC(year, monthNo, 0)).getUTCDate();
          const amount = Math.round(monthlyRate / days * nights);
          const fifth = `${month}-05`;

          // For a first month that begins after the 5th, the prorated
          // first installment is due at check-in rather than retroactively.
          const dueDate = month === String(r.checkIn).slice(0, 7) && fifth < String(r.checkIn)
            ? String(r.checkIn)
            : fifth;

          installments.push({
            dueDate,
            charge: amount,
            paid: 0,
            balance: amount
          });
        }
      }

      installments.sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));

      const reservationPayments = payments
        .filter((x: AnyRecord) => x.reservationId === r.id)
        .sort((a: AnyRecord, b: AnyRecord) =>
          String(a.date || '').localeCompare(String(b.date || ''))
        );

      const paid = reservationPayments.reduce(
        (sum: number, x: AnyRecord) => sum + Math.max(0, Number(x.amount || 0)),
        0
      );

      // Apply each recorded payment to the oldest outstanding installment first.
      for (const payment of reservationPayments) {
        let remaining = Math.max(0, Number(payment.amount || 0));
        for (const installment of installments) {
          if (remaining <= 0) break;
          const applied = Math.min(installment.balance, remaining);
          installment.paid += applied;
          installment.balance -= applied;
          remaining -= applied;
        }
      }

      const charge = installments.reduce((sum, x) => sum + x.charge, 0);
      const balance = Math.max(0, charge - paid);
      const dueNow = installments.reduce(
        (sum, x) => sum + (x.dueDate <= today ? x.balance : 0), 0
      );
      const overdueAmount = installments.reduce(
        (sum, x) => sum + (x.dueDate < today ? x.balance : 0), 0
      );

      for (const installment of installments) {
        installment.status = installment.balance <= 0
          ? 'Paid'
          : installment.dueDate < today
            ? 'Overdue'
            : installment.dueDate === today
              ? 'Due'
              : 'Upcoming';
      }

      const dueDate = installments.find(x => x.balance > 0)?.dueDate
        || installments[0]?.dueDate
        || String(r.checkIn || today);

      const status = charge <= 0
        ? 'Setup needed'
        : balance <= 0
          ? 'Paid'
          : overdueAmount > 0
            ? 'Overdue'
            : dueNow > 0
              ? 'Due'
              : 'Upcoming';

      return {
        reservationId: r.id,
        guest: r.guest,
        room: r.room,
        propertyId: r.propertyId,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        reservationStatus: r.status,
        rentalType,
        monthlyRate,
        charge,
        paid,
        balance,
        dueNow,
        overdueAmount,
        dueDate,
        status,
        installments,
        payments: reservationPayments
      };
    })
    .sort((a: AnyRecord, b: AnyRecord) => {
      const roomA = String(a.room || '');
      const roomB = String(b.room || '');
      const isGuestRoomA = /^G\d+$/i.test(roomA);
      const isGuestRoomB = /^G\d+$/i.test(roomB);

      // Put G rooms first, then sort all room numbers naturally.
      if (isGuestRoomA !== isGuestRoomB) {
        return isGuestRoomA ? -1 : 1;
      }

      return roomA.localeCompare(roomB, undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });
}
app.get('/api/v1/billing', (_req, res) => {
  const d = readData();
  res.json({ data: getBillingRows(d), payments: Array.isArray(d.payments) ? d.payments : [] });
});

app.patch('/api/v1/billing/:reservationId', (req, res) => {
  const d = readData();
  const r = (d.reservations || []).find((x: AnyRecord) => x.id === req.params.reservationId);
  if (!r) return res.status(404).json({ error: 'Reservation not found' });
  const rentalType = req.body.rentalType === 'Monthly' ? 'Monthly' : 'Daily';
  const monthlyRate = Number(req.body.monthlyRate || 0);
  if (!Number.isFinite(monthlyRate) || monthlyRate < 0 || (rentalType === 'Monthly' && monthlyRate <= 0))
    return res.status(400).json({ error: 'Enter a valid monthly rent amount for monthly stays.' });
  if (!Array.isArray(d.billingSettings)) d.billingSettings = [];
  const setting = d.billingSettings.find((x: AnyRecord) => x.reservationId === r.id);
  if (setting) Object.assign(setting, { rentalType, monthlyRate });
  else d.billingSettings.push({ reservationId: r.id, rentalType, monthlyRate });
  writeData(d);
  res.json({ data: getBillingRows(d).find((x: AnyRecord) => x.reservationId === r.id) });
});

app.post('/api/v1/billing/payments', (req, res) => {
  const d = readData();
  const reservationId = String(req.body.reservationId || '');
  if (!(d.reservations || []).some((x: AnyRecord) => x.id === reservationId))
    return res.status(404).json({ error: 'Reservation not found' });
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0)
    return res.status(400).json({ error: 'Payment amount must be greater than zero.' });
  if (!Array.isArray(d.payments)) d.payments = [];
  const payment = { id: `PAY-${Date.now()}`, reservationId,
    date: req.body.date || new Date().toISOString().slice(0, 10),
    amount: Math.round(amount), method: String(req.body.method || 'Cash'),
    notes: String(req.body.notes || '').slice(0, 500) };
  d.payments.unshift(payment);
  if (!Array.isArray(d.activity)) d.activity = [];
  d.activity.unshift({ id: Date.now(), text: `Payment recorded for reservation ${reservationId}`,
    by: activityActor(req), time: new Date().toISOString().slice(11, 16) });
  writeData(d);
  res.status(201).json({ data: payment, billing: getBillingRows(d).find((x: AnyRecord) => x.reservationId === reservationId) });
});


app.patch('/api/v1/billing/payments/:paymentId', (req, res) => {
  const d = readData();
  const payment = (Array.isArray(d.payments) ? d.payments : [])
    .find((x: AnyRecord) => x.id === req.params.paymentId);

  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  const amount = Number(req.body.amount);
  const date = String(req.body.date || '');
  const method = String(req.body.method || '').trim();

  if (!Number.isFinite(amount) || amount <= 0)
    return res.status(400).json({ error: 'Payment amount must be greater than zero.' });

  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)
      || Number.isNaN(parsedDate.getTime())
      || parsedDate.toISOString().slice(0, 10) !== date)
    return res.status(400).json({ error: 'Enter a valid payment date.' });

  if (!method || method.length > 80)
    return res.status(400).json({ error: 'Enter a valid payment method.' });

  const before = {
    amount: payment.amount,
    date: payment.date,
    method: payment.method,
    notes: payment.notes || ''
  };

  payment.amount = Math.round(amount);
  payment.date = date;
  payment.method = method;
  payment.notes = String(req.body.notes ?? payment.notes ?? '').slice(0, 500);

  if (!Array.isArray(d.activity)) d.activity = [];
  d.activity.unshift({
    id: Date.now(),
    text: `Payment ${payment.id} edited for ${payment.reservationId}: amount ${before.amount} -> ${payment.amount}; date ${before.date} -> ${payment.date}; method ${before.method} -> ${payment.method}`,
    by: activityActor(req),
    time: new Date().toISOString().slice(11, 16)
  });

  writeData(d);
  res.json({
    data: payment,
    billing: getBillingRows(d).find((x: AnyRecord) => x.reservationId === payment.reservationId)
  });
});


app.delete('/api/v1/billing/payments/:paymentId', (req, res) => {
  const d = readData();
  const payments = Array.isArray(d.payments) ? d.payments : [];
  const index = payments.findIndex(
    (x: AnyRecord) => x.id === req.params.paymentId
  );

  if (index < 0) return res.status(404).json({ error: 'Payment not found' });

  const [payment] = payments.splice(index, 1);

  if (!Array.isArray(d.activity)) d.activity = [];
  d.activity.unshift({
    id: Date.now(),
    text: `Payment ${payment.id} deleted for reservation ${payment.reservationId}: ${payment.amount} VND`,
    by: activityActor(req),
    time: new Date().toISOString().slice(11, 16)
  });

  writeData(d);
  res.json({
    data: payment,
    billing: getBillingRows(d).find(
      (x: AnyRecord) => x.reservationId === payment.reservationId
    )
  });
});

app.get('/api/v1/housekeeping/tasks', (_req, res) => res.json({ data: readData().tasks }));
app.get('/api/v1/audit-logs', (_req, res) => res.json({ data: readData().activity }));

app.get('/api/v1/backup/reservations/download', async (_req, res) => {
  try {
    const data = readData();
    const reservations = Array.isArray(data.reservations) ? data.reservations : [];

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Hospitality Group Management';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Khách Đang Lưu Trú');

    const dateText = (value: any): string => {
      if (!value) return '';
      const raw = value instanceof Date
        ? value.toISOString().slice(0, 10)
        : String(value).slice(0, 10);
      const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      return match ? `${match[3]}/${match[2]}/${match[1]}` : String(value);
    };

    const utcDate = (value: any): number | null => {
      if (!value) return null;
      const raw = value instanceof Date
        ? value.toISOString().slice(0, 10)
        : String(value).slice(0, 10);
      const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!match) return null;
      return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    };

    sheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'PHÒNG', key: 'room', width: 14 },
      { header: 'HỌ-TÊN', key: 'guest', width: 30 },
      { header: 'CHECK-IN', key: 'checkIn', width: 16 },
      { header: 'CHECK-OUT', key: 'checkOut', width: 16 },
      { header: 'THỜI GIAN LƯU TRÚ', key: 'stay', width: 24 }
    ];

    sheet.addRows(reservations.map((row: any, index: number) => {
      const start = utcDate(row.checkIn);
      const end = utcDate(row.checkOut);
      const stay = start === null || end === null
        ? ''
        : Math.round((end - start) / 86400000);

      return {
        stt: index + 1,
        room: row.room ?? '',
        guest: row.guest ?? '',
        checkIn: dateText(row.checkIn),
        checkOut: dateText(row.checkOut),
        stay
      };
    }));

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF24476B' }
    };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 6 }
    };

    const attachment = Buffer.from(await workbook.xlsx.writeBuffer());
    const filename = 'DS KHÁCH ĐANG LƯU TRÚ.xlsx';

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    res.send(attachment);
  } catch (error) {
    console.error('Reservations Excel backup failed:', error);
    res.status(500).json({ error: 'Failed to create reservations Excel backup' });
  }
});

app.get('/api/v1/backup/download', async (_req, res) => {
  try {
    const data = readData();
    const collections = Object.entries(data).filter(
      (entry): entry is [string, any[]] => Array.isArray(entry[1])
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Hospitality Group Management';
    workbook.created = new Date();

    const info = workbook.addWorksheet('Backup Info');
    info.addRows([
      ['Hospitality Group Management - Data Backup'],
      ['Created at', new Date().toISOString()],
      ['Scope', 'All properties and all stored records'],
      ['Collection', 'Record count'],
      ...collections.map(([name, rows]) => [name, rows.length]),
      ['Total collections', collections.length],
      ['Total records', collections.reduce((sum, [, rows]) => sum + rows.length, 0)]
    ]);
    info.getRow(1).font = { bold: true, size: 16 };
    info.getRow(4).font = { bold: true };
    info.getColumn(1).width = 38;
    info.getColumn(2).width = 55;

    for (const [name, rows] of collections) {
      const sheetName = name === 'reservations'
        ? 'Khách Đang Lưu Trú'
        : name.replace(/[\\/?*:\[\]]/g, '-').slice(0, 31) || 'Data';
      const sheet = workbook.addWorksheet(sheetName);

      if (name === 'reservations') {
        const dateText = (value: any): string => {
          if (!value) return '';
          const raw = value instanceof Date
            ? value.toISOString().slice(0, 10)
            : String(value).slice(0, 10);
          const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          return match ? `${match[3]}/${match[2]}/${match[1]}` : String(value);
        };

        const utcDate = (value: any): number | null => {
          if (!value) return null;
          const raw = value instanceof Date
            ? value.toISOString().slice(0, 10)
            : String(value).slice(0, 10);
          const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if (!match) return null;
          return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        };

        sheet.columns = [
          { header: 'STT', key: 'stt', width: 8 },
          { header: 'PHÒNG', key: 'room', width: 14 },
          { header: 'HỌ-TÊN', key: 'guest', width: 30 },
          { header: 'CHECK-IN', key: 'checkIn', width: 16 },
          { header: 'CHECK-OUT', key: 'checkOut', width: 16 },
          { header: 'THỜI GIAN LƯU TRÚ', key: 'stay', width: 24 }
        ];

        sheet.addRows(rows.map((row, index) => {
          const start = utcDate(row.checkIn);
          const end = utcDate(row.checkOut);
          const stay = start === null || end === null
            ? ''
            : Math.round((end - start) / 86400000);

          return {
            stt: index + 1,
            room: row.room ?? '',
            guest: row.guest ?? '',
            checkIn: dateText(row.checkIn),
            checkOut: dateText(row.checkOut),
            stay
          };
        }));

        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF24476B' }
        };
        sheet.views = [{ state: 'frozen', ySplit: 1 }];
        sheet.autoFilter = {
          from: { row: 1, column: 1 },
          to: { row: 1, column: 6 }
        };
        continue;
      }

      const keys = [...new Set(rows.flatMap(row => Object.keys(row)))];

      if (!keys.length) {
        sheet.addRow(['No records']);
        continue;
      }

      sheet.columns = keys.map(key => ({
        header: key,
        key,
        width: Math.min(
          Math.max(key.length + 4, ...rows.map(row => String(row[key] ?? '').length + 2)),
          40
        )
      }));
      sheet.addRows(rows);
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF24476B' }
      };
      sheet.views = [{ state: 'frozen', ySplit: 1 }];
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: keys.length }
      };
    }

    const attachment = Buffer.from(await workbook.xlsx.writeBuffer());
    const filename = 'Tất Cả Tài Liệu.xlsx';

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    res.send(attachment);
  } catch (error) {
    console.error('Excel download failed:', error);
    res.status(500).json({ error: 'Could not create the Excel backup.' });
  }
});

app.post('/api/v1/backup/email', async (_req, res) => {
  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    const recipient = process.env.BACKUP_EMAIL_TO || 'xuther86@gmail.com';

    if (!gmailUser || !gmailPassword) {
      return res.status(500).json({
        error: 'Email is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.'
      });
    }

    const data = readData();
    const collections = Object.entries(data).filter(
      (entry): entry is [string, any[]] => Array.isArray(entry[1])
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Hospitality Group Management';
    workbook.created = new Date();

    const info = workbook.addWorksheet('Backup Info');
    info.addRows([
      ['Hospitality Group Management - Data Backup'],
      ['Created at', new Date().toISOString()],
      ['Recipient', recipient],
      ['Scope', 'All properties and all stored records'],
      ['Collection', 'Record count'],
      ...collections.map(([name, rows]) => [name, rows.length]),
      ['Total collections', collections.length],
      ['Total records', collections.reduce((sum, [, rows]) => sum + rows.length, 0)]
    ]);
    info.getRow(1).font = { bold: true, size: 16 };
    info.getRow(5).font = { bold: true };
    info.getColumn(1).width = 38;
    info.getColumn(2).width = 65;

    for (const [name, rows] of collections) {
      const sheetName = name.replace(/[\\/?*[\]:]/g, '-').slice(0, 31) || 'Data';
      const sheet = workbook.addWorksheet(sheetName);

      if (name === 'reservations') {
        const dateText = (value: any): string => {
          if (!value) return '';
          const raw = value instanceof Date
            ? value.toISOString().slice(0, 10)
            : String(value).slice(0, 10);
          const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          return match ? `${match[3]}/${match[2]}/${match[1]}` : String(value);
        };

        const utcDate = (value: any): number | null => {
          if (!value) return null;
          const raw = value instanceof Date
            ? value.toISOString().slice(0, 10)
            : String(value).slice(0, 10);
          const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if (!match) return null;
          return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        };

        sheet.columns = [
          { header: 'STT', key: 'stt', width: 8 },
          { header: 'PHÒNG', key: 'room', width: 14 },
          { header: 'HỌ-TÊN', key: 'guest', width: 30 },
          { header: 'CHECK-IN', key: 'checkIn', width: 16 },
          { header: 'CHECK-OUT', key: 'checkOut', width: 16 },
          { header: 'THỜI GIAN LƯU TRÚ', key: 'stay', width: 24 }
        ];

        sheet.addRows(rows.map((row, index) => {
          const start = utcDate(row.checkIn);
          const end = utcDate(row.checkOut);
          const stay = start === null || end === null
            ? ''
            : Math.round((end - start) / 86400000);

          return {
            stt: index + 1,
            room: row.room ?? '',
            guest: row.guest ?? '',
            checkIn: dateText(row.checkIn),
            checkOut: dateText(row.checkOut),
            stay
          };
        }));

        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF24476B' }
        };
        sheet.views = [{ state: 'frozen', ySplit: 1 }];
        sheet.autoFilter = {
          from: { row: 1, column: 1 },
          to: { row: 1, column: 6 }
        };
        continue;
      }

      const keys = [...new Set(rows.flatMap(row => Object.keys(row)))];

      if (!keys.length) {
        sheet.addRow(['No records']);
        continue;
      }

      sheet.columns = keys.map(key => ({
        header: key,
        key,
        width: Math.min(
          Math.max(key.length + 4, ...rows.map(row => String(row[key] ?? '').length + 2)),
          40
        )
      }));
      sheet.addRows(rows);
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF24476B' }
      };
      sheet.views = [{ state: 'frozen', ySplit: 1 }];
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: keys.length }
      };
    }

    const attachment = Buffer.from(await workbook.xlsx.writeBuffer());
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPassword }
    });

    await transporter.sendMail({
      from: gmailUser,
      to: recipient,
      subject: 'Hospitality Group Management - Excel Data Backup',
      text: 'Attached is the latest Excel backup covering all stored collections and properties. Keep this attachment secure.',
      attachments: [{
        filename: 'hospitality-group-backup-' +
          new Date().toISOString().replace(/[:.]/g, '-') + '.xlsx',
        content: attachment,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }]
    });

    res.json({
      message: 'Excel backup emailed successfully.',
      recipient,
      collections: collections.length,
      records: collections.reduce((sum, [, rows]) => sum + rows.length, 0)
    });
  } catch (error) {
    console.error('Email backup failed:', error);
    res.status(500).json({
      error: 'Could not create or email the backup. Check the server terminal for details.'
    });
  }
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Simulated endpoint not implemented yet.' }));
const port = Number(process.env.PORT || 4001);
app.listen(port, '0.0.0.0', () => {
  console.log(`Hotel management API listening on port ${port}`);
});
