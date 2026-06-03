import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

async function main() {
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
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const port = Number(map.smtp_port || 587);

  const smtp = {
    host: map.smtp_host || 'smtp.gmail.com',
    port: Number.isFinite(port) ? port : 587,
    user: map.smtp_user || '',
    pass: map.smtp_pass || '',
    senderName: map.smtp_sender_name || 'GearZone',
    senderEmail: map.smtp_sender_email || map.smtp_user || '',
  };

  console.log('Loaded SMTP config from database:');
  console.log(`Host: ${smtp.host}`);
  console.log(`Port: ${smtp.port}`);
  console.log(`User: ${smtp.user}`);
  console.log(`Sender: "${smtp.senderName}" <${smtp.senderEmail}>`);

  if (!smtp.user || !smtp.pass) {
    console.error('SMTP credentials are not configured in settings.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  const targetEmail = 'vankhaixz2@gmail.com';
  console.log(`Sending test email to ${targetEmail}...`);

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px;">
      <h2 style="color: #eab308; margin-bottom: 20px;">Kiểm tra gửi Email từ Server GearZone 🚀</h2>
      <p>Xin chào, đây là email kiểm tra tính năng gửi thư và hiển thị ảnh từ server production của bạn.</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <div style="display: flex; align-items: center; border-bottom: 1px solid #f1f5f9; padding: 10px 0;">
          <img src="https://product.hstatic.net/200000722513/product/thumbchuot_a405fadb92a34c429c3eed4d11a84fb5_master.jpg" alt="Logitech G Pro X Superlight 2 Red" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; margin-right: 15px;" />
          <div style="flex: 1;">
            <h4 style="margin: 0; font-size: 14px; color: #1e293b;">Logitech G Pro X Superlight 2 Red (Ảnh Đã Fix)</h4>
            <span style="font-size: 13px; font-weight: bold; color: #4f46e5;">3.290.000đ</span>
          </div>
        </div>
      </div>

      <p>Trạng thái: <b>Hoạt động tốt!</b> Đường dẫn ảnh đã được định dạng chuẩn và không bị vỡ nữa.</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: smtp.senderName ? `"${smtp.senderName}" <${smtp.senderEmail}>` : smtp.senderEmail,
    to: targetEmail,
    subject: 'Test email from Server GearZone 🛒 (Gửi vankhaixz2)',
    html,
  });

  console.log('Email sent successfully: %s', info.messageId);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
