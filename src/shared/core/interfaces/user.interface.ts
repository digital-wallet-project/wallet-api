import { RoleEnum } from "../enums/RoleEnum"
import { UserStatusEnum } from "../enums/UserStatusEnum"

export interface ICreateUserRequest {
  name: string
  email: string
  password: string
}

export interface IUserPayload {
  requesterId: string
  requesterRole: RoleEnum
  targetId: string // id que será atualizado
  name?: string
  email?: string
  password?: string
  status?: UserStatusEnum
  role?: RoleEnum
}

export interface IUserInactivate {
  requesterId: string
  requesterRole: RoleEnum
  targetId: string
}