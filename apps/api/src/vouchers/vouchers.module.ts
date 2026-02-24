import { Module } from '@nestjs/common';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';
import { NumberingModule } from '../numbering/numbering.module';
import { DriveModule } from '../drive/drive.module';
import { PdfModule } from '../pdf/pdf.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [NumberingModule, DriveModule, PdfModule, EmailModule],
  controllers: [VouchersController],
  providers: [VouchersService],
})
export class VouchersModule {}
