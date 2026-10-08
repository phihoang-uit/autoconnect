import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Lấy gara của người đang đăng nhập và gắn vào req.garageId
async function attachGarage(req, res, next) {
  const { data, error } = await supabase
    .from('garages')
    .select('id')
    .eq('owner_id', req.user.id)
    .single();
  if (error || !data) return res.status(404).json({ error: 'Không tìm thấy gara' });
  req.garageId = data.id;
  next();
}

// Kiểm tra dữ liệu gửi lên. partial = true khi cập nhật một phần (PATCH)
function parseService(body, { partial = false } = {}) {
  const out = {};

  if (!partial || body.name !== undefined) {
    const name = String(body.name ?? '').trim();
    if (!name) return { error: 'Tên dịch vụ là bắt buộc' };
    if (name.length > 100) return { error: 'Tên dịch vụ tối đa 100 ký tự' };
    out.name = name;
  }

  if (!partial || body.price !== undefined) {
    const raw = body.price;
    const price = Number(raw);
    if (raw === undefined || raw === null || raw === '' || !Number.isFinite(price) || price < 0) {
      return { error: 'Giá phải là số lớn hơn hoặc bằng 0' };
    }
    out.price = price;
  }

  if (body.description !== undefined) {
    out.description = String(body.description ?? '').trim() || null;
  }

  if (body.duration_minutes !== undefined) {
    if (body.duration_minutes === null || body.duration_minutes === '') {
      out.duration_minutes = null;
    } else {
      const d = Number(body.duration_minutes);
      if (!Number.isInteger(d) || d <= 0) {
        return { error: 'Thời gian phải là số nguyên dương (phút)' };
      }
      out.duration_minutes = d;
    }
  }

  if (body.is_active !== undefined) out.is_active = Boolean(body.is_active);

  return { value: out };
}

const guard = [requireAuth, requireRole('garage'), attachGarage];

// Xem danh sách dịch vụ của gara mình
router.get('/garage/services', guard, async (req, res) => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('garage_id', req.garageId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Thêm dịch vụ
router.post('/garage/services', guard, async (req, res) => {
  const parsed = parseService(req.body);
  if (parsed.error) return res.status(400).json({ error: parsed.error });

  const { data, error } = await supabase
    .from('services')
    .insert({ ...parsed.value, garage_id: req.garageId })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Sửa dịch vụ (chỉ dịch vụ thuộc gara mình)
router.patch('/garage/services/:id', guard, async (req, res) => {
  if (!UUID_RE.test(req.params.id)) {
    return res.status(404).json({ error: 'Không tìm thấy dịch vụ' });
  }
  const parsed = parseService(req.body, { partial: true });
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  if (Object.keys(parsed.value).length === 0) {
    return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
  }

  const { data, error } = await supabase
    .from('services')
    .update(parsed.value)
    .eq('id', req.params.id)
    .eq('garage_id', req.garageId)
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Không tìm thấy dịch vụ' });
  res.json(data);
});

// Xóa dịch vụ (chỉ dịch vụ thuộc gara mình)
router.delete('/garage/services/:id', guard, async (req, res) => {
  if (!UUID_RE.test(req.params.id)) {
    return res.status(404).json({ error: 'Không tìm thấy dịch vụ' });
  }

  const { data, error } = await supabase
    .from('services')
    .delete()
    .eq('id', req.params.id)
    .eq('garage_id', req.garageId)
    .select('id');
  if (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        error: 'Dịch vụ đã có trong đơn hàng, không thể xóa. Hãy chuyển sang trạng thái tạm ẩn.',
      });
    }
    return res.status(500).json({ error: error.message });
  }
  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Không tìm thấy dịch vụ' });
  }
  res.json({ deleted: true });
});

export default router;
