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

  if (!product) return <div className="text-center py-16 text-gray-500">Produk tidak ditemukan.</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-6 flex items-center gap-1">
        ← Kembali
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="bg-gray-100 flex items-center justify-center min-h-72">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="object-contain max-h-72 p-4"
                onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML='<span class="text-6xl">🖥️</span>' }} />
            ) : (
              <span className="text-7xl">🖥️</span>
            )}
          </div>

          <div className="p-8">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {product.category}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-3">{product.name}</h1>
            <p className="text-3xl font-bold text-blue-600 mt-2">{formatRupiah(product.price)}</p>

            <p className="text-sm text-gray-500 mt-2">
              Stok: <span className={product.stock > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {product.stock > 0 ? `${product.stock} tersedia` : 'Habis'}
              </span>
            </p>

           {/* Ganti blok Spesifikasi lama dengan kode ini */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-3">Spesifikasi</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {typeof product.specs === 'object' 
                    ? Object.values(product.specs).filter(Boolean).join('\n') 
                    : String(product.specs)}
                </div>
              </div>
            )}

            {user?.role === 'customer' && product.stock > 0 && (
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 font-bold">−</button>
                  <span className="px-4 py-2 font-medium">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 font-bold">+</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  {addingToCart ? 'Menambahkan...' : '🛒 Tambah ke Keranjang'}
                </button>
              </div>
            )}

            {!user && (
              <p className="mt-4 text-sm text-gray-500">
                <a href="/login" className="text-blue-600 hover:underline">Masuk</a> untuk menambahkan ke keranjang
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
