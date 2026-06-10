import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatRupiah, getErrorMessage } from '../../utils/helpers'

const CATEGORIES = ['CPU', 'Motherboard', 'RAM', 'Storage', 'GPU', 'PSU', 'Casing']
const PRODUCTS_PER_PAGE = 6

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    api.get('/products')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? res.data?.products ?? [])
        setProducts(data)
        setFiltered(data)
      })
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = products
    if (selectedCategories.length > 0) result = result.filter(p => selectedCategories.includes(p.category))
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (minPrice) result = result.filter(p => Number(p.price) >= Number(minPrice))
    if (maxPrice) result = result.filter(p => Number(p.price) <= Number(maxPrice))
    setFiltered(result)
    setCurrentPage(1)
  }, [selectedCategories, search, minPrice, maxPrice, products])

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(item => item !== cat) : [...prev, cat]
    )
  }

  const resetFilters = () => {
    setSelectedCategories([])
    setSearch('')
    setMinPrice('')
    setMaxPrice('')
    setCurrentPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE))
  const paginatedProducts = filtered.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE)
  const visiblePages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-blue-600">TechStore Catalog</p>
        <h1 className="text-3xl font-bold text-slate-900">Semua Produk</h1>
        <p className="mt-1 text-sm text-slate-500">Cari komponen PC sesuai kategori dan rentang harga.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Filter Produk</h2>
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Reset
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Cari Produk</label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Nama produk..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Kategori</p>
              <div className="space-y-2">
                {CATEGORIES.map(cat => (
                  <label key={cat} className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Range Harga</p>
              <div className="space-y-3">
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  placeholder="Harga minimum"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  placeholder="Harga maksimum"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div>
              <p className="font-semibold text-slate-900">Produk Tersedia</p>
              <p className="text-sm text-slate-500">{filtered.length} produk ditemukan</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
              {selectedCategories.length > 0 ? `${selectedCategories.length} kategori` : 'Semua kategori'}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-slate-500 shadow-sm">Tidak ada produk ditemukan.</div>
          ) : (
            <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedProducts.map(product => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex h-36 items-center justify-center overflow-hidden bg-slate-100">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          onError={e => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M4 5h16v11H4z" />
                            <path d="M9 20h6" />
                            <path d="M12 16v4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
                        {product.category}
                      </span>
                      <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</h3>
                      <p className="mt-1.5 text-sm font-bold text-blue-600">{formatRupiah(product.price)}</p>
                      <p className="mt-1 text-xs text-slate-500">Stok: {product.stock}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
                >
                  &lt;
                </button>
                {visiblePages.map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                {totalPages > 5 && <span className="px-1 text-sm font-semibold text-slate-400">...</span>}
                {totalPages > 5 && (
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                      currentPage === totalPages
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {totalPages}
                  </button>
                )}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
                >
                  &gt;
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
