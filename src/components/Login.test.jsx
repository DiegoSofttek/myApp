import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from './Login'
import { signInUser } from '../config/authCall'
import { useAuth } from '../hooks/useAuth'

const mockNavigate = vi.fn()

vi.mock('../config/authCall', () => ({
  signInUser: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('TASK-1 / SUB-1 Login error', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({ user: null })
  })

  it('SUB-1-TC-01 renders an error when invalid credentials are rejected', async () => {
    signInUser.mockRejectedValueOnce(new Error('invalid credentials'))
    const user = userEvent.setup()

    render(<Login />)

    await user.type(screen.getByLabelText(/email:/i), 'wrong@example.com')
    await user.type(screen.getByLabelText(/password:/i), 'bad-password')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(signInUser).toHaveBeenCalledWith('wrong@example.com', 'bad-password')
    })

    expect(await screen.findByText('Error al iniciar sesión')).toBeInTheDocument()
  })

  it('SUB-1-TC-02 does not navigate to /home when login fails', async () => {
    signInUser.mockRejectedValueOnce(new Error('invalid credentials'))
    const user = userEvent.setup()

    render(<Login />)

    await user.type(screen.getByLabelText(/email:/i), 'wrong@example.com')
    await user.type(screen.getByLabelText(/password:/i), 'bad-password')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await screen.findByText('Error al iniciar sesión')

    expect(mockNavigate).not.toHaveBeenCalledWith('/home')
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('SUB-1-TC-03 keeps the login button disabled until both fields are filled', async () => {
    const user = userEvent.setup()

    render(<Login />)

    const loginButton = screen.getByRole('button', { name: /log in/i })
    const emailInput = screen.getByLabelText(/email:/i)
    const passwordInput = screen.getByLabelText(/password:/i)

    expect(loginButton).toBeDisabled()

    await user.type(emailInput, 'user@example.com')
    expect(loginButton).toBeDisabled()

    await user.type(passwordInput, 'secret123')
    expect(loginButton).toBeEnabled()

    await user.clear(emailInput)
    expect(loginButton).toBeDisabled()
  })

  it('SUB-1-TC-04 forwards entered credentials unchanged to signInUser on submit', async () => {
    signInUser.mockRejectedValueOnce(new Error('invalid credentials'))
    const user = userEvent.setup()
    const email = 'User.Name+tag@example.com'
    const password = ' pass With Spaces 123 '

    render(<Login />)

    await user.type(screen.getByLabelText(/email:/i), email)
    await user.type(screen.getByLabelText(/password:/i), password)
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(signInUser).toHaveBeenCalledTimes(1)
      expect(signInUser).toHaveBeenCalledWith(email, password)
    })
  })
})
