import { Body, Controller, Post, Res } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { AuthService } from '../../application/services/AuthService'
import { LoginDTO } from './dtos/LoginDTO'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Authenticate user',
    description: 'Endpoint for authentication. Returns the JWT token.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Success' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid user credentials' 
  })
  @ApiResponse({
     status: 500, 
     description: 'Internal server error' 
  })
  @ApiBody({ type: LoginDTO, required: true })
  async login(@Res() res: Response, @Body() dto: LoginDTO) {
    try {
      const result = await this.authService.login(dto)  
      return res.status(200).json(result)
    } catch (err) {
      return res.status(err.status ?? 500).json({ message: err.message })
    }
  }
}