'use client';

import { useMemo, useState } from 'react';
import { Minus, Plus, ImageOff, ShoppingBag, MapPin } from 'lucide-react';
import { submitPublicOrderAction } from '@/server/actions/public-order-form';
import type { Commune, Product, Wilaya } from '@prisma/client';

interface PublicOrderFormProps {
  formSlug: string;
  products: Product[];
  wilayas: Wilaya[];
  communes: Commune[];
  themeColor: string | null;
}

export function PublicOrderForm({ formSlug, products, wilayas, communes, themeColor }: PublicOrderFormProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedWilaya, setSelectedWilaya] = useState('');

  const accent = themeColor || 'rgb(var(--primary))';

  const filteredCommunes = useMemo(
    () => communes.filter((commune) => String(commune.wilayaId) === selectedWilaya),
    [communes, selectedWilaya]
  );

  const selectedItems = useMemo(
    () =>
      Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([productId, qty]) => ({ product: products.find((p) => p.id === productId)!, quantity: qty }))
        .filter((item) => item.product),
    [quantities, products]
  );

  const total = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const hasSelection = selectedItems.length > 0;

  const setQuantity = (productId: string, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(0, quantity) }));
  };

  return (
    <form action={submitPublicOrderAction.bind(null, formSlug)} className="space-y-8">
      {/* Honeypot — real visitors never see or fill this */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      {/* Step 1 — product picker */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            1
          </span>
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <ShoppingBag className="h-4 w-4" /> Choose your products
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {products.map((product) => {
            const quantity = quantities[product.id] ?? 0;
            const imageUrl = product.imageUrls[0];

            return (
              <div
                key={product.id}
                className={`flex gap-3 rounded-xl border p-3 transition-colors ${
                  quantity > 0 ? 'border-primary bg-primary/5' : 'border-border bg-surface'
                }`}
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-hover">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageOff className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-sm font-medium leading-tight text-foreground">{product.name}</p>
                    <p className="tabular-nums text-sm text-muted-foreground">{product.price.toLocaleString()} DZD</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(product.id, quantity - 1)}
                      disabled={quantity === 0}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-surface-hover disabled:opacity-40"
                      aria-label={`Decrease ${product.name} quantity`}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums text-foreground">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(product.id, quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-surface-hover"
                      aria-label={`Increase ${product.name} quantity`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {quantity > 0 ? (
                  <>
                    <input type="hidden" name="itemProductId" value={product.id} />
                    <input type="hidden" name="itemQuantity" value={quantity} />
                  </>
                ) : null}
              </div>
            );
          })}
        </div>

        {hasSelection ? (
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-hover px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              {selectedItems.reduce((sum, item) => sum + item.quantity, 0)} item(s) selected
            </span>
            <span className="tabular-nums font-semibold text-foreground">{total.toLocaleString()} DZD</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select at least one product to continue.</p>
        )}
      </section>

      {/* Step 2 — customer details */}
      <section className={`space-y-4 transition-opacity ${hasSelection ? '' : 'pointer-events-none opacity-40'}`}>
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            2
          </span>
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <MapPin className="h-4 w-4" /> Your delivery details
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-foreground">
            Full name
            <input
              name="fullName"
              required={hasSelection}
              placeholder="Your name"
              className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-foreground">
            Phone number
            <input
              name="phone"
              type="tel"
              required={hasSelection}
              placeholder="05XX XX XX XX"
              className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-foreground">
            Wilaya
            <select
              name="wilayaId"
              required={hasSelection}
              value={selectedWilaya}
              onChange={(event) => setSelectedWilaya(event.target.value)}
              className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="">Select wilaya</option>
              {wilayas.map((wilaya) => (
                <option key={wilaya.id} value={wilaya.id}>
                  {wilaya.nameFr}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium text-foreground">
            Commune
            <select
              name="communeId"
              required={hasSelection}
              disabled={!selectedWilaya}
              className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="">Select commune</option>
              {filteredCommunes.map((commune) => (
                <option key={commune.id} value={commune.id}>
                  {commune.nameFr}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-1 text-sm font-medium text-foreground">
          Delivery address
          <textarea
            name="address"
            required={hasSelection}
            rows={2}
            placeholder="Street, building, landmark..."
            className="flex min-h-16 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>

        <label className="block space-y-1 text-sm font-medium text-foreground">
          Note (optional)
          <textarea
            name="notes"
            rows={2}
            placeholder="Anything we should know about your order?"
            className="flex min-h-14 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>

        <p className="text-xs text-muted-foreground">Cash on delivery. Our team will call you to confirm before shipping.</p>

        <button
          type="submit"
          disabled={!hasSelection}
          style={{ backgroundColor: accent }}
          className="flex h-12 w-full items-center justify-center rounded-lg text-sm font-semibold text-white shadow-soft transition hover:opacity-90 disabled:opacity-50"
        >
          Place order · {total.toLocaleString()} DZD
        </button>
      </section>
    </form>
  );
}
