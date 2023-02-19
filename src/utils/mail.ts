import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendMail(
  to: string,
  subject: string,
  text: string,
  html: string
) {
  const mailOptions = {
    from: process.env.SMTP_USERNAME,
    to,
    subject,
    text,
    html,
  };
  const info = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", info.messageId);
}
