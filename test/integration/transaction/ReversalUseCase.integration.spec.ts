import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { CreateUserUseCase } from 'src/modules/core/application/usecases/CreateUserUseCase'
import { DepositUseCase } from 'src/modules/core/application/usecases/DepositUseCase'
import { TransferUseCase } from 'src/modules/core/application/usecases/TransferUseCase'
import { ReversalUseCase } from 'src/modules/core/application/usecases/ReversalUseCase'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'
import { TransactionTypeEnum } from 'src/shared/core/enums/TransactionTypeEnum'
import { TransactionStatusEnum } from 'src/shared/core/enums/TransactionStatusEnum'
import { createTestModule } from '../test.module'
import { cleanDatabase } from '../helpers/cleanDatabase'

describe('ReversalUseCase (integration)', () => {
  let createUserUseCase: CreateUserUseCase
  let depositUseCase: DepositUseCase
  let transferUseCase: TransferUseCase
  let reversalUseCase: ReversalUseCase
  let prisma: PrismaService
  let module: TestingModule

  beforeAll(async () => {
    module = await createTestModule()
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase)
    depositUseCase = module.get<DepositUseCase>(DepositUseCase)
    transferUseCase = module.get<TransferUseCase>(TransferUseCase)
    reversalUseCase = module.get<ReversalUseCase>(ReversalUseCase)
    prisma = module.get<PrismaService>(PrismaService)
  })

  beforeEach(async () => {
    await cleanDatabase(prisma)
  })

  afterAll(async () => {
    await cleanDatabase(prisma)
    await prisma.$disconnect()
  })

  // helper para criar uma transferência
  async function createTransfer(amount: number = 50) {
    await createUserUseCase.execute({ name: 'User1', email: 'user1@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'User2', email: 'user2@email.com', password: 'senha123' })
    const user1 = await prisma.user.findFirst({ where: { email: 'user1@email.com' } })
    const user2 = await prisma.user.findFirst({ where: { email: 'user2@email.com' } })
    const walletTo = await prisma.wallet.findFirst({ where: { userId: user2!.id } })

    await depositUseCase.execute({ requesterId: user1!.id, requesterRole: RoleEnum.USER, amount: 100 })
    await transferUseCase.execute({ requesterId: user1!.id, requesterRole: RoleEnum.USER, walletToId: walletTo!.id, amount })

    return { user1, user2 }
  }

  // casos de sucesso
  it('should reverse transaction and restore balances', async () => {
    const { user1, user2 } = await createTransfer()

    const transaction = await prisma.transaction.findFirst({ where: { type: TransactionTypeEnum.TRANSFER } })
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })

    await reversalUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      transactionId: transaction!.id,
    })

    const walletFrom = await prisma.wallet.findFirst({ where: { userId: user1!.id } })
    const walletTo = await prisma.wallet.findFirst({ where: { userId: user2!.id } })
    const reversedTransaction = await prisma.transaction.findFirst({ where: { id: transaction!.id } })

    expect(walletFrom?.balance.toNumber()).toBe(100)
    expect(walletTo?.balance.toNumber()).toBe(0)
    expect(reversedTransaction?.status).toBe(TransactionStatusEnum.REVERSED)
  })

  // erros de autorização
  it('should throw ForbiddenException when user tries to reverse', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    await expect(reversalUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
      transactionId: 'any-transaction',
    })).rejects.toThrow(ForbiddenException)
  })

  //  erros de validação
  it('should throw NotFoundException when transaction not found', async () => {
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })

    await expect(reversalUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      transactionId: 'non-existent-tx',
    })).rejects.toThrow(NotFoundException)
  })

  it('should throw BadRequestException when transaction is not TRANSFER type', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })

    await depositUseCase.execute({ requesterId: user!.id, requesterRole: RoleEnum.USER, amount: 100 })
    const transaction = await prisma.transaction.findFirst({ where: { type: TransactionTypeEnum.DEPOSIT } })

    await expect(reversalUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      transactionId: transaction!.id,
    })).rejects.toThrow(BadRequestException)
  })

  it('should throw BadRequestException when transaction is not COMPLETED', async () => {
    await createTransfer() 
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })

    const transaction = await prisma.transaction.findFirst({ where: { type: TransactionTypeEnum.TRANSFER } })
    await prisma.transaction.update({ where: { id: transaction!.id }, data: { status: TransactionStatusEnum.REVERSED } })

    await expect(reversalUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      transactionId: transaction!.id,
    })).rejects.toThrow(BadRequestException)
  })

  it('should throw BadRequestException when reversal period has expired', async () => {
    await createTransfer()
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })

    const transaction = await prisma.transaction.findFirst({ where: { type: TransactionTypeEnum.TRANSFER } })
    const oldDate = new Date()
    oldDate.setHours(oldDate.getHours() - 25)
    await prisma.transaction.update({ where: { id: transaction!.id }, data: { createdAt: oldDate } })

    await expect(reversalUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      transactionId: transaction!.id,
    })).rejects.toThrow(BadRequestException)
  })
})