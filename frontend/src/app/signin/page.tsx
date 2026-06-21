"use client";

import React from "react";
import { useRouter } from "next/navigation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const endpoint = mode === 'signup' ? '/api/signup' : '/api/signin';
      const res = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || (mode === 'signup' ? 'Sign up failed' : 'Sign in failed'));

      setSuccess(mode === 'signup' ? 'Account created successfully!' : 'Signed in successfully!');
      setTimeout(() => router.push('/'), 1000);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="max-w-md w-full p-8 bg-slate-900/60 rounded-2xl border border-white/5">
        <h1 className="text-2xl font-bold mb-2">{mode === 'signup' ? 'Create Account' : 'Sign In'}</h1>
        <p className="text-slate-400 mb-6 text-sm">
          {mode === 'signup' ? 'Create an account to track energy and emissions.' : 'Sign in to your existing account.'}
        </p>

        <div className="flex gap-2 mb-5 p-1 bg-slate-800/60 rounded-lg">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
            className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${mode === 'signin' ? 'bg-emerald-500 text-slate-900' : 'text-slate-400'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
            className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${mode === 'signup' ? 'bg-emerald-500 text-slate-900' : 'text-slate-400'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-3">
          <label className="flex flex-col">
            <span className="text-sm text-slate-400 mb-1">Email</span>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              required
              className="px-3 py-2 rounded bg-slate-800 border border-white/5 focus:outline-none focus:border-emerald-500"
              placeholder="your@email.com"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-slate-400 mb-1">Password</span>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              required
              className="px-3 py-2 rounded bg-slate-800 border border-white/5 focus:outline-none focus:border-emerald-500"
              placeholder="enter password"
            />
          </label>

          <div className="flex items-center gap-3 mt-2">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-emerald-500 text-slate-900 font-bold disabled:opacity-50">
              {loading ? 'Processing...' : (mode === 'signup' ? 'Create Account' : 'Sign In')}
            </button>
            <button type="button" onClick={() => { setEmail(''); setPassword(''); setError(null); setSuccess(null); }} className="px-4 py-2 rounded bg-white/5 hover:bg-white/10">Reset</button>
          </div>

          {error && <div className="text-rose-400 mt-3 text-sm border border-rose-500/30 bg-rose-500/10 p-2 rounded">{error}</div>}
          {success && <div className="text-emerald-400 mt-3 text-sm border border-emerald-500/30 bg-emerald-500/10 p-2 rounded">{success}</div>}
        </form>

        <div className="mt-6">
          <a href="/" className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white text-sm font-semibold shadow-[0_8px_30px_rgba(99,102,241,0.12)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.2)] transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" /></svg><span>Back to Home</span></a>
        </div>
      </div>
    </div>
  );
}