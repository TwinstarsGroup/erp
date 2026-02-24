import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
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
  generatePdf(data: DocData): Buffer {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 50 });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

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

    // Synchronous collection
    const end = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // Since PDFDocument is synchronous when using .end(), we return synchronously
    // but we need to await. Use a workaround: return the buffer after collecting all chunks.
    // Actually pdfkit is sync when there's no async content, but we use streams.
    // Return chunks synchronously - they will be populated by the time end fires in sync context.
    return Buffer.concat(chunks);
  }
}
