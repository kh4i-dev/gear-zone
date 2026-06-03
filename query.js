const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { URL } = require('url');

async function main() {
  const products = await prisma.product.findMany({
    select: {
      imageUrl: true,
      images: {
        select: {
          url: true
        }
      }
    }
  });

  const domains = new Set();
  
  function addUrl(str) {
    if (!str) return;
    str.split(/[\r\n|]+/).forEach(part => {
      const trimmed = part.trim();
      if (!trimmed) return;
      try {
        const u = new URL(trimmed);
        domains.add(u.hostname);
      } catch (e) {
        // Not a valid URL
        console.log(`Invalid URL found: ${trimmed}`);
      }
    });
  }

  products.forEach(p => {
    addUrl(p.imageUrl);
    p.images.forEach(img => addUrl(img.url));
  });

  console.log('Unique image domains in database:');
  console.log(Array.from(domains));
}

main().finally(() => prisma.$disconnect());
