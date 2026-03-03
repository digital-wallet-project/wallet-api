import { Prisma, User } from '@prisma/client'
import { UserDomain } from '../../domain/entity/UserDomain'

export interface IUserRepo {
  save(register: UserDomain): Promise<User>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>
  delete(id: string): Promise<void>
}