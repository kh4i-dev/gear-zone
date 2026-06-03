import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'
import nodemailer from 'nodemailer'
import { prisma } from '@/lib/db'

const QUEUE_NAME = 'email-queue'
let emailQueue: Queue | null = null
let emailWorker: Worker | null = null
let useBullMQ = false
let fallbackInterval: NodeJS.Timeout | null = null

// Helper to fetch SMTP config dynamically from the database
export async function getDynamicSmtpConfig() {
  const rows = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          'smtp_host',
          'smtp_port',
          'smtp_user',
          'smtp_pass',
          'smtp_sender_name',
          'smtp_sender_email',
        ],
      },
    },
  })
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  const port = Number(map.smtp_port || 587)

  return {
    host: map.smtp_host || 'smtp.gmail.com',
    port: Number.isFinite(port) ? port : 587,
    user: map.smtp_user || '',
    pass: map.smtp_pass || '',
    senderName: map.smtp_sender_name || 'GearZone',
    senderEmail: map.smtp_sender_email || map.smtp_user || '',
  }
}

// Nodemailer sender logic
async function sendRawEmail(to: string, subject: string, html: string) {
  const emailLower = to.toLowerCase()
  if (
    emailLower.endsWith('@example.com') ||
    emailLower.endsWith('@test.com') ||
    emailLower.endsWith('@localhost') ||
    emailLower.endsWith('@mock.com')
  ) {
    console.log(`[SMTP Sandbox] Skipping sending email to mock address: ${to}`)
    return
  }

  const smtp = await getDynamicSmtpConfig()
  if (!smtp.host || !smtp.user || !smtp.pass) {
    throw new Error('SMTP credentials are not configured in settings.')
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  })

  const fromString = smtp.senderName 
    ? `"${smtp.senderName}" <${smtp.senderEmail}>` 
    : smtp.senderEmail

  await transporter.sendMail({
    from: fromString,
    to,
    subject,
    html,
  })
}

// Function to process a single email job
async function processEmailJob(data: any) {
  const { to, subject, html, campaignId, logId, scheduledEmailId } = data
  try {
    // 1. Send the email
    await sendRawEmail(to, subject, html)

    // 2. Update CampaignLog if present
    if (logId) {
      await prisma.campaignLog.update({
        where: { id: logId },
        data: { status: 'SENT', sentAt: new Date() },
      })
      if (campaignId) {
        await prisma.marketingCampaign.update({
          where: { id: campaignId },
          data: { sentCount: { increment: 1 } },
        })
      }
    }

    // 3. Update ScheduledEmail if present
    if (scheduledEmailId) {
      await prisma.scheduledEmail.update({
        where: { id: scheduledEmailId },
        data: { status: 'SENT', updatedAt: new Date() },
      })
    }
  } catch (error: any) {
    console.error(`Email send failed to ${to}:`, error)
    
    if (logId) {
      await prisma.campaignLog.update({
        where: { id: logId },
        data: { status: 'FAILED', errorMessage: error?.message || 'Unknown error' },
      })
    }
    if (scheduledEmailId) {
      await prisma.scheduledEmail.update({
        where: { id: scheduledEmailId },
        data: { 
          status: 'FAILED', 
          errorMessage: error?.message || 'Unknown error',
          updatedAt: new Date()
        },
      })
    }
    throw error
  }
}

// Initialize Queue and Worker
export async function initEmailQueue() {
  // Always start the scheduled email scanner loop
  startFallbackScheduler()

  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    console.log('No REDIS_URL found. Email queueing using database fallback.')
    return
  }

  try {
    const redisConfig = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      connectTimeout: 5000,
    })

    redisConfig.on('error', (err) => {
      console.warn('Redis connection error in EmailQueue:', err.message)
    })

    redisConfig.on('connect', () => {
      if (!useBullMQ) {
        console.log('Connected to Redis. Initializing BullMQ email queue...')
        useBullMQ = true
        
        emailQueue = new Queue(QUEUE_NAME, { connection: redisConfig as any })
        emailWorker = new Worker(QUEUE_NAME, async (job) => {
          await processEmailJob(job.data)
        }, { 
          connection: redisConfig as any,
          concurrency: 5 // Send up to 5 emails in parallel
        })

        emailWorker.on('failed', (job, err) => {
          console.error(`BullMQ job ${job?.id} failed:`, err)
        })
      }
    })
  } catch (err: any) {
    console.warn('Failed to connect to Redis. Email queue using database/in-memory fallback. Error:', err.message)
  }
}

// Enqueue an email job
export async function enqueueEmail(data: {
  to: string
  subject: string
  html: string
  campaignId?: string
  logId?: string
  scheduledEmailId?: string
}) {
  if (useBullMQ && emailQueue) {
    await emailQueue.add('send-email', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    })
  } else {
    // Fallback: Store or process asynchronously
    // Write it to ScheduledEmail if it isn't already, or process it direct
    // To make fallback fast, we trigger a microtask to execute it in the background
    setImmediate(async () => {
      try {
        await processEmailJob(data)
      } catch (err) {
        console.error('Fallback email execution failed:', err)
      }
    })
  }
}

// Database fallback scheduler for scheduled tasks & deferred emails
function startFallbackScheduler() {
  if (fallbackInterval) return

  console.log('Scheduled email database scanner loop started (runs every 30s).')
  fallbackInterval = setInterval(async () => {
    try {
      const now = new Date()
      // Fetch pending emails that are scheduled to send
      const pendingEmails = await prisma.scheduledEmail.findMany({
        where: {
          status: 'PENDING',
          scheduledAt: { lte: now },
        },
        take: 20, // process in small batches to prevent blocking
      })

      if (pendingEmails.length === 0) return

      console.log(`Email scheduler: processing ${pendingEmails.length} pending emails.`)

      for (const email of pendingEmails) {
        // Mark as SENDING to prevent double processing
        await prisma.scheduledEmail.update({
          where: { id: email.id },
          data: { status: 'SENDING' },
        })

        // Enqueue email processing
        await enqueueEmail({
          to: email.email,
          subject: email.subject,
          html: email.body,
          scheduledEmailId: email.id,
        })
      }
    } catch (err) {
      console.error('Error in fallback email scheduler loop:', err)
    }
  }, 30000) // run every 30 seconds
}
