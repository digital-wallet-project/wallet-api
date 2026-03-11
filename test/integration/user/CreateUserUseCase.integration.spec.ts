import { ConflictException, BadRequestException } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { CreateUserUseCase } from 'src/modules/core/application/usecases/CreateUserUseCase'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { createTestModule } from '../test.module'
import { cleanDatabase } from '../helpers/cleanDatabase'

describe('CreateUserUseCase (integration)', () => {
  let createUserUseCase: CreateUserUseCase
  let prisma: PrismaService
  let module: TestingModule

  beforeAll(async () => {
    module = await createTestModule()
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase)
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
  it('should create user and wallet successfully', async () => {
    const result = await createUserUseCase.execute({
      name: 'Raphael',
      email: 'raphael@email.com',
      password: 'senha123',
    })

    expect(result.email).toBe('raphael@email.com')
    expect(result.isActive).toBe(true)

    const wallet = await prisma.wallet.findFirst({ where: { userId: result.id } })
    expect(wallet).not.toBeNull()
    expect(wallet?.balance.toNumber()).toBe(0)
  })

  // erros de validação
  it('should throw BadRequestException for invalid email', async () => {
    await expect(createUserUseCase.execute({
      name: 'Raphael',
      email: 'email-invalido',
      password: 'senha123',
    })).rejects.toThrow(BadRequestException)
  })

  it('should throw BadRequestException when password is too short', async () => {
    await expect(createUserUseCase.execute({
      name: 'Raphael',
      email: 'raphael@email.com',
      password: '123',
    })).rejects.toThrow(BadRequestException)
  })

  it('should throw ConflictException when email already in use', async () => {
    await createUserUseCase.execute({
      name: 'Raphael',
      email: 'raphael@email.com',
      password: 'senha123',
    })

    await expect(createUserUseCase.execute({
      name: 'Raphael 2',
      email: 'raphael@email.com',
      password: 'senha123',
    })).rejects.toThrow(ConflictException)
  })
})