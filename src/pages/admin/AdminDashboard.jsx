import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatRupiah, getErrorMessage } from '../../utils/helpers'

const formatOrderDate = (order) => {
  const value = order.createdAt || order.created_at || order.orderDate || order.date
  if (!value) return '—'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

const ITEMS_PER_PAGE = 5

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(recentOrders.length / ITEMS_PER_PAGE))
  const paginated = recentOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const visiblePages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1)

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
        setRecentOrders(orders)
      })
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Produk', value: stats.products, icon: 'P', color: 'bg-blue-600' },
    { label: 'Total Pesanan', value: stats.orders, icon: 'O', color: 'bg-emerald-600' },
    { label: 'Pendapatan', value: formatRupiah(stats.revenue), icon: 'Rp', color: 'bg-amber-500' },
    { label: 'Pelanggan', value: stats.customers, icon: 'C', color: 'bg-slate-700' },
  ]

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600 ring-1 ring-blue-100">
              TS
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Admin Overview</p>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard TechStore</h1>
              <p className="mt-1 text-sm text-slate-500">Ringkasan performa produk, pesanan, pelanggan, dan pendapatan toko.</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-blue-100">
            Admin Panel
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {statCards.map(card => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
              <div className={`${card.color} flex h-12 w-12 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pesanan Terbaru</h2>
            <p className="text-sm text-slate-500">{recentOrders.length} transaksi yang masuk ke sistem</p>
          </div>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">Belum ada pesanan</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900">
                <tr className="text-left">
                  <th className="px-6 py-4 font-semibold text-slate-100">Order ID</th>
                  <th className="px-6 py-4 font-semibold text-slate-100">Tanggal</th>
                  <th className="px-6 py-4 font-semibold text-slate-100">Pelanggan</th>
                  <th className="px-6 py-4 font-semibold text-slate-100">Total</th>
                  <th className="px-6 py-4 font-semibold text-slate-100">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((order, index) => (
                  <tr key={order.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td className="px-6 py-4 text-slate-600">{formatOrderDate(order)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{order.user?.name || '—'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{formatRupiah(order.totalPrice || order.total_price || 0)}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
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
        {recentOrders.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-2 border-t border-slate-200 px-6 py-4">
            <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50">&lt;</button>
            {visiblePages.map(page => (
              <button key={page} type="button" onClick={() => setCurrentPage(page)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>{page}</button>
            ))}
            {totalPages > 5 && <span className="px-1 text-sm font-semibold text-slate-400">...</span>}
            {totalPages > 5 && (
              <button type="button" onClick={() => setCurrentPage(totalPages)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${currentPage === totalPages ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>{totalPages}</button>
            )}
            <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50">&gt;</button>
          </div>
        )}
      </div>
    </div>
  )
}
