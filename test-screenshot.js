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
  
  await productCard.screenshot({ path: 'before_hover.png' });
  
  await productCard.hover({ force: true });
  
  await page.waitForTimeout(1500);
  
  await productCard.screenshot({ path: 'after_hover.png' });
  
  await browser.close();
})();
