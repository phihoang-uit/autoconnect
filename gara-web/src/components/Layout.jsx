import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `block rounded px-3 py-2 ${
    isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-200'
  }`;

export default function Layout() {
  const { garage, signOut } = useAuth();

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-56 shrink-0 bg-white p-4 shadow flex flex-col gap-1">
        <div className="mb-4">
          <p className="text-xs uppercase text-slate-400">Gara</p>
          <p className="font-bold text-blue-600">{garage?.name}</p>
        </div>
        <NavLink to="/" end className={linkClass}>Trang chủ</NavLink>
        <NavLink to="/services" className={linkClass}>Dịch vụ</NavLink>
        <button
          onClick={signOut}
          className="mt-auto rounded bg-slate-800 px-3 py-2 text-white"
        >
          Đăng xuất
        </button>
      </aside>
      <main className="flex-1 p-6 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
