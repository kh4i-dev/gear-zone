const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.product.findMany({
  where: { name: 'Chuột Gaming ASUS ROG Keris Aimpoint' },
  include: { images: true }
}).then(products => {
  console.log(JSON.stringify(products.map(p => ({ id: p.id, imgLen: p.images.length })), null, 2));
}).finally(() => prisma.$disconnect());
