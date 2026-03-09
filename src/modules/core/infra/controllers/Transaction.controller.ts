import { Body, Controller, Query, Get, Post, Put, Res, Req, Param, UseGuards } from '@nestjs/common'
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { DepositUseCase } from '../../application/usecases/DepositUseCase'
import { TransferUseCase } from '../../application/usecases/TransferUseCase'
import { ReversalUseCase } from '../../application/usecases/ReversalUseCase'
import { GetTransactionsUseCase } from '../../application/usecases/GetTransactionsUseCase'
import { DepositDTO, TransferDTO } from './dtos/TransactionDTO'
import { JwtGuard } from 'src/shared/core/guards/JwtGuard'
import { TransactionTypeEnum } from 'src/shared/core/enums/TransactionTypeEnum'

@ApiTags('transaction')
@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly depositUseCase: DepositUseCase,
    private readonly transferUseCase: TransferUseCase,
    private readonly reversalUseCase: ReversalUseCase,
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
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

  @Put('/:transactionId/reversal')
  @UseGuards(JwtGuard)
  @ApiHeader({ 
    name: 'Authorization', 
    description: 'Bearer token', 
    required: true 
  })
  @ApiOperation({ 
    summary: 'Reversal', 
    description: 'Reverse a transaction. Admin only.' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Transaction completed successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Transaction must be a completed transfer to be reversed'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Only admins can reverse transactions' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Transaction not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async reversal(@Res() res: Response, @Req() req: any, @Param('transactionId') transactionId: string) {
    try {
      await this.reversalUseCase.execute({
        transactionId,
        requesterId: req.user.id,
        requesterRole: req.user.role,
      })
      return res.status(201).json({ message: 'Transaction completed successfully' })
    } catch (err) {
      return res.status(err.status ?? 500).json({ message: err.message })
    }
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiHeader({ 
    name: 'Authorization', 
    description: 'Bearer token', 
    required: true 
  })
  @ApiOperation({ 
    summary: 'Get transactions', 
    description: 'Get all transactions from authenticated user wallet.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Transactions found' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Wallet not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async getTransactions(@Res() res: Response, @Req() req: any, @Query('type') type?: TransactionTypeEnum) {
    try {
      const result = await this.getTransactionsUseCase.execute({
      requesterId: req.user.id,
      requesterRole: req.user.role,
      type,
    })
    return res.status(200).json(result)
  } catch (err) {
      return res.status(err.status ?? 500).json({ message: err.message })
    }
  }
}