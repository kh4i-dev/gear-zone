import nodemailer from 'nodemailer';

async function test() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.error('Error: SMTP_USER and SMTP_PASS environment variables must be set.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: user,
      to: user,
      subject: 'Test email from GearZone',
      text: 'This is a test email.',
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

test();
