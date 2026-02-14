import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 发送密码重置邮件
   */
  async sendPasswordResetEmail(email: string, token: string, username?: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: '重置您的密码 - Audio Label Pro',
      template: 'password-reset',
      context: {
        username: username || email.split('@')[0],
        resetLink,
        expirationTime: '1小时',
        year: new Date().getFullYear(),
      },
    });

    console.log(`Password reset email sent to ${email}`);
    console.log(`Reset link: ${resetLink}`);
  }

  /**
   * 发送欢迎邮件
   */
  async sendWelcomeEmail(email: string, username?: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: '欢迎加入 Audio Label Pro',
      template: 'welcome',
      context: {
        username: username || email.split('@')[0],
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * 发送账户验证邮件
   */
  async sendVerificationEmail(email: string, token: string, username?: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: '验证您的邮箱 - Audio Label Pro',
      template: 'email-verification',
      context: {
        username: username || email.split('@')[0],
        verificationLink,
        year: new Date().getFullYear(),
      },
    });
  }
}