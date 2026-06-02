import prisma from '@/lib/db'

export class NewsletterService {
  /**
   * Find an existing subscription by email
   */
  public async findByEmail(email: string) {
    return await prisma.newsletterSubscription.findUnique({
      where: { email },
    })
  }

  /**
   * Create a new subscription
   */
  public async subscribe(email: string, source: string = 'homepage_footer') {
    return await prisma.newsletterSubscription.create({
      data: {
        email,
        source,
        isActive: true,
      },
    })
  }

  /**
   * Unsubscribe an email
   */
  public async unsubscribe(email: string) {
    return await prisma.newsletterSubscription.update({
      where: { email },
      data: { isActive: false },
    })
  }
}

export const newsletterService = new NewsletterService()
