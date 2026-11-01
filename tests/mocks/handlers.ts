import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('*/api/proxy/chat/:mode/', async ({ request }) => {
    const body = (await request.json()) as { message?: string }
    return HttpResponse.json({
      response: `Respuesta simulada para: ${body.message ?? '(sin mensaje)'}`,
      model_used: 'mock-model',
      context_used: 'test',
    })
  }),

  http.get('*/api/:path*', () => {
    return HttpResponse.json({ ok: true })
  }),
]
