const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = process.env.SMTP_PORT || '587';
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.error('Error: SMTP_USER and SMTP_PASS environment variables must be set.');
    process.exit(1);
  }

  await prisma.setting.upsert({
    where: { key: 'smtp_host' },
    update: { value: smtpHost },
    create: { key: 'smtp_host', value: smtpHost },
  });
  await prisma.setting.upsert({
    where: { key: 'smtp_port' },
    update: { value: smtpPort },
    create: { key: 'smtp_port', value: smtpPort },
  });
  await prisma.setting.upsert({
    where: { key: 'smtp_user' },
    update: { value: smtpUser },
    create: { key: 'smtp_user', value: smtpUser },
  });
  await prisma.setting.upsert({
    where: { key: 'smtp_pass' },
    update: { value: smtpPass },
    create: { key: 'smtp_pass', value: smtpPass },
  });
  await prisma.setting.upsert({
    where: { key: 'newsletter_welcome_enabled' },
    update: { value: 'true' },
    create: { key: 'newsletter_welcome_enabled', value: 'true' },
  });
  console.log('Database updated successfully with SMTP settings from environment variables!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
