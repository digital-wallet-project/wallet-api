import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Transaction } from '@prisma/client'
import { IWalletRepo } from '../../infra/repository/IWalletRepo'
import { WalletRepository } from '../../infra/repository/impl/WalletRepository'
import { ITransactionRepo } from '../../infra/repository/ITransactionRepo'
import { TransactionRepository } from '../../infra/repository/impl/TransactionRepository'
import { IGetTransactionsPayload } from 'src/shared/core/interfaces/transaction.interface'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'

@Injectable()
export class GetTransactionsUseCase {
  constructor(
    @Inject(WalletRepository)
    private readonly walletRepo: IWalletRepo,
    @Inject(TransactionRepository)
    private readonly transactionRepo: ITransactionRepo,
  ) {}

  async execute(payload: IGetTransactionsPayload): Promise<Transaction[]> {
    const isAdmin = payload.requesterRole === RoleEnum.ADMIN

    if (isAdmin) {
      return await this.transactionRepo.findAll(payload.type)
    }
    
    const wallet = await this.walletRepo.findByUserId(payload.requesterId)
    if (!wallet)
      throw new NotFoundException('Wallet not found')

    return await this.transactionRepo.findByWalletId(wallet.id, payload.type)
  }
}