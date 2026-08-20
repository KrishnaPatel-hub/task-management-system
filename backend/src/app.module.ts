import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { MailModule } from './mail/mail.module';
import { WeatherModule } from './weather/weather.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_manager'),
    AuthModule,
    TasksModule,
    MailModule,
    WeatherModule,
    CloudinaryModule,
  ],
})
export class AppModule {}
