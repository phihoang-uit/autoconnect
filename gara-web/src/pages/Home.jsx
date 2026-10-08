import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { garage, profile } = useAuth();

  return (
    <div className="max-w-xl space-y-3 rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold text-blue-600">Gara home</h1>
      <p>Tên gara: <b>{garage?.name}</b></p>
      <p>Email: {profile?.email}</p>
      <p>Vai trò: {profile?.role}</p>
    </div>
  );
}
