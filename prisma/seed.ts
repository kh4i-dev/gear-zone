import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (adminEmail && adminPassword) {
    const hashed = await bcrypt.hash(adminPassword, 10)
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
    if (existing) {
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashed,
          role: 'ADMIN',
        },
      })
      console.log('Admin user credentials updated')
    } else {
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Admin',
          password: hashed,
          role: 'ADMIN',
        },
      })

      console.log('Admin user created')
    }
  } else {
    console.log('ADMIN_EMAIL or ADMIN_PASSWORD not set; skipping admin user seed')
  }

  const categories = ['Bàn phím', 'Chuột', 'Tai nghe']
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  const keyboard = await prisma.category.findUnique({ where: { name: 'Bàn phím' } })
  const mouse = await prisma.category.findUnique({ where: { name: 'Chuột' } })
  const headset = await prisma.category.findUnique({ where: { name: 'Tai nghe' } })

  const sampleProducts = [
    {
      name: 'Akko 5075B Plus Black & Gold',
      data: {
        name: 'Akko 5075B Plus Black & Gold',
        description: 'Bàn phím cơ wireless layout 75%, switch Akko V3 Cream Yellow.',
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
        price: 1890000,
        oldPrice: 2290000,
        stock: 12,
        soldCount: 8,
        categoryId: keyboard?.id,
      },
    },
    {
      name: 'Logitech G Pro X Superlight 2',
      data: {
        name: 'Logitech G Pro X Superlight 2',
        description: 'Chuột gaming không dây siêu nhẹ, cảm biến HERO 2.',
        imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=80',
        price: 3290000,
        oldPrice: 3790000,
        stock: 6,
        soldCount: 15,
        categoryId: mouse?.id,
      },
    },
    {
      name: 'HyperX Cloud III Wireless',
      data: {
        name: 'HyperX Cloud III Wireless',
        description: 'Tai nghe gaming không dây, pin dài, âm thanh rõ.',
        imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
        price: 2790000,
        oldPrice: 3190000,
        stock: 4,
        soldCount: 11,
        categoryId: headset?.id,
      },
    },
  ]

  for (const product of sampleProducts) {
    const existingProduct = await prisma.product.findFirst({ where: { name: product.name } })
    if (!existingProduct) {
      await prisma.product.create({ data: product.data })
    }
  }

  console.log('Sample products seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
