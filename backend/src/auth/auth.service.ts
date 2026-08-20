import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const exists = await this.users.exists({ email });
    if (exists) throw new ConflictException('Email is already registered');

    const password = await bcrypt.hash(dto.password, 12);
    const user = await this.users.create({ name: dto.name.trim(), email, password });

    return this.sign(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ email: dto.email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.sign(user);
  }

  private async sign(user: UserDocument) {
    const accessToken = await this.jwt.signAsync({
      sub: String(user._id),
      email: user.email,
    });
    return {
      accessToken,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    };
  }
}
