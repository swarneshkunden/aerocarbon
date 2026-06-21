"use client";

import { motion } from "framer-motion";
import { Leaf, Activity, ArrowRight, Wind, Zap, Droplets, Target, ShieldCheck, TrendingDown } from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface DashboardData {
  todayEmissions: number;
  trend: number;
  weeklyData: { day: string; emissions: number }[];
  aiSuggestion: string;
  airQuality: string;
}

// --- C1: Suggested Actions Data ---
const ACTIONS_DATA = [
  { id: 1, icon: "🚌", title: "Take public transport today", saving: "2.1 kg CO₂e", category: "Transport", difficulty: "Easy", tip: "Replaces a 12km car trip" },
  { id: 2, icon: "🥗", title: "Try a plant-based meal", saving: "1.5 kg CO₂e", category: "Food", difficulty: "Easy", tip: "Beef = 10× more emissions than chicken" },
  { id: 3, icon: "💡", title: "Turn off standby devices", saving: "0.3 kg CO₂e", category: "Energy", difficulty: "Easy", tip: "Standby draws 5–10% of home electricity" },
  { id: 4, icon: "🚿", title: "Shorten shower by 2 mins", saving: "0.2 kg CO₂e", category: "Water", difficulty: "Easy", tip: "Hot water heating is energy-intensive" },
];

// --- C1: ActionCard component ---
function ActionCard({ action }: { action: typeof ACTIONS_DATA[0] }) {
  const [done, setDone] = React.useState(false);
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => setDone(!done)}
      className={`cursor-pointer p-4 rounded-2xl border transition-all ${
        done ? "bg-emerald-500/20 border-emerald-500/40" : "bg-slate-900/60 border-white/5 hover:border-white/10"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{action.icon}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{action.category}</span>
      </div>
      <p className="text-sm font-semibold text-white mb-1">{action.title}</p>
      <p className="text-xs text-slate-400 mb-3">{action.tip}</p>
      <div className="flex items-center justify-between">
        <span className="text-emerald-400 text-xs font-bold">−{action.saving}</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${done ? "bg-emerald-500 text-slate-950" : "bg-white/5 text-slate-400"}`}>
          {done ? "Done ✓" : "Mark done"}
        </span>
      </div>
    </motion.div>
  );
}

// --- H4: CategoryBar component ---
function CategoryBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8A8070', marginBottom: '3px' }}>
        <span>{label}</span><span>{pct}%</span>
      </div>
      <div style={{ height: '5px', background: '#D4CFBF', borderRadius: '3px' }}>
        <div style={{ height: '5px', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

// --- M1: InfoTooltip component ---
function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = React.useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ cursor: 'help', fontSize: '10px', color: '#8A8070', border: '1px solid #8A8070', borderRadius: '50%', padding: '0 4px', marginLeft: '4px' }}
      >?</span>
      {show && (
        <span style={{ position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)', background: '#1A3328', color: '#F7F3EA', fontSize: '11px', padding: '6px 10px', borderRadius: '8px', whiteSpace: 'nowrap', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          {text}
        </span>
      )}
    </span>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [liveSavings, setLiveSavings] = useState(0);
  const [chartData, setChartData] = useState<Array<{ time: string; value: number; ts: string }>>([]);
  const [viewMode, setViewMode] = useState<'consumed' | 'saved'>('consumed');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [simDays, setSimDays] = useState<number>(5);
  const [simTons, setSimTons] = useState<number>(185.9);
  const [gardenCount, setGardenCount] = useState<number>(0);
  const [user, setUser] = useState<{ email: string; userId: string } | null>(null);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiBase}/api/me`, {
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          setUser(json);
        }
      } catch (err) {
        // Not authenticated - that's okay
      }
    };

    fetchUser();
  }, []);

  async function handleLogout() {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await fetch(`${apiBase}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      router.push('/signin');
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  useEffect(() => {
    setMounted(true);
    
    // Fetch initial REST data (weekly consumed data will be used for day-wise 'Consumed' view)
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(d => {
        setData(d);
      })
      .catch(err => console.error("Failed to fetch dashboard data:", err));

    // Establish WebSocket Connection (robust: configurable URL, safe init/cleanup)
    let ws: WebSocket | null = null;
    try {
      const defaultWs = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss://localhost:4000" : "ws://localhost:4000";
      // Use NEXT_PUBLIC_WS_URL when provided for production or different hosts
      const wsUrl = (process && (process as any).env && (process as any).env.NEXT_PUBLIC_WS_URL) || defaultWs;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        // connection opened
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'INIT') {
            setLiveSavings(payload.data.liveEmissionsSaved);
            // seed chart with initial point
            const initialTs = payload.data.timestamp || new Date().toISOString();
            setChartData([{ time: new Date(initialTs).toLocaleString(), value: payload.data.liveEmissionsSaved, ts: initialTs }]);
            setLastUpdated(initialTs);
          } else if (payload.type === 'EMISSION_UPDATE') {
            // update cumulative saved value and append a timestamped point for the chart
            setLiveSavings(prev => {
              const next = +(prev + payload.data.newSavings).toFixed(2);
              try {
                const ts = payload.data.timestamp || new Date().toISOString();
                    setChartData(cd => {
                      const nextPoint = { time: new Date(ts).toLocaleString(), value: next, ts };
                      // keep up to 7 days at 24 points per day (~hourly) => 168 points
                      const capped = [...cd, nextPoint].slice(-168);
                      setLastUpdated(ts);
                      return capped;
                    });
              } catch (e) { /* ignore chart push errors */ }
              return next;
            });
          }
        } catch (e) {
          console.error("WS parse error", e);
        }
      };

      ws.onerror = (err) => {
        // avoid throwing — just surface a concise warning
        console.warn("WebSocket error connecting to", wsUrl, err);
      };

      ws.onclose = (ev) => {
        // Normal when backend isn't running; it's safe to ignore or retry later
        if (!ev.wasClean) {
          console.warn("WebSocket closed before connection established:", ev);
        }
      };
    } catch (e) {
      console.warn("Failed to initialize WebSocket:", e);
      ws = null;
    }

    return () => {
      try {
        if (ws && ws.readyState !== WebSocket.CLOSED) ws.close();
      } catch (e) {
        // ignore cleanup errors
      }
    };
  }, []);

  // animate garden count on mount
  useEffect(() => {
    let mounted = true;
    const target = 47;
    const duration = 900;
    const start = performance.now();
    function frame(now: number) {
      const p = Math.min((now - start) / duration, 1);
      if (mounted) setGardenCount(Math.round(target * p));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return () => { mounted = false; };
  }, []);

  // community slider calculation
  useEffect(() => {
    const tons = +(simDays * 2.6 * 14302 / 1000).toFixed(1);
    setSimTons(tons);
  }, [simDays]);

  // derive a day-wise series (last 7 days) depending on viewMode
  const daySeries = React.useMemo(() => {
    // consumed: use backend weeklyData directly (map day->value)
    if (viewMode === 'consumed') {
      if (!data?.weeklyData) return [];
      return data.weeklyData.map(d => ({ time: d.day, value: d.emissions, ts: '' }));
    }

    // saved: compute per-day deltas from cumulative chartData
    // build last 7 dates ending today
    const now = new Date();
    const days: { key: string; date: Date; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(now);
      dt.setDate(now.getDate() - i);
      dt.setHours(0, 0, 0, 0);
      days.push({ key: dt.toISOString().slice(0,10), date: dt, total: 0 });
    }

    if (!chartData || chartData.length < 2) {
      // not enough realtime points, return zeros for days
      return days.map(d => ({ time: d.date.toLocaleDateString(undefined, { weekday: 'short' }), value: 0, ts: d.date.toISOString() }));
    }

    // sort chartData by timestamp
    const sorted = [...chartData].sort((a,b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i-1];
      const cur = sorted[i];
      const delta = Math.max(0, cur.value - prev.value);
      const dayKey = new Date(cur.ts).toISOString().slice(0,10);
      const found = days.find(d => d.key === dayKey);
      if (found) found.total += delta;
    }

    return days.map(d => ({ time: d.date.toLocaleDateString(undefined, { weekday: 'short' }), value: +d.total.toFixed(2), ts: d.date.toISOString() }));
  }, [viewMode, data, chartData]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-400 animate-pulse">Loading AeroCarbon...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 font-sans">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Leaf className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400 tracking-tight">
              AeroCarbon
            </h1>
          </motion.div>

            <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            {user && (
              <>
                <div className="text-sm">
                  <div className="text-slate-400">Logged in as</div>
                  <div className="text-emerald-400 font-semibold">{user.email}</div>
                </div>
                <motion.button
                  type="button"
                  onClick={handleLogout}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="px-5 py-2.5 rounded-full text-sm font-medium bg-rose-500 hover:bg-rose-600 text-white transition-colors inline-block text-center"
                >
                  Sign Out
                </motion.button>
              </>
            )}
            {!user && (
              <motion.button
                type="button"
                onClick={() => router.push('/signin')}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="px-5 py-2.5 rounded-full text-sm font-medium bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md inline-block text-center"
              >
                Sign In
              </motion.button>
            )}
            <motion.button
              type="button"
              onClick={() => router.push('/calculate')}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="px-5 py-2.5 rounded-full text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] inline-block text-center"
            >
              Calculate Footprint
            </motion.button>
          </motion.div>
        </header>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-8 items-start mb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div style={{ borderRadius: '1rem', background: '#1A3328', color: '#F7F3EA', padding: '2rem' }} className="max-w-2xl shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-200">Your carbon garden</h3>
                  <p className="text-slate-200/60 text-sm mt-1">based on your actions this year</p>
                </div>
                <div className="hidden md:block w-10 h-10 rounded border border-emerald-700" />
              </div>

              <div className="mt-8 flex items-center gap-6">
                <div style={{ fontSize: '3rem', lineHeight: 1 }} className="font-extrabold">{gardenCount}</div>
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#C8E972' }}>trees worth absorbed</div>
                  <div style={{ fontSize: '0.9rem', color: '#9FC79F', marginTop: '0.5rem' }}>based on your actions this year</div>
                </div>
              </div>

              <div className="mt-8">
                <svg viewBox="0 0 300 110" style={{ width: '100%', height: '90px' }} role="img" aria-label="Illustration of overlapping circles representing trees in a growing carbon garden">
                  <circle cx="55" cy="78" r="42" fill="#2E5240" />
                  <circle cx="125" cy="55" r="52" fill="#3E6B52" />
                  <circle cx="200" cy="70" r="46" fill="#4A7D5F" />
                  <circle cx="262" cy="50" r="34" fill="#C8E972" />
                </svg>
              </div>
            </div>

            <div className="mt-6 md:mt-8">
              <motion.button onClick={() => router.push('/tracking')} whileHover={{ scale: 1.02 }} className="px-6 py-3 rounded-full bg-emerald-500 text-slate-950 font-bold mr-3">Start Tracking</motion.button>
              <motion.button onClick={() => router.push('/connect')} whileHover={{ scale: 1.02 }} className="px-5 py-3 rounded-full bg-white/5">Connect Device</motion.button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <div style={{ padding: '1rem', background: '#F7F3EA', borderRadius: '0.75rem' }}>
                <div style={{ fontSize: '0.9rem', color: '#8A8070' }}>Today</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontFamily: 'serif', fontSize: '1.75rem', color: '#1A3328' }}>
                    {data?.todayEmissions ?? 8.2}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#8A8070' }}>
                    kg CO₂e
                    <InfoTooltip text="CO₂ equivalent — measures all greenhouse gases in one unit" />
                  </span>
                </div>
                <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#1A3328', background: '#C8E972', padding: '4px 8px', borderRadius: '6px' }}>
                  ↓ 14% vs yesterday
                </div>
                <div style={{ marginTop: '12px' }}>
                  <CategoryBar label="Transport" pct={42} color="#E0714A" />
                  <CategoryBar label="Energy" pct={33} color="#1D9E75" />
                  <CategoryBar label="Food" pct={25} color="#C8E972" />
                </div>
              </div>

              <div style={{ padding: '1rem', background: '#22304A', borderRadius: '0.75rem' }}>
                <div style={{ fontSize: '0.9rem', color: '#C8E972' }}>Top 8%</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.6rem', color: '#F7F3EA' }}>in your city this month</div>
              </div>

              <div style={{ padding: '1rem', background: '#E0714A', borderRadius: '0.75rem', color: '#FBE3D5' }}>
                <div style={{ fontSize: '0.9rem' }}>current streak</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>12 days</div>
              </div>
              <div style={{ padding: '1rem', background: '#C8E972', borderRadius: '0.75rem', color: '#1A3328' }}>
                <div style={{ fontSize: '0.9rem' }}>until 250kg saved badge</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>3 kg to go</div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', background: '#F7F3EA', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                <div style={{ width: '18px', height: '18px', background: '#E0714A', borderRadius: '4px' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A3328' }}>What if everyone in your community joined you?</span>
              </div>
              <p style={{ fontSize: '13px', color: '#8A8070', margin: 0, marginBottom: '0.875rem' }}>Drag to see the impact if all 14,302 members took <span style={{ fontWeight: 600, color: '#1A3328' }}>{simDays}</span> extra car-free days this month.</p>
              <div style={{ marginTop: '0.5rem' }}>
                <input aria-label="community-days" type="range" min={0} max={10} step={1} value={simDays} onChange={(e) => setSimDays(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '1rem' }}>
                <span style={{ fontFamily: 'serif', fontSize: '2.25rem', color: '#1A3328' }}>{simTons}</span>
                <span style={{ fontSize: '14px', color: '#8A8070' }}>tonnes of CO2e saved community-wide</span>
              </div>
            </div>

            {/* H1: Weekly Emissions Chart */}
            {data?.weeklyData && data.weeklyData.length > 0 && (
              <div style={{ marginTop: '1rem', background: '#F7F3EA', borderRadius: '0.75rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A3328' }}>7-day emissions</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['consumed', 'saved'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: viewMode === mode ? '#1A3328' : 'transparent', color: viewMode === mode ? '#C8E972' : '#8A8070' }}
                      >
                        {mode === 'consumed' ? 'Consumed' : 'Saved'}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={daySeries} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1A3328" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1A3328" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#8A8070' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#8A8070' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1A3328', border: 'none', borderRadius: '8px', color: '#F7F3EA', fontSize: '12px' }} formatter={(v) => [`${v} kg CO₂e`]} />
                    <Area type="monotone" dataKey="value" stroke="#1A3328" strokeWidth={2} fill="url(#chartGrad)" dot={false} />
                    <ReferenceLine
                      y={daySeries.length > 0 ? Math.round(daySeries.reduce((s, d) => s + d.value, 0) / daySeries.length) : undefined}
                      stroke="#8A8070"
                      strokeDasharray="4 4"
                      label={{ value: 'avg', fill: '#8A8070', fontSize: 10 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Target, title: "Precision Tracking", desc: "Connect smart devices for automated, real-time emission logging across all your activities." },
            { icon: ShieldCheck, title: "Verified Offsets", desc: "Invest in gold-standard certified carbon offsetting projects globally with absolute transparency." },
            { icon: Droplets, title: "Resource Analytics", desc: "Deep dive into your water, energy, and transportation consumption with predictive AI models." }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
              className="p-8 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-900/60 transition-all hover:-translate-y-1 shadow-lg"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                <feature.icon className="w-7 h-7 text-emerald-400" />
              </div>
              <h4 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h4>
              <p className="text-slate-400 text-sm leading-relaxed font-light">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* C1: Suggested Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Today&apos;s suggested actions</h2>
            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
              Save up to 4.1 kg CO₂e today
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ACTIONS_DATA.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        </motion.div>

        {/* H2: AI Insight Banner */}
        {data?.aiSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <span className="text-emerald-400 mt-0.5">✦</span>
            <div>
              <div className="text-xs text-emerald-400 font-bold mb-1 uppercase tracking-wider">AI Insight</div>
              <p className="text-sm text-slate-200">{data.aiSuggestion}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
