"use client";
import { useState, useEffect } from 'react';

// --- CONFIGURATION ---
// Change this ONE line if your Hotspot IP changes!
const API_IP = "172.20.10.3"; 
const API_BASE = `http://${API_IP}:5000`;

interface Log {
  user: string;
  note: string;
}

interface Report {
  id: string;
  category: string;
  issue: string;
  status: string;
  level: string;
  name: string;
  date: string;
  image_url: string;
  logs?: Log[];
}

export default function Admin_Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, completed: 0 });

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reports`);
      const data = await res.json();
      
      // Sort by date (Newest first)
      const sortedData = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setReports(sortedData);
      calculateStats(sortedData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Report[]) => {
    const total = data.length;
    const completed = data.filter((r) => r.status === 'Selesai').length;
    const active = data.filter((r) => r.status === 'Dalam Tindakan').length;
    // Pending is anything that is NOT completed and NOT active
    const pending = total - completed - active;
    
    setStats({ total, completed, active, pending });
  };

  useEffect(() => { fetchReports(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ Adakah anda pasti mahu memadam laporan ini secara kekal?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/delete_report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        alert("🗑 Laporan telah dipadam.");
        fetchReports(); // Refresh list
      } else {
        alert("Gagal memadam.");
      }
    } catch (error) { 
      alert("Error contacting server."); 
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-bold">
      Loading Admin Command Center...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6 font-sans text-gray-100">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-700 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">🛡️ Admin Command Center</h1>
            <p className="text-gray-400 text-sm mt-1">Pantau & Urus semua aduan SOC (JPP & Kebersihan)</p>
          </div>
          <button 
            onClick={fetchReports} 
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-bold transition shadow-lg flex items-center gap-2"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Jumlah Aduan</h3>
            <p className="text-4xl font-extrabold text-white mt-2">{stats.total}</p>
          </div>
          <div className="bg-gray-800 p-5 rounded-xl border border-red-900/50 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-16 h-16 bg-red-500/10 rounded-bl-full"></div>
            <h3 className="text-red-400 text-xs font-bold uppercase tracking-wider">Pending (Baru)</h3>
            <p className="text-4xl font-extrabold text-red-400 mt-2">{stats.pending}</p>
          </div>
          <div className="bg-gray-800 p-5 rounded-xl border border-yellow-900/50 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-16 h-16 bg-yellow-500/10 rounded-bl-full"></div>
            <h3 className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Sedang Dibaiki</h3>
            <p className="text-4xl font-extrabold text-yellow-400 mt-2">{stats.active}</p>
          </div>
          <div className="bg-gray-800 p-5 rounded-xl border border-green-900/50 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-16 h-16 bg-green-500/10 rounded-bl-full"></div>
            <h3 className="text-green-400 text-xs font-bold uppercase tracking-wider">Selesai</h3>
            <p className="text-4xl font-extrabold text-green-400 mt-2">{stats.completed}</p>
          </div>
        </div>

        {/* MASTER LIST */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-300 mb-4 flex items-center gap-2">
            📜 Senarai Semua Aduan
          </h2>
          
          {reports.length === 0 && (
            <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700 border-dashed">
              <p className="text-gray-500">Tiada data dalam sistem.</p>
            </div>
          )}

          {reports.map((report) => (
            <div key={report.id} className="bg-gray-800 rounded-xl p-5 flex flex-col lg:flex-row gap-6 hover:bg-gray-750 transition border border-gray-700 shadow-md">
              
              {/* Left Side: Image & Info */}
              <div className="flex gap-5 w-full lg:w-1/2">
                {/* IMAGE FIX APPLIED HERE */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-900 rounded-lg overflow-hidden border border-gray-600">
                  <img 
                    src={report.image_url.replace('localhost', API_IP)} 
                    className="w-full h-full object-cover" 
                    alt="Defect"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
                
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded ${
                      report.category === 'Kebersihan' ? 'bg-green-900 text-green-300 border border-green-800' : 'bg-blue-900 text-blue-300 border border-blue-800'
                    }`}>
                      {report.category}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded border ${
                      report.status === 'Selesai' ? 'border-green-500 text-green-500 bg-green-500/10' : 
                      report.status === 'Dalam Tindakan' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 'border-red-500 text-red-500 bg-red-500/10'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">{report.issue}</h3>
                  <div className="mt-2 text-sm text-gray-400 space-y-1">
                     <p>📍 Lokasi: <span className="text-gray-300">Aras {report.level}</span></p>
                     <p>👤 Lapor: <span className="text-gray-300">{report.name}</span></p>
                     <p>📅 Tarikh: <span className="text-gray-500 text-xs">{new Date(report.date).toLocaleString()}</span></p>
                  </div>
                </div>
              </div>

              {/* Middle: Action Logs */}
              <div className="flex-1 bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 text-sm">
                <p className="text-gray-500 font-bold mb-3 text-[10px] uppercase tracking-widest">Log Tindakan (Audit Trail):</p>
                {(!report.logs || report.logs.length === 0) ? (
                    <p className="text-gray-600 italic text-xs">Belum ada tindakan diambil oleh staf.</p>
                ) : (
                    <div className="space-y-3 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                        {report.logs.map((log: any, idx: number) => (
                            <div key={idx} className="flex flex-col text-gray-300 border-l-2 border-gray-600 pl-3">
                                <span className="text-blue-400 font-bold text-xs">{log.user}</span>
                                <span className="text-gray-300 text-xs mt-0.5">{log.note}</span>
                            </div>
                        ))}
                    </div>
                )}
              </div>

              {/* Right: Admin Actions */}
              <div className="flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-gray-700 pt-4 lg:pt-0 lg:pl-6">
                 <button 
                    onClick={() => handleDelete(report.id)}
                    className="group flex items-center justify-center gap-2 text-red-400 hover:text-white hover:bg-red-600 px-4 py-3 rounded-lg transition duration-200 text-sm font-bold w-full lg:w-auto"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Padam Laporan
                 </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}