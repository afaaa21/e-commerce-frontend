import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatRupiah, getStatusBadgeClass, getErrorMessage } from '../../utils/helpers'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    api.get('/orders/my')
      .then(res => setOrders(res.data.orders ?? res.data))
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  // Fungsi baru untuk membatalkan pesanan
  const handleCancelOrder = async (e, orderId) => {
    e.preventDefault() // Mencegah klik tombol malah membuka halaman detail
    
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
      return
    }

    setCancellingId(orderId)
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'dibatalkan' })
      // Update data di layar secara instan tanpa perlu refresh
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'dibatalkan' } : o))
      toast.success('Pesanan berhasil dibatalkan')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">📦 Riwayat Pesanan</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">Belum ada pesanan</p>
          <Link to="/products" className="text-blue-600 hover:underline">Mulai belanja →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.id}</p>
                  <p className="font-bold text-gray-900 mt-1">{formatRupiah(order.total_price || order.totalPrice)}</p>
                </div>
                
                <div className="flex flex-col sm:items-end gap-2 text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold w-fit ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                  
                  <div className="flex items-center gap-4 mt-2">
                    {/* Tombol batal hanya muncul jika status masih pending */}
                    {order.status === 'pending' && (
                      <button
                        onClick={(e) => handleCancelOrder(e, order.id)}
                        disabled={cancellingId === order.id}
                        className="text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                      >
                        {cancellingId === order.id ? 'Memproses...' : 'Batalkan Pesanan'}
                      </button>
                    )}
                    <span className="text-xs font-semibold text-blue-600 hover:underline">Lihat detail →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}