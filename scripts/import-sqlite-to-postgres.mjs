import { existsSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { PrismaClient } from '@prisma/client'

const DEFAULT_SQLITE_PATH = path.join(process.cwd(), 'prisma', 'prisma', 'dev.db')
const BATCH_SIZE = 100

function resolveSqlitePath() {
  const fromPath = process.env.SQLITE_DATABASE_PATH
  const fromUrl = process.env.SQLITE_DATABASE_URL

  if (fromPath) return path.resolve(fromPath)
  if (fromUrl?.startsWith('file:')) {
    const rawPath = fromUrl.slice('file:'.length)
    return path.resolve(process.cwd(), rawPath)
  }

  return DEFAULT_SQLITE_PATH
}

function assertPostgresTarget() {
  const url = process.env.DATABASE_URL
  if (!url?.startsWith('postgresql://') && !url?.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string before importing.')
  }
}

function toDate(value, fallback = new Date()) {
  if (!value) return fallback
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return fallback
  return parsed
}

function toNullableString(value) {
  return value == null || value === '' ? null : String(value)
}

function toBoolean(value, fallback) {
  if (value == null) return fallback
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  return value === 'true' || value === '1'
}

function tableExists(sqlite, tableName) {
  const row = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(tableName)
  return Boolean(row)
}

function readRows(sqlite, tableName, orderColumn = 'id') {
  if (!tableExists(sqlite, tableName)) return []
  return sqlite
    .prepare(`SELECT * FROM "${tableName}" ORDER BY "${orderColumn}" ASC`)
    .all()
}

async function runInBatches(items, buildOperation) {
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE)
    await prisma.$transaction(batch.map(buildOperation))
  }
}

function omitId(data) {
  const { id, ...rest } = data
  return rest
}

assertPostgresTarget()

const sqlitePath = resolveSqlitePath()
if (!existsSync(sqlitePath)) {
  throw new Error(`SQLite source database not found: ${sqlitePath}`)
}

const prisma = new PrismaClient()
const sqlite = new DatabaseSync(sqlitePath, { readOnly: true })

try {
  const users = readRows(sqlite, 'User').map((row) => ({
    id: String(row.id),
    username: String(row.username),
    email: toNullableString(row.email),
    name: String(row.name),
    password: String(row.password),
    role: row.role ? String(row.role) : 'USER',
    phone: String(row.phone),
    address: toNullableString(row.address),
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
  }))

  const categories = readRows(sqlite, 'Category').map((row) => ({
    id: String(row.id),
    name: String(row.name),
  }))

  const products = readRows(sqlite, 'Product').map((row) => ({
    id: String(row.id),
    name: String(row.name),
    description: toNullableString(row.description),
    imageUrl: toNullableString(row.imageUrl),
    price: Number(row.price),
    oldPrice: row.oldPrice == null ? null : Number(row.oldPrice),
    stock: Number(row.stock ?? 0),
    soldCount: Number(row.soldCount ?? 0),
    categoryId: toNullableString(row.categoryId),
    isVisible: toBoolean(row.isVisible, true),
    status: row.status ? String(row.status) : 'ACTIVE',
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
  }))

  const settings = readRows(sqlite, 'Setting', 'key').map((row) => ({
    key: String(row.key),
    value: String(row.value),
  }))

  const orders = readRows(sqlite, 'Order').map((row) => ({
    id: String(row.id),
    userId: String(row.userId),
    status: row.status ? String(row.status) : 'PENDING',
    totalAmount: Number(row.totalAmount),
    shippingName: toNullableString(row.shippingName),
    shippingPhone: toNullableString(row.shippingPhone),
    shippingAddress: toNullableString(row.shippingAddress),
    shippingCccd: toNullableString(row.shippingCccd),
    paymentMethod: toNullableString(row.paymentMethod),
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
  }))

  const orderItems = readRows(sqlite, 'OrderItem').map((row) => ({
    id: String(row.id),
    orderId: String(row.orderId),
    productId: String(row.productId),
    quantity: Number(row.quantity),
    price: Number(row.price),
  }))

  console.log(`Import source: ${sqlitePath}`)
  console.log(`Rows found: users=${users.length}, categories=${categories.length}, products=${products.length}, settings=${settings.length}, orders=${orders.length}, orderItems=${orderItems.length}`)

  const userIdMap = new Map()
  for (const data of users) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { id: data.id },
          { username: data.username },
          { phone: data.phone },
          ...(data.email ? [{ email: data.email }] : []),
        ],
      },
      select: { id: true },
    })

    if (existing) {
      userIdMap.set(data.id, existing.id)
      await prisma.user.update({ where: { id: existing.id }, data: omitId(data) })
    } else {
      await prisma.user.create({ data })
      userIdMap.set(data.id, data.id)
    }
  }

  const categoryIdMap = new Map()
  for (const data of categories) {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { id: data.id },
          { name: data.name },
        ],
      },
      select: { id: true },
    })

    if (existing) {
      categoryIdMap.set(data.id, existing.id)
      await prisma.category.update({ where: { id: existing.id }, data: omitId(data) })
    } else {
      await prisma.category.create({ data })
      categoryIdMap.set(data.id, data.id)
    }
  }

  const mappedProducts = products.map((data) => ({
    ...data,
    categoryId: data.categoryId ? categoryIdMap.get(data.categoryId) ?? data.categoryId : null,
  }))

  await runInBatches(mappedProducts, (data) =>
    prisma.product.upsert({ where: { id: data.id }, update: data, create: data })
  )

  await runInBatches(settings, (data) =>
    prisma.setting.upsert({ where: { key: data.key }, update: data, create: data })
  )

  const mappedOrders = orders.map((data) => ({
    ...data,
    userId: userIdMap.get(data.userId) ?? data.userId,
  }))

  await runInBatches(mappedOrders, (data) =>
    prisma.order.upsert({ where: { id: data.id }, update: data, create: data })
  )

  await runInBatches(orderItems, (data) =>
    prisma.orderItem.upsert({ where: { id: data.id }, update: data, create: data })
  )

  const skipped = ['Cart', 'CartItem', 'Review'].filter((table) => !tableExists(sqlite, table))
  if (skipped.length > 0) {
    console.log(`Skipped missing optional tables: ${skipped.join(', ')}`)
  }

  console.log('SQLite to PostgreSQL import completed.')
} finally {
  sqlite.close()
  await prisma.$disconnect()
}
