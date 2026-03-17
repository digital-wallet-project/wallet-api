import { RoleEnum } from "../enums/RoleEnum"

export interface IGetWallet {
  requesterId: string
  requesterRole: RoleEnum
}