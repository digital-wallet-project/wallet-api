import { RoleEnum } from "../enums/RoleEnum"

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
  role?: RoleEnum
}

export interface IUserActivationChange  {
  requesterId: string
  requesterRole: RoleEnum
  targetId: string
}

export interface IGetUsers {
  requesterId: string
  requesterRole: RoleEnum
  email?: string
}