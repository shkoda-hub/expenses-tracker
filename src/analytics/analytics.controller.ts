import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { GetAnalyticsQueryDto } from './dto/get-analytics-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AggregatedExpensesDto } from './dto/aggregated-expenses.dto';
import { JwtPayload } from '../shared/interfaces/jwt-payload.interface';

@Controller('analytics')
@ApiBearerAuth('accessToken')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('by-categories')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get aggregated expenses data by categories' })
  @ApiQuery({
    name: 'from',
    type: String,
    required: true,
    example: '2025-08-01',
  })
  @ApiQuery({
    name: 'to',
    type: String,
    required: true,
    example: '2025-08-31',
  })
  @ApiResponse({ status: HttpStatus.OK, type: [AggregatedExpensesDto] })
  async getByCategories(
    @Query() query: GetAnalyticsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return await this.analyticsService.aggregateByCategories(
      user.sub,
      query.from,
      query.to,
    );
  }
}
