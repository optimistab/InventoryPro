import pool from "../db";

async function checkUsers() {
  try {
    console.log("Checking user status...\n");

    // Get all users
    const allUsers = await pool.query(
      `SELECT username, role, is_active, date_of_creation FROM users ORDER BY username`
    );

    console.log("📋 All Users in Database:");
    console.log("┌──────────┬─────────┬──────────┬─────────────────────┐");
    console.log("│ Username │ Role    │ Active   │ Created             │");
    console.log("├──────────┼─────────┼──────────┼─────────────────────┤");
    
    allUsers.rows.forEach((user: any) => {
      const status = user.is_active ? "✅ Yes" : "❌ No";
      const created = new Date(user.date_of_creation).toLocaleDateString();
      console.log(`│ ${user.username.padEnd(8)} │ ${user.role.padEnd(7)} │ ${status.padEnd(8)} │ ${created.padEnd(19)} │`);
    });
    
    console.log("└──────────┴─────────┴──────────┴─────────────────────┘");

    const activeCount = allUsers.rows.filter((user: any) => user.is_active).length;
    const totalCount = allUsers.rows.length;

    console.log(`\n📊 Summary:`);
    console.log(`   Total users: ${totalCount}`);
    console.log(`   Active users: ${activeCount}`);
    console.log(`   Inactive users: ${totalCount - activeCount}`);

    // Expected counts for new user structure
    const expectedCounts = {
      admin: 3,
      developer: 2,
      support: 2,
      salesperson: 6,
      salesmanager: 2,
      InventoryStaff: 2
    };

    const expectedTotal = Object.values(expectedCounts).reduce((sum, count) => sum + count, 0);

    if (activeCount === expectedTotal) {
      console.log(`\n✅ System has ${activeCount} active users as expected!`);

      // Show breakdown by role
      console.log("\n📈 Active Users by Role:");
      const roleCounts: Record<string, number> = {};
      allUsers.rows.filter((user: any) => user.is_active).forEach((user: any) => {
        roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
      });

      for (const [role, count] of Object.entries(roleCounts)) {
        const expected = expectedCounts[role as keyof typeof expectedCounts] || 0;
        const status = count === expected ? "✅" : "⚠️";
        console.log(`   ${role}: ${count}/${expected} ${status}`);
      }
    } else {
      console.log(`\n⚠️  System has ${activeCount} active users (expected ${expectedTotal})`);
    }

  } catch (error) {
    console.error("❌ Error checking users:", error);
  } finally {
    process.exit(0);
  }
}

checkUsers(); 