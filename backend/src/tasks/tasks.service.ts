import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { WeatherService } from '../weather/weather.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument, TaskStatus } from './schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly tasks: Model<TaskDocument>,
    @InjectModel('User') private readonly users: Model<any>,
    private readonly mail: MailService,
    private readonly cloudinary: CloudinaryService,
    private readonly weather: WeatherService,
  ) {}

  async create(userId: string, dto: CreateTaskDto) {
    const user = await this.users.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');

    const task = await this.tasks.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      userId: new Types.ObjectId(userId),
    });

    await this.mail.sendTaskCreated(user.email, task.title).catch(() => undefined);
    return task;
  }

  async findAll(userId: string, q: QueryTaskDto) {
    const filter: any = { userId: new Types.ObjectId(userId) };
    if (q.status) filter.status = q.status;
    if (q.priority) filter.priority = q.priority;

    if (q.dueFrom || q.dueTo) {
      filter.dueDate = {};
      if (q.dueFrom) filter.dueDate.$gte = new Date(q.dueFrom);
      if (q.dueTo) {
        const end = new Date(q.dueTo);
        end.setHours(23, 59, 59, 999);
        filter.dueDate.$lte = end;
      }
    }

    const allowedSort = ['createdAt', 'dueDate', 'title', 'priority', 'status'];
    const sortBy = allowedSort.includes(q.sortBy) ? q.sortBy : 'createdAt';
    const sort = { [sortBy]: q.sortOrder === 'asc' ? 1 : -1 };
    const skip = (q.page - 1) * q.limit;

    const [items, total] = await Promise.all([
      this.tasks.find(filter).sort(sort).skip(skip).limit(q.limit).lean(),
      this.tasks.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        page: q.page,
        limit: q.limit,
        total,
        totalPages: Math.ceil(total / q.limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid task id');
    const task = await this.tasks.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    }).lean();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const before = await this.findOne(userId, id);
    const patch: any = { ...dto };
    if (dto.dueDate !== undefined) patch.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;

    const task = await this.tasks.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { $set: patch },
      { new: true },
    ).lean();

    if (!task) throw new NotFoundException('Task not found');

    if (before.status !== TaskStatus.DONE && task.status === TaskStatus.DONE) {
      const user = await this.users.findById(userId).lean();
      if (user) await this.mail.sendTaskDone(user.email, task.title).catch(() => undefined);
    }

    return task;
  }

  async remove(userId: string, id: string) {
    const task = await this.findOne(userId, id);
    for (const attachment of task.attachments || []) {
      await this.cloudinary.destroy(attachment.publicId).catch(() => undefined);
    }
    await this.tasks.deleteOne({ _id: id, userId: new Types.ObjectId(userId) });
    return { message: 'Task deleted' };
  }

  async addAttachment(userId: string, id: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    await this.findOne(userId, id);

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Maximum file size is 10 MB');
    }

    const uploaded = await this.cloudinary.upload(file.buffer, file.originalname);
    const task = await this.tasks.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { $push: { attachments: uploaded } },
      { new: true },
    ).lean();

    return task;
  }

  async removeAttachment(userId: string, id: string, attachmentId: string) {
    const task = await this.findOne(userId, id);
    const attachment = (task.attachments || []).find(
      (a: any) => String(a._id) === attachmentId,
    );
    if (!attachment) throw new NotFoundException('Attachment not found');

    await this.cloudinary.destroy(attachment.publicId).catch(() => undefined);
    await this.tasks.updateOne(
      { _id: id, userId: new Types.ObjectId(userId) },
      { $pull: { attachments: { _id: attachmentId } } },
    );
    return { message: 'Attachment deleted' };
  }

  async getWeather(userId: string, id: string) {
    const task = await this.findOne(userId, id);
    if (!task.location) throw new BadRequestException('Task has no location');
    return this.weather.current(task.location);
  }
}
