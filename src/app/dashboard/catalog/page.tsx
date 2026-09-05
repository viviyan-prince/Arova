'use client';

import { useEffect, useState, useCallback } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  status: string;
  semantic_description?: string | null;
  json_ld?: Record<string, unknown> | null;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/merchant/catalog');
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.data ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function handleGenerate(productId: string) {
    setGeneratingId(productId);
    try {
      const res = await fetch('/api/merchant/catalog-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });
      if (res.ok) {
        await fetchProducts();
      }
    } catch {
      // silent
    } finally {
      setGeneratingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Product Catalog</h2>
        <span className="text-sm text-gray-400">
          {products.length} product{products.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-900 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No products yet</p>
          <p className="text-sm mt-1">
            Add products via the API to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">AI Description</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const hasSemantic = Boolean(product.semantic_description);
                const isExpanded = expandedId === product.id;

                return (
                  <tr key={product.id} className="border-b border-gray-800/50">
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        className="text-white font-medium hover:text-indigo-400 transition-colors text-left"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : product.id)
                        }
                      >
                        {product.name}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {typeof product.price === 'number'
                        ? `$${(product.price / 100).toFixed(2)}`
                        : '--'}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {product.category || '--'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                          product.status === 'active'
                            ? 'bg-emerald-900/40 text-emerald-400'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {hasSemantic ? (
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-indigo-900/40 text-indigo-400">
                          Generated
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-500">
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleGenerate(product.id)}
                        disabled={generatingId === product.id}
                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {generatingId === product.id ? (
                          <span className="flex items-center gap-1.5">
                            <svg
                              className="w-3 h-3 animate-spin"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            Generating...
                          </span>
                        ) : (
                          'Generate AI Catalog'
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Expanded detail panel */}
          {expandedId && (
            <div className="mt-4 bg-gray-900 rounded-lg p-5 border border-gray-800">
              {(() => {
                const p = products.find((x) => x.id === expandedId);
                if (!p) return null;
                return (
                  <div className="space-y-4">
                    <h3 className="text-white font-medium">{p.name}</h3>
                    {p.semantic_description && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                          Semantic Description
                        </p>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {p.semantic_description}
                        </p>
                      </div>
                    )}
                    {p.json_ld && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                          JSON-LD Preview
                        </p>
                        <pre className="text-xs text-gray-400 bg-gray-950 rounded p-3 overflow-x-auto">
                          {JSON.stringify(p.json_ld, null, 2)}
                        </pre>
                      </div>
                    )}
                    {!p.semantic_description && !p.json_ld && (
                      <p className="text-sm text-gray-500">
                        No AI-generated content yet. Click &quot;Generate AI
                        Catalog&quot; to create a semantic description and
                        JSON-LD markup.
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
