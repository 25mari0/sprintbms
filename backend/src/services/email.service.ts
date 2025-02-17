// services/email.service.ts
import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      // Use environment variables for configuration
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // If using Gmail, you might need these additional settings:
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendWorkerWelcomeEmail(email: string, resetLink: string): Promise<void> {
    await this.transporter.sendMail({
      from: '"Your App Name" <noreply@yourdomain.com>',
      to: email,
      subject: "Welcome to Our Service - Set Your Password",
      text: `Welcome! Please set your password by clicking this link: ${resetLink}`,
      html: `<b>Welcome!</b> Please set your password by clicking this link: <a href="${resetLink}">Set Password</a>`,
    });
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    await this.transporter.sendMail({
      from: '"Your App Name" <noreply@yourdomain.com>',
      to: email,
      subject: "Password Reset Request",
      text: `Please reset your password by clicking this link: ${resetLink}`,
      html: `<b>Please reset your password by clicking this link:</b> <a href="${resetLink}">Reset Password</a>`,
    });
  }

}

export default new EmailService();