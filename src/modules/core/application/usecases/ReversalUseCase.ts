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
import { IReversalPayload } from 'src/shared/core/interfaces/transaction.interface'

@Injectable()
export class ReversalUseCase {
  constructor(
    @Inject(WalletRepository)
    private readonly walletRepo: IWalletRepo,
    @Inject(TransactionRepository)
    private readonly transactionRepo: ITransactionRepo,
    private readonly prisma: PrismaService,
  ) {}

  async execute(payload: IReversalPayload): Promise<void> {
    const isAdmin = payload.requesterRole === RoleEnum.ADMIN

    if (!isAdmin)
      throw new ForbiddenException('Only admins can reverse transactions')

    const transaction = await this.transactionRepo.findById(payload.transactionId)
    if (!transaction)
      throw new NotFoundException('Transaction not found')

    if (transaction.status !== TransactionStatusEnum.COMPLETED)
      throw new BadRequestException('Only completed transactions can be reversed')

    if (transaction.type !== TransactionTypeEnum.TRANSFER)
        throw new BadRequestException('Only transfer transactions can be reversed')

    const hoursDiff = (new Date().getTime() - new Date(transaction.createdAt).getTime()) / (1000 * 60 * 60)
    if (hoursDiff > 24)
      throw new BadRequestException('Reversal period of 24 hours has expired')

    await this.prisma.$transaction(async (tx) => {
      await this.walletRepo.update(transaction.walletFromId!, { balance: { increment: transaction.amount } }, tx)
      await this.walletRepo.update(transaction.walletToId!, { balance: { decrement: transaction.amount } }, tx)

      await this.transactionRepo.save(
        TransactionDomain.create({
          walletFromId: transaction.walletToId!,
          walletToId: transaction.walletFromId!,
          reversedTransactionId: transaction.id,
          type: TransactionTypeEnum.REVERSAL,
          status: TransactionStatusEnum.COMPLETED,
          amount: transaction.amount.toNumber(),
        }),
        tx
      )

      await this.transactionRepo.update(transaction.id, { status: TransactionStatusEnum.REVERSED }, tx)
    })
  }
}