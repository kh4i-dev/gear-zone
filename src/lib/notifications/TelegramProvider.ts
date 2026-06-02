export class TelegramProvider {
  private botToken: string | null = null
  private chatId: string | null = null

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || null
    this.chatId = process.env.TELEGRAM_CHAT_ID || null
  }

  public isConfigured(): boolean {
    return this.botToken !== null && this.chatId !== null
  }

  public async sendMessage(message: string): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      console.warn('TelegramProvider is not configured (missing vars). Skipping message.')
      return false
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
        }),
      })
      if (!res.ok) {
        throw new Error(`Telegram API responded with status: ${res.status}`)
      }
      return true
    } catch (error) {
      console.error('Failed to send Telegram message:', error)
      return false
    }
  }
}
