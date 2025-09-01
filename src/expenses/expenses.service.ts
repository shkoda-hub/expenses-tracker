import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDTO } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import { UpdateExpenseDTO } from './dto/update-expense.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense } from './schemas/expense.schema';
import { ClassifierService } from '../classifier/classifier.service';
import { RedisService } from '../redis/redis.service';
import {
  transformToDto,
  transformToDtoArray,
} from '../shared/utils/class-transformer.utils';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private readonly expenseModel: Model<Expense>,
    private readonly classifierService: ClassifierService,
    private readonly redisService: RedisService,
  ) {}

  async create(
    userId: string,
    createExpensesDto: CreateExpenseDTO,
  ): Promise<ExpenseDto> {
    const category =
      createExpensesDto.category ||
      (await this.classifierService.classify(createExpensesDto.description));

    const expense = await this.expenseModel.create({
      ...createExpensesDto,
      category,
      userId,
    });

    await this.redisService.delete(`expenses:${userId}`);

    return transformToDto(ExpenseDto, expense);
  }

  async update(
    userId: string,
    expenseId: string,
    updateExpensesDto: UpdateExpenseDTO,
  ): Promise<ExpenseDto> {
    const updated = await this.expenseModel
      .findOneAndUpdate(
        { _id: expenseId, userId },
        { $set: updateExpensesDto },
        {
          new: true,
          runValidators: true,
          context: 'query',
        },
      )
      .lean();

    if (!updated) {
      throw new NotFoundException(`Expense with id ${expenseId} not found`);
    }

    await this.redisService.delete(`expenses:${userId}`);

    return transformToDto(ExpenseDto, updated);
  }

  async delete(userId: string, expenseId: string): Promise<void> {
    const result = await this.expenseModel
      .deleteOne({ _id: expenseId, userId })
      .exec();

    if (!result.deletedCount) {
      throw new NotFoundException(`Expense with id ${expenseId} not found`);
    }

    await this.redisService.delete(`expenses:${userId}`);
  }

  async findOne(userId: string, expenseId: string): Promise<ExpenseDto> {
    const expense = await this.expenseModel
      .findOne({ _id: expenseId, userId })
      .lean();

    if (!expense) {
      throw new NotFoundException(`Expense with id ${expenseId} not found`);
    }

    return transformToDto(ExpenseDto, expense);
  }

  async findAll(userId: string): Promise<ExpenseDto[]> {
    const cached = await this.redisService.get<ExpenseDto[]>(
      `expenses:${userId}`,
    );

    if (cached) return cached;

    const expenses = await this.expenseModel.find({ userId });

    const expensesDto = transformToDtoArray(ExpenseDto, expenses);

    await this.redisService.set(`expenses:${userId}`, expensesDto, 600);
    return expensesDto;
  }
}
