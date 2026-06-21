import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as bcrypt from 'bcrypt';
import * as dns from 'dns'; 
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { docsHtml } from './docsHtml';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Initialize Prisma client
let prisma: PrismaClient | null = null;
let usePrisma = false;
try {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  });
  prisma = new PrismaClient({ adapter });
  usePrisma = true;
  console.log('[prisma] Prisma client loaded successfully');
} catch (e) {
  console.error('[prisma] Failed to load Prisma client:', e);
  console.log('[prisma] Using in-memory stores as fallback');
}

const dnsPromises = dns.promises;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function isValidEmail(email: string): Promise<{ valid: boolean; reason?: string }> {
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return { valid: false, reason: 'Please enter a valid email address.' };
  }
  const domain = email.split('@')[1];
  if (!domain) {
    return { valid: false, reason: 'Please enter a valid email address.' };
}
  try {
    const records = await dnsPromises.resolveMx(domain);
    
    if (!records || records.length === 0) {
      return { valid: false, reason: 'This email domain cannot receive mail.' };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, reason: 'This email domain does not exist.' };
  }
}


// small helper: require API key if configured
function requireApiKey(req: Request, res: Response, next: NextFunction) {

// small helper: require API key if configured
function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const required = process.env.API_KEY;
  if (!required) return next();
  const sent = (req.headers['x-api-key'] || req.query.apiKey) as string | undefined;
  if (sent !== required) return res.status(401).json({ error: 'unauthorized' });
  return next();
}
}

// Create HTTP server to share with WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// WebSocket Connection Logic
wss.on('connection', (ws: WebSocket) => {
  console.log('[websocket]: New client connected');
  
  // Send initial real-time data
  ws.send(JSON.stringify({ type: 'INIT', data: { activeUsers: 1420, liveEmissionsSaved: 2450.5 } }));

  // Send current devices snapshot on connect (DB or in-memory)
  (async () => {
    try {
      const devices = await getDevicesSnapshot();
      ws.send(JSON.stringify({ type: 'DEVICES', data: devices }));
    } catch (e) {
      // ignore
    }
  })();

  // Simulate incoming real-time events (e.g. connected devices sending data)
  const interval = setInterval(() => {
    const randomSaved = +(Math.random() * 5).toFixed(2);
    ws.send(JSON.stringify({ 
      type: 'EMISSION_UPDATE', 
      data: { 
        newSavings: randomSaved,
        timestamp: new Date().toISOString()
      } 
    }));
  }, 5000);

  // Periodically push devices snapshot as well (so clients get updates even if no change)
  const devicesInterval = setInterval(async () => {
    try {
      const devices = await getDevicesSnapshot();
      ws.send(JSON.stringify({ type: 'DEVICES', data: devices }));
    } catch (e) {
      // no-op
    }
  }, 8000);

  ws.on('close', () => {
    console.log('[websocket]: Client disconnected');
    clearInterval(interval);
    clearInterval(devicesInterval);
  });
});

// In-memory stores (fallback)
type DeviceRecord = { id: string; name: string; status: 'online' | 'offline'; lastSeen: string; currentPower?: number | undefined };
const devicesStore: Record<string, DeviceRecord> = {};
const readingsStore: Array<{ deviceId: string; kwh: number; kgCO2e: number; timestamp: string }> = [];

// Seed in-memory devices on startup so WebSocket clients receive an initial snapshot
if (!usePrisma && Object.keys(devicesStore).length === 0) {
  const seeded = [
    { id: 'main-meter', name: 'Main Meter' },
    { id: 'solar', name: 'Solar Inverter' },
    { id: 'ev-charger', name: 'EV Charger' },
    { id: 'heat-pump', name: 'Heat Pump' },
  ];
  seeded.forEach((d, i) => {
    const online = i % 3 !== 0;
    devicesStore[d.id] = { id: d.id, name: d.name, status: online ? 'online' : 'offline', lastSeen: new Date(Date.now() - Math.floor(Math.random() * 10 * 60 * 1000)).toISOString(), currentPower: online ? +(Math.random() * 3).toFixed(3) : undefined };
  });
}

// Simple session store (in-memory) for local dev auth - kept for in-memory fallback
type Session = { id: string; username: string; createdAt: string; userId?: string };
const sessionsStore: Record<string, Session> = {};

function parseCookies(header?: string | string[] | undefined): Record<string, string> {
  const raw = Array.isArray(header) ? header.join(';') : (header || '');
  return raw
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .reduce((acc: Record<string, string>, pair) => {
      const parts = pair.split('=');
      const k = (parts.shift() || '').trim();
      if (!k) return acc;
      const v = parts.join('=');
      try {
        acc[k] = decodeURIComponent(v || '');
      } catch (e) {
        acc[k] = v || '';
      }
      return acc;
    }, {});
}

async function getSessionFromReq(req: Request): Promise<Session | null> {
  const cookies = parseCookies(req.headers?.cookie as any);
  const sid = cookies['session'];
  if (!sid) return null;
  
  // Check database first if available
  if (usePrisma && prisma) {
    try {
      const dbSession = await prisma.session.findUnique({
        where: { id: sid },
        include: { user: true }
      });
      
      if (dbSession && dbSession.expiresAt > new Date()) {
        return {
          id: dbSession.id,
          username: dbSession.user.email,
          createdAt: dbSession.createdAt.toISOString(),
          userId: dbSession.userId
        };
      }
      // Session expired, delete it
      if (dbSession) {
        await prisma.session.delete({ where: { id: sid } });
      }
      return null;
    } catch (e) {
      return null;
    }
  }
  
  // Fallback to in-memory
  return sessionsStore[sid] || null;
}

// Auth endpoints with password hashing and database sessions

app.post('/api/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'missing email or password' });
    const emailCheck = await isValidEmail(String(email));
    if (!emailCheck.valid) return res.status(400).json({ error: emailCheck.reason });
    if (!usePrisma || !prisma) {
      return res.status(503).json({ error: 'Signup unavailable - database not configured' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
    }
    const passwordHash = await bcrypt.hash(String(password), 10);
    const newUser = await prisma.user.create({
      data: { email, name: email.split('@')[0], passwordHash }
    });
    const sessionToken = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: { id: sessionToken, userId: newUser.id, token: sessionToken, expiresAt }
    });
    res.cookie('session', sessionToken, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' });
    return res.status(201).json({ ok: true, email: newUser.email });
  } catch (e) {
    console.error('signup error', e);
    return res.status(500).json({ error: 'internal' });
  }
});

app.post('/api/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'missing email or password' });
    if (!usePrisma || !prisma) {
      return res.status(503).json({ error: 'Sign-in unavailable - database not configured' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email. Please sign up first.' });
    }
    const passwordValid = await bcrypt.compare(String(password), user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }
    const sessionToken = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: { id: sessionToken, userId: user.id, token: sessionToken, expiresAt }
    });
    res.cookie('session', sessionToken, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' });
    return res.status(200).json({ ok: true, email: user.email });
  } catch (e) {
    console.error('signin error', e);
    return res.status(500).json({ error: 'internal' });
  }
});

app.post('/api/logout', async (req: Request, res: Response) => {
  try {
    const cookies = parseCookies(req.headers?.cookie as any);
    const sid = cookies['session'];
    
    if (usePrisma && prisma && sid) {
      // Delete from database
      await prisma.session.delete({ where: { id: sid } }).catch(() => {});
    } else if (sid) {
      // Delete from in-memory store
      delete sessionsStore[sid];
    }
    
    res.cookie('session', '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      expires: new Date(0)
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'internal' });
  }
});

// Helper to get devices snapshot (DB or in-memory)
async function getDevicesSnapshot() {
  if (usePrisma && prisma) return await prisma.device.findMany();
  return Object.values(devicesStore);
}

// Broadcast helper for devices (reads from DB or in-memory)
async function broadcastDevices() {
  try {
    const devices = await getDevicesSnapshot();
    const payload = JSON.stringify({ type: 'DEVICES', data: devices });
    wss.clients.forEach(client => {
      try { if ((client as any).readyState === WebSocket.OPEN) client.send(payload); } catch (e) { /* ignore */ }
    });
  } catch (e) {
    // ignore
  }
}

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'carbon-api', timestamp: new Date().toISOString() });
});

// Interactive API Documentation
app.get('/docs', (req: Request, res: Response) => {
  res.send(docsHtml);
});

// Mock Dashboard Endpoint for Frontend Integration
app.get('/api/dashboard', async (req: Request, res: Response) => {
  try {
    const session = await getSessionFromReq(req);

    // Build weekly data from real readings if available
    let weeklyData = [
      { day: 'Mon', emissions: 6.2 }, { day: 'Tue', emissions: 9.4 },
      { day: 'Wed', emissions: 7.1 }, { day: 'Thu', emissions: 11.2 },
      { day: 'Fri', emissions: 8.8 }, { day: 'Sat', emissions: 6.5 },
      { day: 'Sun', emissions: 8.2 }
    ];
    let todayEmissions = 8.2;
    const trend = -14;

    if (usePrisma && prisma && session?.userId) {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);

      const readings = await prisma.reading.findMany({
        where: { userId: session.userId, timestamp: { gte: sevenDaysAgo } },
        orderBy: { timestamp: 'asc' }
      });

      if (readings.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayMap: Record<string, number> = {};
        readings.forEach((r: any) => {
          const dayIndex = new Date(r.timestamp).getDay();
          const day = dayNames[dayIndex] || 'Unknown';
          dayMap[day] = (dayMap[day] || 0) + r.kgCO2e;
        });
        weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
          day, emissions: Math.round((dayMap[day] || 0) * 10) / 10
        }));

        // today's total
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayReadings = readings.filter((r: any) => new Date(r.timestamp) >= todayStart);
        if (todayReadings.length > 0) {
          todayEmissions = Math.round(todayReadings.reduce((sum: number, r: any) => sum + r.kgCO2e, 0) * 10) / 10;
        }
      }
    }

    // Generate personalized AI suggestion based on today's total
    let aiSuggestion = 'Turn down AC to save 2 kg CO₂e';
    if (todayEmissions > 10) {
      aiSuggestion = 'High emissions today — try public transport tomorrow to save ~2.1 kg CO₂e';
    } else if (todayEmissions < 5) {
      aiSuggestion = 'Great low-emission day! Sustain it by planning meals at home tonight.';
    }

    return res.status(200).json({
      todayEmissions,
      unit: 'kg CO2e',
      trend,
      weeklyData,
      aiSuggestion,
      airQuality: 'Excellent'
    });
  } catch (e) {
    console.error('dashboard error', e);
    return res.status(500).json({ error: 'internal' });
  }
});

// Connect Device Endpoint - accepts kWh readings and returns kgCO2e
app.post('/api/connect-device', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { deviceId, kwh, timestamp, registerDevice } = req.body || {};

    if (typeof kwh !== 'number' || isNaN(kwh)) {
      return res.status(400).json({ error: 'Invalid or missing `kwh` in request body' });
    }

    // Emission factor (kgCO2e per kWh) - configurable via env
    const FACTOR = parseFloat(process.env.EMISSION_FACTOR || process.env.FACTOR || '0.45');

    const kgCO2e = +(kwh * FACTOR).toFixed(3);
    // Persist reading to DB. Only update device registry when `registerDevice` is truthy.
    const ts = timestamp || new Date().toISOString();
    const id = deviceId || 'unknown';
    const currentPower = +(Math.random() * 3).toFixed(3);
    
    // Get authenticated user if available
    const session = await getSessionFromReq(req);
    
    // save reading in DB / store
    if (usePrisma && prisma) {
      // Find device by externalId to get its internal UUID (required for FK in Reading)
      let device = await prisma.device.findUnique({ where: { externalId: id } });
      if (!device) {
        // Auto-create device if not found
        const deviceData: any = {
          externalId: id,
          name: id === 'unknown' ? 'Unknown Device' : id.replace(/[-_]/g, ' '),
          status: 'online',
          lastSeen: new Date(ts),
          currentPower: Number(currentPower),
        };
        if (session?.userId) deviceData.userId = session.userId;
        device = await prisma.device.create({ data: deviceData });
      }
      // Use internal device.id (UUID) for Reading FK, not externalId
      const readingData: any = { deviceId: device.id, kwh, kgCO2e, timestamp: new Date(ts) };
      if (session?.userId) {
        readingData.userId = session.userId;
      }
      await prisma.reading.create({ data: readingData });
      
      if (registerDevice) {
        // Create device with userId if authenticated
        const deviceData: any = { 
          externalId: id, 
          name: id === 'unknown' ? 'Unknown Device' : id.replace(/[-_]/g, ' '), 
          status: 'online', 
          lastSeen: new Date(ts), 
          currentPower: Number(currentPower) 
        };
        if (session?.userId) {
          deviceData.userId = session.userId;
        }
        
        const updateData: any = { lastSeen: new Date(ts), status: 'online', currentPower: Number(currentPower) };
        if (session?.userId) {
          updateData.userId = session.userId;
        }
        
        await prisma.device.upsert({
          where: { externalId: id },
          update: updateData,
          create: deviceData,
        });
        try { await broadcastDevices(); } catch (e) { /* ignore */ }
      }
    } else {
      readingsStore.unshift({ deviceId: id, kwh, kgCO2e, timestamp: ts });
      if (registerDevice) {
        const existing = devicesStore[id];
        devicesStore[id] = { id, name: existing?.name || (id === 'unknown' ? 'Unknown Device' : id.replace(/[-_]/g, ' ')), status: 'online', lastSeen: ts, currentPower };
        try { broadcastDevices(); } catch (e) { /* ignore */ }
      }
    }

    return res.status(200).json({ deviceId: id, kwh, kgCO2e, timestamp: ts, factor: FACTOR });
  } catch (e) {
    console.error('connect-device error', e);
    return res.status(500).json({ error: 'internal' });
  }
});

// Devices Endpoint - mock/demo data for frontend status panel
app.get('/api/devices', async (req: Request, res: Response) => {
  try {
    // Get authenticated user if available
    const session = await getSessionFromReq(req);
    
    if (usePrisma && prisma) {
      // If user is authenticated, show only their devices
      if (session?.userId) {
        const userDevices = await prisma.device.findMany({
          where: { userId: session.userId }
        });
        // Keep all user devices online when authenticated
        return res.status(200).json(userDevices.map((d: any) => ({
          ...d,
          status: 'online',
          lastSeen: d.lastSeen || new Date()
        })));
      }
      
      // If not authenticated, show default devices
      const existing = await prisma.device.findMany({ where: { userId: null } });
      if (existing.length === 0) {
        const seeded = [
          { externalId: 'main-meter', name: 'Main Meter' },
          { externalId: 'solar', name: 'Solar Inverter' },
          { externalId: 'ev-charger', name: 'EV Charger' },
          { externalId: 'heat-pump', name: 'Heat Pump' },
        ];
        for (const [i, d] of seeded.entries()) {
          const online = i % 3 !== 0;
          await prisma.device.create({ data: { externalId: d.externalId, name: d.name, status: online ? 'online' : 'offline', lastSeen: new Date(Date.now() - Math.floor(Math.random() * 10 * 60 * 1000)), currentPower: online ? +(Math.random() * 3) : null } });
        }
      }
      const devices = await prisma.device.findMany({ where: { userId: null } });
      return res.status(200).json(devices);
    }

    // in-memory fallback: seed if empty
    if (Object.keys(devicesStore).length === 0) {
      const seeded = [
        { id: 'main-meter', name: 'Main Meter' },
        { id: 'solar', name: 'Solar Inverter' },
        { id: 'ev-charger', name: 'EV Charger' },
        { id: 'heat-pump', name: 'Heat Pump' },
      ];
      seeded.forEach((d, i) => {
        const online = i % 3 !== 0;
        devicesStore[d.id] = { id: d.id, name: d.name, status: online ? 'online' : 'offline', lastSeen: new Date(Date.now() - Math.floor(Math.random() * 10 * 60 * 1000)).toISOString(), currentPower: online ? +(Math.random() * 3).toFixed(3) : undefined };
      });
    }
    return res.status(200).json(Object.values(devicesStore));
  } catch (e) {
    console.error('devices error', e);
    return res.status(500).json({ error: 'internal' });
  }
});

// Delete a device and its readings
app.delete('/api/devices/:externalId', requireApiKey, async (req: Request, res: Response) => {
  try {
    const rawExternalId = (req.params as any).externalId;
    const externalId = Array.isArray(rawExternalId) ? rawExternalId[0] : rawExternalId;
    if (!externalId || typeof externalId !== 'string') return res.status(400).json({ error: 'missing externalId' });

    // Get authenticated user if available
    const session = await getSessionFromReq(req);
    
    if (usePrisma && prisma) {
      // Check if device exists and user has permission
      const device = await prisma.device.findUnique({ where: { externalId } });
      if (!device) return res.status(404).json({ error: 'device not found' });
      
      // Only allow deletion if user owns the device or device has no owner
      if (device.userId && device.userId !== session?.userId) {
        return res.status(403).json({ error: 'unauthorized - device belongs to another user' });
      }
      
      await prisma.reading.deleteMany({ where: { deviceId: externalId } }).catch(() => {});
      await prisma.device.delete({ where: { externalId } });
    } else {
      // remove readings for the device
      for (let i = readingsStore.length - 1; i >= 0; i--) {
        const row = readingsStore[i];
        if (row && row.deviceId === externalId) readingsStore.splice(i, 1);
      }
      delete devicesStore[externalId];
    }

    try { await broadcastDevices(); } catch (e) { /* ignore */ }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('delete-device error', e);
    return res.status(500).json({ error: 'internal' });
  }
});

// Readings endpoint for debugging/consumption
app.get('/api/readings', requireApiKey, async (req: Request, res: Response) => {
  try {
    if (usePrisma && prisma) {
      const rows = await prisma.reading.findMany({ orderBy: { timestamp: 'desc' }, take: 100 });
      return res.status(200).json(rows.map((r: any) => ({ deviceId: r.deviceId, kwh: r.kwh, kgCO2e: r.kgCO2e, timestamp: r.timestamp })));
    }
    return res.status(200).json(readingsStore.slice(0, 100));
  } catch (e) {
    console.error('readings error', e);
    return res.status(500).json({ error: 'internal' });
  }
});

server.listen(PORT, () => {
  console.log(`[server]: API Service is running at http://localhost:${PORT}`);
  console.log(`[server]: WebSocket server is active on ws://localhost:${PORT}`);
});
