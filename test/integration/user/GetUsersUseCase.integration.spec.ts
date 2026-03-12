import { ForbiddenException } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { CreateUserUseCase } from 'src/modules/core/application/usecases/CreateUserUseCase'
import { GetUsersUseCase } from 'src/modules/core/application/usecases/GetUsersUseCase'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'
import { createTestModule } from '../test.module'
import { cleanDatabase } from '../helpers/cleanDatabase'

describe('GetUsersUseCase (integration)', () => {
  let createUserUseCase: CreateUserUseCase
  let getUsersUseCase: GetUsersUseCase
  let prisma: PrismaService
  let module: TestingModule

  beforeAll(async () => {
    module = await createTestModule()
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase)
    getUsersUseCase = module.get<GetUsersUseCase>(GetUsersUseCase)
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
  it('should return all users when no filter is provided', async () => {
    await createUserUseCase.execute({ name: 'User1', email: 'user1@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'User2', email: 'user2@email.com', password: 'senha123' })
    const adminUser = await prisma.user.findFirst({ where: { email: 'user1@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })

    const users = await getUsersUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
    })

    expect(users).toHaveLength(1)
    expect(users[0].email).toBe('user2@email.com')
  })

  it('should return filtered users by email', async () => {
    await createUserUseCase.execute({ name: 'User1', email: 'user1@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'User2', email: 'user2@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'User3', email: 'user3@email.com', password: 'senha123' })
    const adminUser = await prisma.user.findFirst({ where: { email: 'user1@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })

    const users = await getUsersUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
      email: 'user2@email.com',
    })

    expect(users).toHaveLength(1)
    expect(users[0].email).toBe('user2@email.com')
  })

  it('should not return password in response', async () => {
    await createUserUseCase.execute({ name: 'User1', email: 'user1@email.com', password: 'senha123' })
    await createUserUseCase.execute({ name: 'User2', email: 'user2@email.com', password: 'senha123' })
    const adminUser = await prisma.user.findFirst({ where: { email: 'user1@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })

    const users = await getUsersUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
    })

    expect((users[0] as any).password).toBeUndefined()
  })

  it('should return empty array when no users found', async () => {
    await createUserUseCase.execute({ name: 'Admin', email: 'admin@email.com', password: 'senha123' })
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@email.com' } })
    await prisma.user.update({ where: { id: adminUser!.id }, data: { role: RoleEnum.ADMIN } })

    const users = await getUsersUseCase.execute({
      requesterId: adminUser!.id,
      requesterRole: RoleEnum.ADMIN,
    })

    expect(users).toHaveLength(0)
  })

  // erros de autorização
  it('should throw ForbiddenException when non-admin tries to list users', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })

    await expect(getUsersUseCase.execute({
      requesterId: user!.id,
      requesterRole: RoleEnum.USER,
    })).rejects.toThrow(ForbiddenException)
  })
})