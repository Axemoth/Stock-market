require('dotenv').config();

console.log('Testing environment configuration...\n');

// Check required environment variables
const requiredVars = [
  'PORT',
  'NODE_ENV',
  'FRONTEND_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'KOTAK_API_BASE_URL',
  'KOTAK_API_KEY',
  'KOTAK_API_SECRET',
  'KOTAK_API_USERNAME',
  'KOTAK_API_PASSWORD',
  'KOTAK_CLIENT_ID',
  'SESSION_SECRET'
];

console.log('Checking required environment variables:');
let allVarsPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: MISSING`);
    allVarsPresent = false;
  } else if (value.includes('your_') || value.includes('_here')) {
    console.log(`⚠️  ${varName}: SET (but appears to be placeholder: ${value})`);
  } else {
    console.log(`✅ ${varName}: SET`);
  }
});

console.log('\nChecking optional environment variables:');
const optionalVars = [
  'USE_MOCK_KOTAK_API',
  'DATABASE_URL',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'REDIS_URL',
  'LOG_LEVEL',
  'LOG_FILE'
];

optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: SET (${value})`);
  } else {
    console.log(`➖ ${varName}: NOT SET (optional)`);
  }
});

console.log('\nEnvironment Summary:');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${process.env.PORT}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? 'SET' : 'MISSING'}`);
console.log(`KOTAK_API_BASE_URL: ${process.env.KOTAK_API_BASE_URL}`);

if (allVarsPresent) {
  console.log('\n🎉 All required environment variables are present!');
  console.log('You can start the application with: npm run dev');
} else {
  console.log('\n❌ Some required environment variables are missing or contain placeholder values.');
  console.log('Please update your backend/.env file with actual values.');
  console.log('Refer to backend/env.example for the required variables.');
}

// Test if we can connect to Supabase (if credentials are set)
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && 
    !process.env.SUPABASE_URL.includes('your_') && 
    !process.env.SUPABASE_ANON_KEY.includes('your_')) {
  console.log('\nTesting Supabase connection...');
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    console.log('✅ Supabase client created successfully');
  } catch (error) {
    console.log('❌ Error creating Supabase client:', error.message);
  }
}
