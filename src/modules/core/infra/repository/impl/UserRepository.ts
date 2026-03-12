import { Injectable } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { UserMapper } from 'src/modules/core/application/mappers/UserMap'
import { UserDomain } from 'src/modules/core/domain/entity/UserDomain'
import { IUserRepo } from '../IUserRepo'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'

@Injectable()
export class UserRepository implements IUserRepo {
  constructor(private readonly prisma: PrismaService) {}

  async save(register: UserDomain, tx?: Prisma.TransactionClient): Promise<User> {
    const prismaClient = tx ?? this.prisma
    const data = UserMapper.toPersistence(register)
    return await prismaClient.user.create({ data })
  }

  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findFirst({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findFirst({ where: { email } })
  }

  async findAll(email?: string): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: {
        role: RoleEnum.USER,
        ...(email && { email: { contains: email } })
      }
    })
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await this.prisma.user.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } })
  }

  async countAdmins(): Promise<number> {
    return await this.prisma.user.count({
      where: { 
        role: RoleEnum.ADMIN, 
        isActive: true 
      }
    })
  }
}