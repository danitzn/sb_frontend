import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getBackendBypassSecret, getBackendUrl } from './lib/backend';

/**
 * El navegador llama a /api/proxy/... en el mismo origen, así que no hace
 * falta CORS. Aquí se reescriben Origin/Referer/Host para que el backend
 * acepte la petición reenviada por el rewrite (next.config.ts) y, si el
 * backend está protegido en Vercel, se agrega el secreto de bypass.
 */
export function proxy(request: NextRequest) {
  const targetUrl = getBackendUrl();
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set('Origin', targetUrl);
  requestHeaders.set('Referer', targetUrl);
  requestHeaders.set('Host', new URL(targetUrl).host);

  // Evitar que un cliente inyecte su propio valor
  requestHeaders.delete('x-vercel-protection-bypass');
  const bypassSecret = getBackendBypassSecret();
  if (bypassSecret && request.nextUrl.pathname.startsWith('/api/proxy/')) {
    requestHeaders.set('x-vercel-protection-bypass', bypassSecret);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: '/api/:path*',
};
