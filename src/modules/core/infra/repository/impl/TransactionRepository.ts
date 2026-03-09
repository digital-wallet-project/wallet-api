import { Injectable } from '@nestjs/common'
import { Prisma, Transaction } from '@prisma/client'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { TransactionMapper } from 'src/modules/core/application/mappers/TransactionMap'
import { TransactionDomain } from 'src/modules/core/domain/entity/TransactionDomain'
import { ITransactionRepo } from '../ITransactionRepo'

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

  async update(id: string, data: Prisma.UserUpdateInput, tx?: Prisma.TransactionClient): Promise<Transaction> {
    const prismaClient = tx ?? this.prisma
    return await prismaClient.transaction.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({ where: { id } })
  }

}