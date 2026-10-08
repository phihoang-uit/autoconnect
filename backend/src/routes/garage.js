import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

router.get('/garage/me', requireAuth, requireRole('garage'), async (req, res) => {
  const { data, error } = await supabase
    .from('garages')
    .select('*')
    .eq('owner_id', req.user.id)
    .single();
  if (error) return res.status(404).json({ error: 'Không tìm thấy gara' });
  res.json(data);
});

export default router;
