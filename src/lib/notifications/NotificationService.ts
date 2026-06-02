import { prisma } from '@/lib/db'
import { EmailProvider } from './EmailProvider'
import { TelegramProvider } from './TelegramProvider'

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

    const emailConfig = {
      host: settings.smtpHost,
      port: settings.smtpPort,
      user: settings.smtpUser,
      pass: settings.smtpPass,
    }

    if (!this.emailProvider.isConfigured(emailConfig)) {
      console.warn('Cannot send Newsletter Welcome. SMTP is not configured.')
      return false
    }

    const subject = 'Chao mung ban den voi Newsletter cua GearZone!'
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Chao mung ban den voi GearZone!</h2>
        <p>Cam on ban da dang ky nhan ban tin tu GearZone.</p>
        <p>Tu bay gio, ban se la mot trong nhung nguoi dau tien nhan thong bao ve:</p>
        <ul>
          <li>Cac uu dai va ma giam gia doc quyen</li>
          <li>Deal gaming gear gia tot nhat</li>
          <li>Thong bao khi co san pham hot moi ve</li>
        </ul>
        <p>GearZone cam ket mang den nhung thiet bi choi game chat luong nhat cho ban.</p>
        <br/>
        <p>Tran trong,</p>
        <p><strong>Doi ngu GearZone</strong></p>
      </div>
    `

    return await this.emailProvider.sendEmail(email, subject, html, emailConfig)
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
    const message = `Newsletter moi tu GearZone\nEmail: ${email}\nTime: ${time}\nSource: ${source}`

    return await this.telegramProvider.sendMessage(message, telegramConfig)
  }
}

export const notificationService = new NotificationService()
