import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NumberingService } from '../numbering/numbering.service';
import { DriveService } from '../drive/drive.service';
import { PdfService } from '../pdf/pdf.service';
import { EmailService } from '../email/email.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';

@Injectable()
export class ReceiptsService {
  constructor(
    private prisma: PrismaService,
    private numbering: NumberingService,
    private drive: DriveService,
    private pdf: PdfService,
    private email: EmailService,
  ) {}

  async create(userId: string, dto: CreateReceiptDto) {
    const date = new Date();
    const docNumber = await this.numbering.nextNumber('CR', date);

    return this.prisma.receipt.create({
      data: {
        docNumber,
        date,
        amount: dto.amount,
        description: dto.description,
        payer: dto.payer,
        createdById: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.receipt.findMany({
      include: { attachments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: { attachments: true },
    });
    if (!receipt) throw new NotFoundException('Receipt not found');
    return receipt;
  }

  async uploadAttachment(userId: string, receiptId: string, file: Express.Multer.File) {
    const receipt = await this.findOne(receiptId);
    const year = receipt.date.getFullYear();

    const fileData = await this.drive.uploadFile(userId, file, 'CR', year);

    return this.prisma.attachment.create({
      data: {
        ...fileData,
        receiptId,
      },
    });
  }

  async downloadPdf(id: string): Promise<Buffer> {
    const receipt = await this.findOne(id);
    return this.pdf.generatePdf({
      docNumber: receipt.docNumber,
      date: receipt.date,
      amount: receipt.amount,
      description: receipt.description,
      partyName: receipt.payer,
      partyLabel: 'Payer',
      docType: 'Receipt',
    });
  }

  async sendEmail(userId: string, id: string, to: string) {
    const receipt = await this.findOne(id);
    const pdfBuffer = await this.downloadPdf(id);

    await this.email.sendDocumentEmail(userId, to, receipt.docNumber, 'Receipt', pdfBuffer);

    return this.prisma.receipt.update({
      where: { id },
      data: { emailedAt: new Date(), emailedTo: to },
    });
  }
}
