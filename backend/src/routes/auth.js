import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/auth/register', async (req, res) => {
  const { email, password, role, full_name, phone, garage_name } = req.body;

  if (!email || !password || !['user', 'garage'].includes(role)) {
    return res.status(400).json({ error: 'Thiếu email, mật khẩu hoặc role không hợp lệ' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }
  if (role === 'garage' && !garage_name?.trim()) {
    return res.status(400).json({ error: 'Cần nhập tên gara' });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) return res.status(400).json({ error: error.message });

  const userId = data.user.id;

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: userId, role, full_name, phone });
  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    return res.status(500).json({ error: profileError.message });
  }

  if (role === 'garage') {
    const { error: garageError } = await supabase
      .from('garages')
      .insert({ owner_id: userId, name: garage_name.trim(), phone });
    if (garageError) {
      await supabase.auth.admin.deleteUser(userId);
      return res.status(500).json({ error: garageError.message });
    }
  }

  res.status(201).json({ id: userId, role });
});

router.get('/me', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();
  if (error) return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
  res.json({ ...data, email: req.user.email });
});

export default router;
