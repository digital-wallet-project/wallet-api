import { Test, TestingModule } from '@nestjs/testing'
import { JwtModule } from '@nestjs/jwt'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { UserRepository } from 'src/modules/core/infra/repository/impl/UserRepository'
import { WalletRepository } from 'src/modules/core/infra/repository/impl/WalletRepository'
import { AuthService } from 'src/modules/core/application/services/AuthService'
import { CreateUserUseCase } from 'src/modules/core/application/usecases/CreateUserUseCase'
import { UpdateUserUseCase } from 'src/modules/core/application/usecases/UpdateUserUseCase'
import { InactivateUserUseCase } from 'src/modules/core/application/usecases/InactivateUserUseCase'
import { ReactivateUserUseCase } from 'src/modules/core/application/usecases/ReactivateUserUseCase'
import { GetWalletUseCase } from 'src/modules/core/application/usecases/GetWalletUseCase'

export async function createTestModule(): Promise<TestingModule> {
  return await Test.createTestingModule({
    imports: [
      JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN) as any },
      }),
    ],
    providers: [
      PrismaService,
      UserRepository,
      WalletRepository,
      AuthService,
      CreateUserUseCase,
      UpdateUserUseCase,
      InactivateUserUseCase,
      ReactivateUserUseCase,
      GetWalletUseCase
    ],
  }).compile()
}