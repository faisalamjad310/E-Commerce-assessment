import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export class UpdateStatusDto {
  @ApiProperty({ enum: STATUSES })
  @IsIn(STATUSES)
  status: string;
}
