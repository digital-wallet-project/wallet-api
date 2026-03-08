import { Entity } from 'src/shared/domain/Entity'

export interface WalletProps {
  userId: string
  balance: number
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class WalletDomain extends Entity<WalletProps> {
  private constructor(props: WalletProps, id?: string) {
    super(props, id)
  }

  static create(props: WalletProps, id?: string) {
    return new WalletDomain(props, id)
  }

  get userId(): string {
    return this.props.userId
  }

  get balance(): number {
    return this.props.balance
  }

  get isActive(): boolean | undefined {
    return this.props.isActive
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt
  }
}