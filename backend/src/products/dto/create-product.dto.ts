import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNotEmpty, Min, MaxLength, MinLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Noise-Cancelling Headphones' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'Premium sound quality with 30hr battery life.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 7999, description: 'Price in integer cents (7999 = $79.99)' })
  @IsInt({ message: 'Price must be an integer (in cents)' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-example' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category: string;

  @ApiProperty({ example: 25, description: 'Units in stock (integer)' })
  @IsInt({ message: 'Stock must be an integer' })
  @Min(0, { message: 'Stock cannot be negative' })
  stock: number;
}
