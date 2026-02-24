import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

export interface DocData {
  docNumber: string;
  date: Date;
  amount: number;
  description: string;
  partyName: string;
  partyLabel: 'Payer' | 'Payee';
  docType: 'Receipt' | 'Payment Voucher';
}

@Injectable()
export class PdfService {
  generatePdf(data: DocData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50 });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Logo
      const logoPath = process.env.LOGO_PATH
        ? path.resolve(process.env.LOGO_PATH)
        : path.resolve(__dirname, '..', '..', 'assets', 'logo.png');

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 80 });
      }

      // Title
      doc.fontSize(20).text('Twinstars Group', 140, 50);
      doc.fontSize(10).text('ERP Document', 140, 75);

      doc.moveDown(3);
      doc.fontSize(16).text(data.docType, { align: 'center' });
      doc.moveDown();

      doc.fontSize(12);
      doc.text(`Document Number: ${data.docNumber}`);
      doc.text(`Date: ${data.date.toLocaleDateString()}`);
      doc.text(`Amount: ${data.amount.toFixed(2)}`);
      doc.text(`Description: ${data.description}`);
      doc.text(`${data.partyLabel}: ${data.partyName}`);

      doc.end();
    });
  }
}
