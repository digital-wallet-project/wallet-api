import { Prisma, Transaction } from '@prisma/client'
import { TransactionDomain } from '../../domain/entity/TransactionDomain'
import { TransactionTypeEnum } from 'src/shared/core/enums/TransactionTypeEnum'

export interface ITransactionRepo {
  save(register: TransactionDomain, tx?: Prisma.TransactionClient): Promise<Transaction>
  findById(id: string): Promise<Transaction | null>
  findByWalletId(walletId: string, type?: TransactionTypeEnum): Promise<Transaction[]>
  update(id: string, data: Prisma.TransactionUpdateInput, tx?: Prisma.TransactionClient): Promise<Transaction>
  delete(id: string): Promise<void>
}