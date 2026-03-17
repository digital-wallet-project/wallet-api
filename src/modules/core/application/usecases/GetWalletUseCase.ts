import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Wallet } from '@prisma/client'
import { IWalletRepo } from '../../infra/repository/IWalletRepo'
import { WalletRepository } from '../../infra/repository/impl/WalletRepository'
import { IGetWallet } from 'src/shared/core/interfaces/wallet.interface'

@Injectable()
export class GetWalletUseCase {
  constructor(
    @Inject(WalletRepository)
    private readonly walletRepo: IWalletRepo,
  ) {}

  async execute(payload: IGetWallet): Promise<Wallet> {
    const wallet = await this.walletRepo.findByUserId(payload.requesterId)

    if (!wallet)
      throw new NotFoundException('Wallet not found')

    return wallet
  }
}