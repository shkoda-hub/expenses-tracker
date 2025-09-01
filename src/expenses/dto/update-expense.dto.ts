import { CreateExpenseDTO } from './create-expense.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateExpenseDTO extends PartialType(CreateExpenseDTO) {}
