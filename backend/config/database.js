const { createClient } = require('@supabase/supabase-js');

let _supabase = null;

const getSupabase = () => {
  if (_supabase) return _supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return _supabase;
};

module.exports = getSupabase();
