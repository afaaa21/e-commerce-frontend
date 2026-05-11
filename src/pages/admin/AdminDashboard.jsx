import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatRupiah, getErrorMessage } from '../../utils/helpers'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/products'),
      api.get('/orders'),
    ])
      .then(([productsRes, ordersRes]) => {
        const products = productsRes.data.products ?? productsRes.data
        const orders = ordersRes.data.orders ?? ordersRes.data
        const revenue = orders.reduce((acc, o) => acc + Number(o.totalPrice || o.total_price || 0), 0)
        const uniqueCustomers = new Set(orders.map(o => o.userId || o.user?.id)).size
        setStats({ products: products.length, orders: orders.length, customers: uniqueCustomers, revenue })
        setRecentOrders(orders.slice(0, 5))
      })
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Produk', value: stats.products, icon: '📦', color: 'bg-blue-500' },
    { label: 'Total Pesanan', value: stats.orders, icon: '🛒', color: 'bg-green-500' },
    { label: 'Pendapatan', value: formatRupiah(stats.revenue), icon: '💰', color: 'bg-yellow-500' },
    { label: 'Pelanggan', value: stats.customers, icon: '👥', color: 'bg-purple-500' },
  ]

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">👑 Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 text-lg mb-4">Pesanan Terbaru</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-sm">Belum ada pesanan</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-3 font-semibold text-gray-600">Order ID</th>
                  <th className="pb-3 font-semibold text-gray-600">Pelanggan</th>
                  <th className="pb-3 font-semibold text-gray-600">Total</th>
                  <th className="pb-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td className="py-3 text-gray-700">#{order.id}</td>
                    <td className="py-3 text-gray-700">{order.user?.name || '—'}</td>
                    <td className="py-3 font-medium text-gray-900">{formatRupiah(order.totalPrice || order.total_price || 0)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'diproses' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'dikirim' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
