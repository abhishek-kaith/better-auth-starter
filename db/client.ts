import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 40,
  idleTimeoutMillis: 30000,
});

const db = drizzle(pool, {
  schema,
});

export default db;
