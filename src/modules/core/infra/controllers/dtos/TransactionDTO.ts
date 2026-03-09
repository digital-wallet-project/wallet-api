import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransactionTypeEnum } from "src/shared/core/enums/TransactionTypeEnum";

export class TransactionRequestDTO {
  @IsNotEmpty()
  @IsEnum(TransactionTypeEnum)
  @ApiProperty()
  type: TransactionTypeEnum

  @IsNotEmpty()
  @IsNumber()
  @ApiPropertyOptional()
  amount: number

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  walletFromId?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  walletToId?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  transactionId?: string
}