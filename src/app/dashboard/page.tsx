'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalProducts: number;
  totalRules: number;
  totalTransactions: number;
  totalSessions: number;
}

const defaultStats: Stats = {
  totalProducts: 0,
  totalRules: 0,
  totalTransactions: 0,
  totalSessions: 0,
};

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [catalogRes, rulesRes, transactionsRes, sessionsRes] =
          await Promise.allSettled([
            fetch('/api/merchant/catalog'),
            fetch('/api/merchant/rules'),
            fetch('/api/transactions'),
            fetch('/api/agent/sessions'),
          ]);

        const parse = async (
          result: PromiseSettledResult<Response>,
        ): Promise<number> => {
          if (result.status === 'fulfilled' && result.value.ok) {
            const data = await result.value.json();
            if (Array.isArray(data)) return data.length;
            if (data && typeof data.count === 'number') return data.count;
            if (data && Array.isArray(data.data)) return data.data.length;
          }
          return 0;
        };

        setStats({
          totalProducts: await parse(catalogRes),
          totalRules: await parse(rulesRes),
          totalTransactions: await parse(transactionsRes),
          totalSessions: await parse(sessionsRes),
        });
      } catch {
        // Keep defaults on network failure
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Products',
      value: stats.totalProducts,
      description: 'Items in your agent-readable catalog',
      color: 'border-indigo-500',
    },
    {
      title: 'Commerce Rules',
      value: stats.totalRules,
      description: 'Active negotiation and pricing rules',
      color: 'border-emerald-500',
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions,
      description: 'Completed agent-initiated purchases',
      color: 'border-amber-500',
    },
    {
      title: 'Agent Sessions',
      value: stats.totalSessions,
      description: 'AI buyer agent interactions',
      color: 'border-cyan-500',
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`bg-gray-900 border-l-4 ${card.color} rounded-lg p-5`}
          >
            <p className="text-sm text-gray-400">{card.title}</p>
            {loading ? (
              <div className="h-9 w-16 bg-gray-800 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-3xl font-bold text-white mt-1">
                {card.value}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
