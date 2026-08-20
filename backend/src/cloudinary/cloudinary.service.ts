import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });
  }

  upload(buffer: Buffer, originalName: string) {
    return new Promise<{ url: string; publicId: string; originalName: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'task-manager', resource_type: 'auto' },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Cloudinary upload failed'));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            originalName,
          });
        },
      );
      Readable.from(buffer).pipe(stream);
    });
  }

  async destroy(publicId: string) {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
  }
}
