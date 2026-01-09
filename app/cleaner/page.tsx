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
  image_url: string;
  logs?: Log[];
}

export default function Cleaner_Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🔒 Hardcoded Role for this Dashboard
  const ROLE = "Pembersih"; 

  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [remarkInput, setRemarkInput] = useState("");

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reports`);
      const data = await res.json();
      
      // ✨ FILTER: Only show 'Kebersihan' tasks
      // This ensures Cleaners don't see Electrical/Furniture issues
      const cleanerTasks = data.filter((r: Report) => r.category === "Kebersihan");
      setReports(cleanerTasks);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleUpdate = async (id: string, newStatus: string) => {
    if (!remarkInput.trim()) { 
      alert("Sila tulis nota tindakan!"); 
      return; 
    }

    try {
      const res = await fetch(`${API_BASE}/api/update_report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          status: newStatus, 
          remark: remarkInput, 
          role: ROLE 
        })
      });

      if (res.ok) {
        alert("✅ Laporan Dikemaskini!");
        setRemarkInput("");
        setActiveReportId(null);
        fetchReports(); // Refresh data
      }
    } catch (error) { 
      alert("Error updating report"); 
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 text-green-700 font-bold">
      Loading Cleaning Tasks...
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50 p-4 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border-l-8 border-green-500 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-900">🧹 Dashboard Pembersih</h1>
            <p className="text-sm text-gray-500">Senarai tugas kebersihan (Sampah, Tandas, Lantai)</p>
          </div>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold shadow-sm">
            {reports.length} Tugasan
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-6">
          {reports.length === 0 && (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed border-green-300">
               <p className="text-gray-400">Tiada tugasan kebersihan buat masa ini 🎉</p>
             </div>
          )}
          
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="p-6 flex flex-col md:flex-row gap-6">
                
                {/* IMAGE FIX APPLIED HERE */}
                <div className="w-full md:w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={report.image_url.replace('localhost', API_IP)} 
                    alt="Defect" 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-1">{report.issue}</h2>
                      <p className="text-gray-600 text-sm">📍 Lokasi: <span className="font-bold">Aras {report.level}</span></p>
                      <p className="text-gray-400 text-xs mt-1">Lapor oleh: {report.name}</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      report.status === 'Selesai' ? 'bg-green-100 text-green-700 border-green-200' : 
                      report.status === 'Dalam Tindakan' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  
                  <div className="mt-4 border-t pt-3">
                    <button 
                      onClick={() => setActiveReportId(activeReportId === report.id ? null : report.id)} 
                      className="text-green-600 font-bold hover:text-green-800 hover:underline text-sm transition"
                    >
                      {activeReportId === report.id ? "Tutup Panel" : "📝 Tindak Balas / Update"}
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTION AREA */}
              {activeReportId === report.id && (
                <div className="bg-gray-50 p-6 border-t border-gray-200 animate-in slide-in-from-top-1">
                  
                  {/* History Logs */}
                  {report.logs && report.logs.length > 0 && (
                    <div className="mb-4 bg-white p-3 rounded border border-gray-200">
                       <p className="text-xs font-bold text-gray-400 uppercase mb-2">Rekod Terdahulu:</p>
                       {report.logs.map((log, i) => (
                         <div key={i} className="text-xs text-gray-600 mb-1">
                           <span className="font-bold">{log.user}:</span> {log.note}
                         </div>
                       ))}
                    </div>
                  )}

                  <label className="block text-sm font-bold text-gray-700 mb-2">Nota Pembersihan:</label>
                  <textarea
                    value={remarkInput}
                    onChange={(e) => setRemarkInput(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Contoh: Sampah telah dibuang..."
                    rows={2}
                  />
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdate(report.id, 'Dalam Tindakan')} 
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-bold transition shadow-sm"
                    >
                      🧽 Sedang Cuci
                    </button>
                    <button 
                      onClick={() => handleUpdate(report.id, 'Selesai')} 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold transition shadow-sm"
                    >
                      ✅ Selesai
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}