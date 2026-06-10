import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatRupiah, getStatusBadgeClass, getErrorMessage } from '../../utils/helpers'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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

  const filteredOrders = orders.filter(order => {
    const keyword = search.toLowerCase()
    const total = String(order.total_price || order.totalPrice || '')
    return String(order.id).includes(keyword) || order.status?.toLowerCase().includes(keyword) || total.includes(keyword)
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-blue-600">TechStore Orders</p>
        <h1 className="text-3xl font-bold text-slate-900">Riwayat Pesanan</h1>
        <p className="mt-1 text-sm text-slate-500">Pantau status transaksi dan detail pesanan komponen PC kamu.</p>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-slate-900">Daftar Pesanan</p>
          <p className="text-sm text-slate-500">{filteredOrders.length} dari {orders.length} pesanan ditampilkan</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari ID, status, atau total..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-80"
        />
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
          <p className="mb-4 text-lg font-semibold text-slate-700">Belum ada pesanan</p>
          <Link to="/products" className="font-semibold text-blue-600 hover:underline">Mulai belanja →</Link>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-slate-500 shadow-sm">Pesanan tidak ditemukan.</div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map(order => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600 ring-1 ring-blue-100">
                    #{order.id}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Order #{order.id}</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{formatRupiah(order.total_price || order.totalPrice)}</p>
                    <p className="mt-1 text-xs text-slate-400">Klik untuk melihat rincian pesanan</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold text-blue-600">Lihat detail →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
