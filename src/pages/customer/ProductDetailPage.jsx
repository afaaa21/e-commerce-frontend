import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatRupiah, getErrorMessage } from '../../utils/helpers'
import { useAuth } from '../../contexts/AuthContext'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data.product ?? res.data))
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Silakan masuk terlebih dahulu')
      navigate('/login')
      return
    }
    setAddingToCart(true)
    try {
      await api.post('/cart', { product_id: product.id, qty })
      toast.success('Produk ditambahkan ke keranjang!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  if (!product) return <div className="text-center py-16 text-slate-500">Produk tidak ditemukan.</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
        <span>←</span>
        Kembali
      </button>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex min-h-80 items-center justify-center bg-slate-100 p-6 sm:min-h-[420px]">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="max-h-96 w-full object-contain p-6"
                  onError={e => { e.currentTarget.style.display = 'none' }} />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 5h16v11H4z" />
                    <path d="M9 20h6" />
                    <path d="M12 16v4" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
              {product.category}
            </span>
            <h1 className="mt-4 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">{product.name}</h1>
            <p className="mt-3 text-3xl font-bold text-blue-600 sm:text-4xl">{formatRupiah(product.price)}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Stok</p>
                <p className={product.stock > 0 ? 'mt-1 font-bold text-emerald-600' : 'mt-1 font-bold text-red-600'}>
                {product.stock > 0 ? `${product.stock} tersedia` : 'Habis'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Kategori</p>
                <p className="mt-1 font-bold text-slate-900">{product.category}</p>
              </div>
            </div>

            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="mt-8">
                <h3 className="mb-3 text-lg font-bold text-slate-900">Spesifikasi</h3>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="divide-y divide-slate-200">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium capitalize text-slate-500">{key.replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-slate-800">{String(value)}</span>
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            )}

            {user?.role === 'customer' && product.stock > 0 && (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex w-fit items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-4 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-100">−</button>
                  <span className="px-5 py-3 font-semibold text-slate-900">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="px-4 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-100">+</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  {addingToCart ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                </button>
              </div>
            )}

            {!user && (
              <p className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-600">
                <a href="/login" className="font-semibold text-blue-600 hover:underline">Masuk</a> untuk menambahkan produk ke keranjang.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
