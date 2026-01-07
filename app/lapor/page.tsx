"use client";
import { useState, useRef, ChangeEvent } from 'react';

// --- 1. ENUMS ---
enum Category {
  Elektrik = "Elektrik",
  Bangunan = "Bangunan",
  Perabot = "Perabot",
  Kebersihan = "Kebersihan"
}

enum Level {
  Ground = "G",
  One = "1",
  Two = "2",
  Three = "3"
}

export default function Home() {
  // --- STATE ---
  const [level, setLevel] = useState<Level>(Level.Ground);
  const [category, setCategory] = useState<Category>(Category.Elektrik);
  const [subCategory, setSubCategory] = useState<string>('');
  const [customIssue, setCustomIssue] = useState('');
  const [name, setName] = useState('');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // --- DATA OPTIONS ---
  const problemTypes = {
    [Category.Elektrik]: ['Lampu Rosak/Kelip', 'Kipas Tidak Pusing', 'Soket Tidak Berfungsi', 'Aircond Panas/Boc', 'Lain-lain'],
    [Category.Bangunan]: ['Pintu/Tombol Rosak', 'Lantai Pecah/Jubin Cabut', 'Siling Bocor', 'Cermin Tingkap Pecah', 'Paip Bocor', 'Lain-lain'],
    [Category.Perabot]: ['Kerusi Patah', 'Meja Goyang/Rosak', 'Papan Putih Rosak', 'Rak Buku Rosak', 'Lain-lain'],
    [Category.Kebersihan]: ['Sampah Sarap', 'Lantai Basah/Licin', 'Bau Busuk', 'Tandas Kotor/Sumbat', 'Lain-lain']
  };

  // --- HANDLERS ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    // 1. Validation
    const finalIssue = subCategory === 'Lain-lain' ? customIssue : subCategory;

    if (!name) { alert("Sila isi Nama!"); return; }
    if (!finalIssue) { alert("Sila pilih Masalah!"); return; }
    if (!photoFile) { alert("Wajib ambil gambar bukti!"); return; }

    setLoading(true);

    try {
      // 2. Prepare Data for Python
      const formData = new FormData();
      formData.append('name', name);
      formData.append('level', level);
      formData.append('category', category);
      formData.append('issue', finalIssue);
      formData.append('photo', photoFile); // The actual file

   // 3. Send to Flask (Public Dev Tunnel URL)
      // REPLACE the URL below with YOUR specific Port 5000 link
      const response = await fetch('https://3t508rcp-5000.asse.devtunnels.ms/api/submit', { 
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Laporan Berjaya Dihantar ke Server Local!");

        // Reset Form
        setPhotoPreview(null);
        setPhotoFile(null);
        setName('');
        setSubCategory('');
        setCustomIssue('');
      } else {
        throw new Error(result.error || "Gagal menghantar");
      }

    } catch (error: any) {
      console.error("FULL ERROR:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const inputStyle = "w-full p-3 border rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans text-gray-900">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">Laporan Kerosakan SOC</h1>

        {/* NAMA */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-1">Nama Pelapor</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputStyle}
            placeholder="Contoh: Ali Bin Abu"
          />
        </div>

        {/* LEVEL */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-1">Aras / Tingkat</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as Level)}
            className={inputStyle}
          >
            {Object.values(Level).map((lvl) => (
              <option key={lvl} value={lvl} className="text-black">
                {lvl === 'G' ? 'Ground Floor' : `Level ${lvl}`}
              </option>
            ))}
          </select>
        </div>

        {/* CATEGORY */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-1">Kategori Masalah</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(Category).map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat as Category); setSubCategory(''); }}
                className={`p-2 rounded-lg text-sm font-bold transition shadow-sm ${category === cat
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* SUB-CATEGORY */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-1">Masalah Spesifik</label>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className={inputStyle}
          >
            <option value="" className="text-gray-400">-- Pilih Masalah --</option>
            {problemTypes[category].map((problem) => (
              <option key={problem} value={problem} className="text-black">{problem}</option>
            ))}
          </select>
        </div>

        {/* CUSTOM ISSUE */}
        {subCategory === 'Lain-lain' && (
          <div className="mb-4">
            <textarea
              value={customIssue}
              onChange={(e) => setCustomIssue(e.target.value)}
              className={inputStyle}
              placeholder="Nyatakan masalah anda..."
              rows={3}
            />
          </div>
        )}

        {/* CAMERA */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-1">Bukti Gambar</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-400 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition bg-gray-50"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="h-40 object-cover rounded-md shadow-sm" />
            ) : (
              <>
                <div className="text-4xl mb-2">📷</div>
                <span className="text-gray-600 font-medium text-sm">Tap untuk ambil gambar</span>
              </>
            )}
          </div>
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition transform active:scale-95 ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {loading ? 'Sedang Hantar...' : 'HANTAR LAPORAN 🚀'}
        </button>

      </div>
    </div>
  );
}