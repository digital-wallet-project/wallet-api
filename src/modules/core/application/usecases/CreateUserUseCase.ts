import { ConflictException, BadRequestException, Inject, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { AuthService } from '../services/AuthService'
import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'
import { IUserRepo } from '../../infra/repository/IUserRepo'
import { UserRepository } from '../../infra/repository/impl/UserRepository'
import { WalletRepository } from '../../infra/repository/impl/WalletRepository'
import { IWalletRepo } from '../../infra/repository/IWalletRepo'
import { UserDomain } from '../../domain/entity/UserDomain'
import { ICreateUserRequest } from 'src/shared/core/interfaces/user.interface'
import { WalletDomain } from '../../domain/entity/WalletDomain'

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(UserRepository)
    private readonly userRepo: IUserRepo,
    @Inject(WalletRepository)
    private readonly walletRepo: IWalletRepo,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(payload: ICreateUserRequest): Promise<User> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(payload.email)) 
      throw new BadRequestException('Invalid email format')

    const existing = await this.userRepo.findByEmail(payload.email)
    if (existing) 
      throw new ConflictException('Email already in use')

    if (payload.password.length < 6)
      throw new BadRequestException('Password must be at least 6 characters')

    const hashedPassword = await this.authService.hashPassword(payload.password)

    return await this.prisma.$transaction(async (tx) => {
      const user = await this.userRepo.save(
        UserDomain.create({
          name: payload.name,
          email: payload.email,
          password: hashedPassword,
        }),
        tx
      )

      const wallet = WalletDomain.create({
        userId: user.id,
        balance: 0
      })

      await this.walletRepo.save(wallet, tx)
      
      const { password, ...result } = user
      return result as User
    })
  }
}