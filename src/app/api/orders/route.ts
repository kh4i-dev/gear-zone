import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { fail, success, unauthorized, badRequest } from '@/lib/api'

async function cancelExpiredOrders() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  try {
    await prisma.$transaction(async (tx) => {
      // Find all orders that are still awaiting payment and created > 5 minutes ago
      const expiredOrders = await tx.order.findMany({
        where: {
          status: 'AWAITING_PAYMENT',
          createdAt: {
            lt: fiveMinutesAgo
          }
        },
        include: {
          items: true
        }
      })

      for (const order of expiredOrders) {
        // Update order status to CANCELLED
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' }
        })

        // Replenish stock and soldCount for each item
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              soldCount: { decrement: item.quantity }
            }
          })
        }
        console.log(`[Auto-Cancel] Order ${order.id} automatically cancelled due to payment timeout (5 mins). Stock replenished.`)
      }
    })
  } catch (error) {
    console.error('Error during auto-cancelling expired orders:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(unauthorized('Vui lòng đăng nhập để xem đơn hàng'), { status: 401 })
    }

    // Process auto-cancellation of expired orders first
    await cancelExpiredOrders()

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: { select: { name: true, imageUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(success(orders))
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(fail('FETCH_ORDERS_ERROR', 'Lỗi khi lấy danh sách đơn hàng'), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(unauthorized('Vui lòng đăng nhập để thanh toán'), { status: 401 })
    }

    // Process auto-cancellation of expired orders first to release locked stock
    await cancelExpiredOrders()

    const body = await request.json()
    const { items, totalAmount, paymentMethod, shippingName, shippingPhone, shippingAddress, shippingCccd } = body

    if (!items || items.length === 0) {
      return NextResponse.json(badRequest('Giỏ hàng trống'), { status: 400 })
    }

    // Anti-spam & Inventory protection: Limit user to a max of 3 pending/awaiting orders
    const activeOrdersCount = await prisma.order.count({
      where: {
        userId: user.id,
        status: {
          in: ['PENDING', 'AWAITING_PAYMENT']
        }
      }
    })

    if (activeOrdersCount >= 3) {
      return NextResponse.json(
        badRequest('Bạn đang có 3 đơn hàng ở trạng thái chờ xử lý hoặc thanh toán. Vui lòng thanh toán/xác nhận các đơn hàng cũ hoặc liên hệ Hotline để được hỗ trợ trước khi tạo đơn mới!'),
        { status: 400 }
      )
    }

    // Start transaction
    const order = await prisma.$transaction(async (tx) => {
      // Check if automated bank or momo payment is configured
      const isAutomatedBank = !!(process.env.NEXT_PUBLIC_SEPAY_API_KEY || process.env.PAYOS_API_KEY)
      const isAutomatedMomo = !!process.env.NEXT_PUBLIC_MOMO_PHONE // If Momo API is implemented, otherwise manual starts as PENDING

      // Determine initial status based on payment method and automated configuration
      const initialStatus = (paymentMethod === 'bank' && isAutomatedBank)
        ? 'AWAITING_PAYMENT' 
        : 'PENDING'

      // Check stock before checking out
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        })
        if (!product || product.stock < item.quantity) {
          throw new Error(`Sản phẩm ${product?.name || 'không xác định'} đã hết hàng hoặc số lượng trong kho không đủ!`)
        }
      }

      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount,
          status: initialStatus,
          paymentMethod,
          shippingName,
          shippingPhone,
          shippingAddress,
          shippingCccd,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      })

      // Update product stock and soldCount
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        })
      }

      return newOrder
    })

    return NextResponse.json(success(order), { status: 201 })
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(fail('CREATE_ORDER_ERROR', error.message || 'Lỗi khi tạo đơn hàng'), { status: 500 })
  }
}
