import { ConfigService, registerAs } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';

export default registerAs('fileUpload', () => ({
  maxFileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE, 10) : 500 * 1024 * 1024, // 500MB default
  fileUploadDir: process.env.FILE_UPLOAD_DIR || './uploads',
  allowedMimeTypes: process.env.ALLOWED_MIME_TYPES 
    ? process.env.ALLOWED_MIME_TYPES.split(',') 
    : [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'text/plain',
        'application/zip'
      ]
}));

export function getFileUploadConfig(configService: ConfigService) {
  const config = configService.get('fileUpload');
  
  return {
    storage: diskStorage({
      destination: config.fileUploadDir,
      filename: (req, file, callback) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        callback(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    limits: {
      fileSize: config.maxFileSize,
    },
    fileFilter: (req, file, callback) => {
      if (config.allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error(`Unsupported file type: ${file.mimetype}`), false);
      }
    }
  };
}