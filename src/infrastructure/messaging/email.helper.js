import nodemailer from 'nodemailer';


export async function sendRealEmail({ title, body }) {
  let transporter;

  const hasSmtpConfig = 
    process.env.SMTP_HOST && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS;

  if (hasSmtpConfig) {
    console.log(`[Email Service] Sending email using SMTP host: ${process.env.SMTP_HOST}...`);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } else {
    console.log('[Email Service] No custom SMTP credentials found. Creating an automated Ethereal test inbox...');
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"DDD Task Microservice" <no-reply@dddtask.com>',
    to: 'yasminelabasy58@gmail.com', 
    subject: `New Post Alert: ${title}`,
    text: `Hello Subscriber,\n\nA new post has been successfully created:\n\nTitle: ${title}\n\nContent:\n${body}\n\nHappy reading!`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e8ed; padding: 25px; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="background-color: #ebf5ff; color: #1e87f0; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">DDD Platform Alert</span>
        </div>
        <h2 style="color: #1e87f0; margin-top: 10px; font-size: 22px; text-align: center; border-bottom: 1px solid #f2f2f2; padding-bottom: 15px;">📢 A New Post Was Published!</h2>
        <div style="padding: 15px 0;">
          <h3 style="color: #2c3e50; font-size: 18px; margin-bottom: 10px;">${title}</h3>
          <p style="color: #555555; line-height: 1.6; font-size: 15px; background-color: #fafbfc; padding: 15px; border-left: 4px solid #1e87f0; border-radius: 4px;">
            ${body}
          </p>
        </div>
        <hr style="border: 0; border-top: 1px solid #f2f2f2; margin: 25px 0;">
        <p style="font-size: 12px; color: #9aa8b6; text-align: center; line-height: 1.4;">
          This real-time notification was dispatched asynchronously through an Apache Kafka consumer topic: <code style="background-color: #f1f3f5; padding: 2px 4px; border-radius: 4px; color: #e83e8c;">post-created</code>.
        </p>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  
  console.log(`[Email Service] Message successfully sent! Message ID: ${info.messageId}`);
  
  if (!hasSmtpConfig) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Email Service] Real Email Inbox Preview Link: ${previewUrl}`);
  }
}
