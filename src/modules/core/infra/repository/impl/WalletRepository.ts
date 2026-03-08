import { Injectable } from '@nestjs/common'
import { Prisma, Wallet } from '@prisma/client'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { WalletMapper } from 'src/modules/core/application/mappers/WalletMap'
import { WalletDomain } from 'src/modules/core/domain/entity/WalletDomain'
import { IWalletRepo } from '../IWalletRepo'

@Injectable()
export class WalletRepository implements IWalletRepo {
  constructor(private readonly prisma: PrismaService) {}

  async save(register: WalletDomain, tx?: Prisma.TransactionClient): Promise<Wallet> {
    const prismaClient = tx ?? this.prisma
    const data = WalletMapper.toPersistence(register)
    return await prismaClient.wallet.create({ data })
  }

  async findById(id: string): Promise<Wallet | null> {
    return await this.prisma.wallet.findFirst({ where: { id } })
  }
  async findByUserId(userId: string): Promise<Wallet | null> {
    return await this.prisma.wallet.findFirst({ where: { userId } })
  }

  async update(id: string, data: Prisma.WalletUpdateInput): Promise<Wallet> {
    return await this.prisma.wallet.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.wallet.delete({ where: { id } })
  }
}