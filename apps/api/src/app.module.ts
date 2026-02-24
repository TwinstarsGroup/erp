import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { DriveModule } from './drive/drive.module';
import { PdfModule } from './pdf/pdf.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ReceiptsModule,
    VouchersModule,
    DriveModule,
    PdfModule,
    EmailModule,
  ],
})
export class AppModule {}
