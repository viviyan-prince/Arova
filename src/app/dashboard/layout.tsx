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
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
