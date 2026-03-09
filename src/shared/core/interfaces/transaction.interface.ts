import { RoleEnum } from "../enums/RoleEnum"

export interface IDepositPayload {
  requesterId: string
  requesterRole: RoleEnum
  amount: number
  description?: string
}

export interface ITransferPayload {
  requesterId: string
  requesterRole: RoleEnum
  amount: number
  walletToId: string
  description?: string
}

export interface IReversalPayload {
  requesterId: string
  requesterRole: RoleEnum
  transactionId: string
}
