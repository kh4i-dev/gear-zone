const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://127.0.0.1:3000/products');
  
  const productTitle = page.locator('h3', { hasText: 'Keris Aimpoint' }).first();
  await productTitle.waitFor({ state: 'visible' });
  
  const productCard = productTitle.locator('xpath=./ancestor::a').first();
  
  await page.evaluate(() => {
    document.querySelectorAll('.overflow-hidden').forEach(el => el.classList.remove('overflow-hidden'));
  });
  
  await productCard.scrollIntoViewIfNeeded();
  
  const transformBefore = await productCard.locator('.transition-transform.duration-500').first().evaluate(el => el.style.transform);
  console.log('Transform before hover:', transformBefore);
  
  // Use page.hover which simulates real mouse movement, but force it
  // and wait for the slideshow interval
  console.log('Hovering with Playwright...');
  await productCard.hover({ force: true });
  
  console.log('Waiting 1500ms...');
  await page.waitForTimeout(1500);
  
  const transformAfter1 = await productCard.locator('.transition-transform.duration-500').first().evaluate(el => el.style.transform);
  console.log('Transform after 1.5s:', transformAfter1);
  
  console.log('Waiting another 1500ms...');
  await page.waitForTimeout(1500);
  
  const transformAfter2 = await productCard.locator('.transition-transform.duration-500').first().evaluate(el => el.style.transform);
  console.log('Transform after 3.0s:', transformAfter2);
  
  await browser.close();
})();
