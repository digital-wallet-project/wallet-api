import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { IUserRepo } from '../../infra/repository/IUserRepo'
import { UserRepository } from '../../infra/repository/impl/UserRepository'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'
import { IGetUsers } from 'src/shared/core/interfaces/user.interface'

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(UserRepository)
    private readonly userRepo: IUserRepo,
  ) {}

  async execute(payload: IGetUsers): Promise<Omit<User, 'password'>[]> {
    if (payload.requesterRole !== RoleEnum.ADMIN)
      throw new ForbiddenException('Only admins can list users')

    const users = await this.userRepo.findAll(payload.email)
    return users.map(({ password, ...user }) => user)
  }
}