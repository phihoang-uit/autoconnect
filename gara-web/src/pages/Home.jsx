import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { garage, profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-xl space-y-3 rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-blue-600">Gara home</h1>
        <p>Tên gara: <b>{garage?.name}</b></p>
        <p>Email: {profile?.email}</p>
        <p>Vai trò: {profile?.role}</p>
        <button onClick={signOut} className="rounded bg-slate-800 px-4 py-2 text-white">
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
