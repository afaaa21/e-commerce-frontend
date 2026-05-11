import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatRupiah, getStatusBadgeClass, getErrorMessage } from '../../utils/helpers'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/my')
      .then(res => setOrders(res.data.orders ?? res.data))
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.id}</p>
                  <p className="font-bold text-gray-900 mt-1">{formatRupiah(order.total_price || order.totalPrice)}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">Lihat detail →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
