import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, Req,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Get()
  findAll(@Req() req: any, @Query() q: QueryTaskDto) {
    return this.service.findAll(req.user.id, q);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.id, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateTaskDto) {
    return this.service.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.id, id);
  }

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  addAttachment(@Req() req: any, @Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.service.addAttachment(req.user.id, id, file);
  }

  @Delete(':id/attachments/:attachmentId')
  removeAttachment(
    @Req() req: any,
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.service.removeAttachment(req.user.id, id, attachmentId);
  }

  @Get(':id/weather')
  weather(@Req() req: any, @Param('id') id: string) {
    return this.service.getWeather(req.user.id, id);
  }
}
