import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
//Controllers
import { AuthController } from './modules/core/infra/controllers/Auth.controller'
import { UserController } from './modules/core/infra/controllers/UserController'
// Repositories
import { UserRepository } from './modules/core/infra/repository/impl/UserRepository'
// Services
import { AuthService } from './modules/core/application/services/AuthService'
import { PrismaService } from './shared/infra/database/prisma/PrismaService'
//UseCases
import { CreateUserUseCase } from './modules/core/application/usecases/CreateUserUseCase'


@Module({
  imports: [
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
    //UseCases
    CreateUserUseCase

  ],
})
export class CoreModule {}