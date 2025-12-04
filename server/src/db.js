import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
    user: process.env.DB_USER || "iamsayon",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "upi_sentinel_db",
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});
