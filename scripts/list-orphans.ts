const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const reports = await prisma.report.findMany({
        where: { userId: null }
    });
    
    console.log(`Found ${reports.length} orphaned reports.`);
    for (const r of reports) {
        console.log(`Report: ${r.id} | Type: ${r.type} | Category: ${r.category} | CreatorId (legacy): ${r.creatorId}`);
    }

    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true }
    });

    console.log('\nAvailable Users:');
    for (const u of users) {
        console.log(`User: ${u.id} | Name: ${u.name} | Email: ${u.email}`);
    }
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
