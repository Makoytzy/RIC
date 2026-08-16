/**
 * Direct SQL Query Execution via Supabase RPC
 * 
 * Workaround for PostgREST schema cache issues.
 * Uses a generic SQL execution function to bypass table cache.
 */

import { supabaseAdmin } from './supabase.js';

/**
 * Execute raw SQL query via custom RPC function
 * This bypasses PostgREST's table cache
 */
export async function executeSQL(sql, params = []) {
  try {
    // First, let's try using the SQL function we created
    const { data, error } = await supabaseAdmin.rpc('verify_employee_code', { 
      code: params[0] 
    });
    
    if (error) {
      console.error('RPC Error:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Direct query error:', error);
    throw error;
  }
}

/**
 * Query employee by code using the SQL function
 */
export async function queryEmployeeByCode(code) {
  try {
    const result = await executeSQL('verify_employee_code', [code]);
    
    if (!result || result.length === 0) {
      return null;
    }
    
    return result[0];
  } catch (error) {
    console.error('Error querying employee:', error);
    throw error;
  }
}

/**
 * Mark employee code as used
 */
export async function markEmployeeAsUsed(code, userId) {
  try {
    const { error } = await supabaseAdmin.rpc('mark_employee_code_used', {
      code: code,
      new_user_id: userId
    });
    
    if (error) {
      console.error('Error marking employee as used:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in markEmployeeAsUsed:', error);
    throw error;
  }
}

export default { executeSQL, queryEmployeeByCode, markEmployeeAsUsed };
