import pool from "../db";
import bcrypt from "bcrypt";

async function createUsers() {
  try {
    console.log("Creating new user structure...");

    // First, deactivate all existing users
    console.log("🔒 Deactivating all existing users...");
    await pool.query("UPDATE users SET is_active = false");
    console.log("✅ All existing users deactivated");

    // Define the new user structure with specified counts
    const userTypes = [
      { role: "admin", count: 3, prefix: "admin_" },
      { role: "developer", count: 2, prefix: "dev_" },
      { role: "support", count: 2, prefix: "support_" },
      { role: "salesperson", count: 6, prefix: "sales_" },
      { role: "salesmanager", count: 2, prefix: "sales_mgr_" },
      { role: "InventoryStaff", count: 2, prefix: "inv_staff_" }
    ];

    const allUsers: Array<{username: string, password: string, role: string}> = [];

    // Generate users for each type
    for (const userType of userTypes) {
      for (let i = 1; i <= userType.count; i++) {
        const username = `${userType.prefix}${String(i).padStart(2, '0')}`;
        const password = `${username}123`; // Pattern: [username]123
        allUsers.push({
          username,
          password,
          role: userType.role
        });
      }
    }

    // Hash passwords and insert users
    console.log("📝 Creating new users...");
    for (const user of allUsers) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Insert user into database using raw SQL
      await pool.query(
        `INSERT INTO users (username, password, role, date_of_creation, is_active)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.username, hashedPassword, user.role, new Date().toISOString(), true]
      );

      console.log(`✅ Created user: ${user.username} (${user.role})`);
    }

    console.log("🎉 All users created successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   Total users created: ${allUsers.length}`);
    console.log(`   User types: ${userTypes.length}`);

    // Display user credentials in a formatted table
    console.log("\n📋 User Credentials:");
    console.log("┌─────────────────┬─────────────────────┬────────────────┐");
    console.log("│ Username        │ Password            │ Role           │");
    console.log("├─────────────────┼─────────────────────┼────────────────┤");

    for (const user of allUsers) {
      console.log(`│ ${user.username.padEnd(15)} │ ${user.password.padEnd(19)} │ ${user.role.padEnd(14)} │`);
    }

    console.log("└─────────────────┴─────────────────────┴────────────────┘");

    // Display summary by role
    console.log("\n📈 Users by Role:");
    for (const userType of userTypes) {
      const usersOfType = allUsers.filter(u => u.role === userType.role);
      console.log(`   ${userType.role}: ${usersOfType.length} users`);
    }

  } catch (error) {
    console.error("❌ Error creating users:", error);
  } finally {
    process.exit(0);
  }
}

// Export a function for automatic user creation during deployment
export async function createUsersIfNeeded() {
  try {
    console.log("🔍 Checking if users exist...");

    // Check if any users exist
    const userCheck = await pool.query("SELECT COUNT(*) as count FROM users");
    const userCount = parseInt(userCheck.rows[0].count);

    if (userCount > 0) {
      console.log(`✅ Users already exist (${userCount} users found). Skipping user creation.`);
      return;
    }

    console.log("📝 No users found. Creating initial user structure...");

    // Define the new user structure with specified counts
    const userTypes = [
      { role: "admin", count: 3, prefix: "admin_" },
      { role: "developer", count: 2, prefix: "dev_" },
      { role: "support", count: 2, prefix: "support_" },
      { role: "salesperson", count: 6, prefix: "sales_" },
      { role: "salesmanager", count: 2, prefix: "sales_mgr_" },
      { role: "InventoryStaff", count: 2, prefix: "inv_staff_" }
    ];

    const allUsers: Array<{username: string, password: string, role: string}> = [];

    // Generate users for each type
    for (const userType of userTypes) {
      for (let i = 1; i <= userType.count; i++) {
        const username = `${userType.prefix}${String(i).padStart(2, '0')}`;
        const password = `${username}123`; // Pattern: [username]123
        allUsers.push({
          username,
          password,
          role: userType.role
        });
      }
    }

    // Hash passwords and insert users
    console.log("👥 Creating users...");
    for (const user of allUsers) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Insert user into database using raw SQL
      await pool.query(
        `INSERT INTO users (username, password, role, date_of_creation, is_active)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.username, hashedPassword, user.role, new Date().toISOString(), true]
      );

      console.log(`✅ Created user: ${user.username} (${user.role})`);
    }

    console.log("🎉 Initial users created successfully!");
    console.log(`📊 Total users created: ${allUsers.length}`);

  } catch (error) {
    console.error("❌ Error in createUsersIfNeeded:", error);
    throw error; // Re-throw to let caller handle it
  }
}

createUsers();