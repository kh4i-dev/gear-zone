import nodemailer from 'nodemailer'

export type EmailConfig = {
  host?: string
  port?: number
  user?: string
  pass?: string
}

export class EmailProvider {
  public isConfigured(config: EmailConfig): boolean {
    return Boolean(config.host && config.user && config.pass)
  }

  public async sendEmail(to: string, subject: string, html: string, config: EmailConfig): Promise<boolean> {
    if (!this.isConfigured(config)) {
      console.warn('EmailProvider is not configured (missing SMTP vars/settings). Skipping email send.')
      return false
    }

    try {
      const port = config.port || 587
      const transporter = nodemailer.createTransport({
        host: config.host,
        port,
        secure: port === 465,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      })

      await transporter.sendMail({
        from: config.user,
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
