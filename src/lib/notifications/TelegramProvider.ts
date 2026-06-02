export type TelegramConfig = {
  botToken?: string
  chatId?: string
}

export class TelegramProvider {
  public isConfigured(config: TelegramConfig): boolean {
    return Boolean(config.botToken && config.chatId)
  }

  public async sendMessage(message: string, config: TelegramConfig): Promise<boolean> {
    if (!this.isConfigured(config)) {
      console.warn('TelegramProvider is not configured (missing vars/settings). Skipping message.')
      return false
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.chatId,
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
