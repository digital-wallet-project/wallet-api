import { Body, Controller, Post, Res, Req, UseGuards } from '@nestjs/common'
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { DepositUseCase } from '../../application/usecases/DepositUseCase'
import { TransferUseCase } from '../../application/usecases/TransferUseCase'
import { DepositDTO, TransferDTO } from './dtos/TransactionDTO'
import { JwtGuard } from 'src/shared/core/guards/JwtGuard'

@ApiTags('transaction')
@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly depositUseCase: DepositUseCase,
    private readonly transferUseCase: TransferUseCase,
  ) {}

  @Post('/deposit')
  @UseGuards(JwtGuard)
  @ApiHeader({ 
    name: 'Authorization', 
    description: 'Bearer token', 
    required: true 
  })
  @ApiOperation({ 
    summary: 'Deposit', 
    description: 'Deposit to your own wallet.' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Transaction completed successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Minimum deposit amount is R$ 10,00' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Wallet not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  @ApiBody({ type: DepositDTO })
  async deposit(@Res() res: Response, @Req() req: any, @Body() dto: DepositDTO) {
    try {
      await this.depositUseCase.execute({
        ...dto,
        requesterId: req.user.id,
        requesterRole: req.user.role,
      })
      return res.status(201).json({ message: 'Transaction completed successfully' })
    } catch (err) {
      return res.status(err.status ?? 500).json({ message: err.message })
    }
  }

  @Post('/transfer')
  @UseGuards(JwtGuard)
  @ApiHeader({ 
    name: 'Authorization', 
    description: 'Bearer token', 
    required: true 
  })
  @ApiOperation({ 
    summary: 'Transfer', 
    description: 'Transfer to another wallet.' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Transaction completed successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Insufficient balance or invalid amount' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Wallet not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  @ApiBody({ type: TransferDTO })
  async transfer(@Res() res: Response, @Req() req: any, @Body() dto: TransferDTO) {
    try {
      await this.transferUseCase.execute({
        ...dto,
        requesterId: req.user.id,
        requesterRole: req.user.role,
      })
      return res.status(201).json({ message: 'Transaction completed successfully' })
    } catch (err) {
      return res.status(err.status ?? 500).json({ message: err.message })
    }
  }
}