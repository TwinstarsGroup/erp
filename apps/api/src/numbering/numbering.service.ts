import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NumberingService {
  constructor(private prisma: PrismaService) {}

  async nextNumber(docType: 'CR' | 'PV', date: Date): Promise<string> {
    const year = date.getFullYear();

    const counter = await this.prisma.$transaction(async (tx) => {
      // Lock the row for this docType+year
      const existing = await tx.$queryRaw<{ id: string; lastSeq: number }[]>`
        SELECT id, "lastSeq" FROM "Counter"
        WHERE "docType" = ${docType} AND year = ${year}
        FOR UPDATE
      `;

      if (existing.length === 0) {
        // Create with seq=1
        return tx.counter.create({
          data: { docType, year, lastSeq: 1 },
        });
      } else {
        return tx.counter.update({
          where: { id: existing[0].id },
          data: { lastSeq: { increment: 1 } },
        });
      }
    });

    const padded = String(counter.lastSeq).padStart(6, '0');
    return `${docType}-${year}-${padded}`;
  }
}
