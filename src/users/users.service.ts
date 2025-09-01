import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { transformToDto } from '../shared/utils/class-transformer.utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const { userName, email, password } = createUserDto;

    const userExist = await this.findByEmail(email);

    if (userExist) {
      throw new BadRequestException(
        `User with email ${email} already registered`,
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.userModel.create({
      email,
      userName,
      passwordHash,
    });

    return transformToDto(UserDto, user);
  }

  async findById(id: string): Promise<UserDto> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return transformToDto(UserDto, user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).lean();
  }
}
