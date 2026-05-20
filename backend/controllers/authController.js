const { createClient } = require('@supabase/supabase-js');
const { validationResult } = require('express-validator');

const getSupabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { name, role: role || 'backer' },
    });
    if (error) return res.status(409).json({ message: error.message });

    res.status(201).json({ message: 'Account created. Please log in.', user: { id: data.user.id, email } });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ message: 'Invalid email or password.' });

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    res.json({ token: data.session.access_token, user: profile || { id: data.user.id, email } });
  } catch (err) { next(err); }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const { data: profile, error } = await supabase
      .from('profiles').select('*').eq('id', req.user.id).single();
    if (error || !profile) return res.status(404).json({ message: 'User not found.' });
    res.json(profile);
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe };
