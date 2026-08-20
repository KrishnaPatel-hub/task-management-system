import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.getOrThrow<string>('SMTP_HOST'),
      port: Number(config.get('SMTP_PORT') || 587),
      secure: config.get('SMTP_SECURE') === 'true',
      auth: {
        user: config.getOrThrow<string>('SMTP_USER'),
        pass: config.getOrThrow<string>('SMTP_PASS'),
      },
    });
  }

  async sendTaskCreated(to: string, title: string) {
    await this.transporter.sendMail({
      from: this.config.getOrThrow<string>('MAIL_FROM'),
      to,
      subject: `Task created: ${title}`,
      text: `Your task "${title}" was created successfully.`,
      html: `<p>Your task <strong>${this.escape(title)}</strong> was created successfully.</p>`,
    });
  }

  async sendTaskDone(to: string, title: string) {
    await this.transporter.sendMail({
      from: this.config.getOrThrow<string>('MAIL_FROM'),
      to,
      subject: `Task completed: ${title}`,
      text: `Your task "${title}" has been marked as done.`,
      html: `<p>Your task <strong>${this.escape(title)}</strong> has been marked as done.</p>`,
    });
  }

  private escape(value: string) {
    return value.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
    }[c]!));
  }
}
