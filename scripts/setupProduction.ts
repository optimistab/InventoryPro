import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupProduction() {
  console.log('🚀 Setting up production environment...');
  
  try {
    // Database is already reset during build process
    console.log('📦 Database already reset during build process');
    
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