import { useEffect, useState } from 'react';
import api from '../lib/api';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  duration_minutes: '',
  is_active: true,
};

const formatPrice = (n) => `${Number(n).toLocaleString('vi-VN')} đ`;

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null = đóng, { id } = sửa, {} = thêm mới
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setError('');
    try {
      const { data } = await api.get('/garage/services');
      setServices(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm(emptyForm);
    setFormError('');
    setModal({});
  }

  function openEdit(s) {
    setForm({
      name: s.name,
      description: s.description ?? '',
      price: String(s.price),
      duration_minutes: s.duration_minutes ? String(s.duration_minutes) : '',
      is_active: s.is_active,
    });
    setFormError('');
    setModal({ id: s.id });
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: form.price,
      duration_minutes: form.duration_minutes === '' ? null : form.duration_minutes,
      is_active: form.is_active,
    };
    try {
      if (modal.id) await api.patch(`/garage/services/${modal.id}`, payload);
      else await api.post('/garage/services', payload);
      setModal(null);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Có lỗi xảy ra, thử lại sau');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(s) {
    try {
      await api.patch(`/garage/services/${s.id}`, { is_active: !s.is_active });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Không cập nhật được trạng thái');
    }
  }

  async function handleDelete(s) {
    if (!window.confirm(`Xóa dịch vụ "${s.name}"?`)) return;
    try {
      await api.delete(`/garage/services/${s.id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Không xóa được dịch vụ');
    }
  }

  const inputClass = 'w-full rounded border border-slate-300 p-2';

  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">Dịch vụ cung cấp</h1>
        <button
          onClick={openCreate}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white"
        >
          + Thêm dịch vụ
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-500">
            <tr>
              <th className="p-3">Tên dịch vụ</th>
              <th className="p-3">Giá</th>
              <th className="p-3">Thời gian</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="5" className="p-6 text-center text-slate-500">Đang tải...</td></tr>
            )}
            {!loading && services.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">
                  Chưa có dịch vụ nào. Bấm "Thêm dịch vụ" để bắt đầu.
                </td>
              </tr>
            )}
            {services.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="p-3">
                  <p className="font-semibold">{s.name}</p>
                  {s.description && <p className="text-xs text-slate-500">{s.description}</p>}
                </td>
                <td className="p-3">{formatPrice(s.price)}</td>
                <td className="p-3">{s.duration_minutes ? `${s.duration_minutes} phút` : '-'}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleActive(s)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      s.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {s.is_active ? 'Đang bán' : 'Tạm ẩn'}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(s)} className="mr-3 text-blue-600 underline">
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(s)} className="text-red-600 underline">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-3 rounded-xl bg-white p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-blue-600">
              {modal.id ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}
            </h2>
            {formError && (
              <p className="rounded bg-red-50 p-2 text-sm text-red-600">{formError}</p>
            )}
            <input
              placeholder="Tên dịch vụ"
              value={form.name}
              onChange={update('name')}
              required
              className={inputClass}
            />
            <textarea
              placeholder="Mô tả (không bắt buộc)"
              value={form.description}
              onChange={update('description')}
              rows="2"
              className={inputClass}
            />
            <input
              type="number"
              min="0"
              step="1000"
              placeholder="Giá (VNĐ)"
              value={form.price}
              onChange={update('price')}
              required
              className={inputClass}
            />
            <input
              type="number"
              min="1"
              placeholder="Thời gian thực hiện (phút, không bắt buộc)"
              value={form.duration_minutes}
              onChange={update('duration_minutes')}
              className={inputClass}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Đang bán (hiển thị cho khách)
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded border border-slate-300 px-4 py-2"
              >
                Hủy
              </button>
              <button
                disabled={saving}
                className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
