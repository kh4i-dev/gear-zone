const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'dark'
  });
  
  const page = await context.newPage();
  
  // Helper to ensure page is settled
  const settle = async (ms = 2000) => await page.waitForTimeout(ms);

  try {
    // 1. Homepage
    console.log('Capturing Homepage...');
    await page.goto('http://127.0.0.1:3000/');
    await settle(2500);
    await page.screenshot({ path: path.join(OUT_DIR, 'homepage.png') });

    // 2. Login
    console.log('Capturing Login...');
    await page.goto('http://127.0.0.1:3000/?auth=login');
    await settle(1000);
    await page.screenshot({ path: path.join(OUT_DIR, 'login.png') });

    // 3. Register
    console.log('Capturing Register...');
    await page.goto('http://127.0.0.1:3000/?auth=register');
    await settle(1000);
    await page.screenshot({ path: path.join(OUT_DIR, 'register.png') });

    // 4. Products
    console.log('Capturing Products...');
    await page.goto('http://127.0.0.1:3000/products');
    await settle(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'products.png') });

    // Navigate to first product detail
    const firstProduct = page.locator('a[href^="/products/"]').first();
    const productUrl = await firstProduct.getAttribute('href');
    if (productUrl) {
      console.log(`Capturing Product Detail (${productUrl})...`);
      await page.goto(`http://127.0.0.1:3000${productUrl}`);
      await settle(2000);
      await page.screenshot({ path: path.join(OUT_DIR, 'product-detail.png') });

      // Click Add to Cart
      const addToCartBtn = page.locator('button:has-text("Thêm vào giỏ"), button:has-text("Add to cart")').first();
      if (await addToCartBtn.count() > 0) {
        await addToCartBtn.click();
        await settle(1000); // wait for cart sidebar/notification
      }
    }

    // 5. Cart
    console.log('Capturing Cart...');
    // Some stores open cart in sidebar, some redirect. Let's just go to /cart or open cart drawer
    // For GearZone, typically there's a cart icon in the header.
    const cartIcon = page.locator('header a[href="/checkout"], header button:has(svg)').nth(1); 
    await page.goto('http://127.0.0.1:3000/checkout'); // If it has a checkout page
    await settle(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'checkout.png') });

    // Login as Admin
    console.log('Logging in as Admin...');
    await page.goto('http://127.0.0.1:3000/system-control/auth-login');
    await settle(1000);
    await page.fill('input[type="email"], input[name="username"]', 'admin');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    await settle(3000);

    // 6. Admin Dashboard
    console.log('Capturing Admin Dashboard...');
    await page.goto('http://127.0.0.1:3000/system-control/dashboard');
    await settle(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'admin-dashboard.png') });

    // 7. Inventory / Products
    console.log('Capturing Inventory...');
    await page.goto('http://127.0.0.1:3000/system-control/products');
    await settle(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'inventory.png') });

    // 8. Orders
    console.log('Capturing Orders...');
    await page.goto('http://127.0.0.1:3000/system-control/orders');
    await settle(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'orders.png') });

    // 9. Settings
    console.log('Capturing Settings...');
    await page.goto('http://127.0.0.1:3000/system-control/settings');
    await settle(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'settings.png') });

    // 10. Categories
    console.log('Capturing Categories...');
    await page.goto('http://127.0.0.1:3000/system-control/categories');
    await settle(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'categories.png') });

  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
    console.log('All screenshots captured.');
  }
}

run();
