'use client';

import { useEffect, useState, useCallback } from 'react';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { useToast } from '@/components/ui/toast';
import { useCursorPosition } from '@/hooks/use-cursor-position';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category: string;
  subcategory?: string;
  inventory_count?: number;
  is_active?: boolean;
  status?: string;
  semantic_description?: string | null;
  json_ld?: Record<string, unknown> | null;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { showToast } = useToast();
  const spotlightRef = useCursorPosition<HTMLDivElement>();

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/merchant/catalog');
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.products ?? data.data ?? []);
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
    const product = products.find(p => p.id === productId);
    setGeneratingId(productId);
    try {
      const res = await fetch('/api/merchant/catalog-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });
      if (res.ok) {
        await fetchProducts();
        showToast(`AI description generated for ${product?.name || 'product'}`, 'success');
      } else {
        showToast('Failed to generate AI description', 'error');
      }
    } catch {
      showToast('Failed to generate AI description', 'error');
    } finally {
      setGeneratingId(null);
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price);
  }

  return (
    <div className="max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white tracking-tight">Products</h1>
            {!loading && (
              <span className="bg-zinc-800 text-zinc-400 text-[11px] font-medium px-2 py-0.5 rounded-full">
                {products.length}
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 mt-1">Agent-readable product catalog with AI-generated descriptions.</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/60">
            <div className="skeleton h-4 w-48" />
          </div>
          <div className="divide-y divide-zinc-800/40">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-6">
                <div className="skeleton h-4 w-48 flex-shrink-0" />
                <div className="skeleton h-4 w-20" />
                <div className="skeleton h-4 w-16" />
                <div className="skeleton h-4 w-12" />
                <div className="skeleton h-4 w-16" />
                <div className="skeleton h-4 w-24 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl py-20 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-zinc-200 mb-2">Your product catalog is ready</h3>
          <p className="text-[13px] text-zinc-500 max-w-md mx-auto mb-6">
            Add products via the merchant API to start building your agent-readable catalog with AI-generated descriptions and Schema.org markup.
          </p>
          <a
            href="/api/merchant/catalog"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 rounded-lg transition-colors"
          >
            View API Documentation
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>
      ) : (
        <div
          ref={spotlightRef}
          className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden cursor-spotlight"
        >
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="py-3 px-5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Product</th>
                <th className="py-3 px-5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Category</th>
                <th className="py-3 px-5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-right">Price</th>
                <th className="py-3 px-5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-right">Stock</th>
                <th className="py-3 px-5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-center">Status</th>
                <th className="py-3 px-5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {products.map((product, idx) => {
                const hasSemantic = Boolean(product.semantic_description);
                const isExpanded = expandedId === product.id;
                const isActive = product.is_active !== false && product.status !== 'inactive';
                const stock = product.inventory_count ?? 0;

                return (
                  <tr key={product.id} className="group">
                    {/* Combined row + expanded detail */}
                    <td colSpan={6} className="p-0">
                      {/* Main row */}
                      <div
                        className={`grid grid-cols-[1fr_120px_100px_80px_100px_140px] items-center px-5 py-3.5 cursor-pointer transition-colors hover:bg-zinc-800/40 ${isExpanded ? 'bg-zinc-800/30' : ''}`}
                        onClick={() => setExpandedId(isExpanded ? null : product.id)}
                      >
                        {/* Product */}
                        <div className="min-w-0 pr-4">
                          <p className="text-[13px] font-medium text-zinc-200 truncate">{product.name}</p>
                          <p className="text-[11px] text-zinc-500 truncate mt-0.5">{product.description || 'No description'}</p>
                        </div>

                        {/* Category */}
                        <div>
                          <span className="bg-zinc-800 text-zinc-400 text-[11px] font-medium px-2 py-0.5 rounded-full capitalize">
                            {product.category || '--'}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-[13px] font-mono text-zinc-200">
                            &#8377;{formatPrice(product.price)}
                          </span>
                        </div>

                        {/* Stock */}
                        <div className="text-right">
                          <span className={`text-[13px] font-mono ${stock < 20 ? 'text-amber-400' : 'text-zinc-300'}`}>
                            {stock}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="text-center">
                          {isActive ? (
                            <span className="bg-emerald-500/10 text-emerald-400 text-[11px] font-medium px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="bg-zinc-800 text-zinc-500 text-[11px] font-medium px-2 py-0.5 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="text-right" onClick={(e) => e.stopPropagation()}>
                          <MagneticButton
                            type="button"
                            onClick={() => handleGenerate(product.id)}
                            disabled={generatingId === product.id}
                            variant="primary"
                            className="text-[12px] px-3 py-1.5"
                          >
                            {generatingId === product.id ? (
                              <>
                                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span className="glow-pulse">Generating</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                </svg>
                                Generate AI
                              </>
                            )}
                          </MagneticButton>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="px-5 pb-4 pt-1 border-t border-zinc-800/40 bg-zinc-900/60 animate-fade-in">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                            {product.semantic_description ? (
                              <div>
                                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Semantic Description</p>
                                <p className="text-[13px] text-zinc-300 leading-relaxed">{product.semantic_description}</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Semantic Description</p>
                                <p className="text-[12px] text-zinc-600 italic">Not generated yet. Click &ldquo;Generate AI&rdquo; to create.</p>
                              </div>
                            )}
                            {product.json_ld ? (
                              <div>
                                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">JSON-LD</p>
                                <pre className="text-[11px] text-zinc-400 bg-zinc-950 rounded-lg p-3 overflow-x-auto max-h-48 font-mono">
                                  {JSON.stringify(product.json_ld, null, 2)}
                                </pre>
                              </div>
                            ) : (
                              <div>
                                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">JSON-LD</p>
                                <p className="text-[12px] text-zinc-600 italic">Not generated yet.</p>
                              </div>
                            )}
                          </div>

                          {product.subcategory && (
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-[11px] text-zinc-500">Subcategory:</span>
                              <span className="bg-zinc-800 text-zinc-400 text-[11px] font-medium px-2 py-0.5 rounded-full capitalize">
                                {product.subcategory.replace(/_/g, ' ')}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
