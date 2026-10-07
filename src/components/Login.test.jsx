import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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

  it('SUB-1-TC-01 shows an error message after invalid credentials are submitted', async () => {
    signInUser.mockRejectedValueOnce(new Error('invalid credentials'))

    render(<Login />)

    fireEvent.change(screen.getByLabelText('Email:'), {
      target: { value: 'wrong@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password:'), {
      target: { value: 'bad-password' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }))

    expect(await screen.findByText('Error al iniciar sesión')).toBeTruthy()
  })

  it('SUB-1-TC-02 calls signInUser once with the entered email and password', async () => {
    signInUser.mockRejectedValueOnce(new Error('invalid credentials'))

    render(<Login />)

    fireEvent.change(screen.getByLabelText('Email:'), {
      target: { value: 'wrong@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password:'), {
      target: { value: 'bad-password' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }))

    await waitFor(() => {
      expect(signInUser).toHaveBeenCalledTimes(1)
      expect(signInUser).toHaveBeenCalledWith('wrong@example.com', 'bad-password')
    })
  })

  it('SUB-1-TC-03 does not navigate to home when login fails and user remains null', async () => {
    signInUser.mockRejectedValueOnce(new Error('invalid credentials'))

    render(<Login />)

    fireEvent.change(screen.getByLabelText('Email:'), {
      target: { value: 'wrong@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password:'), {
      target: { value: 'bad-password' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }))

    await screen.findByText('Error al iniciar sesión')
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('SUB-1-TC-04 keeps the login button disabled until both fields contain values', () => {
    render(<Login />)

    const submitButton = screen.getByRole('button', { name: 'Log In' })
    const emailInput = screen.getByLabelText('Email:')
    const passwordInput = screen.getByLabelText('Password:')

    expect(submitButton).toBeDisabled()

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    expect(submitButton).toBeDisabled()

    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    expect(submitButton).not.toBeDisabled()
  })
})
