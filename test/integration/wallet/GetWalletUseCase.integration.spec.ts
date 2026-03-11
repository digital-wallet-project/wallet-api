import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { CreateUserUseCase } from 'src/modules/core/application/usecases/CreateUserUseCase'
import { GetWalletUseCase } from 'src/modules/core/application/usecases/GetWalletUseCase'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'
import { createTestModule } from '../test.module'
import { cleanDatabase } from '../helpers/cleanDatabase'

describe('GetWalletUseCase (integration)', () => {
  let createUserUseCase: CreateUserUseCase
  let getWalletUseCase: GetWalletUseCase
  let prisma: PrismaService
  let module: TestingModule

  beforeAll(async () => {
    module = await createTestModule()
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase)
    getWalletUseCase = module.get<GetWalletUseCase>(GetWalletUseCase)
    prisma = module.get<PrismaService>(PrismaService)
  })

  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  afterAll(async () => {
    await cleanDatabase(prisma)
    await prisma.$disconnect()
  })

  // casos de sucesso
  it('should return own wallet', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    const wallet = await getWalletUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
    })

    expect(wallet).not.toBeNull()
    expect(wallet.userId).toBe(user!.id)
    expect(wallet.balance.toNumber()).toBe(0)
  })

  it('should allow admin to get any wallet', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })
    const wallet = await prisma.wallet.findFirst({ where: { userId: user!.id } })

    const result = await getWalletUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      walletId: wallet!.id,
    })

    expect(result).not.toBeNull()
    expect(result.userId).toBe(user!.id)
  })

  // erros de autorização
  it('should throw ForbiddenException when user tries to get another wallet', async () => {
    await createUserUseCase.execute({ name: 'User1', email: 'user1@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'User2', email: 'user2@email.com', password: 'senha123' })
    const user1 = await prisma.user.findFirst({ where: { email: 'user1@email.com' } })
    const user2 = await prisma.user.findFirst({ where: { email: 'user2@email.com' } })
    const wallet2 = await prisma.wallet.findFirst({ where: { userId: user2!.id } })

    await expect(getWalletUseCase.execute({
      requesterId: user1!.id,
      requesterRole: RoleEnum.USER,
      walletId: wallet2!.id,
    })).rejects.toThrow(ForbiddenException)
  })

  // erros de validação
  it('should throw NotFoundException when wallet not found', async () => {
    await expect(getWalletUseCase.execute({
      requesterId: 'non-existent-user',
      requesterRole: RoleEnum.USER,
    })).rejects.toThrow(NotFoundException)
  })
})