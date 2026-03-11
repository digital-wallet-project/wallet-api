import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { CreateUserUseCase } from 'src/modules/core/application/usecases/CreateUserUseCase'
import { ReactivateUserUseCase } from 'src/modules/core/application/usecases/ReactivateUserUseCase'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'
import { createTestModule } from '../test.module'
import { cleanDatabase } from '../helpers/cleanDatabase'

describe('ReactivateUserUseCase (integration)', () => {
  let createUserUseCase: CreateUserUseCase
  let reactivateUserUseCase: ReactivateUserUseCase
  let prisma: PrismaService
  let module: TestingModule

  beforeAll(async () => {
    module = await createTestModule()
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase)
    reactivateUserUseCase = module.get<ReactivateUserUseCase>(ReactivateUserUseCase)
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
  it('should reactivate user successfully', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })
    await prisma.user.update({ where: { id: user!.id }, data: { isActive: false } })

    await expect(reactivateUserUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      targetId: user!.id,
    })).resolves.not.toThrow()

    const updated = await prisma.user.findFirst({ where: { id: user!.id } })
    expect(updated?.isActive).toBe(true)
  })

  // erros de autorização
  it('should throw ForbiddenException when user tries to reactivate', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    await expect(reactivateUserUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
      targetId: user!.id,
    })).rejects.toThrow(ForbiddenException)
  })

  //  erros de validação
  it('should throw NotFoundException when user not found', async () => {
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })

    await expect(reactivateUserUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      targetId: 'non-existent-id',
    })).rejects.toThrow(NotFoundException)
  })

  it('should throw BadRequestException when user is already active', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })

    await expect(reactivateUserUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      targetId: user!.id,
    })).rejects.toThrow(BadRequestException)
  })
})