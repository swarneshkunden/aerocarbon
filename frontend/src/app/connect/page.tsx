"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ConnectDevicePage() {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState("");
  const [kwh, setKwh] = useState<number | ''>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const parsed = Number(kwh);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Enter a valid kWh value');
      return;
    }
    const deviceToSend = deviceId || selectedDevice || undefined;
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/connect-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: deviceToSend, kwh: parsed, registerDevice: true })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'request failed');
      setResult(json);
      // navigate to tracking so user sees saved device and live status
      router.push('/tracking');
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function fetchDevices() {
      setDevicesLoading(true);
      try {
        const res = await fetch('/api/proxy/devices');
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'failed to fetch devices');
        if (!cancelled) setDevices(json.map((d: any) => ({ id: d.externalId || d.id, name: d.name })));
      } catch (e: any) {
        if (!cancelled) setError('Failed to load devices: ' + (e?.message || String(e)));
      } finally {
        if (!cancelled) setDevicesLoading(false);
      }
    }
    fetchDevices();
    const id = setInterval(fetchDevices, 8000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  async function deleteDevice() {
    const id = selectedDevice;
    if (!id) return;
    if (!confirm(`Delete device "${id}"? This will remove its readings.`)) return;
    setDeleting(true);
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;
      if (apiKey) headers['x-api-key'] = apiKey;
      const res = await fetch(`/api/proxy/devices/${encodeURIComponent(id)}`, { method: 'DELETE', headers });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'delete failed');
      setDevices(prev => prev.filter(d => d.id !== id));
      setSelectedDevice('');
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto w-full p-8 bg-slate-900/60 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold">Connect Device</h1>
            <p className="text-slate-400 text-sm md:text-base">Submit a kWh reading and see the computed kg CO₂e using the server-side emission factor.</p>
          </div>
          <motion.button
            type="button"
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 360 }}
            aria-label="Back to home"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white text-sm font-semibold shadow-[0_8px_30px_rgba(99,102,241,0.12)] hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/30 flex-shrink-0 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" />
            </svg>
            <span>Back to Home</span>
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="flex flex-col">
            <span className="text-sm text-slate-400 mb-1">Choose existing device</span>
            <select value={selectedDevice} onChange={e => setSelectedDevice(e.target.value)} className="px-3 py-2 rounded bg-slate-800 border border-white/5">
              <option value="">-- create new device --</option>
              {devices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.id})</option>)}
            </select>
          </label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => { setDeviceId(selectedDevice || ''); }} className="px-3 py-2 rounded bg-white/5">Use Selected</button>
            <button type="button" onClick={deleteDevice} disabled={!selectedDevice || deleting} className="px-3 py-2 rounded bg-rose-600 text-white">{deleting ? 'Deleting...' : 'Delete Device'}</button>
          </div>
          <label className="flex flex-col">
            <span className="text-sm text-slate-400 mb-1">Device ID (optional)</span>
            <input value={deviceId} onChange={e => setDeviceId(e.target.value)} className="px-3 py-2 rounded bg-slate-800 border border-white/5" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-slate-400 mb-1">Energy (kWh)</span>
            <input value={kwh} onChange={e => setKwh(e.target.value === '' ? '' : Number(e.target.value))} type="number" step="0.001" className="px-3 py-2 rounded bg-slate-800 border border-white/5" />
          </label>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-emerald-500 text-slate-900 font-bold">{loading ? 'Sending...' : 'Send'}</button>
            <button type="button" onClick={() => { setDeviceId(''); setKwh(''); setResult(null); setError(null); }} className="px-4 py-2 rounded bg-white/5">Reset</button>
          </div>

          {error && <div className="text-rose-400">{error}</div>}

          {result && (
            <div className="mt-4 p-4 rounded bg-slate-800 border border-white/5">
              <div><strong>Device:</strong> {result.deviceId}</div>
              <div><strong>kWh:</strong> {result.kwh}</div>
              <div><strong>kg CO₂e:</strong> {result.kgCO2e} kg</div>
              <div className="text-slate-400 text-sm">Emission factor: {result.factor} kgCO₂e/kWh</div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
