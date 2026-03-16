import { Injectable } from '@nestjs/common'
import { Prisma, Transaction } from '@prisma/client'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { TransactionMapper } from 'src/modules/core/application/mappers/TransactionMap'
import { TransactionDomain } from 'src/modules/core/domain/entity/TransactionDomain'
import { ITransactionRepo } from '../ITransactionRepo'
import { TransactionTypeEnum } from 'src/shared/core/enums/TransactionTypeEnum'

@Injectable()
export class TransactionRepository implements ITransactionRepo {
  constructor(private readonly prisma: PrismaService) {}

  async save(register: TransactionDomain, tx?: Prisma.TransactionClient): Promise<Transaction> {
    const prismaClient = tx ?? this.prisma
    const data = TransactionMapper.toPersistence(register)
    return await prismaClient.transaction.create({ data })
  }

  async findById(id: string): Promise<Transaction | null> {
    return await this.prisma.transaction.findFirst({ where: { id } })
  }

    async findByWalletId(walletId: string, type?: TransactionTypeEnum): Promise<Transaction[]> {
    return await this.prisma.transaction.findMany({
      where: {
        OR: [
          { walletFromId: walletId },
          { walletToId: walletId },
        ],
        ...(type && { type }),
      },
      include: {
        WalletFrom: {
          include: {
            User: {
              select: { email: true }
            }
          }
        },
        WalletTo: {
          include: {
            User: {
              select: { email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findAll(type?: TransactionTypeEnum): Promise<any[]> {
    return await this.prisma.transaction.findMany({
      where: {
        ...(type && { type })
      },
      include: {
        WalletFrom: {
          include: {
            User: {
              select: { email: true }
            }
          }
        },
        WalletTo: {
          include: {
            User: {
              select: { email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async update(id: string, data: Prisma.UserUpdateInput, tx?: Prisma.TransactionClient): Promise<Transaction> {
    const prismaClient = tx ?? this.prisma
    return await prismaClient.transaction.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({ where: { id } })
  }

}