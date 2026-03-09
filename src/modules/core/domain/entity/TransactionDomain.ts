import { Entity } from 'src/shared/domain/Entity'
import { TransactionTypeEnum } from 'src/shared/core/enums/TransactionTypeEnum'
import { TransactionStatusEnum } from 'src/shared/core/enums/TransactionStatusEnum'

export interface TransactionProps {
  walletFromId?: string
  walletToId?: string
  reversedTransactionId?: string
  type: TransactionTypeEnum
  status: TransactionStatusEnum
  amount: number
  description?: string
  createdAt?: Date
}

export class TransactionDomain extends Entity<TransactionProps> {
  private constructor(props: TransactionProps, id?: string) {
    super(props, id)
  }

  static create(props: TransactionProps, id?: string) {
    return new TransactionDomain(props, id)
  }

  get walletFromId(): string | undefined {
    return this.props.walletFromId
  }

  get walletToId(): string | undefined {
    return this.props.walletToId
  }

  get reversedTransactionId(): string | undefined {
    return this.props.reversedTransactionId
  }

  get type(): TransactionTypeEnum {
    return this.props.type
  }

  get status(): TransactionStatusEnum {
    return this.props.status
  }

  get amount(): number{
    return this.props.amount
  }

  get description(): string | undefined {
    return this.props.description
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt
  }
}