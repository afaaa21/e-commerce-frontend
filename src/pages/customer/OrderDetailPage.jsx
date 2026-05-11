import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatRupiah, getStatusBadgeClass, getErrorMessage } from '../../utils/helpers'

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data.order ?? res.data))
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  if (!order) return <div className="text-center py-16 text-gray-500">Pesanan tidak ditemukan.</div>

  const items = order.orderItems ?? order.items ?? []
  const total = items.reduce((acc, item) => acc + (Number(item.productPrice ?? item.price) * item.qty), 0)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-6 flex items-center gap-1">
        ← Kembali
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gray-900 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Order #{order.id}</h1>
              {order.shippingAddress && (
                <p className="text-gray-400 text-sm mt-1">📍 {order.shippingAddress}</p>
              )}
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeClass(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Item Pesanan</h2>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{item.productName ?? item.product_name}</p>
                  <p className="text-sm text-gray-500">{item.qty} × {formatRupiah(item.productPrice ?? item.price)}</p>
                </div>
                <p className="font-bold text-gray-900">{formatRupiah(Number(item.productPrice ?? item.price) * item.qty)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-gray-600 font-medium">Total Pembayaran</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatRupiah(order.totalPrice || order.total_price || total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
