import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { Test } from '@nestjs/testing';
import { CreateExpenseDTO } from './dto/create-expense.dto';
import { Category } from '../shared/enums/categories.enum';
import { Currency } from '../shared/enums/currencies.enum';
import { JwtPayload } from '../shared/interfaces/jwt-payload.interface';

describe('ExpenseController', () => {
  const testUser: JwtPayload = {
    sub: '123456789',
    username: 'test',
  };

  const createExpenseDto: CreateExpenseDTO = {
    amount: 0,
    category: Category.CINEMA,
    currency: Currency.USD,
    description: 'test',
    merchant: 'test',
  };

  const expensesServiceMock = {
    create: jest.fn(),
  };

  let expensesController: ExpensesController;
  let expensesService: ExpensesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [{ provide: ExpensesService, useValue: expensesServiceMock }],
    }).compile();

    expensesService = moduleRef.get(ExpensesService);
    expensesController = moduleRef.get(ExpensesController);
  });

  describe('create', () => {
    it('should create a new expense', async () => {
      jest.spyOn(expensesService, 'create').mockResolvedValue({
        id: '123',
        userId: testUser.sub,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...createExpenseDto,
      });

      await expensesController.create(testUser, createExpenseDto);

      expect(expensesServiceMock.create).toHaveBeenCalledWith(
        testUser.sub,
        createExpenseDto,
      );
    });
  });
});
