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

  /** Generates a professional HTML email template */
  private generateEmailHtml(message: string, buttonText: string = '', buttonLink: string = ''): string {
    const buttonHtml = buttonText
      ? `<p><a href="${buttonLink}" style="background-color: #4A90E2; border: none; border-radius: 4px; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;">${buttonText}</a></p>`
      : '';
    return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding: 20px;">
                  <img src="https://i.imgur.com/uU4fPTz.png" alt="SprintBMS Logo" style="width: 150px; height: auto;">
                </td>
              </tr>
              <tr>
                <td style="padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5;">
                  <p>Hello,</p>
                  <p>${message}</p>
                  ${buttonHtml}
                  <p>Best regards,<br>Sprint Business Management Solutions</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px; font-family: Arial, sans-serif; font-size: 12px; color: #999;">
                  <p>© 2025 SprintBMS. All rights reserved.</p>
                  <p><a href="https://sprintbms.com" style="color: #4A90E2; text-decoration: none;">Visit our website</a></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }

  /** Sends a welcome email to a new worker */
  async sendWorkerWelcome(email: string, verificationLink: string): Promise<void> {
    const message = "Welcome to SprintBMS! To complete your registration, please set your password by clicking the button below.";
    const buttonText = "Set Password";
    const html = this.generateEmailHtml(message, buttonText, verificationLink);
    const text = `Welcome to SprintBMS!\n\nTo complete your registration, please set your password by visiting this link: ${verificationLink}\n\nThank you for joining us.`;
    await this.transporter.sendMail({
      from: '"SprintBMS" <noreply@yourdomain.com>',
      to: email,
      subject: "Welcome to SprintBMS - Set Your Password",
      text: text,
      html: html,
    });
  }

  /** Sends a password reset email */
  async sendPasswordReset(email: string, resetLink: string): Promise<void> {
    const message = "We received a request to reset your password for your SprintBMS account. Please click the button below to reset your password. If you did not request this, please ignore this email or contact support if you have concerns.";
    const buttonText = "Reset Password";
    const html = this.generateEmailHtml(message, buttonText, resetLink);
    const text = `Please reset your password by visiting this link: ${resetLink}\n\nIf you did not request this, please ignore this email.`;
    await this.transporter.sendMail({
      from: '"SprintBMS" <noreply@yourdomain.com>',
      to: email,
      subject: "SprintBMS - Password Reset Request",
      text: text,
      html: html,
    });
  }

  /** Sends an account verification email */
  async sendAccountVerification(email: string, verificationLink: string): Promise<void> {
    const message = "Thank you for registering with SprintBMS.\n\nPlease verify your account by clicking the button below.\n\nOnce verified, you’ll have full access to your account.";
    const buttonText = "Verify Account";
    const html = this.generateEmailHtml(message, buttonText, verificationLink);
    const text = `Please verify your account by visiting this link: ${verificationLink}`;
    await this.transporter.sendMail({
      from: '"SprintBMS" <noreply@yourdomain.com>',
      to: email,
      subject: "SprintBMS - Account Verification Request",
      text: text,
      html: html,
    });
  }

  /** Notifies a worker of account suspension */
  async sendWorkerSuspended(email: string): Promise<void> {
    const message = "We regret to inform you that your SprintBMS account has been suspended. For more information or to resolve this issue, please contact your business manager.";
    const html = this.generateEmailHtml(message);
    const text = "We're sorry to inform you that your account has been suspended. Please contact the business manager for more information.";
    await this.transporter.sendMail({
      from: '"SprintBMS" <noreply@yourdomain.com>',
      to: email,
      subject: "SprintBMS - Your account has been suspended",
      text: text,
      html: html,
    });
  }

  /** Notifies a worker of account reactivation */
  async sendAccountReactivated(email: string): Promise<void> {
    const message = "We’re pleased to inform you that your SprintBMS account has been reactivated. You can now log in and access your account as usual. Welcome back!";
    const html = this.generateEmailHtml(message);
    const text = "We're happy to inform you that your account has been reactivated.";
    await this.transporter.sendMail({
      from: '"SprintBMS" <noreply@yourdomain.com>',
      to: email,
      subject: "SprintBMS - Your account has been reactivated",
      text: text,
      html: html,
    });
  }
}

export default new EmailService();