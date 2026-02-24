import { Injectable, BadRequestException } from '@nestjs/common';
import { google } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';
import { Readable } from 'stream';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ROOT_FOLDER_NAME = 'ERP Attachments';

@Injectable()
export class DriveService {
  constructor(private prisma: PrismaService) {}

  private async getDriveClient(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.refreshToken) throw new BadRequestException('No refresh token available');

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL,
    );
    auth.setCredentials({ refresh_token: user.refreshToken });
    return google.drive({ version: 'v3', auth });
  }

  private async getOrCreateFolder(drive: any, name: string, parentId?: string): Promise<string> {
    const query = parentId
      ? `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
      : `name='${name}' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false`;

    const res = await drive.files.list({ q: query, fields: 'files(id,name)' });
    if (res.data.files && res.data.files.length > 0) {
      return res.data.files[0].id;
    }

    const folder = await drive.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined,
      },
      fields: 'id',
    });
    return folder.data.id;
  }

  async uploadFile(
    userId: string,
    file: Express.Multer.File,
    docType: string,
    year: number,
  ) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 25MB limit');
    }

    const drive = await this.getDriveClient(userId);

    const rootFolderId = await this.getOrCreateFolder(drive, ROOT_FOLDER_NAME);
    const yearFolderId = await this.getOrCreateFolder(drive, String(year), rootFolderId);
    const docFolderId = await this.getOrCreateFolder(drive, docType, yearFolderId);

    const stream = new Readable();
    stream.push(file.buffer);
    stream.push(null);

    const uploadedFile = await drive.files.create({
      requestBody: {
        name: file.originalname,
        parents: [docFolderId],
      },
      media: {
        mimeType: file.mimetype,
        body: stream,
      },
      fields: 'id',
    });

    return {
      driveFileId: uploadedFile.data.id as string,
      driveFolderId: docFolderId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
