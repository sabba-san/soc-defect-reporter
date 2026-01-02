'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { db, storage } from './firebase'; // Import your firebase setup
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Home() {
  // --- STATE ---
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [level, setLevel] = useState('G');
  const [category, setCategory] = useState('Kebersihan');
  const [subCategory, setSubCategory] = useState('');
  const [customIssue, setCustomIssue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- DATA OPTIONS ---
  const problemTypes = {
    Kebersihan: ['Sampah', 'Lantai Basah', 'Bau Busuk', 'Tandas Kotor', 'Lain-lain'],
    Kerosakan: ['Kerusi Patah', 'Meja Rosak', 'Pintu/Tombol', 'Cermin Pecah', 'Lain-lain'],
    Elektrik: ['Lampu Rosak', 'Aircond Panas', 'Soket Tidak Berfungsi', 'Lain-lain']
  };

  // --- HANDLERS ---
  const handleCameraClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // --- DEBUGGING VERSION OF SUBMIT ---
  const handleSubmit = async () => {
    // 1. Validation
    const finalIssue = subCategory === 'Lain-lain' ? customIssue : subCategory;
    if (!name || !finalIssue) {
      alert("Sila isi Nama dan Masalah!");
      return;
    }
    if (!photoFile) {
      alert("Wajib ambil gambar!");
      return;
    }

    setLoading(true);

    try {
      console.log("Step 1: Starting Image Upload...");
      
      // Create a unique name
      const imageName = `report_${Date.now()}.jpg`;
      const imageRef = ref(storage, `defects/${imageName}`);
      
      // Upload
      const snapshot = await uploadBytes(imageRef, photoFile);
      console.log("Step 2: Upload Complete!");

      // Get URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("Step 3: Got URL:", downloadURL);

      // Save to Firestore
      console.log("Step 4: Saving to Database...");
      await addDoc(collection(db, 'reports'), {
        name: name,
        level: level,
        category: category,
        issue: finalIssue,
        imageUrl: downloadURL,
        status: 'Baru',
        createdAt: serverTimestamp()
      });

      console.log("Step 5: Success!");
      alert("✅ Laporan Berjaya Dihantar!");

      // Reset form
      setPhotoPreview(null);
      setPhotoFile(null);
      setName('');
      setSubCategory('');
      setCustomIssue('');
      
    } catch (error: any) {
      // THIS WILL SHOW THE REAL ERROR ON YOUR PHONE SCREEN
      console.error("FULL ERROR:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gray-50 text-black">
      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-900">SOC Defect Report</h1>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Nama Pengadu</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-50 outline-none" placeholder="Ali Bin Abu" />
        </div>

        {/* Level */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Level</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full p-3 border rounded-lg bg-white">
            <option value="G">Ground Floor</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
          </select>
        </div>

        {/* Category */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="col-span-2"><label className="block text-sm font-semibold mb-1">Jenis Masalah</label></div>
          {Object.keys(problemTypes).map((type) => (
            <button key={type} onClick={() => { setCategory(type); setSubCategory(''); setCustomIssue(''); }}
              className={`p-2 rounded-lg text-sm font-medium transition ${category === type ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {type}
            </button>
          ))}
        </div>

        {/* Sub-Category */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-1">Perincian Masalah</label>
          <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full p-3 border rounded-lg bg-white mb-2">
            <option value="">-- Pilih Masalah --</option>
            {/* @ts-expect-error - Typescript ignore */}
            {problemTypes[category].map((item: string) => <option key={item} value={item}>{item}</option>)}
          </select>
          {subCategory === 'Lain-lain' && (
            <textarea value={customIssue} onChange={(e) => setCustomIssue(e.target.value)}
              placeholder="Sila tulis masalah..." className="w-full p-3 border border-blue-400 rounded-lg bg-blue-50 outline-none" rows={3} />
          )}
        </div>

        {/* Camera */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Bukti Gambar (Wajib)</label>
          <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          {photoPreview ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
              <Image src={photoPreview} alt="Preview" fill style={{ objectFit: 'cover' }} />
              <button onClick={() => {setPhotoPreview(null); setPhotoFile(null);}} className="absolute bottom-2 right-2 bg-red-600 text-white text-xs px-3 py-1 rounded">Padam</button>
            </div>
          ) : (
            <button onClick={handleCameraClick} className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50">
              <span className="text-2xl mb-1">📷</span><span className="text-sm">Tangkap Gambar</span>
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button onClick={handleSubmit} disabled={loading}
          className={`w-full text-white py-4 rounded-xl font-bold text-lg shadow-lg transition ${loading ? 'bg-gray-400' : 'bg-blue-900 hover:bg-blue-800'}`}>
          {loading ? 'Sedang Menghantar...' : 'Hantar Laporan'}
        </button>

      </div>
    </main>
  );
}