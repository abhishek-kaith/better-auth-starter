import nodemailer from "nodemailer";
import { env } from "@/env";

type Payload = {
  to: string;
  subject: string;
  html: string;
};

const smtpSettings = {
  url: env.SMTP_URL,
};

export const sendEmail = async (data: Payload) => {
  const transporter = nodemailer.createTransport({
    url: smtpSettings.url,
  });

  return await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: data.to,
    subject: data.subject,
    html: data.html,
  });
};
