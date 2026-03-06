import { RoleEnum } from "src/shared/core/enums/RoleEnum"
import { UserStatusEnum } from "src/shared/core/enums/UserStatusEnum"
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  email: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string
}

export class UserPayloadDTO {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  name?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  email?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  password?: string

  @IsOptional()
  @IsEnum(UserStatusEnum)
  @ApiPropertyOptional()
  status?: UserStatusEnum

  @IsOptional()
  @IsEnum(RoleEnum)
  @ApiPropertyOptional()
  role?: RoleEnum
}