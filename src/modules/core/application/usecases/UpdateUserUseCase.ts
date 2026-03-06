import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { User } from '@prisma/client'
import { IUserRepo } from '../../infra/repository/IUserRepo'
import { UserRepository } from '../../infra/repository/impl/UserRepository'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'
import { IUserPayload } from 'src/shared/core/interfaces/user.interface'
import { AuthService } from '../services/AuthService'

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(UserRepository)
    private readonly userRepo: IUserRepo,
    private readonly authService: AuthService,
  ) {}

  async execute(payload: IUserPayload): Promise<User> {
    const isAdmin = payload.requesterRole === RoleEnum.ADMIN
    const isSelf = payload.requesterId === payload.targetId

    if (!isAdmin && !isSelf)
      throw new ForbiddenException('You can only update your own account')

    if (!isAdmin && payload.role)
      throw new ForbiddenException('You are not allowed to update role')

    const target = await this.userRepo.findById(payload.targetId)
    if (!target) throw new NotFoundException('User not found')

    // ADMIN não pode rebaixar ADMIN para USER
    if (isAdmin && payload.role === RoleEnum.USER && target.role === RoleEnum.ADMIN)
      throw new ForbiddenException('Cannot demote an admin to user')

    if (!target.isActive)
      throw new BadRequestException('Cannot update an inactive user')

    // validação de email
    if (payload.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(payload.email))
        throw new BadRequestException('Invalid email format')

      const existing = await this.userRepo.findByEmail(payload.email)
      if (existing && existing.id !== payload.targetId)
        throw new BadRequestException('Email already in use')
    }

    // validação de senha
    let hashedPassword: string | undefined
    if (payload.password) {
      if (payload.password.length < 6)
        throw new BadRequestException('Password must be at least 6 characters')

      hashedPassword = await this.authService.hashPassword(payload.password)
    }

    const data = {
      ...(payload.name && { name: payload.name }),
      ...(payload.email && {email: payload.email,}),
      ...(hashedPassword && { password: hashedPassword }),
      ...(isAdmin && payload.role && { role: payload.role }),
    }

    if (!Object.keys(data).length)
      throw new BadRequestException('No valid fields to update')

    const updated = await this.userRepo.update(payload.targetId, data)
    const { password, ...result } = updated; //escondendo a senha no retorno
    return result as User;
  }
}