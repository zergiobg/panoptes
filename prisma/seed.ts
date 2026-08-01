import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding genesis user...');
  
  const genesisUser = await prisma.user.upsert({
    where: { email: 'sergio@bochica.network' },
    update: {
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      email: 'sergio@bochica.network',
      name: 'Sergio (Genesis)',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('Genesis user created:', genesisUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
