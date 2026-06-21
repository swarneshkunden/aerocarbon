"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Simple emission factors (configurable later)
const FACTORS = {
  electricity: 0.45, // kg CO2e per kWh
  naturalGas: 2.0,   // kg CO2e per m3 (approximate)
  car: 0.20,         // kg CO2e per km (approx average)
  flight: 0.255,     // kg CO2e per km (economy short-haul)
  meatMeals: 3.3,    // kg CO2e per meat-based meal
};

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

export default function CalculatePage() {
  const [electricity, setElectricity] = useState<number | "">("");
  const [gas, setGas] = useState<number | "">("");
  const [carKm, setCarKm] = useState<number | "">("");
  const [flightKm, setFlightKm] = useState<number | "">("");
  const [meatMeals, setMeatMeals] = useState<number | "">("");
  const [result, setResult] = useState<null | { breakdown: Record<string, number>; total: number }>(null);

  function compute(e: React.FormEvent) {
    e.preventDefault();
    const el = Number(electricity) || 0;
    const g = Number(gas) || 0;
    const km = Number(carKm) || 0;
    const fl = Number(flightKm) || 0;
    const mt = Number(meatMeals) || 0;

    const elEm = +(el * FACTORS.electricity).toFixed(3);
    const gEm = +(g * FACTORS.naturalGas).toFixed(3);
    const kmEm = +(km * FACTORS.car).toFixed(3);
    const flEm = +(fl * FACTORS.flight).toFixed(3);
    const mtEm = +(mt * FACTORS.meatMeals).toFixed(3);
    const total = +(elEm + gEm + kmEm + flEm + mtEm).toFixed(3);

    setResult({ breakdown: { electricity: elEm, naturalGas: gEm, car: kmEm, flight: flEm, meatMeals: mtEm }, total });
  }

  function reset() {
    setElectricity("");
    setGas("");
    setCarKm("");
    setFlightKm("");
    setMeatMeals("");
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto w-full p-8 bg-slate-900/60 rounded-2xl border border-white/5">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">Calculate Footprint</h1>
            <p className="text-slate-400 text-sm md:text-base">Enter simple activity metrics to estimate emissions. These are illustrative factors — swap with authoritative factors for production.</p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white text-sm font-semibold shadow-[0_8px_30px_rgba(99,102,241,0.12)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.2)] transition-all whitespace-nowrap flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" /></svg>
            <span>Back to Home</span>
          </Link>
        </div>

        <form onSubmit={compute} className="grid gap-4">
          <label className="flex flex-col">
            <span className="text-sm text-slate-400 mb-1">Electricity (kWh)</span>
            <input type="number" step="0.001" min="0" value={electricity} onChange={e => setElectricity(e.target.value === '' ? '' : Number(e.target.value))} className="px-3 py-2 rounded bg-slate-800 border border-white/5" placeholder="e.g. 12.5" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-slate-400 mb-1">Natural gas (m3)</span>
            <input type="number" step="0.001" min="0" value={gas} onChange={e => setGas(e.target.value === '' ? '' : Number(e.target.value))} className="px-3 py-2 rounded bg-slate-800 border border-white/5" placeholder="e.g. 4.2" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-slate-400 mb-1">Car travel (km)</span>
            <input type="number" step="0.1" min="0" value={carKm} onChange={e => setCarKm(e.target.value === '' ? '' : Number(e.target.value))} className="px-3 py-2 rounded bg-slate-800 border border-white/5" placeholder="e.g. 18.4" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-slate-400 mb-1">Flight distance (km)</span>
            <input type="number" step="1" min="0" value={flightKm} onChange={e => setFlightKm(e.target.value === '' ? '' : Number(e.target.value))} className="px-3 py-2 rounded bg-slate-800 border border-white/5" placeholder="e.g. 500 for Mumbai→Delhi" />
            <span className="text-xs text-slate-500 mt-1">Economy class short-haul factor used</span>
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-slate-400 mb-1">Meat-based meals (count this week)</span>
            <input type="number" step="1" min="0" value={meatMeals} onChange={e => setMeatMeals(e.target.value === '' ? '' : Number(e.target.value))} className="px-3 py-2 rounded bg-slate-800 border border-white/5" placeholder="e.g. 5" />
            <span className="text-xs text-slate-500 mt-1">Beef/lamb meals average ~3.3 kg CO₂e each</span>
          </label>

          <div className="flex items-center gap-3">
            <button type="submit" className="px-4 py-2 rounded bg-emerald-500 text-slate-900 font-bold">Calculate</button>
            <button type="button" onClick={reset} className="px-4 py-2 rounded bg-white/5">Reset</button>
          </div>
        </form>

        {result && (
          <div className="mt-6 p-4 rounded bg-slate-800 border border-white/5">
            <h3 className="font-bold mb-2">Result</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900/40 rounded">
                <div className="text-sm text-slate-400">Electricity</div>
                <div className="text-lg font-bold">{fmt(result.breakdown.electricity)} kg CO₂e</div>
                <div className="text-xs text-slate-400">Factor: {FACTORS.electricity} kg/kWh</div>
              </div>
              <div className="p-3 bg-slate-900/40 rounded">
                <div className="text-sm text-slate-400">Natural gas</div>
                <div className="text-lg font-bold">{fmt(result.breakdown.naturalGas)} kg CO₂e</div>
                <div className="text-xs text-slate-400">Factor: {FACTORS.naturalGas} kg/m³</div>
              </div>
              <div className="p-3 bg-slate-900/40 rounded">
                <div className="text-sm text-slate-400">Car travel</div>
                <div className="text-lg font-bold">{fmt(result.breakdown.car)} kg CO₂e</div>
                <div className="text-xs text-slate-400">Factor: {FACTORS.car} kg/km</div>
              </div>
              <div className="p-3 bg-slate-900/40 rounded">
                <div className="text-sm text-slate-400">Flights</div>
                <div className="text-lg font-bold">{fmt(result.breakdown.flight)} kg CO₂e</div>
                <div className="text-xs text-slate-400">Factor: {FACTORS.flight} kg/km</div>
              </div>
              <div className="p-3 bg-slate-900/40 rounded">
                <div className="text-sm text-slate-400">Diet (meat meals)</div>
                <div className="text-lg font-bold">{fmt(result.breakdown.meatMeals)} kg CO₂e</div>
                <div className="text-xs text-slate-400">Factor: {FACTORS.meatMeals} kg/meal</div>
              </div>
            </div>

            <div className="mt-4 border-t border-white/5 pt-4">
              <div className="text-sm text-slate-400">Total estimated emissions</div>
              <div className="text-2xl font-bold">{fmt(result.total)} kg CO₂e</div>
            </div>

            <div className="mt-4 flex gap-3 flex-wrap">
              <Link href="/tracking" className="px-4 py-2 rounded bg-emerald-500 text-slate-900 font-bold text-sm inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                Log this to your tracker
              </Link>
              <button onClick={reset} className="px-4 py-2 rounded bg-white/5 text-sm">Calculate again</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
