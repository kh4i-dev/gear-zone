export async function register() {
  // Only run on Node.js runtime, not Edge runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { initEmailQueue } = await import('./lib/queue/EmailQueue')
      const { marketingService } = await import('./lib/services/MarketingService')

      // 1. Initialize BullMQ email worker / scheduler
      await initEmailQueue()

      // 2. Start recurring checks for Abandoned Carts (runs every 15 minutes)
      console.log('Registering background marketing & cart recovery loops...')
      
      setInterval(async () => {
        try {
          await marketingService.checkAbandonedCarts()
        } catch (err) {
          console.error('Error in background abandoned carts check:', err)
        }
      }, 15 * 60 * 1000) // 15 minutes
    } catch (error) {
      console.error('Failed to initialize background workers in instrumentation:', error)
    }
  }
}
