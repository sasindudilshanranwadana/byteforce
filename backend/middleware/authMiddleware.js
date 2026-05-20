const { createClient } = require('@supabase/supabase-js');

const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const supabase = getSupabase();
    if (!supabase) return res.status(500).json({ message: 'Server configuration error.' });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ message: 'Not authorised. Invalid token.' });

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, email, role')
      .eq('id', user.id)
      .single();

    req.user = profile || { id: user.id, email: user.email, role: 'backer' };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorised. Invalid token.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Access denied. Admins only.' });
};

module.exports = { protect, adminOnly };
