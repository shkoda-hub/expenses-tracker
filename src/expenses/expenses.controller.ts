import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDTO } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { UpdateExpenseDTO } from './dto/update-expense.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ExpenseDto } from './dto/expense.dto';
import { JwtPayload } from '../shared/interfaces/jwt-payload.interface';

@Controller('expenses')
@ApiBearerAuth('accessToken')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create new expense. LLM modes is used to categorize expenses',
  })
  @ApiBody({ type: CreateExpenseDTO })
  @ApiResponse({ status: HttpStatus.CREATED, type: ExpenseDto })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() createExpenseDTO: CreateExpenseDTO,
  ): Promise<ExpenseDto> {
    return await this.expensesService.create(user.sub, createExpenseDTO);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update expense',
  })
  @ApiBody({ type: UpdateExpenseDTO })
  @ApiResponse({ status: HttpStatus.OK, type: ExpenseDto })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateExpenseDTO: UpdateExpenseDTO,
  ) {
    return await this.expensesService.update(user.sub, id, updateExpenseDTO);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Find all expenses',
  })
  @ApiResponse({ status: HttpStatus.OK, type: [ExpenseDto] })
  async findAll(@CurrentUser() user: JwtPayload) {
    return await this.expensesService.findAll(user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Find expense by id',
  })
  @ApiResponse({ status: HttpStatus.OK, type: ExpenseDto })
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return await this.expensesService.findOne(user.sub, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete expense',
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return await this.expensesService.delete(user.sub, id);
  }
}
