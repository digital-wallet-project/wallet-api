import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
//Controllers
import { AuthController } from './modules/core/infra/controllers/Auth.controller'
import { UserController } from './modules/core/infra/controllers/UserController'
// Repositories
import { UserRepository } from './modules/core/infra/repository/impl/UserRepository'
// Services
import { AuthService } from './modules/core/application/services/AuthService'
import { PrismaService } from './shared/infra/database/prisma/PrismaService'
//Strategy
import { JwtStrategy } from './shared/core/guards/JwtStrategy'
//UseCases
import { CreateUserUseCase } from './modules/core/application/usecases/CreateUserUseCase'
import { UpdateUserUseCase } from './modules/core/application/usecases/UpdateUserUseCase'
import { InactivateUserUseCase } from './modules/core/application/usecases/InactivateUserUseCase'


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
    UserController
  ],
  providers: [
    // Repositories
    UserRepository,
    // Services
    PrismaService,
    AuthService,
    // Strategy
    JwtStrategy,
    //UseCases
    CreateUserUseCase,
    UpdateUserUseCase,
    InactivateUserUseCase

  ],
})
export class CoreModule {}