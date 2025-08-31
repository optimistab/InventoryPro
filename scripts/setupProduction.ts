import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupProduction() {
  console.log('🚀 Setting up production environment...');
  
  try {
    // Step 1: Reset database to erase all data
    console.log('📦 Step 1: Resetting database to erase all data...');

    try {
      execSync('npm run db:reset', { stdio: 'inherit' });
      console.log('✅ Database reset completed!');
    } catch (resetError) {
      console.log('⚠️  Database reset failed, but continuing...');
      console.log('💡 This might happen if database is not accessible');
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