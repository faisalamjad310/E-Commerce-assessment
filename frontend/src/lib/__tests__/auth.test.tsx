import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../auth'

const ADMIN    = { id: '1', name: 'Admin', email: 'admin@test.com', role: 'admin'    } as const
const CUSTOMER = { id: '2', name: 'Jane',  email: 'jane@test.com',  role: 'customer' } as const

function Spy() {
  const { user, token, isAdmin, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="token">{token ?? 'null'}</span>
      <span data-testid="email">{user?.email ?? 'none'}</span>
      <span data-testid="isAdmin">{String(isAdmin)}</span>
      <button onClick={() => login('tok-admin', ADMIN)}>login-admin</button>
      <button onClick={() => login('tok-cust',  CUSTOMER)}>login-customer</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

const setup = () => {
  render(<AuthProvider><Spy /></AuthProvider>)
  return userEvent.setup()
}

describe('AuthContext', () => {
  beforeEach(() => localStorage.clear())

  it('starts unauthenticated when localStorage is empty', () => {
    setup()
    expect(screen.getByTestId('token').textContent).toBe('null')
    expect(screen.getByTestId('email').textContent).toBe('none')
    expect(screen.getByTestId('isAdmin').textContent).toBe('false')
  })

  it('login() writes token and user to state and localStorage', async () => {
    const user = setup()
    await user.click(screen.getByText('login-admin'))

    expect(screen.getByTestId('token').textContent).toBe('tok-admin')
    expect(screen.getByTestId('email').textContent).toBe('admin@test.com')
    expect(localStorage.getItem('token')).toBe('tok-admin')
    expect(JSON.parse(localStorage.getItem('user')!)).toMatchObject({ email: 'admin@test.com' })
  })

  it('isAdmin is true for admin role, false for customer', async () => {
    const user = setup()

    await user.click(screen.getByText('login-admin'))
    expect(screen.getByTestId('isAdmin').textContent).toBe('true')

    await user.click(screen.getByText('login-customer'))
    expect(screen.getByTestId('isAdmin').textContent).toBe('false')
  })

  it('logout() clears state and localStorage', async () => {
    const user = setup()
    await user.click(screen.getByText('login-admin'))
    await user.click(screen.getByText('logout'))

    expect(screen.getByTestId('token').textContent).toBe('null')
    expect(screen.getByTestId('email').textContent).toBe('none')
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('restores existing session from localStorage on mount', () => {
    localStorage.setItem('token', 'existing-tok')
    localStorage.setItem('user', JSON.stringify(CUSTOMER))
    setup()

    expect(screen.getByTestId('token').textContent).toBe('existing-tok')
    expect(screen.getByTestId('email').textContent).toBe('jane@test.com')
  })
})
