import { Prisma, Transaction } from '@prisma/client'
import { TransactionDomain } from '../../domain/entity/TransactionDomain'

export interface ITransactionRepo {
  save(register: TransactionDomain, tx?: Prisma.TransactionClient): Promise<Transaction>
  findById(id: string): Promise<Transaction | null>
  update(id: string, data: Prisma.TransactionUpdateInput, tx?: Prisma.TransactionClient): Promise<Transaction>
  delete(id: string): Promise<void>
}