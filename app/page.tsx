'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

interface ChatResponse {
  response: string;
  model_used: string;
  context_used: string;
}

// URL base y path separados para mejor mantenimiento
const API_BASE_URL = 'https://did-delhi-processor-historical.trycloudflare.com';
const API_CHAT_PATH = '/api/chat/cloud/';
const CHAT_API_URL = `${API_BASE_URL}${API_CHAT_PATH}`;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), text: input.trim(), sender: 'user' };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('📤 Enviando mensaje a:', CHAT_API_URL);
      
      // Añadir timeout para evitar esperas
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }

      const data: ChatResponse = await response.json();
      
      const botMessage: Message = { 
        id: Date.now() + 1, 
        text: data.response, 
        sender: 'bot' 
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error: any) {
      console.error('❌ Error completo:', error);
      
      let errorText = '❌ Error de conexión';
      
      if (error.name === 'AbortError') {
        errorText = '⏰ La solicitud tardó demasiado tiempo. Intenta nuevamente.';
      } else if (error.message.includes('Failed to fetch')) {
        errorText = `🌐 Error de conexión con la API\n\n• URL: ${API_BASE_URL}\n• Path: ${API_CHAT_PATH}\n\nVerifica:\n• Tu conexión a internet\n• Que Cloudflare esté funcionando\n• Que la URL sea accesible`;
      } else {
        errorText = `❌ Error: ${error.message}`;
      }

      const errorMessage: Message = { 
        id: Date.now() + 1, 
        text: errorText, 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Para testing: verificar la conexión
  const testConnection = async () => {
    setIsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cloudflare-skip-browser-warning': '1',
        },
        body: JSON.stringify({ message: 'test connection' }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const testMessage: Message = { 
          id: Date.now(), 
          text: '✅ Conexión exitosa con la API', 
          sender: 'bot' 
        };
        setMessages(prev => [...prev, testMessage]);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      const errorMessage: Message = { 
        id: Date.now(), 
        text: `❌ Falló la conexión: ${error.message}`, 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col flex-1 max-w-4xl w-full mx-auto h-full p-4">
        
        {/* Encabezado con botón de test */}
        <header className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl text-white">🤖</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Lynda Carolyn Chatbot
                </h1>
                <p className="text-sm text-gray-600">
                  Base URL: {API_BASE_URL}
                </p>
                <p className="text-xs text-gray-500">
                  Endpoint: {API_CHAT_PATH}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={testConnection}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition duration-200"
              >
                Test Conexión
              </button>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  🗑️ Limpiar
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Área de Mensajes */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="flex flex-col h-full">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">En línea</span>
                </div>
                <span className="text-xs text-gray-500">
                  {messages.length} mensajes
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white to-blue-50/30">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🛒</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    ¡Hola! Soy Celeste, tu asistente
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Haz clic en "Test Conexión" para verificar que la API esté funcionando.
                  </p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
                    <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-700 border border-blue-100">
                      💰 "¿Qué precios tienen los helados?"
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-700 border border-blue-100">
                      📦 "¿Hay Cervezas"
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-700 border border-blue-100">
                      🔍 "Muéstrame productos en oferta"
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-700 border border-blue-100">
                      📋 "¿Qué marcas de Lacteos tienen?"
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className="flex max-w-[85%] space-x-3">
                    {msg.sender === 'bot' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        AI
                      </div>
                    )}
                    <div 
                      className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md' 
                          : 'bg-white text-gray-800 rounded-tl-md border border-gray-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.sender === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        TÚ
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      AI
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Área de Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Escribe tu consulta sobre productos, precios o stock..."
                    className="w-full p-4 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-500 transition duration-200"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    ↵ Enter
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  className={`p-4 px-6 text-white rounded-xl font-semibold transition duration-200 shadow-sm ${
                    isLoading || !input.trim()
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105'
                  }`}
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Enviar'
                  )}
                </button>
              </div>
              <div className="text-xs text-gray-500 text-center mt-3">
                Presiona Enter para enviar • Usando: {API_BASE_URL}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-500 mt-4 pb-2">
          Powered by AI Assistant • {new Date().getFullYear()}
        </footer>
      </div>

      {/* Estilos de animación */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}