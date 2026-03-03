import { Entity } from 'src/shared/domain/Entity'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'
import { UserStatusEnum } from 'src/shared/core/enums/UserStatusEnum'

export interface UserProps {
  name: string
  email: string
  password: string
  role?: RoleEnum
  status?: UserStatusEnum
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class UserDomain extends Entity<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id)
  }

  static create(props: UserProps, id?: string) {
    if (!props?.role) props.role = RoleEnum.USER;
    if (!props?.status) props.status = UserStatusEnum.ACTIVE;
    return new UserDomain(props, id)
  }

  get name(): string {
    return this.props.name
  }

  get email(): string {
    return this.props.email
  }

  get password(): string {
    return this.props.password
  }

  get role(): RoleEnum | undefined {
    return this.props.role
  }

  get status(): UserStatusEnum | undefined {
    return this.props.status
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