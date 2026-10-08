import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import api from '../lib/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    garage_name: '',
    full_name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/auth/register', { ...form, role: 'garage' });
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) throw new Error(error.message);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = 'w-full rounded border border-slate-300 p-2';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3 rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-blue-600">Đăng ký Gara</h1>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        <input placeholder="Tên gara" value={form.garage_name} onChange={update('garage_name')} required className={inputClass} />
        <input placeholder="Tên chủ gara" value={form.full_name} onChange={update('full_name')} className={inputClass} />
        <input placeholder="Số điện thoại" value={form.phone} onChange={update('phone')} className={inputClass} />
        <input type="email" placeholder="Email" value={form.email} onChange={update('email')} required className={inputClass} />
        <input type="password" placeholder="Mật khẩu (tối thiểu 6 ký tự)" value={form.password} onChange={update('password')} required className={inputClass} />
        <button
          disabled={submitting}
          className="w-full rounded bg-blue-600 p-2 font-semibold text-white disabled:opacity-50"
        >
          {submitting ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
        <p className="text-center text-sm text-slate-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 underline">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}
