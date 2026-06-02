const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.product.findMany({
  where: { name: { in: [
    'Chuột Gaming ASUS ROG Keris Aimpoint',
    'Chuột Razer Pro Click V2 Vertical',
    'Chuột Razer Viper V3 Pro Counter-Strike 2 Edition',
    'Chuột gaming không dây Logitech Pro X2 Superstrike Lightspeed'
  ] } },
  include: { images: true }
}).then(products => {
  for (const p of products) {
    console.log(`Product: ${p.name}, images.length in DB = ${p.images.length}`);
    if (p.images.length > 0) {
      console.log(p.images.map(img => img.url));
    }
  }
}).finally(() => prisma.$disconnect());
