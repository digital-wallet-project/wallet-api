import { NotFoundException } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { CreateUserUseCase } from 'src/modules/core/application/usecases/CreateUserUseCase'
import { DepositUseCase } from 'src/modules/core/application/usecases/DepositUseCase'
import { TransferUseCase } from 'src/modules/core/application/usecases/TransferUseCase'
import { GetTransactionsUseCase } from 'src/modules/core/application/usecases/GetTransactionsUseCase'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'
import { TransactionTypeEnum } from 'src/shared/core/enums/TransactionTypeEnum'
import { createTestModule } from '../test.module'
import { cleanDatabase } from '../helpers/cleanDatabase'

describe('GetTransactionsUseCase (integration)', () => {
  let createUserUseCase: CreateUserUseCase
  let depositUseCase: DepositUseCase
  let transferUseCase: TransferUseCase
  let getTransactionsUseCase: GetTransactionsUseCase
  let prisma: PrismaService
  let module: TestingModule

  beforeAll(async () => {
    module = await createTestModule()
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase)
    depositUseCase = module.get<DepositUseCase>(DepositUseCase)
    transferUseCase = module.get<TransferUseCase>(TransferUseCase)
    getTransactionsUseCase = module.get<GetTransactionsUseCase>(GetTransactionsUseCase)
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
  it('should return all transactions', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    await depositUseCase.execute({ requesterId: user!.id, requesterRole: RoleEnum.USER, amount: 100 })
    await depositUseCase.execute({ requesterId: user!.id, requesterRole: RoleEnum.USER, amount: 50 })

    const transactions = await getTransactionsUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
    })

    expect(transactions).toHaveLength(2)
  })

  it('should return only deposit transactions when filtered by type', async () => {
    await createUserUseCase.execute({ name: 'User1', email: 'user1@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'User2', email: 'user2@email.com', password: 'senha123' })
    const user1 = await prisma.user.findFirst({ where: { email: 'user1@email.com' } })
    const user2 = await prisma.user.findFirst({ where: { email: 'user2@email.com' } })
    const walletTo = await prisma.wallet.findFirst({ where: { userId: user2!.id } })

    await depositUseCase.execute({ requesterId: user1!.id, requesterRole: RoleEnum.USER, amount: 100 })
    await transferUseCase.execute({ requesterId: user1!.id, requesterRole: RoleEnum.USER, walletToId: walletTo!.id, amount: 30 })

    const transactions = await getTransactionsUseCase.execute({
      requesterId: user1!.id,
      requesterRole: RoleEnum.USER,
      type: TransactionTypeEnum.DEPOSIT,
    })

    expect(transactions).toHaveLength(1)
    expect(transactions[0].type).toBe(TransactionTypeEnum.DEPOSIT)
  })

  it('should return empty array when no transactions', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    const transactions = await getTransactionsUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
    })

    expect(transactions).toHaveLength(0)
  })

  // erros de validação
  it('should throw NotFoundException when wallet not found', async () => {
    await expect(getTransactionsUseCase.execute({
      requesterId: 'non-existent-user',
      requesterRole: RoleEnum.USER,
    })).rejects.toThrow(NotFoundException)
  })
})