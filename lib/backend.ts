/**
 * Configuración del backend (Django). Se lee solo en el servidor
 * (next.config.ts y proxy.ts), nunca se expone al navegador.
 */
const DEFAULT_API_BASE_URL = 'http://localhost:8000';

export function getBackendUrl(): string {
  return (process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/+$/, '');
}

/**
 * Secreto de "Protection Bypass for Automation" de Vercel.
 * Permite que este servidor llame al backend protegido con Vercel Authentication.
 * Sin prefijo NEXT_PUBLIC_: nunca llega al navegador.
 */
export function getBackendBypassSecret(): string | undefined {
  return process.env.VERCEL_PROTECTION_BYPASS?.trim() || undefined;
}
