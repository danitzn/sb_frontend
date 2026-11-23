/**
 * URL base del backend (Django). Se lee solo en el servidor
 * (next.config.ts y proxy.ts), nunca se expone al navegador.
 */
const DEFAULT_API_BASE_URL = 'http://localhost:8000';

export function getBackendUrl(): string {
  return (process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/+$/, '');
}
