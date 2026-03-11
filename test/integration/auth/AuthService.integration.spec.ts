import { UnauthorizedException } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { CreateUserUseCase } from 'src/modules/core/application/usecases/CreateUserUseCase'
import { AuthService } from 'src/modules/core/application/services/AuthService'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { createTestModule } from '../test.module'
import { cleanDatabase } from '../helpers/cleanDatabase'

describe('AuthService (integration)', () => {
  let createUserUseCase: CreateUserUseCase
  let authService: AuthService
  let prisma: PrismaService
  let module: TestingModule

  beforeAll(async () => {
    module = await createTestModule()
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase)
    authService = module.get<AuthService>(AuthService)
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
  it('should login successfully and return token', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })

    const result = await authService.login({
      email: 'raphael@email.com',
      password: 'senha123',
    })

    expect(result.token).toBeDefined()
    expect(typeof result.token).toBe('string')
  })

  // erros de autenticação
  it('should throw UnauthorizedException when email is wrong', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })

    await expect(authService.login({
      email: 'errado@email.com',
      password: 'senha123',
    })).rejects.toThrow(UnauthorizedException)
  })

  it('should throw UnauthorizedException when password is wrong', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })

    await expect(authService.login({
      email: 'raphael@email.com',
      password: 'senhaerrada',
    })).rejects.toThrow(UnauthorizedException)
  })

  it('should throw UnauthorizedException when user is inactive', async () => {
    await createUserUseCase.execute({ name: 'Raphael', email: 'raphael@email.com', password: 'senha123' })
    const user = await prisma.user.findFirst({ where: { email: 'raphael@email.com' } })
    await prisma.user.update({ where: { id: user!.id }, data: { isActive: false } })

    await expect(authService.login({
      email: 'raphael@email.com',
      password: 'senha123',
    })).rejects.toThrow(UnauthorizedException)
  })
})