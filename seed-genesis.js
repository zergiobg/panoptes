const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function main() {
    console.log('Conectando a Neon DB directamente...');
    
    // We use a raw insert. If they exist, we do nothing or update.
    const query = `
        INSERT INTO "User" (id, email, name, role, status, "updatedAt")
        VALUES (gen_random_uuid(), 'sergio@bochica.network', 'Sergio (Génesis)', 'ADMIN', 'ACTIVE', NOW())
        ON CONFLICT (email) 
        DO UPDATE SET role = 'ADMIN', status = 'ACTIVE', "updatedAt" = NOW()
        RETURNING *;
    `;
    
    try {
        const res = await pool.query(query);
        console.log('Usuario Génesis creado/actualizado con éxito:', res.rows[0]);
    } catch (err) {
        console.error('Error insertando usuario:', err);
    } finally {
        await pool.end();
    }
}

main();
