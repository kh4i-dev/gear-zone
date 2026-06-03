import { prisma } from '@/lib/db'
import { EmailProvider } from './EmailProvider'
import { TelegramProvider } from './TelegramProvider'
import { marketingService } from '@/lib/services/MarketingService'

type NotificationSettings = {
  telegramBotToken?: string
  telegramChatId?: string
  smtpHost?: string
  smtpPort: number
  smtpUser?: string
  smtpPass?: string
  newsletterWelcomeEnabled: boolean
  adminNotifyNewsletterEnabled: boolean
}

function enabledByDefault(value: string | undefined) {
  return value !== 'false'
}

export class NotificationService {
  private emailProvider: EmailProvider
  private telegramProvider: TelegramProvider

  constructor() {
    this.emailProvider = new EmailProvider()
    this.telegramProvider = new TelegramProvider()
  }

  private async getSettings(): Promise<NotificationSettings> {
    const rows = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'telegram_bot_token',
            'telegram_chat_id',
            'smtp_host',
            'smtp_port',
            'smtp_user',
            'smtp_pass',
            'newsletter_welcome_enabled',
            'admin_notify_newsletter_enabled',
          ],
        },
      },
    })
    const settingsMap = Object.fromEntries(rows.map((setting) => [setting.key, setting.value]))
    const smtpPort = Number(settingsMap.smtp_port || process.env.SMTP_PORT || 587)

    return {
      telegramBotToken: settingsMap.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN || undefined,
      telegramChatId: settingsMap.telegram_chat_id || process.env.TELEGRAM_CHAT_ID || undefined,
      smtpHost: settingsMap.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: Number.isFinite(smtpPort) ? smtpPort : 587,
      smtpUser: settingsMap.smtp_user || process.env.SMTP_USER || undefined,
      smtpPass: settingsMap.smtp_pass || process.env.SMTP_PASS || undefined,
      newsletterWelcomeEnabled: enabledByDefault(settingsMap.newsletter_welcome_enabled || process.env.NEWSLETTER_WELCOME_ENABLED),
      adminNotifyNewsletterEnabled: enabledByDefault(settingsMap.admin_notify_newsletter_enabled || process.env.ADMIN_NOTIFY_NEWSLETTER_ENABLED),
    }
  }

  public async sendNewsletterWelcome(email: string): Promise<boolean> {
    const settings = await this.getSettings()
    if (!settings.newsletterWelcomeEnabled) return false

    try {
      const template = await marketingService.getTemplate('welcome')
      const shopUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gearzone.kh4idev.id.vn'
      const customerName = email.split('@')[0]

      // Fetch 3 active products to display in the email
      let products = await prisma.product.findMany({
        where: { status: 'ACTIVE', isVisible: true },
        take: 3,
        orderBy: { soldCount: 'desc' },
      })

      // Fallback to mock products if database is empty
      if (products.length === 0) {
        products = [
          {
            id: 'mock-1',
            name: 'Akko 5075B Plus Blue on White',
            price: 2490000,
            oldPrice: 2890000,
            imageUrl: '/images/products/akko-5075b.png',
          },
          {
            id: 'mock-2',
            name: 'Logitech G Pro X Superlight 2',
            price: 3590000,
            oldPrice: 3890000,
            imageUrl: '/images/products/gpro-superlight.png',
          },
          {
            id: 'mock-3',
            name: 'HyperX Cloud III Wireless',
            price: 2990000,
            oldPrice: 3490000,
            imageUrl: '/images/products/cloud3.png',
          },
        ] as any
      }

      const productsHtml = marketingService.formatProductsHtml(products)
      const emailBody = marketingService.parseTemplate(template.body, {
        customer_name: customerName,
        products: productsHtml,
        shop_url: shopUrl,
        unsubscribe_url: `${shopUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`,
      })

      // Create ScheduledEmail immediately to be sent via queue
      await prisma.scheduledEmail.create({
        data: {
          email,
          type: 'WELCOME',
          subject: template.subject,
          body: emailBody,
          scheduledAt: new Date(),
          status: 'PENDING',
        },
      })
      return true
    } catch (error) {
      console.error('Failed to queue newsletter welcome email:', error)
      return false
    }
  }

  public async notifyAdminNewSubscriber(email: string, source: string = 'unknown'): Promise<boolean> {
    const settings = await this.getSettings()
    if (!settings.adminNotifyNewsletterEnabled) return false

    const telegramConfig = {
      botToken: settings.telegramBotToken,
      chatId: settings.telegramChatId,
    }

    if (!this.telegramProvider.isConfigured(telegramConfig)) {
      console.warn('Cannot notify Admin of new subscriber. Telegram is not configured.')
      return false
    }

    const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    const message = `Bản tin mới từ GearZone\nEmail: ${email}\nThời gian: ${time}\nNguồn: ${source}`

    return await this.telegramProvider.sendMessage(message, telegramConfig)
  }

  public async notifyAdminNewOrder(orderId: string): Promise<boolean> {
    const settings = await this.getSettings()
    
    const telegramConfig = {
      botToken: settings.telegramBotToken,
      chatId: settings.telegramChatId,
    }

    if (!this.telegramProvider.isConfigured(telegramConfig)) {
      console.warn('Cannot notify Admin of new order. Telegram is not configured.')
      return false
    }

    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          items: {
            include: {
              product: true,
              variant: {
                include: {
                  optionValues: {
                    include: {
                      optionValue: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!order) {
        console.warn(`Order ${orderId} not found for Telegram notification.`)
        return false
      }

      const formattedTotal = order.totalAmount.toLocaleString('vi-VN') + 'đ'
      const paymentText = order.paymentMethod === 'bank' ? 'Chuyển khoản (Bank)' : 'Thanh toán COD'
      const time = order.createdAt.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })

      let itemsText = ''
      order.items.forEach((item, index) => {
        let variantName = ''
        if (item.variant) {
          variantName = ' (' + item.variant.optionValues.map(ov => ov.optionValue.label).join(', ') + ')'
        }
        itemsText += `${index + 1}. ${item.product.name}${variantName} x ${item.quantity} (${item.price.toLocaleString('vi-VN')}đ)\n`
      })

      const message = `🔔 ĐƠN HÀNG MỚI TỪ GEARZONE!\n\n` +
        `• Mã đơn hàng: #${order.id}\n` +
        `• Thời gian: ${time}\n` +
        `• Khách hàng: ${order.shippingName || order.user.name}\n` +
        `• Điện thoại: ${order.shippingPhone || order.user.phone || 'N/A'}\n` +
        `• Địa chỉ: ${order.shippingAddress || 'N/A'}\n` +
        `• Thanh toán: ${paymentText}\n` +
        `• Trạng thái: PENDING\n\n` +
        `📦 Sản phẩm đặt mua:\n${itemsText}\n` +
        `💰 Tổng tiền thanh toán: ${formattedTotal}`

      return await this.telegramProvider.sendMessage(message, telegramConfig)
    } catch (error) {
      console.error('Failed to notify Admin of new order via Telegram:', error)
      return false
    }
  }
}

export const notificationService = new NotificationService()