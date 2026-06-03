import { prisma } from '@/lib/db'
import { enqueueEmail } from '../queue/EmailQueue'

// Default email templates to fallback on if not configured in Settings
const DEFAULT_TEMPLATES = {
  welcome_subject: 'Chào mừng bạn đến với GearZone! 🚀',
  welcome_body: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px;">
      <h2 style="color: #4f46e5; margin-bottom: 20px;">Chào mừng {{customer_name}} đến với GearZone!</h2>
      <p>Cảm ơn bạn đã đăng ký nhận bản tin từ GearZone.</p>
      <p>Từ bây giờ, bạn sẽ là một trong những người đầu tiên nhận thông tin về:</p>
      <ul>
        <li>Các ưu đãi và mã giảm giá độc quyền</li>
        <li>Deal gaming gear giá tốt nhất thị trường</li>
        <li>Thông báo khi có sản phẩm hot mới về</li>
      </ul>
      <p>Đặc biệt, tặng bạn mã giảm giá <b>WELCOME10</b> giảm ngay 10% cho đơn hàng đầu tiên!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{shop_url}}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ghé Thăm Cửa Hàng →</a>
      </div>
      <p style="color: #64748b; font-size: 12px;">Nếu bạn không đăng ký bản tin này, vui lòng bỏ qua email hoặc <a href="{{unsubscribe_url}}">hủy đăng ký</a>.</p>
    </div>
  `,
  order_subject: 'Xác nhận đơn hàng #{{order_id}} tại GearZone 📦',
  order_body: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px;">
      <h2 style="color: #10b981; margin-bottom: 20px;">Cảm ơn bạn đã mua hàng tại GearZone!</h2>
      <p>Xin chào {{customer_name}}, đơn hàng <b>#{{order_id}}</b> của bạn đã được nhận và đang được xử lý.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <h3>Chi tiết đơn hàng:</h3>
      {{products}}
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p><b>Tổng cộng:</b> {{total_amount}}</p>
      <p>Chúng tôi sẽ thông báo cho bạn khi đơn hàng bắt đầu được giao.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{shop_url}}/orders/{{order_id}}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Xem Chi Tiết Đơn Hàng</a>
      </div>
    </div>
  `,
  abandoned_cart_subject: 'Bạn quên sản phẩm trong giỏ hàng GearZone? 🛒',
  abandoned_cart_body: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px;">
      <h2 style="color: #eab308; margin-bottom: 20px;">Giỏ hàng của bạn đang đợi!</h2>
      <p>Xin chào {{customer_name}}, chúng tôi nhận thấy bạn đã để lại một số sản phẩm tuyệt vời trong giỏ hàng:</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        {{products}}
      </div>
      <p>Đừng để lỡ! Sản phẩm vẫn đang chờ bạn và số lượng có hạn.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{shop_url}}/cart" style="background-color: #eab308; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Quay Lại Giỏ Hàng Ngay →</a>
      </div>
    </div>
  `,
  review_reminder_subject: 'Chia sẻ cảm nhận về sản phẩm từ GearZone ⭐',
  review_reminder_body: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px;">
      <h2 style="color: #4f46e5; margin-bottom: 20px;">Đánh giá sản phẩm của bạn!</h2>
      <p>Xin chào {{customer_name}}, đơn hàng của bạn đã giao thành công được 7 ngày. Hãy chia sẻ trải nghiệm để giúp GearZone cải thiện dịch vụ nhé!</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        {{products}}
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{shop_url}}/orders/{{order_id}}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Viết Đánh Giá Ngay</a>
      </div>
    </div>
  `,
  recommendation_subject: 'Gợi ý sản phẩm dành riêng cho bạn tại GearZone 🎁',
  recommendation_body: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px;">
      <h2 style="color: #ec4899; margin-bottom: 20px;">Gợi ý hot dành riêng cho bạn!</h2>
      <p>Chào {{customer_name}}, dựa trên các sản phẩm bạn đã mua, GearZone xin giới thiệu các phụ kiện có thể bạn sẽ thích:</p>
      <div style="margin: 25px 0;">
        {{products}}
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{shop_url}}" style="background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Khám Phá Thêm</a>
      </div>
    </div>
  `,
}

export class MarketingService {
  // Load email template (from settings or default)
  public async getTemplate(type: string) {
    const subjectKey = `email_template_${type}_subject`
    const bodyKey = `email_template_${type}_body`

    const settings = await prisma.setting.findMany({
      where: { key: { in: [subjectKey, bodyKey] } },
    })

    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]))
    
    const fallbackSubject = (DEFAULT_TEMPLATES as any)[`${type}_subject`] || 'GearZone Notification'
    const fallbackBody = (DEFAULT_TEMPLATES as any)[`${type}_body`] || '<p>GearZone</p>'

    return {
      subject: settingsMap[subjectKey] || fallbackSubject,
      body: settingsMap[bodyKey] || fallbackBody,
    }
  }

  // Segmenting newsletter subscribers dynamically
  public async getSegmentSubscribers(segment: string) {
    // 1. Get all active subscribers
    const subscribers = await prisma.newsletterSubscription.findMany({
      where: { isActive: true },
    })

    if (segment === 'ALL' || subscribers.length === 0) {
      return subscribers
    }

    // 2. Fetch users matching subscriber emails to do behavior segmentation
    const emails = subscribers.map((s) => s.email)
    const matchedUsers = await prisma.user.findMany({
      where: {
        email: { in: emails, mode: 'insensitive' },
      },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    const userMap = new Map(matchedUsers.map((u) => [u.email?.toLowerCase(), u]))

    return subscribers.filter((sub) => {
      const user = userMap.get(sub.email.toLowerCase())
      if (!user) return false // guest subscriber has no purchase history, only receives ALL

      if (segment === 'VIP') {
        const totalSpent = user.orders.reduce((sum, o) => sum + o.totalAmount, 0)
        return totalSpent >= 5000000 // VIP spent threshold
      }

      // Check product categories purchased
      const categoriesPurchased = new Set<string>()
      user.orders.forEach((order) => {
        order.items.forEach((item) => {
          if (item.product.category?.name) {
            categoriesPurchased.add(item.product.category.name.toLowerCase())
          }
        })
      })

      if (segment === 'KEYBOARD') {
        return categoriesPurchased.has('bàn phím') || categoriesPurchased.has('keyboard')
      }
      if (segment === 'MOUSE') {
        return categoriesPurchased.has('chuột') || categoriesPurchased.has('mouse')
      }
      if (segment === 'HEADSET') {
        return (
          categoriesPurchased.has('tai nghe') ||
          categoriesPurchased.has('headset') ||
          categoriesPurchased.has('loa')
        )
      }

      return false
    })
  }

  // Parse HTML templates replacing placeholders
  public parseTemplate(
    html: string,
    replacements: Record<string, string>
  ): string {
    let result = html
    Object.entries(replacements).forEach(([key, val]) => {
      result = result.replaceAll(`{{${key}}}`, val)
    })
    return result
  }

  // Format product list helper for emails
  public formatProductsHtml(products: Array<{ name: string; price: number; oldPrice?: number | null; imageUrl?: string | null }>): string {
    return products
      .map(
        (p) => `
      <div style="display: flex; align-items: center; border-bottom: 1px solid #f1f5f9; padding: 10px 0;">
        ${
          p.imageUrl
            ? `<img src="${p.imageUrl}" alt="${p.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; margin-right: 15px;" />`
            : ''
        }
        <div style="flex: 1;">
          <h4 style="margin: 0; font-size: 14px; color: #1e293b;">${p.name}</h4>
          <span style="font-size: 13px; font-weight: bold; color: #4f46e5;">${p.price.toLocaleString('vi-VN')}đ</span>
          ${
            p.oldPrice
              ? `<span style="font-size: 11px; text-decoration: line-through; color: #94748b; margin-left: 8px;">${p.oldPrice.toLocaleString(
                  'vi-VN'
                )}đ</span>`
              : ''
          }
        </div>
      </div>
    `
      )
      .join('')
  }

  // Trigger campaign sending
  public async sendCampaign(campaignId: string) {
    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!campaign) throw new Error('Campaign not found')

    // Update status to SENDING
    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: { status: 'SENDING', sentCount: 0 },
    })

    const subscribers = await this.getSegmentSubscribers(campaign.targetGroup)
    if (subscribers.length === 0) {
      await prisma.marketingCampaign.update({
        where: { id: campaignId },
        data: { status: 'SENT' },
      })
      return
    }

    const shopUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const productsList = campaign.products.map((cp) => cp.product)
    const productsHtml = this.formatProductsHtml(productsList)

    for (const sub of subscribers) {
      // 1. Create campaign log entry
      const log = await prisma.campaignLog.create({
        data: {
          campaignId,
          email: sub.email,
          status: 'PENDING',
        },
      })

      // 2. Format content
      const customerName = sub.email.split('@')[0]
      const emailBody = this.parseTemplate(campaign.content, {
        customer_name: customerName,
        products: productsHtml,
        shop_url: shopUrl,
        unsubscribe_url: `${shopUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(
          sub.email
        )}`,
      })

      // Wrap email body with open tracking pixel & rewrite links for click tracking
      const openTrackingPixel = `<img src="${shopUrl}/api/newsletter/track/open?logId=${log.id}" width="1" height="1" style="display:none;" />`
      let trackedBody = emailBody + openTrackingPixel

      // Quick rewrite anchor tags to redirect for tracking clicks
      trackedBody = trackedBody.replace(/href="([^"]+)"/g, (match, url) => {
        if (url.startsWith('http') && !url.includes('/track/')) {
          return `href="${shopUrl}/api/newsletter/track/click?logId=${log.id}&url=${encodeURIComponent(
            url
          )}"`
        }
        return match
      })

      // 3. Dispatch to Queue
      await enqueueEmail({
        to: sub.email,
        subject: campaign.subject,
        html: trackedBody,
        campaignId,
        logId: log.id,
      })
    }

    // Update campaign status
    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: { status: 'SENT' },
    })
  }

  // Automation Check: Cart Recovery (runs as a scheduled loop)
  public async checkAbandonedCarts() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    // Find carts modified > 24 hours ago that have items and haven't been emailed
    const carts = await prisma.cart.findMany({
      where: {
        abandonedEmailSent: false,
        updatedAt: { lte: oneDayAgo },
        items: {
          some: {}, // has at least one item
        },
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    })

    if (carts.length === 0) return

    const template = await this.getTemplate('abandoned_cart')
    const shopUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    for (const cart of carts) {
      if (!cart.user.email) continue // skip users without emails

      // Confirm user hasn't completed an order *after* the cart's last update time
      const recentOrder = await prisma.order.findFirst({
        where: {
          userId: cart.userId,
          createdAt: { gte: cart.updatedAt },
        },
      })
      
      if (recentOrder) {
        // User purchased, mark as sent to avoid spamming
        await prisma.cart.update({
          where: { id: cart.id },
          data: { abandonedEmailSent: true },
        })
        continue
      }

      // Compile products list HTML
      const productsData = cart.items.map((item) => ({
        name: item.product.name + (item.variant?.sku ? ` (${item.variant.sku})` : ''),
        price: item.variant?.salePrice ?? item.variant?.price ?? item.product.price,
        imageUrl: item.variant?.imageUrl ?? item.product.imageUrl,
      }))
      const productsHtml = this.formatProductsHtml(productsData)

      // Replace placeholders
      const emailBody = this.parseTemplate(template.body, {
        customer_name: cart.user.name || cart.user.username,
        products: productsHtml,
        shop_url: shopUrl,
      })

      // Log into ScheduledEmail
      await prisma.scheduledEmail.create({
        data: {
          email: cart.user.email,
          type: 'ABANDONED_CART',
          targetId: cart.id,
          subject: template.subject,
          body: emailBody,
          scheduledAt: new Date(), // send immediately
          status: 'PENDING',
        },
      })

      // Mark cart as sent
      await prisma.cart.update({
        where: { id: cart.id },
        data: { abandonedEmailSent: true },
      })
    }
  }

  // Automation Trigger: Post purchase scheduler
  public async schedulePostPurchaseEmails(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order || !order.user.email) return

    const shopUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const customerName = order.user.name || order.user.username

    const productsData = order.items.map((item) => ({
      name: item.product.name,
      price: item.price,
      imageUrl: item.product.imageUrl,
    }))
    const productsHtml = this.formatProductsHtml(productsData)

    // 1. Queue Order Confirmation (Immediately)
    const confTemplate = await this.getTemplate('order')
    const confBody = this.parseTemplate(confTemplate.body, {
      customer_name: customerName,
      order_id: order.id,
      products: productsHtml,
      total_amount: order.totalAmount.toLocaleString('vi-VN') + 'đ',
      shop_url: shopUrl,
    })

    await prisma.scheduledEmail.create({
      data: {
        email: order.user.email,
        type: 'ORDER_CONFIRMATION',
        targetId: order.id,
        subject: this.parseTemplate(confTemplate.subject, { order_id: order.id }),
        body: confBody,
        scheduledAt: new Date(), // immediate
        status: 'PENDING',
      },
    })

    // 2. Schedule Review Reminder (7 days later)
    const reviewTemplate = await this.getTemplate('review_reminder')
    const reviewBody = this.parseTemplate(reviewTemplate.body, {
      customer_name: customerName,
      order_id: order.id,
      products: productsHtml,
      shop_url: shopUrl,
    })

    await prisma.scheduledEmail.create({
      data: {
        email: order.user.email,
        type: 'REVIEW_REMINDER',
        targetId: order.id,
        subject: reviewTemplate.subject,
        body: reviewBody,
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'PENDING',
      },
    })

    // 3. Schedule Product Recommendations (30 days later)
    // For recommendations, we can pull 3 random active products of other categories
    const purchasedCategoryIds = order.items
      .map((item) => item.product.categoryId)
      .filter(Boolean) as string[]

    const recommendedProducts = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        isVisible: true,
        categoryId: { notIn: purchasedCategoryIds },
      },
      take: 3,
    })

    // Fallback if no other categories exist
    const finalRecs = recommendedProducts.length > 0 
      ? recommendedProducts 
      : await prisma.product.findMany({ where: { status: 'ACTIVE', isVisible: true }, take: 3 })

    const recsHtml = this.formatProductsHtml(finalRecs)
    const recsTemplate = await this.getTemplate('recommendation')
    const recsBody = this.parseTemplate(recsTemplate.body, {
      customer_name: customerName,
      products: recsHtml,
      shop_url: shopUrl,
    })

    await prisma.scheduledEmail.create({
      data: {
        email: order.user.email,
        type: 'RECOMMENDATION',
        targetId: order.id,
        subject: recsTemplate.subject,
        body: recsBody,
        scheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: 'PENDING',
      },
    })
  }
}

export const marketingService = new MarketingService()
