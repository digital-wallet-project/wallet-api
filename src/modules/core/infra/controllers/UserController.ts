import { Body, Controller, Post, Res } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { CreateUserUseCase } from '../../application/usecases/CreateUserUseCase'
import { CreateUserDTO } from './dtos/UserDTO'

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post('register')
  @ApiOperation({
    summary: 'Create user',
    description: 'Endpoint for creating a new user.',
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid email format or password too short' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email already in use' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  @ApiBody({ type: CreateUserDTO })
  async register(@Res() res: Response, @Body() dto: CreateUserDTO) {
    try {
      const result = await this.createUserUseCase.execute(dto)
      return res.status(201).json(result)
    } catch (err) {
      return res.status(err.status ?? 500).json({ message: err.message })
    }
  }
}