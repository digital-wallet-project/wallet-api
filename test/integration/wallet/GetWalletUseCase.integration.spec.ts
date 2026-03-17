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

  // erros de validação
  it('should throw NotFoundException when wallet not found', async () => {
    await expect(getWalletUseCase.execute({
      requesterId: 'non-existent-user',
      requesterRole: RoleEnum.USER,
    })).rejects.toThrow(NotFoundException)
  })
})