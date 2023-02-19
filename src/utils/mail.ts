import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";
import { env } from "@/env.mjs";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: 587,
  secure: true,
  auth: {
    user: env.SMTP_USERNAME,
    pass: env.SMTP_PASSWORD,
  },
});

const sendMail = async (
  to: string,
  subject: string,
  text: string,
  html: string
) => {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  } satisfies SendMailOptions;

  const transporter = nodemailer.createTransport(
    {
      host: env.SMTP_HOST,
      port: 587,
      secure: true,
      auth: {
        user: env.SMTP_USERNAME,
        pass: env.SMTP_PASSWORD,
      },
    },
    {
      from: env.EMAIL_FROM,
    }
  );

  const info = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", info.messageId);
};
