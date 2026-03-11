import { PrismaService } from 'src/shared/infra/database/prisma/PrismaService'

export async function cleanDatabase(prisma: PrismaService) {
  await prisma.transaction.deleteMany()
  await prisma.wallet.deleteMany()
  await prisma.user.deleteMany()
} 