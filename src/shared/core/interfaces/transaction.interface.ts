import { RoleEnum } from "../enums/RoleEnum"
import { TransactionTypeEnum } from "../enums/TransactionTypeEnum"

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
  emailTo: string
  description?: string
}

export interface IReversalPayload {
  requesterId: string
  requesterRole: RoleEnum
  transactionId: string
}

export interface IGetTransactionsPayload {
  requesterId: string
  requesterRole: RoleEnum
  type?: TransactionTypeEnum
}
