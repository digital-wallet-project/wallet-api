import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { IWalletRepo } from '../../infra/repository/IWalletRepo'
import { WalletRepository } from '../../infra/repository/impl/WalletRepository'
import { ITransactionRepo } from '../../infra/repository/ITransactionRepo'
import { TransactionRepository } from '../../infra/repository/impl/TransactionRepository'
import { UserRepository } from '../../infra/repository/impl/UserRepository'
import { IUserRepo } from '../../infra/repository/IUserRepo'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { TransactionDomain } from '../../domain/entity/TransactionDomain'
import { TransactionTypeEnum } from 'src/shared/core/enums/TransactionTypeEnum'
import { TransactionStatusEnum } from 'src/shared/core/enums/TransactionStatusEnum'
import { ITransferPayload } from 'src/shared/core/interfaces/transaction.interface'

@Injectable()
export class TransferUseCase {
  constructor(
    @Inject(WalletRepository)
    private readonly walletRepo: IWalletRepo,
    @Inject(TransactionRepository)
    private readonly transactionRepo: ITransactionRepo,
    @Inject(UserRepository)
    private readonly userRepo: IUserRepo,
    private readonly prisma: PrismaService,
  ) {}

  async execute(payload: ITransferPayload): Promise<void> {
    const walletFrom = await this.walletRepo.findByUserId(payload.requesterId)
    if (!walletFrom)
      throw new NotFoundException('Wallet not found')

    const userTo = await this.userRepo.findByEmail(payload.emailTo)
    if (!userTo || !userTo.isActive)
      throw new NotFoundException('Destination user not found')

    const walletTo = await this.walletRepo.findByUserId(userTo.id)

    if (!walletTo)
      throw new NotFoundException('Destination wallet not found')

    if (walletFrom.id === walletTo.id)
      throw new BadRequestException('Cannot transfer to your own wallet')

    if (payload.amount <= 0)
      throw new BadRequestException('Amount must be greater than zero')

    if (walletFrom.balance.toNumber() < payload.amount)
      throw new BadRequestException('Insufficient balance')

    await this.prisma.$transaction(async (tx) => {
      await this.walletRepo.update(walletFrom.id, { balance: { decrement: payload.amount } }, tx)
      await this.walletRepo.update(walletTo.id, { balance: { increment: payload.amount } }, tx)

      await this.transactionRepo.save(
        TransactionDomain.create({
          walletFromId: walletFrom.id,
          walletToId: walletTo.id,
          type: TransactionTypeEnum.TRANSFER,
          status: TransactionStatusEnum.COMPLETED,
          amount: payload.amount,
          description: payload.description,
        }),
        tx
      )
    })
  }
}