import Sidebar from './_components/sidebar';

export const metadata = {
  title: 'Dashboard | Arova',
  description: 'Arova merchant dashboard — manage your agent-commerce catalog, rules, and audit trail.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-gray-800 bg-gray-900/60 backdrop-blur flex items-center px-6 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-white">Arova</span>
            <span className="text-gray-600">|</span>
            <span className="text-sm text-gray-400">Dashboard</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
