import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const guard = [requireAuth, requireRole('user')];

// Kiểm tra dữ liệu gửi lên. partial = true khi cập nhật một phần (PATCH)
function parseVehicle(body, userId, { partial = false } = {}) {
  const out = {};

  if (!partial || body.name !== undefined) {
    const name = String(body.name ?? '').trim();
    if (!name) return { error: 'Tên xe là bắt buộc' };
    if (name.length > 60) return { error: 'Tên xe tối đa 60 ký tự' };
    out.name = name;
  }

  const textFields = [
    ['brand', 'Hãng xe'],
    ['model', 'Dòng xe'],
    ['plate_number', 'Biển số'],
  ];
  for (const [field, label] of textFields) {
    if (body[field] !== undefined) {
      const v = String(body[field] ?? '').trim();
      if (v.length > 40) return { error: `${label} tối đa 40 ký tự` };
      out[field] = v || null;
    }
  }
  if (out.plate_number) out.plate_number = out.plate_number.toUpperCase();

  if (body.year !== undefined) {
    if (body.year === null || body.year === '') {
      out.year = null;
    } else {
      const y = Number(body.year);
      const max = new Date().getFullYear() + 1;
      if (!Number.isInteger(y) || y < 1950 || y > max) {
        return { error: `Năm sản xuất phải từ 1950 đến ${max}` };
      }
      out.year = y;
    }
  }

  if (body.odometer !== undefined) {
    if (body.odometer === null || body.odometer === '') {
      out.odometer = 0;
    } else {
      const km = Number(body.odometer);
      if (!Number.isInteger(km) || km < 0 || km > 5000000) {
        return { error: 'Số km phải là số nguyên từ 0 trở lên' };
      }
      out.odometer = km;
    }
  }

  if (body.image_url !== undefined) {
    if (body.image_url === null || body.image_url === '') {
      out.image_url = null;
    } else {
      const prefix = `${process.env.SUPABASE_URL}/storage/v1/object/public/vehicle-images/${userId}/`;
      if (typeof body.image_url !== 'string' || !body.image_url.startsWith(prefix)) {
        return { error: 'Ảnh không hợp lệ' };
      }
      out.image_url = body.image_url;
    }
  }

  return { value: out };
}

// Danh sách xe của mình
router.get('/vehicles', guard, async (req, res) => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('owner_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Chi tiết một xe
router.get('/vehicles/:id', guard, async (req, res) => {
  if (!UUID_RE.test(req.params.id)) {
    return res.status(404).json({ error: 'Không tìm thấy xe' });
  }
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', req.params.id)
    .eq('owner_id', req.user.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Không tìm thấy xe' });
  res.json(data);
});

// Thêm xe
router.post('/vehicles', guard, async (req, res) => {
  const parsed = parseVehicle(req.body, req.user.id);
  if (parsed.error) return res.status(400).json({ error: parsed.error });

  const { data, error } = await supabase
    .from('vehicles')
    .insert({ ...parsed.value, owner_id: req.user.id })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Sửa xe
router.patch('/vehicles/:id', guard, async (req, res) => {
  if (!UUID_RE.test(req.params.id)) {
    return res.status(404).json({ error: 'Không tìm thấy xe' });
  }
  const parsed = parseVehicle(req.body, req.user.id, { partial: true });
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  if (Object.keys(parsed.value).length === 0) {
    return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
  }

  const { data, error } = await supabase
    .from('vehicles')
    .update(parsed.value)
    .eq('id', req.params.id)
    .eq('owner_id', req.user.id)
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Không tìm thấy xe' });
  res.json(data);
});

// Xóa xe
router.delete('/vehicles/:id', guard, async (req, res) => {
  if (!UUID_RE.test(req.params.id)) {
    return res.status(404).json({ error: 'Không tìm thấy xe' });
  }
  const { data, error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', req.params.id)
    .eq('owner_id', req.user.id)
    .select('id');
  if (error) {
    if (error.code === '23503') {
      return res.status(409).json({ error: 'Xe đã có lịch sử sửa chữa, không thể xóa.' });
    }
    return res.status(500).json({ error: error.message });
  }
  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Không tìm thấy xe' });
  }
  res.json({ deleted: true });
});

export default router;
