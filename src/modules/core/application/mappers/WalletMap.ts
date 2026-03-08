import { Wallet, Prisma } from '@prisma/client';
import { WalletDomain, WalletProps } from '../../domain/entity/WalletDomain';

export class WalletMapper {
  static toDomain(dbEntity: Wallet): WalletDomain {
    const entityProps = {
      userId: dbEntity.userId,
      balance: dbEntity.balance.toNumber(),
      isActive: dbEntity.isActive,
      createdAt: dbEntity.createdAt,
      updatedAt: dbEntity.updatedAt,
    } as WalletProps;

    return WalletDomain.create(entityProps, dbEntity.id);
  }

  static toDomainList(dbEntityList: Wallet[] | undefined): (WalletDomain | undefined)[] | [] {
    if (dbEntityList && dbEntityList.length > 0) {
      const entityDomainList = dbEntityList.map((dbEntity) => {
        return this.toDomain(dbEntity);
      });
      return entityDomainList;
    }
    return [];
  }

  static toPersistence(payload: WalletDomain): Prisma.WalletCreateInput {
    const User = payload?.userId ? { connect: { id: payload.userId } } : {};
    return {
      id: payload._id,
      balance: payload.balance,
      isActive: payload.isActive,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
      User
    } as Prisma.WalletCreateInput;
  }
}
