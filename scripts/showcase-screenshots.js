const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const BASE_URL = process.env.TEST_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000'
const OUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots')
const envPath = path.join(__dirname, '..', '.env')

function readEnvValue(key) {
  const current = process.env[key]
  if (current) return current
  if (!fs.existsSync(envPath)) return ''
  const content = fs.readFileSync(envPath, 'utf8')
  const line = content.split(/\r?\n/).find((item) => item.trim().startsWith(`${key}=`))
  if (!line) return ''
  return line.slice(line.indexOf('=') + 1).trim().replace(/^['"]|['"]$/g, '')
}

const ADMIN_PREFIX = readEnvValue('NEXT_PUBLIC_ADMIN_PANEL_PREFIX') || 'system-control'
const ADMIN_LOGIN = readEnvValue('NEXT_PUBLIC_ADMIN_LOGIN_PATH') || 'auth-login'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || readEnvValue('ADMIN_PASSWORD') || '123'

fs.mkdirSync(OUT_DIR, { recursive: true })

async function waitForSettled(page) {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(1200)
  await page.addStyleTag({
    content: `
      [data-sonner-toaster],
      nextjs-portal,
      [data-nextjs-toast],
      [data-nextjs-dialog-overlay],
      .__next-dev-overlay,
      .nextjs-toast {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }
    `,
  }).catch(() => {})
}

async function screenshot(page, name) {
  await waitForSettled(page)
  await page.screenshot({
    path: path.join(OUT_DIR, `${name}.png`),
    fullPage: false,
    animations: 'disabled',
  })
}

async function getProducts(page) {
  const response = await page.request.get(`${BASE_URL}/api/products?page=1&pageSize=12`)
  if (!response.ok()) {
    throw new Error(`Could not load products: ${response.status()} ${await response.text()}`)
  }
  const json = await response.json()
  return json.data || []
}

function cartItemFromProduct(product) {
  const variant = product.variants?.find((item) => item.isActive && item.stock > 0)
  const imageUrl = variant?.imageUrl || product.images?.[0]?.url || product.imageUrl || null
  return {
    productId: product.id,
    variantId: variant?.id || null,
    sku: variant?.sku || null,
    name: product.name,
    price: variant?.salePrice || variant?.price || product.price,
    imageUrl,
    quantity: 1,
    maxStock: variant?.stock || product.stock || 1,
  }
}

async function registerAndLogin(page) {
  const suffix = Date.now().toString().slice(-8)
  const username = `showcase${suffix}`
  const phone = `09${suffix.slice(0, 8)}`
  const email = `${username}@example.com`
  const password = 'Showcase123'

  await page.request.post(`${BASE_URL}/api/auth/register`, {
    data: {
      username,
      phone,
      email,
      name: 'Showcase Customer',
      password,
    },
  }).catch(() => {})

  const loginResponse = await page.request.post(`${BASE_URL}/api/auth/login`, {
    data: { username, password },
  })
  const setCookie = loginResponse.headers()['set-cookie']
  const sessionCookie = setCookie?.split(';')[0]
  if (sessionCookie?.startsWith('gearzone_session=')) {
    const url = new URL(BASE_URL)
    await page.context().addCookies([{
      name: 'gearzone_session',
      value: sessionCookie.slice('gearzone_session='.length),
      domain: url.hostname,
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: url.protocol === 'https:',
    }])
  }

  const meResponse = await page.request.get(`${BASE_URL}/api/auth/me`)
  const me = await meResponse.json()

  return { username, password, user: me.data }
}

async function loginAdmin(page) {
  await page.goto(`${BASE_URL}/${ADMIN_PREFIX}/${ADMIN_LOGIN}`)
  await waitForSettled(page)
  await page.locator('input[name="username"], input[type="email"], input[type="text"]').first().fill('admin')
  await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD)
  await page.locator('button[type="submit"]').first().click()
  await page.waitForURL(new RegExp(`/${ADMIN_PREFIX}/dashboard`), { timeout: 10000 })
  await waitForSettled(page)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    locale: 'vi-VN',
  })
  const page = await context.newPage()

  await page.goto(BASE_URL)
  const products = await getProducts(page)
  if (!products.length) throw new Error('No products returned from /api/products')
  const firstProduct = products[0]
  const firstCategory = firstProduct.category?.name || firstProduct.categoryId || 'all'
  const cartItem = cartItemFromProduct(firstProduct)

  await page.goto(BASE_URL)
  await screenshot(page, 'homepage')

  await page.goto(`${BASE_URL}/products?category=${encodeURIComponent(firstCategory)}`)
  await screenshot(page, 'category')

  await page.goto(`${BASE_URL}/products`)
  await screenshot(page, 'products')

  await page.goto(`${BASE_URL}/products/${firstProduct.id}`)
  await screenshot(page, 'product-detail')

  await page.goto(`${BASE_URL}/?auth=login`)
  await screenshot(page, 'login')

  await page.goto(`${BASE_URL}/?auth=register`)
  await screenshot(page, 'register')

  await page.goto(BASE_URL)
  await page.evaluate((item) => {
    localStorage.setItem('gearzone_cart:guest', JSON.stringify([item]))
    window.dispatchEvent(new Event('gearzone_cart_changed'))
  }, cartItem)
  await page.goto(`${BASE_URL}/cart`)
  await screenshot(page, 'cart')

  const customer = await registerAndLogin(page)
  await page.goto(BASE_URL)
  await page.evaluate((item) => {
    localStorage.setItem('gearzone_cart:guest', JSON.stringify([item]))
    if (window.__GEARZONE_USER_ID__) {
      localStorage.setItem(`gearzone_cart:user_${window.__GEARZONE_USER_ID__}`, JSON.stringify([item]))
    }
    window.dispatchEvent(new Event('gearzone_cart_changed'))
  }, cartItem)
  await page.evaluate((userId) => {
    window.__GEARZONE_USER_ID__ = userId
  }, customer.user?.id || null)
  await page.evaluate((item) => {
    if (window.__GEARZONE_USER_ID__) {
      localStorage.setItem(`gearzone_cart:user_${window.__GEARZONE_USER_ID__}`, JSON.stringify([item]))
    }
    window.dispatchEvent(new Event('gearzone_cart_changed'))
  }, cartItem)
  await page.goto(`${BASE_URL}/cart`)
  await waitForSettled(page)
  await page.getByRole('button', { name: /Tiến hành thanh toán/i }).click()
  await screenshot(page, 'checkout')

  await page.request.post(`${BASE_URL}/api/orders`, {
    data: {
      totalAmount: cartItem.price,
      paymentMethod: 'cod',
      shippingName: 'Showcase Customer',
      shippingPhone: '0900000000',
      shippingAddress: '123 Showcase Street, Ho Chi Minh City',
      shippingCccd: null,
      items: [{
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        quantity: 1,
        price: cartItem.price,
      }],
    },
  }).catch(() => {})

  await page.goto(`${BASE_URL}/orders`)
  await screenshot(page, 'orders')

  await loginAdmin(page)
  await page.goto(`${BASE_URL}/${ADMIN_PREFIX}/dashboard`)
  await screenshot(page, 'admin-dashboard')

  await page.goto(`${BASE_URL}/${ADMIN_PREFIX}/inventory`)
  await screenshot(page, 'inventory')

  await page.goto(`${BASE_URL}/${ADMIN_PREFIX}/orders`)
  await screenshot(page, 'order-management')

  await page.goto(`${BASE_URL}/${ADMIN_PREFIX}/settings`)
  await screenshot(page, 'admin-settings')

  await browser.close()
  console.log(`Showcase screenshots saved to ${OUT_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
