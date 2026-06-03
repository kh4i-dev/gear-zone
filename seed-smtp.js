const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.setting.upsert({
    where: { key: 'smtp_host' },
    update: { value: 'smtp.gmail.com' },
    create: { key: 'smtp_host', value: 'smtp.gmail.com' },
  });
  await prisma.setting.upsert({
    where: { key: 'smtp_port' },
    update: { value: '587' },
    create: { key: 'smtp_port', value: '587' },
  });
  await prisma.setting.upsert({
    where: { key: 'smtp_user' },
    update: { value: 'vankhaixz2@gmail.com' },
    create: { key: 'smtp_user', value: 'vankhaixz2@gmail.com' },
  });
  await prisma.setting.upsert({
    where: { key: 'smtp_pass' },
    update: { value: 'pgcl szzo gqaq vnom' },
    create: { key: 'smtp_pass', value: 'pgcl szzo gqaq vnom' },
  });
  await prisma.setting.upsert({
    where: { key: 'newsletter_welcome_enabled' },
    update: { value: 'true' },
    create: { key: 'newsletter_welcome_enabled', value: 'true' },
  });
  console.log('Database updated successfully with SMTP credentials!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
