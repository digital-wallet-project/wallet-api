import { TransactionType } from "@prisma/client"
import { RoleEnum } from "../enums/RoleEnum"

export interface ITransactionPayload {
  requesterId: string
  requesterRole: RoleEnum
  type: TransactionType
  amount: number
  description?: string
  walletFromId?: string
  walletToId?: string
  transactionId?: string // para REVERSAL
}