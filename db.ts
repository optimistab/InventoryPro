// import { Pool } from "pg";

// const pool = new Pool({
//   user: "postgres",           // your Postgres username
//   host: "localhost",          // or your DB host
//   database: "inventoryprodb",  // your DB name
//   password: "User%40123",  // your DB password
//   port: 5432,                 // default Postgres port
// });

// export default pool;

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Important for Render's managed PG
});

export default pool;

