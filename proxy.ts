import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const isApi = request.nextUrl.pathname.startsWith('/api/');

    if (isApi) {
        // 1. Manejar Preflight (OPTIONS) directamente
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
            });
        }

        // 2. Preparar headers para el backend (Spoofing)
        const requestHeaders = new Headers(request.headers)
        const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8000'
        const targetUrl = API_BASE_URL.replace(/\/+$/, '')
        const targetHost = new URL(targetUrl).host

        requestHeaders.set('Origin', targetUrl)
        requestHeaders.set('Referer', targetUrl)
        requestHeaders.set('Host', targetHost)

        // 3. Continuar y modificar respuesta
        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })

        // 4. Asegurar CORS en la respuesta final
        response.headers.set('Access-Control-Allow-Origin', '*')
        return response
    }
}

export const config = {
    matcher: '/api/:path*',
}
