import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { UsersModule } from '../src/users/users.module';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { UserDto } from '../src/users/dto/user.dto';

process.env.JWT_SECRET =
  '7c3f73d59137ba8578e5587785f315c409816745bd80cbb2fe4eb772de380aeb';

const SET_UP_TIMEOUT = 20_000;

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let container: StartedTestContainer;

  beforeAll(async () => {
    container = await new GenericContainer('mongo')
      .withExposedPorts(27017)
      .start();
  }, SET_UP_TIMEOUT);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        MongooseModule.forRoot(
          `mongodb://${container.getHost()}:${container.getMappedPort(27017)}/expenses-tracker`,
        ),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await container.stop();
  });

  it('/users (POST) with valid body -> 201', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'test@mail.com',
        password: 'qwerty123',
        userName: 'qwerty123',
      })
      .expect((response) => {
        const body = response.body as UserDto;

        expect(body).toHaveProperty('id');
        expect(body.email).toBe('test@mail.com');
        expect(body.userName).toBe('qwerty123');
        expect(body).not.toHaveProperty('passwordHash');
      });
  });

  it('/users (POST) with wrong email -> 400', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'testmailcom',
        password: 'qwerty123',
        userName: 'qwerty123',
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: ['email must be an email'],
          statusCode: 400,
        });
      });
  });
});
