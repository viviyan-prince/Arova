'use client';

import { useEffect, useState, useCallback } from 'react';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { useToast } from '@/components/ui/toast';
import { useCursorPosition } from '@/hooks/use-cursor-position';
import { useTranslation } from '@/lib/i18n/context';

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
  const [schemaOpenId, setSchemaOpenId] = useState<string | null>(null);
  const { showToast } = useToast();
  const spotlightRef = useCursorPosition<HTMLDivElement>();
  const t = useTranslation();

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
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">{t('products.title')}</h1>
            {!loading && (
              <span className="bg-surface-raised text-muted-foreground text-[11px] font-medium px-2 py-0.5 rounded-full">
                {products.length}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{t('products.subtitle')}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <div className="skeleton h-4 w-48" />
          </div>
          <div className="divide-y divide-border-subtle">
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
        <div className="bg-surface border border-border rounded-xl py-20 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent/10 to-ai/10 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-foreground mb-2">Your product catalog is ready</h3>
          <p className="text-[13px] text-muted-foreground max-w-md mx-auto mb-6">
            Add products via the merchant API to start building your agent-readable catalog with AI-generated descriptions and Schema.org markup.
          </p>
          <a
            href="/api/merchant/catalog"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-accent hover:text-accent/80 border border-accent/30 hover:border-accent/50 rounded-lg transition-colors"
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
          className="bg-surface border border-border rounded-xl overflow-hidden cursor-spotlight"
        >
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="py-3 px-5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="py-3 px-5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-right">Price</th>
                <th className="py-3 px-5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-right">Stock</th>
                <th className="py-3 px-5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-center">AI readiness</th>
                <th className="py-3 px-5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {products.map((product) => {
                const hasSemantic = Boolean(product.semantic_description);
                const isExpanded = expandedId === product.id;
                const stock = product.inventory_count ?? 0;

                return (
                  <tr key={product.id} className="table-row group">
                    {/* Combined row + expanded detail */}
                    <td colSpan={6} className="p-0">
                      {/* Main row */}
                      <div
                        className={`grid grid-cols-[1fr_120px_100px_80px_100px_140px] items-center px-5 py-3.5 cursor-pointer transition-colors hover:bg-surface-raised/50 ${isExpanded ? 'bg-surface-raised/30' : ''}`}
                        onClick={() => setExpandedId(isExpanded ? null : product.id)}
                      >
                        {/* Product */}
                        <div className="min-w-0 pr-4">
                          <p className="text-[13px] font-medium text-foreground truncate">{product.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{product.description || 'No description'}</p>
                        </div>

                        {/* Category */}
                        <div>
                          <span className="bg-surface-raised text-muted-foreground text-[11px] font-medium px-2 py-0.5 rounded-full capitalize">
                            {product.category || '--'}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-[13px] font-mono text-foreground">
                            &#8377;{formatPrice(product.price)}
                          </span>
                        </div>

                        {/* Stock */}
                        <div className="text-right">
                          <span className={`text-[13px] font-mono ${stock < 20 ? 'text-warning' : 'text-foreground/80'}`}>
                            {stock}
                          </span>
                        </div>

                        {/* AI Readiness */}
                        <div className="text-center">
                          {hasSemantic ? (
                            <span className="bg-revenue-subtle text-revenue text-[11px] font-medium px-2 py-0.5 rounded-full">
                              {t('products.aiReady')}
                            </span>
                          ) : (
                            <span className="bg-surface-raised text-muted text-[11px] font-medium px-2 py-0.5 rounded-full">
                              {t('products.needsAi')}
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
                                {t('products.makeAiReady')}
                              </>
                            )}
                          </MagneticButton>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="premium-card px-5 pb-4 pt-1 border-t border-border-subtle bg-surface/60 animate-fade-in">
                          <div className="mt-3">
                            {product.semantic_description ? (
                              <div className="mb-4">
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">What AI knows about this product</p>
                                <ul className="space-y-1.5">
                                  {product.semantic_description.split(/[.!?]+/).filter(s => s.trim()).map((sentence, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[13px] text-foreground/80 leading-relaxed">
                                      <span className="text-revenue mt-0.5 shrink-0">&#8226;</span>
                                      <span>{sentence.trim()}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <div className="mb-4">
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">What AI knows about this product</p>
                                <p className="text-[12px] text-muted italic">Not generated yet. Click &ldquo;Make AI-ready&rdquo; to create.</p>
                              </div>
                            )}

                            {product.json_ld ? (
                              <div>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setSchemaOpenId(schemaOpenId === product.id ? null : product.id); }}
                                  className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                                >
                                  <svg
                                    className={`w-3 h-3 transition-transform duration-200 ${schemaOpenId === product.id ? 'rotate-90' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                  </svg>
                                  Schema markup
                                </button>
                                {schemaOpenId === product.id && (
                                  <pre className="mt-2 text-[11px] text-muted-foreground bg-background rounded-lg p-3 overflow-x-auto max-h-48 font-mono animate-fade-in">
                                    {JSON.stringify(product.json_ld, null, 2)}
                                  </pre>
                                )}
                              </div>
                            ) : (
                              <div>
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Schema markup</p>
                                <p className="text-[12px] text-muted italic">Not generated yet.</p>
                              </div>
                            )}
                          </div>

                          {product.subcategory && (
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-[11px] text-muted-foreground">Subcategory:</span>
                              <span className="bg-surface-raised text-muted-foreground text-[11px] font-medium px-2 py-0.5 rounded-full capitalize">
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
