'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { submitPublicOrderAction } from '@/server/actions/public-order-form';
import type { Commune, Product, Wilaya } from '@prisma/client';

interface PublicOrderFormProps {
  formSlug: string;
  products: Product[];
  wilayas: Wilaya[];
  communes: Commune[];
  themeColor: string | null;
}

interface ItemRow {
  key: number;
  productId: string;
  quantity: number;
}

let rowKeySeed = 0;
function nextRowKey() {
  rowKeySeed += 1;
  return rowKeySeed;
}

export function PublicOrderForm({ formSlug, products, wilayas, communes, themeColor }: PublicOrderFormProps) {
  const [selectedWilaya, setSelectedWilaya] = useState('');
  const [items, setItems] = useState<ItemRow[]>([{ key: nextRowKey(), productId: products[0]?.id ?? '', quantity: 1 }]);

  const filteredCommunes = useMemo(
    () => communes.filter((commune) => String(commune.wilayaId) === selectedWilaya),
    [communes, selectedWilaya]
  );

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  const estimatedTotal = items.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  const accent = themeColor || '#0f172a';

  return (
    <form action={submitPublicOrderAction.bind(null, formSlug)} className="space-y-5">
      {/* Honeypot — real visitors never see or fill this */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Full name
          <input
            name="fullName"
            required
            placeholder="Your name"
            className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Phone number
          <input
            name="phone"
            type="tel"
            required
            placeholder="05XX XX XX XX"
            className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Wilaya
          <select
            name="wilayaId"
            required
            value={selectedWilaya}
            onChange={(event) => setSelectedWilaya(event.target.value)}
            className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="">Select wilaya</option>
            {wilayas.map((wilaya) => (
              <option key={wilaya.id} value={wilaya.id}>
                {wilaya.nameFr}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Commune
          <select
            name="communeId"
            required
            disabled={!selectedWilaya}
            className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950"
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

      <label className="block space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
        Delivery address
        <textarea
          name="address"
          required
          rows={2}
          placeholder="Street, building, landmark..."
          className="flex min-h-16 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
      </label>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Products</p>
        {items.map((item, index) => (
          <div key={item.key} className="flex items-center gap-2">
            <select
              name="itemProductId"
              required
              value={item.productId}
              onChange={(event) =>
                setItems((prev) => prev.map((row) => (row.key === item.key ? { ...row, productId: event.target.value } : row)))
              }
              className="flex h-11 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} — {product.price.toLocaleString()} DZD
                </option>
              ))}
            </select>
            <input
              type="number"
              name="itemQuantity"
              min={1}
              max={50}
              required
              value={item.quantity}
              onChange={(event) =>
                setItems((prev) =>
                  prev.map((row) => (row.key === item.key ? { ...row, quantity: Number(event.target.value) || 1 } : row))
                )
              }
              className="h-11 w-20 rounded-lg border border-slate-200 bg-white px-2 text-center text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            {items.length > 1 ? (
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((row) => row.key !== item.key))}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
                aria-label="Remove product"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
            {index === items.length - 1 && products.length > 1 ? (
              <button
                type="button"
                onClick={() => setItems((prev) => [...prev, { key: nextRowKey(), productId: products[0]?.id ?? '', quantity: 1 }])}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
                aria-label="Add another product"
              >
                <Plus className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <label className="block space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
        Note (optional)
        <textarea
          name="notes"
          rows={2}
          placeholder="Anything we should know about your order?"
          className="flex min-h-14 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
      </label>

      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
        <span className="text-slate-600 dark:text-slate-400">Estimated total</span>
        <span className="font-semibold text-slate-900 dark:text-slate-100">{estimatedTotal.toLocaleString()} DZD</span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">Cash on delivery. Our team will call you to confirm before shipping.</p>

      <button
        type="submit"
        style={{ backgroundColor: accent }}
        className="flex h-12 w-full items-center justify-center rounded-lg text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
      >
        Place order
      </button>
    </form>
  );
}
