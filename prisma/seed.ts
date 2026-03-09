import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'
import { RoleEnum } from 'src/shared/core/enums/RoleEnum'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (existing) {
    console.log('Admin already exists, skipping seed')
    return
  }

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: process.env.ADMIN_EMAIL!,
      password: hashedPassword,
      role: RoleEnum.ADMIN,
      isActive: true,
    }
  })

  console.log('Admin created:', admin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })