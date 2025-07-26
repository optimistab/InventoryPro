import pool from "../db";
import { users } from "../shared/schema";
import bcrypt from "bcrypt";

// Helper to get current ISO date string
function getCurrentIsoDate() {
  return new Date().toISOString();
}

async function createUser(username: string, rawPassword: string, role: string = "admin") {
  const password = await bcrypt.hash(rawPassword, 10);
  const dateOfCreation = getCurrentIsoDate();

  // Use SQL insert since drizzle-orm is not used directly here
  await pool.query(
    `INSERT INTO users (username, password, role, date_of_creation) VALUES ($1, $2, $3, $4)`,
    [username, password, role, dateOfCreation]
  );

  console.log("User created:", username);
}

createUser("admin", "admin123", "admin");