'use client';

import { useState, useCallback } from 'react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string;
  time?: number;
}

export default function CORSTestPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  const [results, setResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [customUrl, setCustomUrl] = useState(`${API_BASE_URL}/api/chat/`);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runFullCORSTest = async () => {
    setIsTesting(true);
    setResults([]);
    const startTime = Date.now();

    try {
      // Test 1: OPTIONS Preflight
      addResult({
        name: '1. Preflight OPTIONS',
        status: 'loading',
        message: 'Enviando request OPTIONS...'
      });

      const optionsStart = Date.now();
      const optionsResponse = await fetch(customUrl, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000'
        }
      });
      const optionsTime = Date.now() - optionsStart;

      const optionsHeaders = Object.fromEntries(optionsResponse.headers.entries());
      const hasCorsHeaders = optionsHeaders['access-control-allow-origin'] !== undefined;

      addResult({
        name: '1. Preflight OPTIONS',
        status: hasCorsHeaders ? 'success' : 'error',
        message: `Status: ${optionsResponse.status} - CORS: ${hasCorsHeaders ? 'SÍ' : 'NO'}`,
        details: `Headers: ${JSON.stringify(optionsHeaders, null, 2)}`,
        time: optionsTime
      });

      // Test 2: POST Request
      addResult({
        name: '2. POST Request',
        status: 'loading',
        message: 'Enviando POST request...'
      });

      const postStart = Date.now();
      const postResponse = await fetch(customUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'test CORS' })
      });
      const postTime = Date.now() - postStart;

      const postHeaders = Object.fromEntries(postResponse.headers.entries());
      const postHasCors = postHeaders['access-control-allow-origin'] !== undefined;

      if (postResponse.ok) {
        try {
          const data = await postResponse.json();
          addResult({
            name: '2. POST Request',
            status: 'success',
            message: `✅ POST exitoso - Status: ${postResponse.status}`,
            details: `Response: ${JSON.stringify(data, null, 2)}\nCORS Headers: ${postHasCors ? 'SÍ' : 'NO'}`,
            time: postTime
          });
        } catch (e) {
          addResult({
            name: '2. POST Request',
            status: 'warning',
            message: `⚠️ POST con status ${postResponse.status} pero respuesta no JSON`,
            details: `Headers: ${JSON.stringify(postHeaders, null, 2)}`,
            time: postTime
          });
        }
      } else {
        addResult({
          name: '2. POST Request',
          status: 'error',
          message: `❌ POST falló - Status: ${postResponse.status}`,
          details: `CORS: ${postHasCors ? 'SÍ' : 'NO'}\nHeaders: ${JSON.stringify(postHeaders, null, 2)}`,
          time: postTime
        });
      }

      // Test 3: CSRF Test (sin CSRF token)
      addResult({
        name: '3. CSRF Test',
        status: 'loading',
        message: 'Probando sin CSRF token...'
      });

      const csrfStart = Date.now();
      try {
        const csrfResponse = await fetch(customUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'csrf test' })
        });
        const csrfTime = Date.now() - csrfStart;

        addResult({
          name: '3. CSRF Test',
          status: csrfResponse.status !== 403 ? 'success' : 'warning',
          message: csrfResponse.status !== 403 ?
            '✅ CSRF no está bloqueando' :
            '⚠️ CSRF puede estar bloqueando (403)',
          details: `Status: ${csrfResponse.status}`,
          time: csrfTime
        });
      } catch (error) {
        addResult({
          name: '3. CSRF Test',
          status: 'error',
          message: '❌ Error en test CSRF',
          details: `${error}`,
          time: Date.now() - csrfStart
        });
      }

      // Test 4: Different Origin
      addResult({
        name: '4. Diferente Origen',
        status: 'loading',
        message: 'Probando con origen diferente...'
      });

      const originStart = Date.now();
      try {
        const originResponse = await fetch(customUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://otro-dominio.com'
          },
          body: JSON.stringify({ message: 'different origin' })
        });
        const originTime = Date.now() - originStart;

        addResult({
          name: '4. Diferente Origen',
          status: originResponse.ok ? 'success' : 'warning',
          message: originResponse.ok ?
            '✅ Origen diferente permitido' :
            '⚠️ Origen diferente rechazado',
          details: `Status: ${originResponse.status}`,
          time: originTime
        });
      } catch (error) {
        addResult({
          name: '4. Diferente Origen',
          status: 'error',
          message: '❌ Error con origen diferente',
          details: `${error}`,
          time: Date.now() - originStart
        });
      }

      // Test 5: Simple GET (si aplica)
      addResult({
        name: '5. Cloudflare Check',
        status: 'loading',
        message: 'Verificando Cloudflare...'
      });

      const cloudflareStart = Date.now();
      try {
        // Intentar acceder sin path específico
        const baseUrl = customUrl.split('/api/')[0];
        const cfResponse = await fetch(baseUrl, {
          method: 'GET',
        });
        const cfTime = Date.now() - cloudflareStart;

        addResult({
          name: '5. Cloudflare Check',
          status: cfResponse.status !== 403 ? 'success' : 'warning',
          message: cfResponse.status !== 403 ?
            '✅ Cloudflare accesible' :
            '⚠️ Cloudflare puede estar bloqueando',
          details: `Status: ${cfResponse.status}`,
          time: cfTime
        });
      } catch (error) {
        addResult({
          name: '5. Cloudflare Check',
          status: 'error',
          message: '❌ Error accediendo a Cloudflare',
          details: `${error}`,
          time: Date.now() - cloudflareStart
        });
      }

    } catch (error: any) {
      addResult({
        name: 'Error General',
        status: 'error',
        message: '❌ Error en el diagnóstico',
        details: error.toString()
      });
    } finally {
      const totalTime = Date.now() - startTime;
      addResult({
        name: 'Resumen',
        status: 'success',
        message: `Diagnóstico completado en ${totalTime}ms`,
        details: `Revisa los resultados individuales arriba`
      });
      setIsTesting(false);
    }
  };

  const testSpecificEndpoint = async () => {
    setIsTesting(true);
    setResults([]);

    try {
      addResult({
        name: 'Test Específico',
        status: 'loading',
        message: `Probando: ${customUrl}`
      });

      const response = await fetch(customUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'test específico' })
      });

      const headers = Object.fromEntries(response.headers.entries());
      const hasCors = headers['access-control-allow-origin'] !== undefined;

      if (response.ok) {
        const data = await response.json();
        addResult({
          name: 'Test Específico',
          status: 'success',
          message: `✅ Request exitoso - CORS: ${hasCors ? 'SÍ' : 'NO'}`,
          details: `Status: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`
        });
      } else {
        addResult({
          name: 'Test Específico',
          status: 'error',
          message: `❌ Request falló - Status: ${response.status}`,
          details: `CORS: ${hasCors ? 'SÍ' : 'NO'}\nHeaders: ${JSON.stringify(headers, null, 2)}`
        });
      }
    } catch (error: any) {
      addResult({
        name: 'Test Específico',
        status: 'error',
        message: '❌ Error de conexión',
        details: error.toString()
      });
    } finally {
      setIsTesting(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 border-green-400 text-green-800';
      case 'error': return 'bg-red-100 border-red-400 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'loading': return 'bg-blue-100 border-blue-400 text-blue-800';
      default: return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'loading': return '🔄';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl text-white">🔍</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Diagnóstico CORS</h1>
                <p className="text-gray-600">Herramienta para diagnosticar problemas de CORS en tu aplicación</p>
              </div>
            </div>
          </div>
        </div>

        {/* URL Input */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuración</h2>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL del Endpoint
              </label>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://tu-api.com/endpoint"
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tests</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={runFullCORSTest}
              disabled={isTesting}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition duration-200 font-semibold"
            >
              {isTesting ? 'Ejecutando Tests...' : 'Diagnóstico Completo CORS'}
            </button>
            <button
              onClick={testSpecificEndpoint}
              disabled={isTesting}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition duration-200 font-semibold"
            >
              Test Endpoint Específico
            </button>
            <button
              onClick={clearResults}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 font-semibold"
            >
              Limpiar Resultados
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`border-2 rounded-xl p-4 ${getStatusColor(result.status)} transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getStatusIcon(result.status)}</span>
                  <h3 className="font-semibold text-lg">{result.name}</h3>
                </div>
                {result.time && (
                  <span className="text-sm bg-white bg-opacity-50 px-2 py-1 rounded">
                    {result.time}ms
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm">{result.message}</p>
              {result.details && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium hover:text-blue-600">
                    Ver detalles
                  </summary>
                  <pre className="mt-2 p-3 bg-black bg-opacity-10 rounded-lg text-xs overflow-x-auto">
                    {result.details}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        {/* Information */}
        {results.length === 0 && !isTesting && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">💡 Información Importante</h3>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>• Tu configuración Django CORS parece correcta</li>
              <li>• El problema podría ser CSRF middleware o Cloudflare</li>
              <li>• Usa "Diagnóstico Completo CORS" para identificar el problema exacto</li>
              <li>• Si CSRF está bloqueando, considera usar <code>@csrf_exempt</code> en tu view</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}