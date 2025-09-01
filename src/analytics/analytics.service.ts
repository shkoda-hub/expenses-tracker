import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Expense } from '../expenses/schemas/expense.schema';
import { Model } from 'mongoose';
import { AggregatedExpensesDto } from './dto/aggregated-expenses.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Expense.name) private readonly expenseModel: Model<Expense>,
  ) {}

  async aggregateByCategories(userId: string, from: Date, to: Date) {
    return await this.expenseModel
      .aggregate<AggregatedExpensesDto>([
        {
          $match: {
            userId,
            createdAt: {
              $gte: from,
              $lt: new Date(
                Date.UTC(
                  to.getUTCFullYear(),
                  to.getUTCMonth(),
                  to.getUTCDate() + 1,
                ),
              ),
            },
          },
        },
        {
          $group: {
            _id: '$category',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, category: '$_id', totalAmount: 1, count: 1 } },
        { $sort: { totalAmount: -1 } },
      ])
      .allowDiskUse(true)
      .exec();
  }
}
