import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class DepositDTO {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  amount: number

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string
}

export class TransferDTO {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  amount: number

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  walletToId: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string
}