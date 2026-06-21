import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

function buildUrl(pathParts: string[] = [], search?: string) {
  // Ensure we forward to the backend under /api/* so frontend calls like
  // /api/proxy/devices map to backend /api/devices.
  const prefix = pathParts[0] === 'api' ? '' : '/api';
  const path = pathParts.length ? `${prefix}/${pathParts.join('/')}` : prefix || '';
  return `${BACKEND}${path}${search || ''}`;
}

function buildUrlFromReq(req: NextRequest) {
  const u = new URL(req.url);
  // Strip the /api/proxy prefix from the incoming path
  const proxyPrefix = '/api/proxy';
  let forwardPath = u.pathname.startsWith(proxyPrefix) ? u.pathname.slice(proxyPrefix.length) : u.pathname;
  // If the forward path is empty or just '/', map to '/api'
  if (!forwardPath || forwardPath === '/') forwardPath = '/api';
  // Ensure it hits backend under /api
  if (!forwardPath.startsWith('/api')) forwardPath = '/api' + (forwardPath.startsWith('/') ? forwardPath : `/${forwardPath}`);
  return `${BACKEND}${forwardPath}${u.search}`;
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const url = buildUrlFromReq(req);
    console.log('[proxy] GET ->', url);
    const headers: any = {};
    // forward API key if configured
    if (API_KEY) headers['x-api-key'] = API_KEY;
    // forward incoming cookies so backend sees session cookie
    const incomingCookie = req.headers.get('cookie');
    if (incomingCookie) headers['cookie'] = incomingCookie;
    const res = await fetch(url, { headers });
    const text = await res.text();
    const forwardedHeaders: any = { 'content-type': res.headers.get('content-type') || 'application/json' };
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) forwardedHeaders['set-cookie'] = setCookie;
    return new NextResponse(text, { status: res.status, headers: forwardedHeaders });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'proxy error' }, { status: 502 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const url = buildUrlFromReq(req);
    console.log('[proxy] POST ->', url);
    const headers: any = { 'content-type': req.headers.get('content-type') || 'application/json' };
    if (API_KEY) headers['x-api-key'] = API_KEY;
    const incomingCookie = req.headers.get('cookie');
    if (incomingCookie) headers['cookie'] = incomingCookie;
    const body = await req.arrayBuffer();
    const res = await fetch(url, { method: 'POST', headers, body });
    const text = await res.text();
    const forwardedHeaders: any = { 'content-type': res.headers.get('content-type') || 'application/json' };
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) forwardedHeaders['set-cookie'] = setCookie;
    return new NextResponse(text, { status: res.status, headers: forwardedHeaders });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'proxy error' }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const url = buildUrlFromReq(req);
    console.log('[proxy] DELETE ->', url);
    const headers: any = {};
    if (API_KEY) headers['x-api-key'] = API_KEY;
    const incomingCookie = req.headers.get('cookie');
    if (incomingCookie) headers['cookie'] = incomingCookie;
    const res = await fetch(url, { method: 'DELETE', headers });
    const text = await res.text();
    const forwardedHeaders: any = { 'content-type': res.headers.get('content-type') || 'application/json' };
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) forwardedHeaders['set-cookie'] = setCookie;
    return new NextResponse(text, { status: res.status, headers: forwardedHeaders });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'proxy error' }, { status: 502 });
  }
}
