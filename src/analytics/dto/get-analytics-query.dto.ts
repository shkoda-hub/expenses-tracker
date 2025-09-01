import {
  IsDate,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { Type } from 'class-transformer';
import {ApiQuery} from '@nestjs/swagger';

/*
  TODO add additional validation to avoid from date to future
 */
export class GetAnalyticsQueryDto {
  @Type(() => Date)
  @IsDate()
  from: Date;

  @Type(() => Date)
  @IsDate()
  to: Date;
}

function IsCannotBeInFuture(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCannotBeInFuture',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments): boolean {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const [relatedPropertyName] = args.constraints;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          const relatedValue = (args.object as any)[relatedPropertyName];

          const todayUtc = new Date(
            Math.floor(Date.now() / 86_400_000) * 86_400_000,
          );
          const fromDate = new Date(value);
          const toDate = new Date(relatedValue);

          return fromDate <= toDate && fromDate <= todayUtc;
        },
      },
    });
  };
}
