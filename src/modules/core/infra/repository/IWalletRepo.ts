import { Prisma, Wallet } from '@prisma/client'
import { WalletDomain } from '../../domain/entity/WalletDomain'

export interface IWalletRepo {
  save(register: WalletDomain, tx?: Prisma.TransactionClient): Promise<Wallet>
  findById(id: string): Promise<Wallet | null>
  findByUserId(userId: string): Promise<Wallet | null>
  update(id: string, data: Prisma.WalletUpdateInput, tx?: Prisma.TransactionClient): Promise<Wallet>
  delete(id: string): Promise<void>
}