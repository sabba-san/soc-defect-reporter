"use client";
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- CONFIGURATION ---
// Ensure this matches the IP in your Landing Page!
const API_IP = "172.20.10.3"; 
const API_URL = `http://${API_IP}:5000`;

export default function LaporPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [issue, setIssue] = useState('');
  const [category, setCategory] = useState('Elektrik'); // Default
  const [level, setLevel] = useState('G'); // Default
  const [file, setFile] = useState<File | null>(null);

  // Handle File Selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Prepare Data to send
    const formData = new FormData();
    formData.append('issue', issue);
    formData.append('category', category);
    formData.append('level', level);
    formData.append('status', 'Baru'); // Default status
    
    // IMPORTANT: Make sure your Python backend expects 'image' as the key
    if (file) {
      formData.append('image', file);
    }

    try {
      // 2. Send to the 172.x.x.x IP (Not Localhost!)
      const res = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        body: formData, // Do NOT set Content-Type header manually when using FormData
      });

      if (res.ok) {
        alert("Aduan berjaya dihantar!");
        router.push('/'); // Go back to home
      } else {
        alert("Gagal menghantar aduan. Sila cuba lagi.");
        console.error("Server Error:", await res.text());
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Ralat rangkaian! Pastikan anda sambung ke Hotspot yang sama.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6">
      
      <div className="max-w-md w-full mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">📝 Lapor Kerosakan</h1>
          <p className="text-gray-500 text-sm mt-2">Isi butiran di bawah untuk tindakan segera.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Issue Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Masalah / Isu</label>
            <input 
              required
              type="text" 
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Contoh: Soket terbakar / Paip bocor"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Category Dropdown */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="Elektrik">Elektrik</option>
                <option value="Sivil">Sivil (Paip/Dinding)</option>
                <option value="Perabot">Perabot</option>
                <option value="Lain-lain">Lain-lain</option>
              </select>
            </div>

            {/* Level Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aras / Lokasi</label>
              <select 
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="G">Aras G</option>
                <option value="1">Aras 1</option>
                <option value="2">Aras 2</option>
                <option value="3">Aras 3</option>
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Bukti</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition cursor-pointer relative">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Muat naik gambar</span>
                    <input type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                {file && <p className="text-sm text-green-600 font-bold mt-2">File dipilih: {file.name}</p>}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Sedang Menghantar...' : 'Hantar Laporan'}
          </button>

          {/* Cancel Button */}
          <Link href="/">
             <button type="button" className="w-full mt-3 py-3 text-sm text-gray-500 hover:text-gray-700 font-medium">
               Batal / Kembali
             </button>
          </Link>

        </form>
      </div>
    </div>
  );
}