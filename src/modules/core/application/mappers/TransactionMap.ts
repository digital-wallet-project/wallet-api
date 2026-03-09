import { Transaction, Prisma } from '@prisma/client';
import { TransactionDomain, TransactionProps } from '../../domain/entity/TransactionDomain';

export class TransactionMapper {
  static toDomain(dbEntity: Transaction): TransactionDomain {
    const entityProps = {
      walletFromId: dbEntity.walletFromId || undefined,
      walletToId: dbEntity.walletToId || undefined,
      reversedTransactionId: dbEntity.reversedTransactionId || undefined,
      type: dbEntity.type,
      status: dbEntity.status,
      amount: dbEntity.amount.toNumber(),
      description: dbEntity.description || undefined,
      createdAt: dbEntity.createdAt,
    } as TransactionProps;

    return TransactionDomain.create(entityProps, dbEntity.id);
  }

  static toDomainList(dbEntityList: Transaction[] | undefined): (TransactionDomain | undefined)[] | [] {
    if (dbEntityList && dbEntityList.length > 0) {
      const entityDomainList = dbEntityList.map((dbEntity) => {
        return this.toDomain(dbEntity);
      });
      return entityDomainList;
    }
    return [];
  }

  static toPersistence(payload: TransactionDomain): Prisma.TransactionCreateInput {
    const WalletFrom = payload?.walletFromId ? { connect: { id: payload.walletFromId } } : {};
    const WalletTo = payload?.walletToId ? { connect: { id: payload.walletToId } } : {};
    const ReversedTransaction = payload?.reversedTransactionId ? { connect: { id: payload.reversedTransactionId } } : {};
    return {
      id: payload._id,
      type: payload.type,
      status: payload.status,
      amount: payload.amount,
      description: payload.description,
      createdAt: payload.createdAt,
      WalletFrom,
      WalletTo,
      ReversedTransaction
    } as Prisma.TransactionCreateInput;
  }
}
