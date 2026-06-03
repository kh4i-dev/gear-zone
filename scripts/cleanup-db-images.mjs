import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: {
      images: true,
    },
  });

  console.log(`Processing ${products.length} products to clean up image URLs...`);

  let updatedCount = 0;
  let addedImagesCount = 0;

  for (const product of products) {
    if (!product.imageUrl) continue;

    // Check if the URL contains pipe character
    if (product.imageUrl.includes('|')) {
      const urls = product.imageUrl
        .split(/[\r\n|]+/)
        .map((url) => url.trim())
        .filter(Boolean);

      if (urls.length === 0) continue;

      const primaryUrl = urls[0];
      const extraUrls = urls.slice(1);

      console.log(`Fixing product: "${product.name}"`);
      console.log(`  - Original: ${product.imageUrl}`);
      console.log(`  - Cleaned Primary: ${primaryUrl}`);

      // 1. Update the product's primary imageUrl in the DB
      await prisma.product.update({
        where: { id: product.id },
        data: {
          imageUrl: primaryUrl,
        },
      });
      updatedCount++;

      // 2. Add extra URLs to the ProductImage table
      // Let's check what the max sortOrder is to append properly
      let nextSortOrder = product.images.length
        ? Math.max(...product.images.map((img) => img.sortOrder)) + 1
        : 0;

      // Ensure the primary URL is also in ProductImage if no primary image is present
      const hasPrimaryInImages = product.images.some((img) => img.isPrimary || img.url === primaryUrl);
      if (!hasPrimaryInImages) {
        console.log(`  - Adding primary to ProductImage: ${primaryUrl}`);
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: primaryUrl,
            sortOrder: 0,
            isPrimary: true,
          },
        });
        addedImagesCount++;
      }

      for (const url of extraUrls) {
        const alreadyExists = product.images.some((img) => img.url === url);
        if (!alreadyExists) {
          console.log(`  - Adding extra image: ${url} (sortOrder: ${nextSortOrder})`);
          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: url,
              sortOrder: nextSortOrder++,
              isPrimary: false,
            },
          });
          addedImagesCount++;
        }
      }
    }
  }

  console.log(`Done! Cleaned up ${updatedCount} products and added ${addedImagesCount} gallery images.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
