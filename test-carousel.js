const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Expose a function to collect logs
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));
  
  await page.goto('http://127.0.0.1:3000/products');
  
  // Find the Chuột bán chạy carousel
  const carouselHeader = page.locator('h2', { hasText: 'Chuột bán chạy' }).first();
  await carouselHeader.waitFor({ state: 'visible' });
  
  const carousel = carouselHeader.locator('xpath=./ancestor::div[contains(@class, "overflow-hidden")][1]').first();
  
  console.log('Waiting for 5 seconds to see if auto-slide occurs...');
  
  // Get the transform of the flex container inside this carousel
  const flexContainer = carousel.locator('.flex').first();
  
  const transform1 = await flexContainer.evaluate(el => el.style.transform);
  console.log('Transform at 0s:', transform1);
  
  await page.waitForTimeout(4500);
  
  const transform2 = await flexContainer.evaluate(el => el.style.transform);
  console.log('Transform at 4.5s:', transform2);
  
  if (transform1 === transform2) {
    console.log('Carousel DID NOT auto-slide!');
  } else {
    console.log('Carousel DID auto-slide!');
  }
  
  console.log('Browser logs:', logs.filter(l => l.includes('CAROUSEL')));
  
  await browser.close();
})();
