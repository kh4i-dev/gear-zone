import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3004'
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD

if (!TEST_ADMIN_EMAIL || !TEST_ADMIN_PASSWORD) {
  throw new Error('Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD before running auth integration tests')
}

describe('Auth Flow Integration', () => {
  // Test 1: /api/auth/me should return 401 without cookie
  it('should return 401 when not authenticated', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  // Test 2: Login should set cookie
  it('should set cookie on successful login', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD
      })
    })

    expect(res.status).toBe(200)

    // Check cookie is set
    const setCookie = res.headers.get('set-cookie')
    expect(setCookie).toBeTruthy()
    expect(setCookie).toContain('gearzone_session')
  })

  // Test 3: /api/auth/me should return user with valid cookie
  it('should return user data with valid session cookie', async () => {
    // First login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD
      })
    })

    // Extract cookie
    const setCookie = loginRes.headers.get('set-cookie')!
    const cookieMatch = setCookie.match(/gearzone_session=([^;]+)/)
    expect(cookieMatch).toBeTruthy()
    const cookie = `gearzone_session=${cookieMatch![1]}`

    // Call /api/auth/me with cookie
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Cookie': cookie }
    })

    expect(meRes.status).toBe(200)
    const data = await meRes.json()
    expect(data.data.email).toBe(TEST_ADMIN_EMAIL)
    expect(data.data.role).toBe('ADMIN')
  })

  // Test 4: Admin dashboard API should work with auth
  it('should allow admin dashboard access with admin cookie', async () => {
    // Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD
      })
    })

    const setCookie = loginRes.headers.get('set-cookie')!
    const cookieMatch = setCookie.match(/gearzone_session=([^;]+)/)
    const cookie = `gearzone_session=${cookieMatch![1]}`

    // Call admin dashboard API
    const dashboardRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { 'Cookie': cookie }
    })

    expect(dashboardRes.status).toBe(200)
    const data = await dashboardRes.json()
    expect(data.data).toHaveProperty('totalRevenue')
  })
})
