import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatRupiah, getErrorMessage } from '../../utils/helpers'

export default function CartPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkoutModal, setCheckoutModal] = useState(false)
  const [shippingAddress, setShippingAddress] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const navigate = useNavigate()

  const fetchCart = () => {
    api.get('/cart')
      .then(res => setItems(res.data.items ?? res.data))
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCart() }, [])

  const handleUpdateQty = async (cartId, newQty) => {
    if (newQty < 1) return
    try {
      await api.put(`/cart/${cartId}`, { qty: newQty })
      setItems(items.map(item => item.id === cartId ? { ...item, qty: newQty, subtotal: item.product.price * newQty } : item))
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleRemove = async (cartId) => {
    try {
      await api.delete(`/cart/${cartId}`)
      setItems(items.filter(item => item.id !== cartId))
      toast.success('Item dihapus dari keranjang')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      toast.error('Alamat pengiriman wajib diisi')
      return
    }
    setCheckingOut(true)
    try {
      const res = await api.post('/orders', { shipping_address: shippingAddress })
      toast.success('Pesanan berhasil dibuat!')
      setCheckoutModal(false)
      navigate('/orders')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCheckingOut(false)
    }
  }

  const total = items.reduce((acc, item) => acc + Number(item.subtotal || (item.product.price * item.qty)), 0)

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">🛒 Keranjang Belanja</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">Keranjang Anda kosong</p>
          <a href="/products" className="text-blue-600 hover:underline">Mulai belanja →</a>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {item.product.image_url ? (
                  <img src={item.product.image_url} alt={item.product.name} className="object-contain w-full h-full p-1"
                    onError={e => { e.target.style.display='none' }} />
                ) : <span className="text-3xl">🖥️</span>}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
                <p className="text-blue-600 font-bold">{formatRupiah(item.product.price)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => handleUpdateQty(item.id, item.qty - 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center">−</button>
                <span className="w-8 text-center font-semibold">{item.qty}</span>
                <button onClick={() => handleUpdateQty(item.id, item.qty + 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center">+</button>
              </div>

              <div className="text-right min-w-24">
                <p className="font-bold text-gray-900">{formatRupiah(item.subtotal || (item.product.price * item.qty))}</p>
              </div>

              <button onClick={() => handleRemove(item.id)}
                className="text-red-500 hover:text-red-700 p-1 rounded transition-colors">
                🗑️
              </button>
            </div>
          ))}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total ({items.length} item)</span>
              <span className="text-2xl font-bold text-blue-600">{formatRupiah(total)}</span>
            </div>
            <button
              onClick={() => setCheckoutModal(true)}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Checkout →
            </button>
          </div>
        </div>
      )}

      {checkoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Konfirmasi Pesanan</h2>
            <div className="mb-4">
              <p className="text-gray-600 text-sm mb-2">Total: <span className="font-bold text-blue-600">{formatRupiah(total)}</span></p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Pengiriman *</label>
              <textarea
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan alamat lengkap pengiriman..."
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCheckoutModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button onClick={handleCheckout} disabled={checkingOut}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition-colors">
                {checkingOut ? 'Memproses...' : 'Buat Pesanan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
