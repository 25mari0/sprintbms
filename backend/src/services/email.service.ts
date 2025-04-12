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

  async sendWorkerWelcome(email: string, verificationLink: string): Promise<void> {
    await this.transporter.sendMail({
      from: '"Your App Name" <noreply@yourdomain.com>',
      to: email,
      subject: "Welcome to SprintBMS - Set Your Password",
      text: `Welcome! Please set your password by clicking this link: ${verificationLink}`,
      html: `<b>Welcome!</b> Please set your password by clicking this link: <a href="${verificationLink}">Set Password</a>`,
    });
  }

  async sendPasswordReset(email: string, resetLink: string): Promise<void> {
    await this.transporter.sendMail({
      from: '"Your App Name" <noreply@yourdomain.com>',
      to: email,
      subject: "SprintBMS - Password Reset Request",
      text: `Please reset your password by clicking this link: ${resetLink}`,
      html: `<b>Please reset your password by clicking this link:</b> <a href="${resetLink}">Reset Password</a>`,
    });
  }

  async sendAccountVerification(email: string, verificationLink: string): Promise<void> {
    await this.transporter.sendMail({
      from: '"Your App Name" <noreply@yourdomain.com>',
      to: email,
      subject: "SprintBMS - Account Verification Request",
      text: `Please verify your account by clicking this link: ${verificationLink}`,
      html: `<b>Please verify your account by clicking this link:</b> <a href="${verificationLink}">Verify Account</a>`,
  });
  }

  async sendWorkerSuspended(email: string): Promise<void> {
    await this.transporter.sendMail({
      from: '"Your App Name" <noreply@yourdomain.com>',
      to: email,
      subject: "SprintBMS - Your account has been suspended",
      text: "We're sorry to inform you that your account has been suspended. Please contact the business manager for more information.",
      html: "<b>We're sorry to inform you that your account has been suspended.</b> Please contact the business manager for more information."
    });
  }

  async sendAccountReactivated(email: string): Promise<void> {
    await this.transporter.sendMail({
      from: '"Your App Name" <noreply@yourdomain.com>',
      to: email,
      subject: "SprintBMS - Your account has been reactivated",
      text: "We're happy to inform you that your account has been reactivated.",
      html: "<b>Welcome back!</b> Your account has been reactivated."
    });
  }

}

export default new EmailService();