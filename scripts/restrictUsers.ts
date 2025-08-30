import pool from "../db";
import bcrypt from "bcrypt";

async function restrictUsers() {
  try {
    console.log("Restricting access to only allowed users...");

    // Define the new user structure
    const userTypes = [
      { role: "admin", count: 3, prefix: "admin_" },
      { role: "developer", count: 2, prefix: "dev_" },
      { role: "support", count: 2, prefix: "support_" },
      { role: "salesperson", count: 6, prefix: "sales_" },
      { role: "salesmanager", count: 2, prefix: "sales_mgr_" },
      { role: "InventoryStaff", count: 2, prefix: "inv_staff_" }
    ];

    // Generate allowed usernames
    const allowedUsernames: string[] = [];
    for (const userType of userTypes) {
      for (let i = 1; i <= userType.count; i++) {
        allowedUsernames.push(`${userType.prefix}${String(i).padStart(2, '0')}`);
      }
    }

    // Deactivate all users that are not in the allowed list
    const result = await pool.query(
      `UPDATE users
        SET is_active = false
        WHERE username != ALL($1)`,
      [allowedUsernames]
    );

    console.log(`✅ Deactivated ${result.rowCount} unauthorized users`);

    // Ensure all allowed users exist and are active
    for (const username of allowedUsernames) {
      const userType = userTypes.find(type => username.startsWith(type.prefix));
      if (!userType) continue;

      // Check if user exists
      const existingUser = await pool.query(
        `SELECT id FROM users WHERE username = $1`,
        [username]
      );

      if (existingUser.rows.length === 0) {
        // Create missing user
        const password = `${username}123`;
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
          `INSERT INTO users (username, password, role, date_of_creation, is_active)
           VALUES ($1, $2, $3, $4, $5)`,
          [username, hashedPassword, userType.role, new Date().toISOString(), true]
        );

        console.log(`✅ Created missing user: ${username} (${userType.role})`);
      } else {
        // Ensure user is active
        await pool.query(
          `UPDATE users SET is_active = true WHERE username = $1`,
          [username]
        );
      }
    }

    // Verify only allowed users are active
    const activeUsers = await pool.query(
      `SELECT username, role FROM users WHERE is_active = true ORDER BY username`
    );

    console.log("\n📋 Currently Active Users:");
    console.log("┌─────────────────┬────────────────┐");
    console.log("│ Username        │ Role           │");
    console.log("├─────────────────┼────────────────┤");

    activeUsers.rows.forEach((user: any) => {
      console.log(`│ ${user.username.padEnd(15)} │ ${user.role.padEnd(14)} │`);
    });

    console.log("└─────────────────┴────────────────┘");

    const expectedTotal = allowedUsernames.length;
    if (activeUsers.rows.length === 0) {
      console.log("\n⚠️  No active users found! Run 'npm run create-users' first.");
    } else if (activeUsers.rows.length === expectedTotal) {
      console.log(`\n✅ Access restricted to only the ${expectedTotal} allowed users!`);

      // Show breakdown by role
      console.log("\n📈 Users by Role:");
      const roleCounts: Record<string, number> = {};
      activeUsers.rows.forEach((user: any) => {
        roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
      });

      for (const userType of userTypes) {
        const count = roleCounts[userType.role] || 0;
        const status = count === userType.count ? "✅" : "⚠️";
        console.log(`   ${userType.role}: ${count}/${userType.count} ${status}`);
      }
    } else {
      console.log(`\n⚠️  Found ${activeUsers.rows.length} active users (expected ${expectedTotal})`);
    }

  } catch (error) {
    console.error("❌ Error restricting users:", error);
  } finally {
    process.exit(0);
  }
}

restrictUsers(); 