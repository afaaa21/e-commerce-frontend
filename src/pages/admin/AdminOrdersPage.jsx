import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatRupiah, getStatusBadgeClass, getErrorMessage } from '../../utils/helpers'

const STATUS_OPTIONS = ['pending', 'diproses', 'dikirim', 'selesai']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [detailModal, setDetailModal] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    api.get('/orders')
      .then(res => setOrders(res.data.orders ?? res.data))
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus })
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      toast.success('Status pesanan diperbarui')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUpdatingId(null)
    }
  }

  const openDetail = async (orderId) => {
    setDetailModal(orderId)
    setLoadingDetail(true)
    try {
      const res = await api.get(`/orders/${orderId}`)
      setDetailData(res.data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoadingDetail(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">📑 Manajemen Pesanan</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Order ID</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Pelanggan</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Total</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Update Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada pesanan</td></tr>
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-gray-500 font-medium">#{order.id}</td>
                  <td className="px-5 py-4 text-gray-800">{order.user?.name || '—'}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900">
                    {formatRupiah(order.totalPrice || order.total_price || 0)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => openDetail(order.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs px-3 py-1 border border-blue-200 rounded-lg hover:bg-blue-50"
                    >
                      Lihat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Detail Order #{detailModal}</h2>
              <button onClick={() => { setDetailModal(null); setDetailData(null) }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>

            {loadingDetail ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : detailData ? (
              <>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                  <p><span className="text-gray-500">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(detailData.status)}`}>{detailData.status}</span></p>
                  {detailData.shippingAddress && <p><span className="text-gray-500">Alamat:</span> {detailData.shippingAddress}</p>}
                </div>
                <div className="space-y-2">
                  {(detailData.orderItems ?? detailData.items ?? []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-800">{item.productName ?? item.product_name}</p>
                        <p className="text-xs text-gray-500">{item.qty} × {formatRupiah(item.productPrice ?? item.price)}</p>
                      </div>
                      <p className="font-bold text-gray-900">{formatRupiah(Number(item.productPrice ?? item.price) * item.qty)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatRupiah(detailData.totalPrice || detailData.total_price || 0)}
                  </span>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
