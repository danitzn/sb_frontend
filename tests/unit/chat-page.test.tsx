import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import ChatPage from '@/app/page'

describe('ChatPage (unitario + MSW)', () => {
  it('renderiza el estado inicial y envía un mensaje mockeado', async () => {
    const user = userEvent.setup()

    render(<ChatPage />)

    // Estado inicial
    expect(screen.getByText('¡Hola! Soy Celeste, tu asistente')).toBeInTheDocument()

    // Enviar mensaje: MSW intercepta el POST a /api/chat/
    const input = screen.getByPlaceholderText(
      'Escribe tu consulta sobre productos, precios o stock...',
    )
    await user.type(input, 'hola')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByText('Respuesta simulada para: hola')).toBeInTheDocument()
  })
})
