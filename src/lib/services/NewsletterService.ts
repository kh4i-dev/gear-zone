import { prisma } from '@/lib/db'

export class NewsletterService {
  public normalizeEmail(email: string) {
    return email.trim().toLowerCase()
  }

  public async findByEmail(email: string) {
    return await prisma.newsletterSubscription.findUnique({
      where: { email: this.normalizeEmail(email) },
    })
  }

  public async subscribe(email: string, source: string = 'homepage_footer') {
    const normalizedEmail = this.normalizeEmail(email)
    const existing = await this.findByEmail(normalizedEmail)

    if (existing) {
      if (!existing.isActive) {
        const subscription = await prisma.newsletterSubscription.update({
          where: { email: normalizedEmail },
          data: { isActive: true, source },
        })

        return { subscription, wasCreated: false, wasReactivated: true }
      }

      return { subscription: existing, wasCreated: false, wasReactivated: false }
    }

    try {
      const subscription = await prisma.newsletterSubscription.create({
        data: {
          email: normalizedEmail,
          source,
          isActive: true,
        },
      })

      return { subscription, wasCreated: true, wasReactivated: false }
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const subscription = await this.findByEmail(normalizedEmail)
        if (subscription) {
          return { subscription, wasCreated: false, wasReactivated: false }
        }
      }

      throw error
    }
  }

  public async unsubscribe(email: string) {
    return await prisma.newsletterSubscription.update({
      where: { email: this.normalizeEmail(email) },
      data: { isActive: false },
    })
  }
}

export const newsletterService = new NewsletterService()
