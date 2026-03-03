import { ConflictException, BadRequestException, Inject, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { AuthService } from '../services/AuthService'
import { IUserRepo } from '../../infra/repository/IUserRepo'
import { UserRepository } from '../../infra/repository/impl/UserRepository'
import { UserDomain } from '../../domain/entity/UserDomain'
import { ICreateUserRequest } from 'src/shared/core/interfaces/user.interface'

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(UserRepository)
    private readonly userRepo: IUserRepo,
    private readonly authService: AuthService,
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

    return await this.userRepo.save(
      UserDomain.create({
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
      })
    )
  }
}