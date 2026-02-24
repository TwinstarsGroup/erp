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
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { memoryStorage } from 'multer';

@Controller('vouchers')
@UseGuards(AuthenticatedGuard)
export class VouchersController {
  constructor(private vouchersService: VouchersService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateVoucherDto) {
    return this.vouchersService.create((req.user as any).id, dto);
  }

  @Get()
  findAll() {
    return this.vouchersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vouchersService.findOne(id);
  }

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadAttachment(
    @Req() req: Request,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.vouchersService.uploadAttachment((req.user as any).id, id, file);
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.vouchersService.downloadPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="voucher-${id}.pdf"`,
    });
    res.send(buffer);
  }

  @Post(':id/email')
  sendEmail(@Req() req: Request, @Param('id') id: string, @Body('to') to: string) {
    return this.vouchersService.sendEmail((req.user as any).id, id, to);
  }
}
