import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Conectando a la base de datos (Neon)...');
    const genesisUser = await prisma.user.upsert({
        where: { email: 'sergio@bochica.network' },
        update: { role: 'ADMIN', status: 'ACTIVE' },
        create: {
            email: 'sergio@bochica.network',
            name: 'Sergio (Génesis)',
            role: 'ADMIN',
            status: 'ACTIVE'
        }
    });
    console.log('Usuario Génesis creado/actualizado con éxito:', genesisUser);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
