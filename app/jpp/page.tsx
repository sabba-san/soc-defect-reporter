"use client";
import { useState, useEffect } from 'react';

// --- CONFIGURATION ---
// Change this ONE line if your Hotspot IP changes!
const API_IP = "172.20.10.3"; 
const API_BASE = `http://${API_IP}:5000`;

interface Log {
  user: string;
  note: string;
  timestamp: string;
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

export default function JPP_Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🔒 Hardcoded Role for this Dashboard
  const ROLE = "JPP"; 

  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [remarkInput, setRemarkInput] = useState("");

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reports`);
      const data = await res.json();
      
      // ✨ FILTER: JPP handles everything EXCEPT 'Kebersihan'
      // 'Kebersihan' usually goes to a separate Cleaning Contractor dashboard
      const jppTasks = data.filter((r: Report) => r.category !== "Kebersihan");
      setReports(jppTasks);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleUpdate = async (id: string, newStatus: string) => {
    if (!remarkInput.trim()) { 
      alert("Sila tulis nota teknikal untuk rekod!"); 
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
        fetchReports(); // Refresh list
      }
    } catch (error) { 
      alert("Error updating report"); 
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold">
      Loading JPP Tasks...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border-l-8 border-blue-600 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">🛠 Dashboard JPP</h1>
            <p className="text-sm text-gray-500">Penyelenggaraan Teknikal (Elektrik, Sivil, Perabot)</p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold shadow-sm">
            {reports.length} Tugasan
          </div>
        </div>

        {/* TASK LIST */}
        <div className="space-y-6">
          {reports.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-400 text-lg">Tiada kerosakan teknikal dilaporkan 🎉</p>
            </div>
          )}

          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="p-6 flex flex-col md:flex-row gap-6">
                
                {/* IMAGE FIX APPLIED HERE */}
                <div className="w-full md:w-40 h-40 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
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
                       <span className="inline-block px-2 py-1 mb-2 text-xs font-bold uppercase tracking-wide text-blue-600 bg-blue-50 rounded">
                         {report.category}
                       </span>
                       <h2 className="text-xl font-bold text-gray-800 mb-1">{report.issue}</h2>
                       <p className="text-sm text-gray-500">Lokasi: <span className="font-semibold text-gray-700">Aras {report.level}</span></p>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      report.status === 'Selesai' ? 'bg-green-100 text-green-700 border-green-200' : 
                      report.status === 'Dalam Tindakan' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <p className="text-xs text-gray-400">Lapor oleh: {report.name}</p>
                    <button 
                      onClick={() => setActiveReportId(activeReportId === report.id ? null : report.id)} 
                      className="text-sm font-bold text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-4"
                    >
                      {activeReportId === report.id ? "Tutup Panel" : "Tindak Balas"}
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTION AREA (Accordion) */}
              {activeReportId === report.id && (
                <div className="bg-slate-50 p-6 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
                  
                  {/* Log History */}
                  {report.logs && report.logs.length > 0 && (
                    <div className="mb-4 bg-white p-3 rounded border border-gray-200">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Sejarah Tindakan:</h4>
                      {report.logs.map((log, i) => (
                        <div key={i} className="text-xs text-gray-600 mb-1 border-l-2 border-gray-300 pl-2">
                          <span className="font-bold text-gray-800">{log.user}:</span> {log.note}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input Form */}
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nota Pembaikan / Status Part:</label>
                  <textarea
                    value={remarkInput}
                    onChange={(e) => setRemarkInput(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Contoh: 'Socket telah diganti' atau 'Menunggu spare part'..."
                    rows={3}
                  />
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleUpdate(report.id, 'Dalam Tindakan')} 
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-lg font-bold shadow-sm transition"
                    >
                      🚧 Sedang Baiki
                    </button>
                    <button 
                      onClick={() => handleUpdate(report.id, 'Selesai')} 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-bold shadow-sm transition"
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