import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

async function deploy() {
  console.log('🚀 Starting deployment process...');
  
  try {
    // Step 1: Set up database
    console.log('📦 Step 1: Setting up database...');
    execSync('npm run db:setup', { stdio: 'inherit' });
    
    // Step 2: Build the application (for production)
    if (process.env.NODE_ENV === 'production') {
      console.log('🔨 Step 2: Building application...');
      execSync('npm run build', { stdio: 'inherit' });
    }
    
    // Step 3: Start the application
    console.log('🎯 Step 3: Starting application...');
    if (process.env.NODE_ENV === 'production') {
      execSync('npm start', { stdio: 'inherit' });
    } else {
      execSync('npm run dev', { stdio: 'inherit' });
    }
    
  } catch (error) {
    console.error('💥 Deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment
deploy(); 