import { supabase } from '../config/supabase.js';

export const requireRole = (role) => async (req, res, next) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (!data || data.role !== role) {
    return res.status(403).json({ error: 'Không có quyền truy cập' });
  }
  req.profile = data;
  next();
};
