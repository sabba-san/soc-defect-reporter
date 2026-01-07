"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Interface matching your JSON data
interface Report {
  id: string;
  category: string;
  issue: string;
  status: string;
  date: string;
  level: string;
  image_url: string;
}

export default function LandingPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch from Python Backend
  useEffect(() => {
    fetch('http://localhost:5000/api/reports') 
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Backend Error:", err);
        setLoading(false);
      });
  }, []);

  // Helper for badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Baru': return 'bg-red-100 text-red-700 border-red-200';
      case 'Dalam Tindakan': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Selesai': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">SOC <span className="text-blue-600">Reporter</span></span>
        </div>
        <Link href="/admin">
          <button className="text-sm font-medium text-gray-500 hover:text-blue-600 transition">Admin Login</button>
        </Link>
      </nav>

      {/* HERO SECTION */}
      <header className="pt-32 pb-16 px-6 text-center bg-white">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Pantau & Lapor <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Kerosakan SOC</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Sistem aduan berpusat untuk fasiliti yang lebih baik. Lihat status aduan terkini atau buat laporan baru.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Link to the form page (Make sure you created app/lapor/page.tsx) */}
          <Link href="/lapor">
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg transition transform hover:-translate-y-1">
              + Buat Aduan Baru
            </button>
          </Link>
          <a href="#status-feed">
            <button className="px-8 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full font-bold transition">
              Semak Status
            </button>
          </a>
        </div>
      </header>

      {/* STATUS FEED SECTION */}
      <section id="status-feed" className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">📋 Status Aduan Terkini</h2>
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
               </span>
               Live Data
            </div>
          </div>

          {loading ? (
             <p className="text-center text-gray-500 py-10">Sedang memuatkan data dari server...</p>
          ) : reports.length === 0 ? (
             <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                <p className="text-gray-500">Tiada rekod aduan dijumpai.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col">
                  
                  {/* Status & Level Header */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Aras {item.level}
                    </span>
                  </div>

                  {/* Image Thumbnail (Optional) */}
                  {item.image_url && (
                    <div className="w-full h-32 mb-4 relative rounded-lg overflow-hidden bg-gray-100">
                       <img 
                         src={item.image_url} 
                         alt="Bukti" 
                         className="object-cover w-full h-full"
                         onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if broken
                       />
                    </div>
                  )}
                  
                  {/* Issue Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{item.issue}</h3>
                    <p className="text-sm text-gray-500 mb-4 capitalize">{item.category}</p>
                  </div>

                  {/* Footer Date */}
                  <div className="border-t border-gray-100 pt-3 mt-auto flex justify-between items-center text-xs text-gray-400">
                     <span>ID: #{item.id.substring(0,6)}...</span>
                     <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center mt-auto">
        <p className="text-gray-500 text-sm">© 2026 SOC Defect Reporter. All Rights Reserved.</p>
      </footer>

    </div>
  );
}