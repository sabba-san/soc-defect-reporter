"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // --- HARDCODED CREDENTIALS ---
    if (username === 'admin' && password === '1234') {
      router.push('/admin');
    } else if (username === 'jpp' && password === '1234') {
      router.push('/jpp'); 
    } else if (username === 'cleaner' && password === '1234') {
      router.push('/cleaner'); 
    } else {
      setError('Username atau Kata Laluan salah!');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        
        {/* Header Area */}
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-16 h-16 bg-white rounded-xl mx-auto flex items-center justify-center text-blue-600 text-3xl font-bold mb-4 shadow-sm">
            S
          </div>
          <h2 className="text-2xl font-bold text-white">SOC Reporter</h2>
          <p className="text-blue-100 text-sm mt-1">Sistem Log Masuk Staf</p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200 text-center font-bold">
                {error}
              </div>
            )}

            <div>
              {/* UPDATED: text-gray-900 (Black) and slightly larger text */}
              <label className="block text-base font-bold text-gray-900 mb-2">
                ID Pengguna
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                // UPDATED: Added text-gray-900 and placeholder-gray-500 for better visibility
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 placeholder-gray-500 font-medium"
                placeholder="Contoh: admin"
                required
              />
            </div>

            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">
                Kata Laluan
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 placeholder-gray-500 font-medium"
                placeholder="••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-bold text-lg shadow-md transition transform active:scale-95 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Sedang Semak...' : 'Log Masuk'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-6">
            <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 font-medium transition">
              ← Kembali ke Halaman Utama
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}