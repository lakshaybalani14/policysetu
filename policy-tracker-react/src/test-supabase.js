// TEST FILE - Delete after testing
// Run this in browser console to test Supabase connection

import { supabase, policyHelpers } from './services/supabase';

// Test 1: Check Supabase connection
console.log('Supabase client:', supabase);

// Test 2: Fetch policies directly
const testFetch = async () => {
    console.log('Testing policy fetch...');

    // Direct query
    const { data: directData, error: directError } = await supabase
        .from('policies')
        .select('*');

    console.log('Direct query result:', { data: directData, error: directError });

    // Using helper
    const { data: helperData, error: helperError } = await policyHelpers.getAll();
    console.log('Helper query result:', { data: helperData, error: helperError });
};

testFetch();
