import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Wallet } from '@prisma/client'
import { IWalletRepo } from '../../infra/repository/IWalletRepo'
import { WalletRepository } from '../../infra/repository/impl/WalletRepository'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'
import { IGetWallet } from 'src/shared/core/interfaces/wallet.interface'

@Injectable()
export class GetWalletUseCase {
  constructor(
    @Inject(WalletRepository)
    private readonly walletRepo: IWalletRepo,
  ) {}

  async execute(payload: IGetWallet): Promise<Wallet> {
    const isAdmin = payload.requesterRole === RoleEnum.ADMIN

    if (!isAdmin && payload.walletId) 
      throw new ForbiddenException('You can only view your own wallet')

    const wallet = isAdmin && payload.walletId
      ? await this.walletRepo.findById(payload.walletId)
      : await this.walletRepo.findByUserId(payload.requesterId)

    if (!wallet)
      throw new NotFoundException('Wallet not found')

    return wallet
  }
}