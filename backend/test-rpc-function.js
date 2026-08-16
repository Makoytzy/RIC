// Test if RPC functions work
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

console.log('\n=== Testing RPC Functions ===\n');
console.log('Supabase URL:', process.env.SUPABASE_URL);

async function testRPC() {
  console.log('1. Testing verify_employee_code RPC function...');
  console.log('   Code: EMP-10001');
  
  try {
    const { data, error } = await supabase.rpc('verify_employee_code', { 
      code: 'EMP-10001' 
    });
    
    if (error) {
      console.error('   ❌ RPC Error:', error.message);
      console.error('   Error code:', error.code);
      console.error('   Error details:', error);
      return false;
    }
    
    console.log('   ✅ RPC call successful!');
    console.log('   Data:', JSON.stringify(data, null, 2));
    
    if (data && data.length > 0) {
      console.log('\n   Employee Details:');
      console.log('   - Code:', data[0].employee_code);
      console.log('   - Name:', data[0].full_name);
      console.log('   - Email:', data[0].email);
      console.log('   - Position:', data[0].employee_position);
      console.log('   - Department:', data[0].department);
      
      console.log('\n✅ SUCCESS! RPC function works!');
      console.log('✅ The backend API should work now!');
      return true;
    } else {
      console.log('   ⚠️  RPC returned empty result');
      console.log('   Code may be already used or invalid');
      return true; // Function works, just no results
    }
  } catch (error) {
    console.error('   ❌ Exception:', error.message);
    return false;
  }
}

async function run() {
  const works = await testRPC();
  
  if (works) {
    console.log('\n=================================');
    console.log('✅ RPC FUNCTIONS ARE WORKING!');
    console.log('=================================');
    console.log('\nYour backend is ready!');
    console.log('\nNext steps:');
    console.log('1. Make sure backend is running: npm run dev');
    console.log('2. Go to frontend: http://localhost:5173');
    console.log('3. Click "Sign Up"');
    console.log('4. Enter code: EMP-10001');
    console.log('5. Click "Verify"');
    console.log('6. Create your account!');
    console.log('=================================\n');
  } else {
    console.log('\n=================================');
    console.log('❌ RPC FUNCTIONS NOT WORKING');
    console.log('=================================');
    console.log('\nThe SQL functions were not created properly.');
    console.log('Please re-run 006.sql in Supabase SQL Editor.');
    console.log('=================================\n');
  }
  
  process.exit(works ? 0 : 1);
}

run();
