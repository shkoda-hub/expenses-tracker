import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { mockedMongooseModel } from '../../test/mocks/mongoose-model.mock';
import { getModelToken } from '@nestjs/mongoose';
import { CreateExpenseDTO } from './dto/create-expense.dto';
import { Category } from '../shared/enums/categories.enum';
import { Currency } from '../shared/enums/currencies.enum';
import { ClassifierService } from '../classifier/classifier.service';
import { RedisService } from '../redis/redis.service';

describe('ExpensesService', () => {
  const userId = '123456789';
  const expenseId = '68b74175781acd2f659e0231';

  const createExpenseDto: CreateExpenseDTO = {
    amount: 100,
    category: Category.CINEMA,
    currency: Currency.USD,
    description: 'test',
    merchant: 'test',
  };

  const mockedExpenseDocument = {
    _id: expenseId,
    amount: 100,
    category: Category.CINEMA,
    currency: Currency.USD,
    description: 'test',
    merchant: 'test',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: userId,
  };

  const expenseModel = mockedMongooseModel;

  let service: ExpensesService;
  let classifierService = { classify: jest.fn() };
  let redisService = { get: jest.fn(), set: jest.fn(), delete: jest.fn() };

  beforeEach(async () => {
    classifierService = {
      classify: jest.fn(),
    };

    redisService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: getModelToken('Expense'), useValue: expenseModel },
        { provide: ClassifierService, useValue: classifierService },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create new expense', async () => {
    expenseModel.create.mockReturnValue(mockedExpenseDocument);

    const result = await service.create(userId, createExpenseDto);

    expect(expenseModel.create).toHaveBeenCalledWith({
      ...createExpenseDto,
      userId,
    });
    expect(redisService.delete).toHaveBeenCalled();

    expect(result).toMatchObject({
      id: expenseId,
      ...createExpenseDto,
    });
  });

  it(`should return one expense`, async () => {
    expenseModel.findOne.mockReturnValue({
      lean: () => Promise.resolve(mockedExpenseDocument),
    });

    const result = await service.findOne(userId, expenseId);

    expect(expenseModel.findOne).toHaveBeenCalledWith({
      _id: expenseId,
      userId,
    });
    expect(result).toMatchObject({
      ...createExpenseDto,
    });
  });
});
