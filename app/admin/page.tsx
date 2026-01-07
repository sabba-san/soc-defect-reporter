"use client";
import { useState, useEffect } from 'react';

const API_BASE = "http://localhost:5000"; 

export default function Admin_Dashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, completed: 0 });

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reports`);
      const data = await res.json();
      setReports(data);
      calculateStats(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    const total = data.length;
    const completed = data.filter((r) => r.status === 'Selesai').length;
    const active = data.filter((r) => r.status === 'Dalam Tindakan').length;
    const pending = total - completed - active;
    setStats({ total, completed, active, pending });
  };

  useEffect(() => { fetchReports(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ Adakah anda pasti mahu memadam laporan ini?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/delete_report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        alert("Laporan telah dipadam.");
        fetchReports();
      }
    } catch (error) { alert("Gagal memadam."); }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-6 font-sans text-gray-100">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">🛡️ Admin Command Center</h1>
            <p className="text-gray-400">Pantau semua aduan SOC (JPP & Kebersihan)</p>
          </div>
          <button onClick={fetchReports} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-bold transition">
            🔄 Refresh Data
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
            <h3 className="text-gray-400 text-sm uppercase">Jumlah Aduan</h3>
            <p className="text-4xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800 p-5 rounded-xl border border-red-900/50">
            <h3 className="text-red-400 text-sm uppercase">Baru / Pending</h3>
            <p className="text-4xl font-bold text-red-400">{stats.pending}</p>
          </div>
          <div className="bg-gray-800 p-5 rounded-xl border border-yellow-900/50">
            <h3 className="text-yellow-400 text-sm uppercase">Dalam Tindakan</h3>
            <p className="text-4xl font-bold text-yellow-400">{stats.active}</p>
          </div>
          <div className="bg-gray-800 p-5 rounded-xl border border-green-900/50">
            <h3 className="text-green-400 text-sm uppercase">Selesai</h3>
            <p className="text-4xl font-bold text-green-400">{stats.completed}</p>
          </div>
        </div>

        {/* MASTER LIST */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-300 mb-4">📜 Senarai Semua Aduan</h2>
          
          {reports.length === 0 && <p className="text-center text-gray-600">Tiada data dalam sistem.</p>}

          {reports.map((report) => (
            <div key={report.id} className="bg-gray-800 rounded-lg p-6 flex flex-col md:flex-row gap-6 hover:bg-gray-750 transition border border-gray-700">
              
              {/* Image & Basic Info */}
              <div className="flex gap-4 w-full md:w-1/2">
                <img src={report.image_url} className="w-24 h-24 object-cover rounded bg-gray-900" alt="Defect" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                      report.category === 'Kebersihan' ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'
                    }`}>
                      {report.category}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded border ${
                      report.status === 'Selesai' ? 'border-green-500 text-green-500' : 
                      report.status === 'Dalam Tindakan' ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{report.issue}</h3>
                  <p className="text-gray-400 text-sm">📍 {report.level} • 👤 {report.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{new Date(report.date).toLocaleString()}</p>
                </div>
              </div>

              {/* Action Logs (What happened?) */}
              <div className="flex-1 bg-gray-900/50 p-4 rounded border border-gray-700 text-sm">
                <p className="text-gray-400 font-bold mb-2 text-xs uppercase">Log Tindakan:</p>
                {(!report.logs || report.logs.length === 0) ? (
                    <p className="text-gray-600 italic">Belum ada tindakan diambil.</p>
                ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {report.logs.map((log: any, idx: number) => (
                            <div key={idx} className="flex gap-2 text-gray-300">
                                <span className="text-blue-400 font-bold">{log.user}:</span>
                                <span>{log.note}</span>
                            </div>
                        ))}
                    </div>
                )}
              </div>

              {/* Admin Actions */}
              <div className="flex flex-col justify-center border-l border-gray-700 pl-4">
                 <button 
                    onClick={() => handleDelete(report.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/30 px-3 py-2 rounded transition flex items-center gap-2 text-sm font-bold"
                 >
                    🗑 Padam
                 </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}