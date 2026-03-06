import { User, Prisma } from '@prisma/client';
import { UserDomain, UserProps } from '../../domain/entity/UserDomain';

export class UserMapper {
  static toDomain(dbEntity: User): UserDomain {
    const entityProps = {
      name: dbEntity.name,
      email: dbEntity.email,
      password: dbEntity.password,
      role: dbEntity.role,
      isActive: dbEntity.isActive,
      createdAt: dbEntity.createdAt,
      updatedAt: dbEntity.updatedAt,
    } as UserProps;

    return UserDomain.create(entityProps, dbEntity.id);
  }

  static toDomainList(dbEntityList: User[] | undefined): (UserDomain | undefined)[] | [] {
    if (dbEntityList && dbEntityList.length > 0) {
      const entityDomainList = dbEntityList.map((dbEntity) => {
        return this.toDomain(dbEntity);
      });
      return entityDomainList;
    }
    return [];
  }

  static toPersistence(payload: UserDomain): Prisma.UserCreateInput {
    return {
      id: payload._id,
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      isActive: payload.isActive,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    } as Prisma.UserCreateInput;
  }
}
