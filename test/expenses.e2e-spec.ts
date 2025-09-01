import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpensesModule } from '../src/expenses/expenses.module';
import { CreateExpenseDTO } from '../src/expenses/dto/create-expense.dto';
import { Category } from '../src/shared/enums/categories.enum';
import { Currency } from '../src/shared/enums/currencies.enum';
import { RedisService } from '../src/redis/redis.service';
import { RedisModule } from '../src/redis/redis.module';
import { ClassifierService } from '../src/classifier/classifier.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { TestJwtAuthGuard } from './mocks/guards/test-jwt-auth.guard';
import { ExpenseDto } from '../src/expenses/dto/expense.dto';

process.env.JWT_SECRET =
  '7c3f73d59137ba8578e5587785f315c409816745bd80cbb2fe4eb772de380aeb';

const SET_UP_TIMEOUT = 20_000;

describe('Expenses (e2e)', () => {
  const validCreateExpenseDto: CreateExpenseDTO = {
    amount: 1000,
    category: Category.CINEMA,
    currency: Currency.USD,
    description: 'test description',
    merchant: 'test merchant',
  };

  let app: INestApplication<App>;
  let container: StartedTestContainer;

  beforeAll(async () => {
    container = await new GenericContainer('mongo')
      .withExposedPorts(27017)
      .start();
  });

  beforeEach(async () => {
    const dbName = `expenses_${new Date().getTime()}`;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        RedisModule,
        ExpensesModule,
        MongooseModule.forRoot(
          `mongodb://${container.getHost()}:${container.getMappedPort(27017)}/${dbName}`,
        ),
      ],
    })
      .overrideProvider(RedisService)
      .useValue({ get: jest.fn(), set: jest.fn(), delete: jest.fn() })
      .overrideProvider(ClassifierService)
      .useValue({ classify: jest.fn() })
      .overrideGuard(JwtAuthGuard)
      .useClass(TestJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  }, SET_UP_TIMEOUT);

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await container.stop();
  });

  it('/expenses (POST) with valid body -> 201', async () => {
    return request(app.getHttpServer())
      .post('/expenses')
      .send(validCreateExpenseDto)
      .expect(201);
  });

  it('/expenses/:id (GET) -> 200', async () => {
    const response = await request(app.getHttpServer())
      .post('/expenses')
      .send(validCreateExpenseDto);

    const expenseDto = response.body as ExpenseDto;

    return request(app.getHttpServer())
      .get(`/expenses/${expenseDto.id}`)
      .expect(200)
      .expect(expenseDto);
  });

  it('/expenses/ (GET) -> 200', async () => {
    const firstResponse = await request(app.getHttpServer())
      .post('/expenses')
      .send(validCreateExpenseDto);

    const secondResponse = await request(app.getHttpServer())
      .post('/expenses')
      .send(validCreateExpenseDto);

    const firstExpense = firstResponse.body as ExpenseDto;
    const secondExpense = secondResponse.body as ExpenseDto;

    return request(app.getHttpServer())
      .get(`/expenses/`)
      .expect(200)
      .expect(({ body }) => {
        const expenses = body as ExpenseDto[];

        expect(expenses).toHaveLength(2);
        expect(expenses).toMatchObject([firstExpense, secondExpense]);
      });
  });

  it('/expenses/:id (PUT) -> 200', async () => {
    const response = await request(app.getHttpServer())
      .post('/expenses')
      .send(validCreateExpenseDto);

    const expenseDto = response.body as ExpenseDto;

    return request(app.getHttpServer())
      .put(`/expenses/${expenseDto.id}`)
      .send({ amount: 2000 })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ ...validCreateExpenseDto, amount: 2000 });
      });
  });

  it('/expenses/:id (DELETE) -> 204', async () => {
    const response = await request(app.getHttpServer())
      .post('/expenses')
      .send(validCreateExpenseDto);

    const expenseDto = response.body as ExpenseDto;

    await request(app.getHttpServer())
      .delete(`/expenses/${expenseDto.id}`)
      .expect(204);

    return request(app.getHttpServer())
      .get(`/expenses/${expenseDto.id}`)
      .expect(404);
  });
});
