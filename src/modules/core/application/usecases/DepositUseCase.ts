import { Inject, Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common'
import { IWalletRepo } from '../../infra/repository/IWalletRepo'
import { WalletRepository } from '../../infra/repository/impl/WalletRepository'
import { ITransactionRepo } from '../../infra/repository/ITransactionRepo'
import { TransactionRepository } from '../../infra/repository/impl/TransactionRepository'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { TransactionDomain } from '../../domain/entity/TransactionDomain'
import { TransactionTypeEnum } from 'src/shared/core/enums/TransactionTypeEnum'
import { TransactionStatusEnum } from 'src/shared/core/enums/TransactionStatusEnum'
import { ITransactionPayload } from 'src/shared/core/interfaces/transaction.interface'

@Injectable()
export class DepositUseCase {
  constructor(
    @Inject(WalletRepository)
    private readonly walletRepo: IWalletRepo,
    @Inject(TransactionRepository)
    private readonly transactionRepo: ITransactionRepo,
    private readonly prisma: PrismaService,
  ) {}

  async execute(payload: ITransactionPayload): Promise<void> {
    const wallet = await this.walletRepo.findByUserId(payload.requesterId)
    if (!wallet)
      throw new NotFoundException('Wallet not found')
    
    if (payload.amount < 10)
      throw new BadRequestException('Minimum deposit amount is R$ 10,00')

    await this.prisma.$transaction(async (tx) => {
      await this.walletRepo.update(wallet.id, { balance: { increment: payload.amount } }, tx)

      await this.transactionRepo.save(
        TransactionDomain.create({
          walletToId: wallet.id,
          type: TransactionTypeEnum.DEPOSIT,
          status: TransactionStatusEnum.COMPLETED,
          amount: payload.amount,
          description: payload.description,
        }),
        tx
      )
    })
  }
}