import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
mkdirSync(UPLOAD_DIR, { recursive: true });

@Controller('upload')
export class UploadController {
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          const safe = /^\.(jpe?g|png|webp|gif)$/.test(ext) ? ext : '.jpg';
          cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${safe}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        cb(null, allowed.includes(file.mimetype));
      },
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { protocol: string; get: (h: string) => string },
  ) {
    if (!file) {
      throw new BadRequestException(
        'Only image files are allowed (JPEG, PNG, WebP, GIF) and must be under 5 MB',
      );
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    return { url };
  }
}
