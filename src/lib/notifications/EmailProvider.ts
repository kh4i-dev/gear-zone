import nodemailer from 'nodemailer'

export class EmailProvider {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT || '587', 10)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      })
    }
  }

  public isConfigured(): boolean {
    return this.transporter !== null
  }

  public async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.transporter) {
      console.warn('EmailProvider is not configured (missing SMTP vars). Skipping email send.')
      return false
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        html,
      })
      return true
    } catch (error) {
      console.error('Failed to send email via SMTP:', error)
      return false
    }
  }
}
