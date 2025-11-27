import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsDate } from 'class-validator';

export class DateRangeDto {
  @ApiPropertyOptional({
    description: 'Start date for filtering',
    type: String,
    example: '2025-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date for filtering',
    type: String,
    example: '2025-12-31',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
