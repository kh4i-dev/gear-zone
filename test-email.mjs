import nodemailer from 'nodemailer';

async function test() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'vankhaixz2@gmail.com',
      pass: 'pgcl szzo gqaq vnom',
    },
  });

  try {
    const info = await transporter.sendMail({
      from: 'vankhaixz2@gmail.com',
      to: 'vankhaixz2@gmail.com',
      subject: 'Test email from GearZone',
      text: 'This is a test email.',
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

test();
