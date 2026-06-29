import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'Latest gadgets and devices', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;
}
