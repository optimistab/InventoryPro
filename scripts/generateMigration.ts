import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function generateMigration() {
  console.log('🔧 Generating new Drizzle migration...');
  
  try {
    // Generate new migration
    console.log('📦 Running drizzle-kit generate...');
    execSync('npx drizzle-kit generate', { stdio: 'inherit' });
    
    console.log('✅ Migration generated successfully!');
    console.log('💡 Next steps:');
    console.log('   1. Review the generated migration file in migrations/');
    console.log('   2. Run: npm run db:migrate');
    console.log('   3. Or deploy to production which will run migrations automatically');
    
  } catch (error) {
    console.error('❌ Migration generation failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateMigration()
    .then(() => {
      console.log('🎉 Migration generation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration generation failed:', error);
      process.exit(1);
    });
}

export default generateMigration; 