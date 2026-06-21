"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function TrackingPage() {
  const router = useRouter();
  const [deviceId, setDeviceId] = React.useState("");
  const [kwh, setKwh] = React.useState<number | "">("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [readings, setReadings] = React.useState<Array<{ deviceId: string; kwh: number; kgCO2e: number; timestamp: string }>>([]);
  const [devices, setDevices] = React.useState<Array<{ id: string; name: string; status: string; lastSeen: string; currentPower?: number }>>([]);
  const [devicesLoading, setDevicesLoading] = React.useState(false);
  const [devicesError, setDevicesError] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<{ email: string; userId: string } | null>(null);
  const [userLoading, setUserLoading] = React.useState(true);

  // Fetch current user
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiBase}/api/me`, {
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          setUser(json);
        } else {
          // Not authenticated, redirect to signin
          router.push('/signin');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        router.push('/signin');
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  async function handleLogout() {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await fetch(`${apiBase}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/signin');
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  async function submitReading(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = Number(kwh);
    if (isNaN(value) || value <= 0) {
      setError("Enter a valid kWh value");
      return;
    }

    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiBase}/api/connect-device`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ deviceId: deviceId || undefined, kwh: value, registerDevice: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "request failed");

      const newReading = { deviceId: json.deviceId || "unknown", kwh: json.kwh, kgCO2e: json.kgCO2e, timestamp: json.timestamp };
      setReadings(prev => [newReading, ...prev].slice(0, 10));
      setKwh("");
      setDeviceId("");
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  // Use WebSocket push updates for device status
  React.useEffect(() => {
    let mounted = true;
    setDevicesLoading(true);
    setDevicesError(null);

    // Prefer explicit WS URL, then API URL (useful in Docker), then localhost:4000
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL || `${location.protocol}//localhost:4000`;
    const wsUrl = baseUrl.replace(/^http/, 'ws');

    let ws: WebSocket | null = null;
    let attempts = 0;
    let reconnectTimer: any = null;

    const connect = () => {
      if (!mounted) return;
      attempts += 1;
      try {
        ws = new WebSocket(wsUrl);
      } catch (err: any) {
        setDevicesError('Unable to create WebSocket');
        setDevicesLoading(false);
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        attempts = 0;
        setDevicesLoading(false);
        setDevicesError(null);
        console.debug('[ws] connected');
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string);
          if (msg?.type === 'DEVICES') {
            setDevices(msg.data || []);
            setDevicesError(null);
          }
        } catch (e) {
          // ignore malformed messages
        }
      };

      ws.onerror = (e) => {
        console.warn('[ws] error', e);
        setDevicesError('WebSocket error');
      };

      ws.onclose = (ev) => {
        console.info('[ws] closed', ev?.code, ev?.reason);
        if (mounted) scheduleReconnect();
      };
    };

    const scheduleReconnect = () => {
      if (reconnectTimer) return;
      const delay = Math.min(1000 * Math.pow(2, attempts), 20000); // exponential backoff up to 20s
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, delay);
    };

    connect();

    return () => {
      mounted = false;
      try { if (reconnectTimer) clearTimeout(reconnectTimer); } catch (e) {}
      try { ws?.close(); } catch (e) { /* ignore */ }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full p-8 bg-slate-900/60 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Start Tracking</h1>
            <p className="text-slate-400 text-sm md:text-base">Connect devices or submit quick manual readings to estimate emissions.</p>
            {user && <p className="text-emerald-400 text-sm mt-2">Logged in as: <span className="font-bold">{user.email}</span></p>}
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              <Link href="/connect" className="inline-block px-4 py-2 rounded bg-white/5 text-sm hover:bg-white/10">Connect Device</Link>
            <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white text-sm font-semibold shadow-[0_8px_30px_rgba(99,102,241,0.12)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.2)] transition-all whitespace-nowrap"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" /></svg><span>Back to Home</span></Link>
              {user && <button onClick={handleLogout} className="inline-block px-4 py-2 rounded bg-rose-500 text-white font-bold text-sm whitespace-nowrap hover:bg-rose-600">Sign Out</button>}
            </div>
          </div>
        </div>

        <div className="mb-6 p-6 bg-slate-900/40 rounded-2xl">
          <h3 className="text-xl font-bold mb-3">Devices</h3>
          {devicesLoading ? (
            <div className="text-slate-400">Loading devices...</div>
          ) : devices.length === 0 ? (
            <div className="text-slate-400">No devices discovered yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {devices.map((d) => {
                const last = d.lastSeen ? new Date(d.lastSeen).getTime() : 0;
                const now = Date.now();
                const TEN_MIN = 10 * 60 * 1000;
                const isOnline = (typeof d.currentPower === 'number' && d.currentPower > 0) || (now - last < TEN_MIN);
                const statusLabel = isOnline ? 'online' : 'offline';
                return (
                  <div key={d.id} className="p-4 bg-slate-900/60 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="font-bold">{d.name}</div>
                      <div className={`text-xs px-2 py-1 rounded ${isOnline ? 'bg-emerald-600 text-slate-900' : 'bg-rose-600 text-white'}`}>{statusLabel}</div>
                    </div>
                    <div className="text-slate-400 text-sm mt-2">{d.lastSeen ? new Date(d.lastSeen).toLocaleString() : '—'}</div>
                    <div className="text-slate-200 text-sm mt-2">{d.currentPower ? `${d.currentPower} kW` : ''}</div>
                  </div>
                );
              })}
            </div>
          )}
          {devicesError && <div className="text-rose-400 mt-2">{devicesError}</div>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-900/40 rounded">
            <h3 className="font-bold mb-3">Manual Tracking</h3>
            <form onSubmit={submitReading} className="grid gap-3">
              <label className="flex flex-col">
                <span className="text-sm text-slate-400 mb-1">Device ID (optional)</span>
                <input value={deviceId} onChange={e => setDeviceId(e.target.value)} className="px-3 py-2 rounded bg-slate-800 border border-white/5" placeholder="e.g. kitchen-meter" />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-slate-400 mb-1">Energy (kWh)</span>
                <input value={kwh} onChange={e => setKwh(e.target.value === '' ? '' : Number(e.target.value))} type="number" step="0.001" className="px-3 py-2 rounded bg-slate-800 border border-white/5" placeholder="e.g. 1.25" />
              </label>

              <div className="flex items-center gap-3 mt-2">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring' }} type="submit" disabled={loading} className="px-4 py-2 rounded bg-emerald-500 text-slate-900 font-bold">{loading ? 'Sending...' : 'Submit Reading'}</motion.button>
                <button type="button" onClick={() => { setDeviceId(''); setKwh(''); setError(null); }} className="px-4 py-2 rounded bg-white/5">Reset</button>
              </div>

              {error && <div className="text-rose-400 mt-2">{error}</div>}
            </form>
          </div>

          <div className="p-4 bg-slate-900/40 rounded">
            <h3 className="font-bold mb-3">Recent Readings</h3>
            {readings.length === 0 ? (
              <div className="text-slate-400">No manual readings yet — submit one on the left or connect a device.</div>
            ) : (
              <ul className="space-y-3">
                {readings.map((r, idx) => (
                  <li key={idx} className="p-3 bg-slate-900/60 rounded flex justify-between items-center">
                    <div>
                      <div className="font-bold">{r.deviceId}</div>
                      <div className="text-slate-400 text-sm">{new Date(r.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{r.kgCO2e} kg</div>
                      <div className="text-slate-400 text-sm">{r.kwh} kWh</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
