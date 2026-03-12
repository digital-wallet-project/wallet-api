import { NotFoundException, BadRequestException } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { CreateUserUseCase } from 'src/modules/core/application/usecases/CreateUserUseCase'
import { DepositUseCase } from 'src/modules/core/application/usecases/DepositUseCase'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'
import { TransactionTypeEnum } from 'src/shared/core/enums/TransactionTypeEnum'
import { createTestModule } from '../test.module'
import { cleanDatabase } from '../helpers/cleanDatabase'

describe('DepositUseCase (integration)', () => {
  let createUserUseCase: CreateUserUseCase
  let depositUseCase: DepositUseCase
  let prisma: PrismaService
  let module: TestingModule

  beforeAll(async () => {
    module = await createTestModule()
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase)
    depositUseCase = module.get<DepositUseCase>(DepositUseCase)
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
  it('should deposit successfully and update balance', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    await depositUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
      amount: 10,
    })

    const wallet = await prisma.wallet.findFirst({ where: { userId: user!.id } })
    expect(wallet?.balance.toNumber()).toBe(10)

    const transaction = await prisma.transaction.findFirst({ where: { walletToId: wallet!.id, type: TransactionTypeEnum.DEPOSIT } })
    expect(transaction).not.toBeNull()
    expect(transaction?.amount.toNumber()).toBe(10)
  })

  // erros de validação
  it('should throw NotFoundException when wallet not found', async () => {
    await expect(depositUseCase.execute({
      requesterId: 'non-existent-user',
      requesterRole: RoleEnum.USER,
      amount: 100,
    })).rejects.toThrow(NotFoundException)
  })

  it('should throw BadRequestException when amount is less than R$ 10,00', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    await expect(depositUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
      amount: 9,
    })).rejects.toThrow(BadRequestException)
  })
})