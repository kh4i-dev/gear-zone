const { PrismaClient } = require("@prisma/client")
const p = new PrismaClient()

async function main() {
  const products = await p.product.findMany({
    select: { id: true, name: true, imageUrl: true },
    take: 20
  })
  for (const prod of products) {
    console.log(`${prod.id} | ${prod.name} | ${JSON.stringify(prod.imageUrl)}`)
  }
  await p.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })