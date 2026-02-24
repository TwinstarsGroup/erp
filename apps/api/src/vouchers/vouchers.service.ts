import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NumberingService } from '../numbering/numbering.service';
import { DriveService } from '../drive/drive.service';
import { PdfService } from '../pdf/pdf.service';
import { EmailService } from '../email/email.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';

@Injectable()
export class VouchersService {
  constructor(
    private prisma: PrismaService,
    private numbering: NumberingService,
    private drive: DriveService,
    private pdf: PdfService,
    private email: EmailService,
  ) {}

  async create(userId: string, dto: CreateVoucherDto) {
    const date = new Date();
    const docNumber = await this.numbering.nextNumber('PV', date);

    return this.prisma.voucher.create({
      data: {
        docNumber,
        date,
        amount: dto.amount,
        description: dto.description,
        payee: dto.payee,
        createdById: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.voucher.findMany({
      include: { attachments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id },
      include: { attachments: true },
    });
    if (!voucher) throw new NotFoundException('Voucher not found');
    return voucher;
  }

  async uploadAttachment(userId: string, voucherId: string, file: Express.Multer.File) {
    const voucher = await this.findOne(voucherId);
    const year = voucher.date.getFullYear();

    const fileData = await this.drive.uploadFile(userId, file, 'PV', year);

    return this.prisma.attachment.create({
      data: {
        ...fileData,
        voucherId,
      },
    });
  }

  async downloadPdf(id: string): Promise<Buffer> {
    const voucher = await this.findOne(id);
    return this.pdf.generatePdf({
      docNumber: voucher.docNumber,
      date: voucher.date,
      amount: voucher.amount,
      description: voucher.description,
      partyName: voucher.payee,
      partyLabel: 'Payee',
      docType: 'Payment Voucher',
    });
  }

  async sendEmail(userId: string, id: string, to: string) {
    const voucher = await this.findOne(id);
    const pdfBuffer = await this.downloadPdf(id);

    await this.email.sendDocumentEmail(userId, to, voucher.docNumber, 'Payment Voucher', pdfBuffer);

    return this.prisma.voucher.update({
      where: { id },
      data: { emailedAt: new Date(), emailedTo: to },
    });
  }
}
