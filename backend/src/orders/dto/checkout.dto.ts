import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, MinLength, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ShippingAddressDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  address: string;

  @ApiProperty({ example: 'London' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  city: string;
}

export class CheckoutDto {
  @ApiProperty({ type: ShippingAddressDto })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;
}
