import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { CreateUserUseCase } from 'src/modules/core/application/usecases/CreateUserUseCase'
import { UpdateUserUseCase } from 'src/modules/core/application/usecases/UpdateUserUseCase'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'
import { createTestModule } from '../test.module'
import { cleanDatabase } from '../helpers/cleanDatabase'

describe('UpdateUserUseCase (integration)', () => {
  let createUserUseCase: CreateUserUseCase
  let updateUserUseCase: UpdateUserUseCase
  let prisma: PrismaService
  let module: TestingModule

  beforeAll(async () => {
    module = await createTestModule()
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase)
    updateUserUseCase = module.get<UpdateUserUseCase>(UpdateUserUseCase)
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
  it('should update own name successfully', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    const result = await updateUserUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
      targetId: user!.id,
      name: 'Raphael Updated',
    })

    expect(result.name).toBe('Raphael Updated')
  })

  it('should update own email successfully', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    const result = await updateUserUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
      targetId: user!.id,
      email: 'novo@email.com',
    })

    expect(result.email).toBe('novo@email.com')
  })

  it('should allow admin to update any user', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })

    const result = await updateUserUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      targetId: user!.id,
      name: 'Updated by Admin',
    })

    expect(result.name).toBe('Updated by Admin')
  })

  // erros de autorização
  it('should throw ForbiddenException when user tries to update another user', async () => {
    await createUserUseCase.execute({ name: 'User1', email: 'user1@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'User2', email: 'user2@email.com', password: 'senha123' })
    const user1 = await prisma.user.findFirst({ where: { email: 'user1@email.com' } })
    const user2 = await prisma.user.findFirst({ where: { email: 'user2@email.com' } })

    await expect(updateUserUseCase.execute({
      requesterId: user1!.id,
      requesterRole: RoleEnum.USER,
      targetId: user2!.id,
      name: 'User3',
    })).rejects.toThrow(ForbiddenException)
  })

  it('should throw ForbiddenException when user tries to update own role', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    await expect(updateUserUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
      targetId: user!.id,
      role: RoleEnum.ADMIN,
    })).rejects.toThrow(ForbiddenException)
  })

  it('should throw ForbiddenException when admin tries to demote another admin', async () => {
    await createUserUseCase.execute({ name: 'Admin1', email: 'admin1@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'Admin2', email: 'admin2@email.com', password: 'senha123' })
    const admin1 = await prisma.user.findFirst({ where: { email: 'admin1@email.com' } })
    const admin2 = await prisma.user.findFirst({ where: { email: 'admin2@email.com' } })
    await prisma.user.update({ where: { id: admin1!.id }, data: { role: RoleEnum.ADMIN } })
    await prisma.user.update({ where: { id: admin2!.id }, data: { role: RoleEnum.ADMIN } })

    await expect(updateUserUseCase.execute({
      requesterId: admin1!.id,
      requesterRole: RoleEnum.ADMIN,
      targetId: admin2!.id,
      role: RoleEnum.USER,
    })).rejects.toThrow(ForbiddenException)
  })

  // erros de validação
  it('should throw NotFoundException when user not found', async () => {
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })

    await expect(updateUserUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      targetId: 'non-existent-id',
      name: 'Test',
    })).rejects.toThrow(NotFoundException)
  })

  it('should throw BadRequestException when updating inactive user', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })
    await prisma.user.update({ where: { id: user!.id }, data: { isActive: false } })

    await expect(updateUserUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      targetId: user!.id,
      name: 'Test',
    })).rejects.toThrow(BadRequestException)
  })

  it('should throw BadRequestException for invalid email format', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    await expect(updateUserUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
      targetId: user!.id,
      email: 'email-invalid',
    })).rejects.toThrow(BadRequestException)
  })

  it('should throw BadRequestException when email already in use', async () => {
    await createUserUseCase.execute({ name: 'User1', email: 'user1@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'User2', email: 'user2@email.com', password: 'senha123' })
    const user1 = await prisma.user.findFirst({ where: { email: 'user1@email.com' } })

    await expect(updateUserUseCase.execute({
      requesterId: user1!.id,
      requesterRole: RoleEnum.USER,
      targetId: user1!.id,
      email: 'user2@email.com',
    })).rejects.toThrow(BadRequestException)
  })

  it('should throw BadRequestException when password is too short', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    await expect(updateUserUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
      targetId: user!.id,
      password: '123',
    })).rejects.toThrow(BadRequestException)
  })

  it('should throw BadRequestException when no valid fields to update', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    await expect(updateUserUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
      targetId: user!.id,
    })).rejects.toThrow(BadRequestException)
  })
})