import { Injectable, BadRequestException } from '@nestjs/common';
import { google } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailService {
  constructor(private prisma: PrismaService) {}

  private async getGmailClient(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.refreshToken) throw new BadRequestException('No refresh token available');

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL,
    );
    auth.setCredentials({ refresh_token: user.refreshToken });
    return google.gmail({ version: 'v1', auth });
  }

  private buildRawEmail(
    to: string,
    subject: string,
    body: string,
    pdfBuffer: Buffer,
    filename: string,
  ): string {
    const boundary = 'boundary_erp_' + Date.now();
    const pdfBase64 = pdfBuffer.toString('base64');

    const raw = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      body,
      '',
      `--${boundary}`,
      `Content-Type: application/pdf; name="${filename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${filename}"`,
      '',
      pdfBase64,
      '',
      `--${boundary}--`,
    ].join('\r\n');

    return Buffer.from(raw)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async sendDocumentEmail(
    userId: string,
    to: string,
    docNumber: string,
    docType: string,
    pdfBuffer: Buffer,
  ) {
    const gmail = await this.getGmailClient(userId);

    const subject = `${docType} - ${docNumber}`;
    const body = `Please find attached the ${docType} document: ${docNumber}.\n\nThank you,\nTwinstars Group`;
    const filename = `${docNumber}.pdf`;

    const raw = this.buildRawEmail(to, subject, body, pdfBuffer, filename);

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });
  }
}
