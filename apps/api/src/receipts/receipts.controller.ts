import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { memoryStorage } from 'multer';

@Controller('receipts')
@UseGuards(AuthenticatedGuard)
export class ReceiptsController {
  constructor(private receiptsService: ReceiptsService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateReceiptDto) {
    return this.receiptsService.create((req.user as any).id, dto);
  }

  @Get()
  findAll() {
    return this.receiptsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receiptsService.findOne(id);
  }

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadAttachment(
    @Req() req: Request,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.receiptsService.uploadAttachment((req.user as any).id, id, file);
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.receiptsService.downloadPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="receipt-${id}.pdf"`,
    });
    res.send(buffer);
  }

  @Post(':id/email')
  sendEmail(@Req() req: Request, @Param('id') id: string, @Body('to') to: string) {
    return this.receiptsService.sendEmail((req.user as any).id, id, to);
  }
}
