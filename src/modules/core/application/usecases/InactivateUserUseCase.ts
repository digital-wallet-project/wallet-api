import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { User } from '@prisma/client'
import { IUserRepo } from '../../infra/repository/IUserRepo'
import { UserRepository } from '../../infra/repository/impl/UserRepository'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'
import { IUserInactivate } from 'src/shared/core/interfaces/user.interface'


@Injectable()
export class InactivateUserUseCase {
  constructor(
    @Inject(UserRepository)
    private readonly userRepo: IUserRepo,
  ) {}

  async execute(payload: IUserInactivate): Promise<User> {
    const isAdmin = payload.requesterRole === RoleEnum.ADMIN
    const isSelf = payload.requesterId === payload.targetId

    if (!isAdmin && !isSelf)
      throw new ForbiddenException('You can only deactivate your own account')

    const target = await this.userRepo.findById(payload.targetId)
    if (!target)
      throw new NotFoundException('User not found')

    if (!target.isActive)
      throw new BadRequestException('User is already inactive')

    // ADMIN não pode inativar outro ADMIN
    if (isAdmin && !isSelf && target.role === RoleEnum.ADMIN)
      throw new ForbiddenException('Cannot deactivate another admin account')

    // ADMIN não pode se auto-inativar se for o único admin
    if (isSelf && isAdmin) {
      const adminCount = await this.userRepo.countAdmins()
      if (adminCount <= 1)
        throw new ForbiddenException('Cannot deactivate the only admin account')
    }

    return await this.userRepo.update(payload.targetId, { isActive: false })
  }
}