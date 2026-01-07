"use client";
import { useState, useEffect } from 'react';

// Use your Port 5000 URL if on mobile
const API_BASE = "http://localhost:5000"; 

export default function Cleaner_Dashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const ROLE = "Pembersih"; // 🔒 Hardcoded Role

  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [remarkInput, setRemarkInput] = useState("");

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reports`);
      const data = await res.json();
      
      // ✨ FILTER: Only show 'Kebersihan' tasks
      const cleanerTasks = data.filter((r: any) => r.category === "Kebersihan");
      setReports(cleanerTasks);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleUpdate = async (id: string, newStatus: string) => {
    if (!remarkInput.trim()) { alert("Sila tulis nota tindakan!"); return; }

    try {
      const res = await fetch(`${API_BASE}/api/update_report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, remark: remarkInput, role: ROLE })
      });

      if (res.ok) {
        alert("✅ Laporan Dikemaskini!");
        setRemarkInput("");
        setActiveReportId(null);
        fetchReports();
      }
    } catch (error) { alert("Error updating"); }
  };

  if (loading) return <div className="p-10 text-center">Loading Tasks...</div>;

  return (
    <div className="min-h-screen bg-green-50 p-4 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border-l-8 border-green-500 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-900">🧹 Dashboard Pembersih</h1>
            <p className="text-sm text-gray-500">Senarai tugas kebersihan (Sampah, Tandas, Lantai)</p>
          </div>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold">
            {reports.length} Tugasan
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-6">
          {reports.length === 0 && <p className="text-center text-gray-400">Tiada tugasan kebersihan 🎉</p>}
          
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-gray-300">
              <div className="p-6 flex flex-col md:flex-row gap-6">
                <img src={report.image_url} alt="Defect" className="w-full md:w-32 h-32 object-cover rounded-lg bg-gray-200" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{report.issue}</h2>
                  <p className="text-gray-600">📍 {report.level} | 👤 {report.name}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                    report.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{report.status}</span>
                  
                  <button onClick={() => setActiveReportId(activeReportId === report.id ? null : report.id)} className="block mt-4 text-green-600 font-bold hover:underline">
                    {activeReportId === report.id ? "Tutup" : "Tindak Balas"}
                  </button>
                </div>
              </div>

              {/* ACTION AREA */}
              {activeReportId === report.id && (
                <div className="bg-gray-50 p-6 border-t">
                  <div className="mb-4">
                     {/* History Mini View */}
                    {report.logs?.map((log: any, i: number) => (
                      <p key={i} className="text-xs text-gray-500 mb-1">
                        <strong>{log.user}:</strong> {log.note}
                      </p>
                    ))}
                  </div>
                  <textarea
                    value={remarkInput}
                    onChange={(e) => setRemarkInput(e.target.value)}
                    className="w-full p-3 border rounded-lg mb-3"
                    placeholder="Nota tindakan pembersihan..."
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(report.id, 'Dalam Tindakan')} className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-bold">Sedang Cuci</button>
                    <button onClick={() => handleUpdate(report.id, 'Selesai')} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold">✅ Selesai</button>
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