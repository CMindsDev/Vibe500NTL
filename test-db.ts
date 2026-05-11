import "dotenv/config";
import { Client } from "pg";

async function main() {
  console.log("=== PostgreSQL / Prisma DB Test ===\n");

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL no está definida en .env");
    process.exit(1);
  }

  // Ocultar credenciales en el log
  const safeUrl = connectionString.replace(/:\/\/[^@]+@/, "://***@");
  console.log(`Connecting to: ${safeUrl}\n`);

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // 1. Conectar
    console.log("▶ Connecting...");
    await client.connect();
    console.log("✅ Connection OK\n");

    // 2. Query básica
    console.log("▶ Running SELECT 1...");
    const res = await client.query("SELECT 1 AS ok, NOW() AS server_time");
    console.log(`✅ Query OK → server_time: ${res.rows[0].server_time}\n`);

    // 3. Versión de PostgreSQL
    console.log("▶ Checking PostgreSQL version...");
    const ver = await client.query("SELECT version()");
    console.log(`✅ ${ver.rows[0].version}\n`);

    // 4. Listar tablas existentes
    console.log("▶ Listing existing tables...");
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    if (tables.rows.length === 0) {
      console.log("ℹ️  No hay tablas todavía (schema vacío — listo para prisma migrate)\n");
    } else {
      console.log(`✅ Tablas encontradas (${tables.rows.length}):`);
      tables.rows.forEach((r) => console.log(`   - ${r.table_name}`));
      console.log();
    }

  } catch (err) {
    console.error("❌ DB Test FAILED:", err);
    process.exit(1);
  } finally {
    await client.end();
  }

  console.log("=== DB Test PASSED ✅ ===");
}

main();
