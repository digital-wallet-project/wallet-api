import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { CreateUserUseCase } from 'src/modules/core/application/usecases/CreateUserUseCase'
import { InactivateUserUseCase } from 'src/modules/core/application/usecases/InactivateUserUseCase'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'
import { createTestModule } from '../test.module'
import { cleanDatabase } from '../helpers/cleanDatabase'

describe('InactivateUserUseCase (integration)', () => {
  let createUserUseCase: CreateUserUseCase
  let inactivateUserUseCase: InactivateUserUseCase
  let prisma: PrismaService
  let module: TestingModule

  beforeAll(async () => {
    module = await createTestModule()
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase)
    inactivateUserUseCase = module.get<InactivateUserUseCase>(InactivateUserUseCase)
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
  it('should inactivate own account', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    await expect(inactivateUserUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
      targetId: user!.id,
    })).resolves.not.toThrow()

    const updated = await prisma.user.findFirst({ where: { id: user!.id } })
    expect(updated?.isActive).toBe(false)
  })

  it('should allow admin to inactivate any user', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })

    await expect(inactivateUserUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      targetId: user!.id,
    })).resolves.not.toThrow()

    const updated = await prisma.user.findFirst({ where: { id: user!.id } })
    expect(updated?.isActive).toBe(false)
  })

  // erros de autorização
  it('should throw ForbiddenException when user tries to inactivate another user', async () => {
    await createUserUseCase.execute({ name: 'User1', email: 'user1@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'User2', email: 'user2@email.com', password: 'senha123' })
    const user1 = await prisma.user.findFirst({ where: { email: 'user1@email.com' } })
    const user2 = await prisma.user.findFirst({ where: { email: 'user2@email.com' } })

    await expect(inactivateUserUseCase.execute({
      requesterId: user1!.id,
      requesterRole: RoleEnum.USER,
      targetId: user2!.id,
    })).rejects.toThrow(ForbiddenException)
  })

  it('should throw ForbiddenException when admin tries to inactivate another admin', async () => {
    await createUserUseCase.execute({ name: 'Admin1', email: 'admin1@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'Admin2', email: 'admin2@email.com', password: 'senha123' })
    const admin1 = await prisma.user.findFirst({ where: { email: 'admin1@email.com' } })
    const admin2 = await prisma.user.findFirst({ where: { email: 'admin2@email.com' } })
    await prisma.user.update({ where: { id: admin1!.id }, data: { role: RoleEnum.ADMIN } })
    await prisma.user.update({ where: { id: admin2!.id }, data: { role: RoleEnum.ADMIN } })

    await expect(inactivateUserUseCase.execute({
      requesterId: admin1!.id,
      requesterRole: RoleEnum.ADMIN,
      targetId: admin2!.id,
    })).rejects.toThrow(ForbiddenException)
  })

  it('should throw ForbiddenException when last admin tries to inactivate itself', async () => {
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })

    await expect(inactivateUserUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      targetId: adminUser!.id,
    })).rejects.toThrow(ForbiddenException)
  })

  // erros de validação
  it('should throw NotFoundException when user not found', async () => {
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })

    await expect(inactivateUserUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      targetId: 'non-existent-id',
    })).rejects.toThrow(NotFoundException)
  })

  it('should throw BadRequestException when user is already inactive', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })
    await prisma.user.update({ where: { id: user!.id }, data: { isActive: false } })

    await expect(inactivateUserUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      targetId: user!.id,
    })).rejects.toThrow(BadRequestException)
  })
})