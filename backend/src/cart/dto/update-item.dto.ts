import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateItemDto {
  @ApiProperty({ example: 2, description: 'New quantity. 0 removes the item.' })
  @IsInt()
  @Min(0)
  quantity: number;
}
