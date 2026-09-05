export default function DemoLoading() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-gray-700 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-400">Loading demo...</p>
      </div>
    </div>
  );
}
