import { Body, Controller, Post, Put, Patch, Delete, Res, Req, Param, UseGuards } from '@nestjs/common'
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { CreateUserUseCase } from '../../application/usecases/CreateUserUseCase'
import { UpdateUserUseCase } from '../../application/usecases/UpdateUserUseCase'
import { InactivateUserUseCase } from '../../application/usecases/InactivateUserUseCase'
import { ReactivateUserUseCase } from '../../application/usecases/ReactivateUserUseCase'
import { CreateUserDTO, UserPayloadDTO } from './dtos/UserDTO'
import { JwtGuard } from 'src/shared/core/guards/JwtGuard'

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly inactivateUserUseCase: InactivateUserUseCase,
    private readonly reactivateUserUseCase: ReactivateUserUseCase
  ) {}

  @Post()
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

  @Put('/:id')
  @UseGuards(JwtGuard)
  @ApiHeader({ 
    name: 'Authorization', 
    description: 'Bearer token', 
    required: true
  })
  @ApiOperation({
    summary: 'Update user',
    description: 'Endpoint for updating a user. Requires authentication.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation error or no valid fields provided' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden – insufficient permissions' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: 500, description: 'Internal server error' 
  })
  @ApiBody({ type: UserPayloadDTO })
  async update(@Res() res: Response, @Req() req: any, @Param('id') id: string, @Body() dto: UserPayloadDTO) {
    try {
      const result = await this.updateUserUseCase.execute({ 
        ...dto, 
        targetId: id, 
        requesterId: req.user.id, // jwt
        requesterRole: req.user.role, // jwt 
      })
      return res.status(200).json(result)
    } catch (err) {
      return res.status(err.status ?? 500).json({ message: err.message })
    }
  }


  @Delete('/:id')
  @UseGuards(JwtGuard)
  @ApiHeader({ 
    name: 'Authorization', 
    description: 'Bearer token', 
    required: true 
  })
  @ApiOperation({
    summary: 'Inactivate user',
    description: 'Endpoint for inactivating a user. Requires authentication.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User inactivated successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'User is already inactive' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden – insufficient permissions' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async inactivate(@Res() res: Response, @Req() req: any, @Param('id') id: string) {
    try {
      await this.inactivateUserUseCase.execute({ 
        targetId: id, 
        requesterId: req.user.id, // jwt
        requesterRole: req.user.role, // jwt 
      })
      return res.status(200).json({ message: 'User inactivated sucessfully' })
    } catch (err) {
      return res.status(err.status ?? 500).json({ message: err.message })
    }
  }

  @Patch('/:id/reactivate')
  @UseGuards(JwtGuard)
  @ApiHeader({ 
    name: 'Authorization', 
    description: 'Bearer token', 
    required: true 
  })
  @ApiOperation({
    summary: 'Reactivate user',
    description: 'Endpoint for reactivating a user. Requires admin authentication.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User reactivated successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'User is already active' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden – only admins can reactivate accounts' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async reactivate(@Res() res: Response, @Req() req: any, @Param('id') id: string) {
    try {
      await this.reactivateUserUseCase.execute({
        targetId: id,
        requesterId: req.user.id,
        requesterRole: req.user.role,
      })
      return res.status(200).json({ message: 'User reactivated successfully' })
    } catch (err) {
      return res.status(err.status ?? 500).json({ message: err.message })
    }
  }
}