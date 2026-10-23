import 'dotenv/config';
import express from 'express';
import webpush from 'web-push';
import ExcelJS from 'exceljs';
import nodemailer from 'nodemailer';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

function addActivity(data: AnyRecord, text: string, details: any[] = []) {
  data.activity.unshift({
    id: Date.now() + Math.random(),
    text,
    by: 'Demo User',
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
app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok', mode: 'simulated-api', warning: 'Demo data only' }));
app.get('/api/v1/auth/me', (_req, res) => res.json({ data: { id: 'demo-owner', name: 'Business Owner', role: 'Owner', permissions: ['*'] } }));
app.post('/api/v1/auth/login', (_req, res) => res.json({ data: { user: { id: 'demo-owner', name: 'Business Owner', role: 'Owner' }, demo: true, message: 'Demo login only; authentication is not implemented.' } }));

app.get('/api/v1/properties', (_req, res) => res.json({ data: readData().properties }));
app.get('/api/v1/dashboard/overview', (req, res) => {
  const d = readData();
  const propertyId = String(req.query.property_id || 'all');
  const properties = propertyId === 'all' ? d.properties : d.properties.filter((p: AnyRecord) => p.id === propertyId);
  const reservations = propertyId === 'all' ? d.reservations : d.reservations.filter((x: AnyRecord) => x.propertyId === propertyId);
  const employees = d.employees;
  const revenue = reservations
    .filter((r: AnyRecord) => r.status === 'Checked out')
    .reduce((sum: number, r: AnyRecord) => sum + Number(r.amount || 0), 0);
  const rooms = properties.reduce((s: number, p: AnyRecord) => s + p.rooms, 0);
  const weighted = properties.reduce((s: number, p: AnyRecord) => s + p.rooms * p.occupancy, 0);
  res.json({ data: {
    revenue, operatingProfit: Math.round(revenue * 0.30), occupancy: rooms ? Math.round(weighted / rooms) : 0,
    employeeCount: employees.length, arrivals: reservations.filter((r: AnyRecord) => r.status === 'Arriving today').length,
    departures: reservations.filter((r: AnyRecord) => r.checkOut === '2026-10-19').length,
    properties, reservations: reservations.slice(0, 5), tasks: d.tasks, activity: d.activity,
    revenueTrend: [
      { month: 'May', hotelA: 1120, hotelB: 890 }, { month: 'Jun', hotelA: 1180, hotelB: 930 },
      { month: 'Jul', hotelA: 1320, hotelB: 970 }, { month: 'Aug', hotelA: 1250, hotelB: 1010 },
      { month: 'Sep', hotelA: 1370, hotelB: 980 }, { month: 'Oct', hotelA: 1400, hotelB: 1000 }
    ]
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
    amount: Number(body.amount || 0)
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
    { key: 'amount', label: 'Amount' }
  ]));
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
    'guests', 'amount', 'source'
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
    { key: 'amount', label: 'Amount' }
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
        addActivity(d, `Room ${room.number} updated automatically after reservation ${item.id} was ${body.status.toLowerCase()}`, automaticRoomChanges);
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
      reservationChanges
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
  ]);

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
    ]);
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
    ]);
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
const port = Number(process.env.PORT || 4000);
app.listen(port, '0.0.0.0', () => {
  console.log(`Hotel management API listening on port ${port}`);
});
