import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
    const passwordHash = await bcrypt.hash('Bochica2026!', 10);
    
    const user = await prisma.user.upsert({
        where: { email: 'sergio@bochica.network' },
        update: {
            password: passwordHash,
            role: 'ADMIN',
        },
        create: {
            email: 'sergio@bochica.network',
            password: passwordHash,
            name: 'Sergio Genesis Admin',
            role: 'ADMIN',
            status: 'ACTIVE'
        }
    });

    console.log('Admin user updated with password!', user.email);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
