import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getBackendUrl } from './lib/backend';

/**
 * El navegador llama a /api/proxy/... en el mismo origen, así que no hace
 * falta CORS. Aquí solo se reescriben Origin/Referer/Host para que el backend
 * (Django detrás de Cloudflare) acepte la petición reenviada por el rewrite.
 */
export function proxy(request: NextRequest) {
  const targetUrl = getBackendUrl();
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set('Origin', targetUrl);
  requestHeaders.set('Referer', targetUrl);
  requestHeaders.set('Host', new URL(targetUrl).host);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: '/api/:path*',
};
