import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupProduction() {
  console.log('🚀 Setting up production environment...');
  
  try {
    // Step 1: Set up database schema with Drizzle migrations
    console.log('📦 Step 1: Setting up database schema with Drizzle migrations...');
    
    try {
      execSync('npm run db:migrate', { stdio: 'inherit' });
      console.log('✅ Database schema setup completed!');
    } catch (migrationError) {
      console.log('⚠️  Database schema setup failed, but continuing...');
      console.log('💡 This is normal if all tables already exist');
    }
    
    // Step 2: Build the application
    console.log('🔨 Step 2: Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('🎉 Production setup completed!');
    
  } catch (error) {
    console.error('💥 Production setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupProduction(); 