const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst({
    where: { name: { contains: 'Keris' } },
    include: {
      images: true,
      options: { include: { values: true } },
      variants: { include: { images: true, optionValues: { include: { optionValue: true } } } }
    }
  });
  console.log(JSON.stringify(product, null, 2));
}

main().finally(() => prisma.$disconnect());
