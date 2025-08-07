import pool from "../db";

async function restrictUsers() {
  try {
    console.log("Restricting access to only allowed users...");

    // Define the allowed usernames
    const allowedUsernames = ["admin", "manager", "staff"];

    // Deactivate all users that are not in the allowed list
    const result = await pool.query(
      `UPDATE users 
       SET is_active = false 
       WHERE username NOT IN (${allowedUsernames.map((_, i) => `$${i + 1}`).join(', ')})`,
      allowedUsernames
    );

    console.log(`✅ Deactivated ${result.rowCount} unauthorized users`);

    // Verify only allowed users are active
    const activeUsers = await pool.query(
      `SELECT username, role FROM users WHERE is_active = true ORDER BY username`
    );

    console.log("\n📋 Currently Active Users:");
    console.log("┌──────────┬─────────┐");
    console.log("│ Username │ Role    │");
    console.log("├──────────┼─────────┤");
    
    activeUsers.rows.forEach((user: any) => {
      console.log(`│ ${user.username.padEnd(8)} │ ${user.role.padEnd(7)} │`);
    });
    
    console.log("└──────────┴─────────┘");

    if (activeUsers.rows.length === 0) {
      console.log("\n⚠️  No active users found! Run 'npm run create-users' first.");
    } else if (activeUsers.rows.length === 3) {
      console.log("\n✅ Access restricted to only the 3 allowed users!");
    } else {
      console.log(`\n⚠️  Found ${activeUsers.rows.length} active users (expected 3)`);
    }

  } catch (error) {
    console.error("❌ Error restricting users:", error);
  } finally {
    process.exit(0);
  }
}

restrictUsers(); 