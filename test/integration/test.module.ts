import { Test, TestingModule } from '@nestjs/testing'
import { JwtModule } from '@nestjs/jwt'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { UserRepository } from 'src/modules/core/infra/repository/impl/UserRepository'
import { WalletRepository } from 'src/modules/core/infra/repository/impl/WalletRepository'
import { TransactionRepository } from 'src/modules/core/infra/repository/impl/TransactionRepository'
import { AuthService } from 'src/modules/core/application/services/AuthService'
import { CreateUserUseCase } from 'src/modules/core/application/usecases/CreateUserUseCase'
import { UpdateUserUseCase } from 'src/modules/core/application/usecases/UpdateUserUseCase'
import { InactivateUserUseCase } from 'src/modules/core/application/usecases/InactivateUserUseCase'
import { ReactivateUserUseCase } from 'src/modules/core/application/usecases/ReactivateUserUseCase'
import { GetWalletUseCase } from 'src/modules/core/application/usecases/GetWalletUseCase'
import { DepositUseCase } from 'src/modules/core/application/usecases/DepositUseCase'
import { TransferUseCase } from 'src/modules/core/application/usecases/TransferUseCase'
import { ReversalUseCase } from 'src/modules/core/application/usecases/ReversalUseCase'
import { GetTransactionsUseCase } from 'src/modules/core/application/usecases/GetTransactionsUseCase'

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
      TransactionRepository,
      AuthService,
      CreateUserUseCase,
      UpdateUserUseCase,
      InactivateUserUseCase,
      ReactivateUserUseCase,
      GetWalletUseCase,
      DepositUseCase,
      TransferUseCase,
      ReversalUseCase,
      GetTransactionsUseCase
    ],
  }).compile()
}