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

    if (activeCount === 3) {
      console.log("\n✅ System is properly restricted to 3 users only!");
    } else {
      console.log(`\n⚠️  System has ${activeCount} active users (expected 3)`);
    }

  } catch (error) {
    console.error("❌ Error checking users:", error);
  } finally {
    process.exit(0);
  }
}

checkUsers(); 