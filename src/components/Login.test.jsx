/* @vitest-environment jsdom */
import '@ant-design/v5-patch-for-react-19'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import Login from './Login'
import * as authCall from '../config/authCall'

const navigateMock = vi.fn()

vi.mock('../config/authCall', () => ({
  signInUser: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('TASK-1 / SUB-1 Login incorrect credentials', () => {
  /** @type {HTMLDivElement} */
  let container
  /** @type {import('react-dom/client').Root} */
  let root
  /** @type {import('vitest').Mock} */
  let signInUserMock

  const getEmailInput = () => /** @type {HTMLInputElement} */ (container.querySelector('#login-email'))
  const getPasswordInput = () => /** @type {HTMLInputElement} */ (container.querySelector('#login-password'))
  const getSubmitButton = () => /** @type {HTMLButtonElement} */ (container.querySelector('#login-submit-btn'))

  const changeInputValue = async (element, value) => {
    await act(async () => {
      const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')
      descriptor?.set?.call(element, value)
      element.dispatchEvent(new Event('input', { bubbles: true }))
      element.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }

  const clickElement = async (element) => {
    await act(async () => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await Promise.resolve()
    })
  }

  beforeEach(async () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    signInUserMock = /** @type {import('vitest').Mock} */ (authCall.signInUser)
    navigateMock.mockReset()
    signInUserMock.mockReset()

    await act(async () => {
      root.render(<Login />)
    })
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('UT-SUB-1-US-1-AC-1 / SUB-1-TC-03 disables submit with empty fields and enables it once both fields are completed', async () => {
    const submitButton = getSubmitButton()
    expect(submitButton.disabled).toBe(true)

    await changeInputValue(getEmailInput(), 'usuario@correo.com')
    expect(getSubmitButton().disabled).toBe(true)

    await changeInputValue(getPasswordInput(), 'secreta123')
    expect(getSubmitButton().disabled).toBe(false)
  })

  it('UT-SUB-1-US-1-AC-1 / SUB-1-TC-01 calls signInUser with entered credentials and shows the authentication error message', async () => {
    signInUserMock.mockRejectedValueOnce(new Error('Invalid credentials'))

    await changeInputValue(getEmailInput(), 'usuario@correo.com')
    await changeInputValue(getPasswordInput(), 'secreta123')
    await clickElement(getSubmitButton())

    expect(signInUserMock).toHaveBeenCalledTimes(1)
    expect(signInUserMock).toHaveBeenCalledWith('usuario@correo.com', 'secreta123')
    expect(container.textContent).toContain('Error al iniciar sesión')
  })

  it('UT-SUB-1-US-1-AC-1 / SUB-1-TC-02 does not navigate to /home when authentication fails', async () => {
    signInUserMock.mockRejectedValueOnce(new Error('Invalid credentials'))

    await changeInputValue(getEmailInput(), 'usuario@correo.com')
    await changeInputValue(getPasswordInput(), 'secreta123')
    await clickElement(getSubmitButton())

    expect(navigateMock).not.toHaveBeenCalledWith('/home')
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
