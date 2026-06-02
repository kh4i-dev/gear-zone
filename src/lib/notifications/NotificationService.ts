import { EmailProvider } from './EmailProvider'
import { TelegramProvider } from './TelegramProvider'

export class NotificationService {
  private emailProvider: EmailProvider
  private telegramProvider: TelegramProvider

  constructor() {
    this.emailProvider = new EmailProvider()
    this.telegramProvider = new TelegramProvider()
  }

  /**
   * Send a Welcome Email to a new Newsletter Subscriber
   */
  public async sendNewsletterWelcome(email: string): Promise<boolean> {
    const isEnabled = process.env.NEWSLETTER_WELCOME_ENABLED === 'true'
    if (!isEnabled) return false

    if (!this.emailProvider.isConfigured()) {
      console.warn('Cannot send Newsletter Welcome. SMTP is not configured.')
      return false
    }

    const subject = 'Chào mừng bạn đến với Newsletter của GearZone!'
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Chào mừng bạn đến với GearZone!</h2>
        <p>Cảm ơn bạn đã đăng ký nhận bản tin từ GearZone.</p>
        <p>Từ bây giờ, bạn sẽ là một trong những người đầu tiên nhận được thông báo về:</p>
        <ul>
          <li>Các ưu đãi và mã giảm giá độc quyền</li>
          <li>Deal gaming gear giá tốt nhất</li>
          <li>Thông báo khi có sản phẩm hot mới về</li>
        </ul>
        <p>GearZone cam kết mang đến những thiết bị chơi game chất lượng nhất cho bạn.</p>
        <br/>
        <p>Trân trọng,</p>
        <p><strong>Đội ngũ GearZone</strong></p>
      </div>
    `

    return await this.emailProvider.sendEmail(email, subject, html)
  }

  /**
   * Send an Admin Alert via Telegram when someone subscribes
   */
  public async notifyAdminNewSubscriber(email: string, source: string = 'unknown'): Promise<boolean> {
    const isEnabled = process.env.ADMIN_NOTIFY_NEWSLETTER_ENABLED !== 'false' // default to true if not explicitly disabled
    if (!isEnabled) return false

    if (!this.telegramProvider.isConfigured()) {
      console.warn('Cannot notify Admin of new subscriber. Telegram is not configured.')
      return false
    }

    const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    const message = `📩 Newsletter mới từ GearZone\nEmail: ${email}\nTime: ${time}\nSource: ${source}`

    return await this.telegramProvider.sendMessage(message)
  }
}

// Export a singleton instance
export const notificationService = new NotificationService()
