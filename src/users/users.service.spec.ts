import { UsersService } from './users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { mockedMongooseModel } from '../../test/mocks/mongoose-model.mock';

describe('UsersService', () => {
  const createUserDto: CreateUserDto = {
    email: 'example@mail.com',
    password: 'qwerty123',
    userName: 'example',
  };

  const userModel = mockedMongooseModel;

  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: userModel,
        },
      ],
    }).compile();

    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create new user', async () => {
    userModel.findOne.mockReturnValue({
      lean: () => Promise.resolve(null),
    });

    userModel.create.mockReturnValue({
      id: '1q2w3e4r5t6y7u',
      email: createUserDto.email,
      passwordHash: 'hashed-password',
      userName: 'example',
    });

    const result = await service.create(createUserDto);

    expect(userModel.create).toHaveBeenCalledWith({
      email: createUserDto.email,
      passwordHash: 'hashed-password',
      userName: createUserDto.userName,
    });

    expect(result).toMatchObject({
      id: '1q2w3e4r5t6y7u',
      email: createUserDto.email,
      userName: createUserDto.userName,
    });
  });

  it('should throw error if user already exists', async () => {
    userModel.findOne.mockReturnValue({
      lean: () => Promise.resolve({}),
    });

    await expect(service.create(createUserDto)).rejects.toThrow(
      `User with email ${createUserDto.email} already registered`,
    );
  });
});
