export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100 text-black">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">SOC Defect Reporter</h1>
        <p className="mb-8 text-gray-600">Scan a QR code to report a problem.</p>
        
        {/* Placeholder Button */}
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition">
          Start Report
        </button>
      </div>
    </main>
  );
}