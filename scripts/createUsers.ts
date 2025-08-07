import pool from "../db";
import bcrypt from "bcrypt";

async function createUsers() {
  try {
    console.log("Creating users...");

    // Define the 3 users with their credentials
    const userData = [
      {
        username: "admin",
        password: "admin123",
        role: "admin",
        dateOfCreation: new Date().toISOString(),
        isActive: true,
      },
      {
        username: "manager",
        password: "manager123",
        role: "manager",
        dateOfCreation: new Date().toISOString(),
        isActive: true,
      },
      {
        username: "staff",
        password: "staff123",
        role: "staff",
        dateOfCreation: new Date().toISOString(),
        isActive: true,
      },
    ];

    // Hash passwords and insert users
    for (const user of userData) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Insert user into database using raw SQL
      await pool.query(
        `INSERT INTO users (username, password, role, date_of_creation, is_active)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.username, hashedPassword, user.role, user.dateOfCreation, user.isActive]
      );

      console.log(`✅ Created user: ${user.username} (${user.role})`);
    }

    console.log("🎉 All users created successfully!");
    console.log("\n📋 User Credentials:");
    console.log("┌──────────┬─────────────┬─────────┐");
    console.log("│ Username │ Password    │ Role    │");
    console.log("├──────────┼─────────────┼─────────┤");
    console.log("│ admin    │ admin123    │ admin   │");
    console.log("│ manager  │ manager123  │ manager │");
    console.log("│ staff    │ staff123    │ staff   │");
    console.log("└──────────┴─────────────┴─────────┘");

  } catch (error) {
    console.error("❌ Error creating users:", error);
  } finally {
    process.exit(0);
  }
}

createUsers(); 