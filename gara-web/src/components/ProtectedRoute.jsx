import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { session, profile, loading, signOut } = useAuth();

  if (loading) return <p className="p-8 text-slate-600">Đang tải...</p>;
  if (!session) return <Navigate to="/login" replace />;

  if (profile?.role !== 'garage') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-100">
        <p className="text-slate-700">
          Không tải được hồ sơ, hoặc tài khoản này không phải tài khoản gara.
        </p>
        <button onClick={signOut} className="rounded bg-blue-600 px-4 py-2 text-white">
          Đăng xuất
        </button>
      </div>
    );
  }

  return children;
}
