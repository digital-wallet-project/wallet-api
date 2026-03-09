import { Body, Controller, Post, Res, Req, UseGuards, BadRequestException } from '@nestjs/common'
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { DepositUseCase } from '../../application/usecases/DepositUseCase'
import { TransactionRequestDTO } from './dtos/TransactionDTO'
import { JwtGuard } from 'src/shared/core/guards/JwtGuard'
import { TransactionTypeEnum } from 'src/shared/core/enums/TransactionTypeEnum'

@ApiTags('transaction')
@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly depositUseCase: DepositUseCase,
  ) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiHeader({ 
    name: 'Authorization', 
    description: 'Bearer token', 
    required: true 
  })
  @ApiOperation({ 
    summary: 'Create transaction', 
    description: 'Deposit, transfer or reverse a transaction.' 
  })
  @ApiBody({ type: TransactionRequestDTO })
  async transaction(@Res() res: Response, @Req() req: any, @Body() dto: TransactionRequestDTO) {
    try {
      const payload = {
      ...dto,
      requesterId: req.user.id,
      requesterRole: req.user.role,
    }

    switch (dto.type) {
      case TransactionTypeEnum.DEPOSIT:
        await this.depositUseCase.execute(payload)
        break
     // case TransactionTypeEnum.TRANSFER:
       // await this.transferUseCase.execute(payload)
       // break
      //case TransactionTypeEnum.REVERSAL:
       // await this.reversalUseCase.execute(payload)
        //break
      default:
        throw new BadRequestException('Invalid transaction type')
    }

    return res.status(201).json({ message: 'Transaction completed successfully' })
   } catch (err) {
      return res.status(err.status ?? 500).json({ message: err.message })
    }
  }
}