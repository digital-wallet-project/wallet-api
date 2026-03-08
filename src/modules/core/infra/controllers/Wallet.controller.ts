import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { JwtGuard } from 'src/shared/core/guards/JwtGuard'
import { GetWalletUseCase } from '../../application/usecases/GetWalletUseCase'

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly getWalletUseCase: GetWalletUseCase,
  ) {}

  @Get()
  @UseGuards(JwtGuard)
  @ApiHeader({ 
    name: 'Authorization', 
    description: 'Bearer token', 
    required: true 
  })
  @ApiOperation({
    summary: 'Get own wallet',
    description: 'Returns the authenticated user wallet.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Wallet found' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Wallet not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async getMyWallet(@Res() res: Response, @Req() req: any) {
    try {
      const result = await this.getWalletUseCase.execute({
        requesterId: req.user.id,
        requesterRole: req.user.role,
      })
      return res.status(200).json(result)
    } catch (err) {
      return res.status(err.status ?? 500).json({ message: err.message })
    }
  }

  @Get('/:id')
  @UseGuards(JwtGuard)
  @ApiHeader({ 
    name: 'Authorization', 
    description: 'Bearer token', 
    required: true 
  })
  @ApiOperation({
    summary: 'Get wallet by id',
    description: 'Returns a wallet by id. Admin only.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Wallet found' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden – admin only' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Wallet not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async getWallet(@Res() res: Response, @Req() req: any, @Param('id') id: string) {
    try {
      const result = await this.getWalletUseCase.execute({
        requesterId: req.user.id,
        requesterRole: req.user.role,
        walletId: id,
      })
      return res.status(200).json(result)
    } catch (err) {
      return res.status(err.status ?? 500).json({ message: err.message })
    }
  }
}