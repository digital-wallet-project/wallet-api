import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IUserRepo } from '../../infra/repository/IUserRepo'
import { UserRepository } from '../../infra/repository/impl/UserRepository'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'
import { IUserActivationChange } from 'src/shared/core/interfaces/user.interface'

@Injectable()
export class ReactivateUserUseCase {
  constructor(
    @Inject(UserRepository)
    private readonly userRepo: IUserRepo,
  ) {}

  async execute(payload: IUserActivationChange): Promise<void> {
    const isAdmin = payload.requesterRole === RoleEnum.ADMIN

    if (!isAdmin)
      throw new ForbiddenException('Only an admin can reactivate an account')

    const target = await this.userRepo.findById(payload.targetId)
    if (!target)
      throw new NotFoundException('User not found')

    if (target.isActive)
      throw new BadRequestException('User is already active')

    await this.userRepo.update(payload.targetId, { isActive: true })
  }
}