import "dotenv/config";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const auths = await prisma.authenticator.findMany();
    console.log(auths);
}
main().finally(() => prisma.$disconnect());
