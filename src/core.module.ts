import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
//Controllers
import { AuthController } from './modules/core/infra/controllers/Auth.controller'
import { UserController } from './modules/core/infra/controllers/User.controller'
import { WalletController } from './modules/core/infra/controllers/Wallet.controller'
import { TransactionController } from './modules/core/infra/controllers/Transaction.controller'
// Repositories
import { UserRepository } from './modules/core/infra/repository/impl/UserRepository'
import { WalletRepository } from './modules/core/infra/repository/impl/WalletRepository'
import { TransactionRepository } from './modules/core/infra/repository/impl/TransactionRepository'
// Services
import { AuthService } from './modules/core/application/services/AuthService'
import { PrismaService } from './shared/infra/database/prisma/PrismaService'
//Strategy
import { JwtStrategy } from './shared/core/guards/JwtStrategy'
//UseCases
import { CreateUserUseCase } from './modules/core/application/usecases/CreateUserUseCase'
import { UpdateUserUseCase } from './modules/core/application/usecases/UpdateUserUseCase'
import { InactivateUserUseCase } from './modules/core/application/usecases/InactivateUserUseCase'
import { ReactivateUserUseCase } from './modules/core/application/usecases/ReactivateUserUseCase'
import { GetWalletUseCase } from './modules/core/application/usecases/GetWalletUseCase'
import { DepositUseCase } from './modules/core/application/usecases/DepositUseCase'
import { TransferUseCase } from './modules/core/application/usecases/TransferUseCase'
import { ReversalUseCase } from './modules/core/application/usecases/ReversalUseCase'
import { GetTransactionsUseCase } from './modules/core/application/usecases/GetTransactionsUseCase'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN) as any },
    }),
  ],
  controllers: [
    AuthController,
    UserController,
    WalletController,
    TransactionController
  ],
  providers: [
    // Repositories
    UserRepository,
    WalletRepository,
    TransactionRepository,
    // Services
    PrismaService,
    AuthService,
    // Strategy
    JwtStrategy,
    //UseCases
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
})
export class CoreModule {}