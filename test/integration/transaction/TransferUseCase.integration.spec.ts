import { NotFoundException, BadRequestException } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { CreateUserUseCase } from 'src/modules/core/application/usecases/CreateUserUseCase'
import { DepositUseCase } from 'src/modules/core/application/usecases/DepositUseCase'
import { TransferUseCase } from 'src/modules/core/application/usecases/TransferUseCase'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'
import { createTestModule } from '../test.module'
import { cleanDatabase } from '../helpers/cleanDatabase'

describe('TransferUseCase (integration)', () => {
  let createUserUseCase: CreateUserUseCase
  let depositUseCase: DepositUseCase
  let transferUseCase: TransferUseCase
  let prisma: PrismaService
  let module: TestingModule

  beforeAll(async () => {
    module = await createTestModule()
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase)
    depositUseCase = module.get<DepositUseCase>(DepositUseCase)
    transferUseCase = module.get<TransferUseCase>(TransferUseCase)
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
  it('should transfer successfully and update both balances', async () => {
    await createUserUseCase.execute({ name: 'User1', email: 'user1@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'User2', email: 'user2@email.com', password: 'senha123' })
    const user1 = await prisma.user.findFirst({ where: { email: 'user1@email.com' } })
    const user2 = await prisma.user.findFirst({ where: { email: 'user2@email.com' } })

    await depositUseCase.execute({ requesterId: user1!.id, requesterRole: RoleEnum.USER, amount: 100 }) // depositar para poder transferir

    await transferUseCase.execute({
      requesterId: user1!.id,
      requesterRole: RoleEnum.USER,
      emailTo: user2!.email,
      amount: 50,
    })

    const walletFrom = await prisma.wallet.findFirst({ where: { userId: user1!.id } })
    const walletToUpdated = await prisma.wallet.findFirst({ where: { userId: user2!.id } })

    expect(walletFrom?.balance.toNumber()).toBe(50)
    expect(walletToUpdated?.balance.toNumber()).toBe(50)
  })

  // erros de autorização
  it('should throw BadRequestException when transferring to own wallet', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    await expect(transferUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
      emailTo: user!.email,
      amount: 50,
    })).rejects.toThrow(BadRequestException)
  })

  // erros de validação
  it('should throw NotFoundException when own wallet not found', async () => {
    await expect(transferUseCase.execute({
      requesterId: 'non-existent-user',
      requesterRole: RoleEnum.USER,
      emailTo: 'any@wallet.com',
      amount: 50,
    })).rejects.toThrow(NotFoundException)
  })

  it('should throw NotFoundException when destination wallet not found', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    await expect(transferUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
      emailTo: 'notfound@wallet.com',
      amount: 50,
    })).rejects.toThrow(NotFoundException)
  })

  it('should throw BadRequestException when amount is zero or less', async () => {
    await createUserUseCase.execute({ name: 'User1', email: 'user1@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'User2', email: 'user2@email.com', password: 'senha123' })
    const user1 = await prisma.user.findFirst({ where: { email: 'user1@email.com' } })
    const user2 = await prisma.user.findFirst({ where: { email: 'user2@email.com' } })

    await expect(transferUseCase.execute({
      requesterId: user1!.id,
      requesterRole: RoleEnum.USER,
      emailTo: user2!.email,
      amount: 0,
    })).rejects.toThrow(BadRequestException)
  })

  it('should throw BadRequestException when insufficient balance', async () => {
    await createUserUseCase.execute({ name: 'User1', email: 'user1@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'User2', email: 'user2@email.com', password: 'senha123' })
    const user1 = await prisma.user.findFirst({ where: { email: 'user1@email.com' } })
    const user2 = await prisma.user.findFirst({ where: { email: 'user2@email.com' } })

    await expect(transferUseCase.execute({
      requesterId: user1!.id,
      requesterRole: RoleEnum.USER,
      emailTo: user2!.email,
      amount: 100,
    })).rejects.toThrow(BadRequestException)
  })
})