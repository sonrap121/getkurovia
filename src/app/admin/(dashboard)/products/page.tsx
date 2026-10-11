import { createProductAction, updateProductAction } from "@/app/admin/actions";
import { getCategories, getProducts } from "@/lib/data";
import { formatUsd } from "@/lib/currency";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ created?: string; error?: string }> }) {
  const { created, error } = await searchParams;
  const [products, categories] = await Promise.all([getProducts({ includeInactive: true, sort: "newest" }), getCategories()]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Products</h1>
      {created && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">Product created and live in the shop.</p>}
      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">Please fill in name, category, price and image URL.</p>}

      <div className="mt-6 grid gap-8 xl:grid-cols-[1fr_380px]">
        <section className="card overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Inventory ({products.length})</h2>
            <p className="text-xs text-slate-500">Edit price, stock and visibility inline. Prices in USD.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {products.map((product) => (
              <form key={product.id} action={updateProductAction} className="grid items-center gap-3 px-5 py-3 md:grid-cols-[56px_1fr_90px_90px_80px_auto_auto]">
                <input type="hidden" name="productId" value={product.id} />
                <div className="h-14 w-14 overflow-hidden rounded-lg bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500">
                    {product.sku} · {product.categoryName} · {formatUsd(product.priceCents)}
                  </p>
                </div>
                <label className="text-xs text-slate-500">
                  Price $
                  <input name="price" type="number" step="0.01" min="0" defaultValue={(product.priceCents / 100).toFixed(2)} className="input mt-1 h-9 px-2" />
                </label>
                <label className="text-xs text-slate-500">
                  Was $
                  <input name="compareAtPrice" type="number" step="0.01" min="0" defaultValue={product.compareAtPriceCents ? (product.compareAtPriceCents / 100).toFixed(2) : ""} className="input mt-1 h-9 px-2" />
                </label>
                <label className="text-xs text-slate-500">
                  Stock
                  <input name="stock" type="number" min="0" defaultValue={product.stock} className={cn("input mt-1 h-9 px-2", product.stock <= 10 && "border-rose-300 bg-rose-50")} />
                </label>
                <div className="flex flex-col gap-1 text-xs text-slate-600">
                  <label className="inline-flex items-center gap-1.5">
                    <input type="checkbox" name="isActive" defaultChecked={product.isActive} className="accent-brand-900" /> Active
                  </label>
                  <label className="inline-flex items-center gap-1.5">
                    <input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured} className="accent-brand-900" /> Featured
                  </label>
                </div>
                <button type="submit" className="btn-outline h-9 px-3 text-xs">
                  Save
                </button>
              </form>
            ))}
          </div>
        </section>

        <section className="card h-fit p-5">
          <h2 className="font-semibold text-slate-900">Add a product</h2>
          <p className="text-xs text-slate-500">New items go live immediately and appear in the shop.</p>
          <form action={createProductAction} className="mt-4 space-y-3">
            <div>
              <label className="label" htmlFor="name">
                Name
              </label>
              <input id="name" name="name" required className="input h-10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="brand">
                  Brand
                </label>
                <input id="brand" name="brand" className="input h-10" />
              </div>
              <div>
                <label className="label" htmlFor="categoryId">
                  Category
                </label>
                <select id="categoryId" name="categoryId" required className="input h-10">
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label" htmlFor="price">
                  Price $
                </label>
                <input id="price" name="price" type="number" step="0.01" min="0.5" required className="input h-10" />
              </div>
              <div>
                <label className="label" htmlFor="compareAtPrice">
                  Was $
                </label>
                <input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" min="0" className="input h-10" />
              </div>
              <div>
                <label className="label" htmlFor="stock">
                  Stock
                </label>
                <input id="stock" name="stock" type="number" min="0" defaultValue={10} className="input h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="weightGrams">
                  Weight (g)
                </label>
                <input id="weightGrams" name="weightGrams" type="number" min="1" defaultValue={500} className="input h-10" />
              </div>
              <div>
                <label className="label" htmlFor="tags">
                  Tags (comma)
                </label>
                <input id="tags" name="tags" placeholder="new, gift" className="input h-10" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="imageUrl">
                Image URL
              </label>
              <input id="imageUrl" name="imageUrl" type="url" required placeholder="https://…" className="input h-10" />
            </div>
            <div>
              <label className="label" htmlFor="shortDescription">
                Short description
              </label>
              <input id="shortDescription" name="shortDescription" className="input h-10" />
            </div>
            <div>
              <label className="label" htmlFor="description">
                Full description
              </label>
              <textarea id="description" name="description" rows={3} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="highlights">
                Highlights (one per line)
              </label>
              <textarea id="highlights" name="highlights" rows={3} className="input" />
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="isFeatured" className="accent-brand-900" /> Feature on homepage
            </label>
            <button type="submit" className="btn-primary h-11 w-full">
              Create product
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
