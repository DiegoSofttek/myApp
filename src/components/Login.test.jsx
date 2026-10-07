import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Login from './Login'
import { signInUser } from '../config/authCall'
import { useAuth } from '../hooks/useAuth'

const navigateMock = vi.fn()

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
    useNavigate: () => navigateMock,
  }
})

describe('TASK-1 SUB-1 Login incorrect credentials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({ user: null })
  })

  it('UT-SUB-1-US-1-AC-1: shows an authentication error for invalid credentials, calls login service once, and avoids redirecting', async () => {
    vi.mocked(signInUser).mockRejectedValue(new Error('Invalid credentials'))

    render(<Login />)

    const emailInput = document.getElementById('login-email') as HTMLInputElement
    const passwordInput = document.getElementById('login-password') as HTMLInputElement
    const submitButton = document.getElementById('login-submit-btn') as HTMLButtonElement

    expect(emailInput).not.toBeNull()
    expect(passwordInput).not.toBeNull()
    expect(submitButton).not.toBeNull()

    expect(screen.queryByText('Error al iniciar sesión')).not.toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    await userEvent.type(emailInput, 'wrong@example.com')
    await userEvent.type(passwordInput, 'bad-password')

    expect(submitButton).toBeEnabled()

    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(signInUser).toHaveBeenCalledTimes(1)
      expect(signInUser).toHaveBeenCalledWith('wrong@example.com', 'bad-password')
      expect(screen.getByText('Error al iniciar sesión')).toBeInTheDocument()
    })

    expect(navigateMock).not.toHaveBeenCalled()
  })
})
