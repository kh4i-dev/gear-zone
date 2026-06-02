const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://127.0.0.1:3000/products');
  
  // Wait for the carousel arrows to appear
  const nextButton = page.locator('button[aria-label="Cuộn sang phải"]').first();
  
  // Click Next a few times to reveal Keris mouse
  console.log('Clicking Next on carousel...');
  for(let i = 0; i < 4; i++) {
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }
  }
  
  const productTitle = page.locator('h3', { hasText: 'Keris Aimpoint' }).first();
  await productTitle.waitFor({ state: 'visible' });
  
  const productCard = productTitle.locator('xpath=./ancestor::a').first();
  
  await productCard.screenshot({ path: 'keris_before.png' });
  
  await productCard.hover({ force: true });
  console.log('Hovering Keris Aimpoint...');
  
  await page.waitForTimeout(1500);
  await productCard.screenshot({ path: 'keris_after_1_5s.png' });
  
  await page.waitForTimeout(1500);
  await productCard.screenshot({ path: 'keris_after_3_0s.png' });
  
  await browser.close();
})();
