import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatRupiah, getStatusBadgeClass, getErrorMessage } from '../../utils/helpers'

const STATUS_OPTIONS = ['pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan']
const ITEMS_PER_PAGE = 5

const formatOrderDate = (order) => {
  const value = order.createdAt || order.created_at || order.orderDate || order.date
  if (!value) return '—'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [detailModal, setDetailModal] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

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

  useEffect(() => { setCurrentPage(1) }, [search, dateFrom, dateTo])

  const filtered = orders.filter(o => {
    const keyword = search.toLowerCase()
    const total = String(o.totalPrice || o.total_price || '')
    const matchesSearch = String(o.id).includes(keyword) || o.user?.name?.toLowerCase().includes(keyword) || o.status?.toLowerCase().includes(keyword) || total.includes(keyword)
    if (!matchesSearch) return false
    if (dateFrom || dateTo) {
      const created = o.createdAt || o.created_at || o.orderDate || o.date
      if (created) {
        const createdDate = new Date(created).setHours(0, 0, 0, 0)
        if (dateFrom && createdDate < new Date(dateFrom).setHours(0, 0, 0, 0)) return false
        if (dateTo && createdDate > new Date(dateTo).setHours(23, 59, 59, 999)) return false
      }
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const visiblePages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1)

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M7 4h10a2 2 0 0 1 2 2v14l-3-2-2 2-2-2-2 2-2-2-3 2V6a2 2 0 0 1 2-2Z" />
              <path d="M9 9h6" />
              <path d="M9 13h6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-600">Admin Pesanan</p>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Pesanan</h1>
            <p className="mt-1 text-sm text-slate-500">Pantau pesanan, status pengiriman, dan detail transaksi pelanggan.</p>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Daftar Pesanan</p>
            <p className="text-xs text-slate-500">{filtered.length} pesanan ditampilkan dari {orders.length} total</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-400">sampai</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari ID, pelanggan, status..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-56"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-900">
              <tr>
                <th className="text-left px-5 py-4 font-semibold text-slate-100">Order ID</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-100">Tanggal</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-100">Pelanggan</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-100">Total</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-100">Status</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-100">Update Status</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-100">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Pesanan tidak ditemukan</td></tr>
              ) : paginated.map((order, index) => (
                <tr key={order.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">#{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                  <td className="px-5 py-4 text-slate-600">{formatOrderDate(order)}</td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{order.user?.name || '—'}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900">
                    {formatRupiah(order.totalPrice || order.total_price || 0)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="relative">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id || order.status === 'dibatalkan'}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-9 text-sm font-medium text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-60"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {order.status === 'dibatalkan' && (
                      <p className="mt-1 text-[11px] font-medium text-red-500">Dibatalkan</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => openDetail(order.id)}
                      className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
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

      {filtered.length > ITEMS_PER_PAGE && (
        <div className="mt-4 flex items-center justify-center gap-2">
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

      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-950 px-6 py-4 text-white">
              <div>
                <p className="text-sm font-medium text-blue-300">Detail Pesanan</p>
                <h2 className="text-xl font-bold">Order #{detailModal}</h2>
              </div>
              <button
                onClick={() => { setDetailModal(null); setDetailData(null) }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              {loadingDetail ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : detailData ? (
                <>
                  <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
                      <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(detailData.status)}`}>
                        {detailData.status}
                      </span>
                    </div>
                    {detailData.shippingAddress && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Alamat</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{detailData.shippingAddress}</p>
                      </div>
                    )}
                    {detailData.createdAt && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tanggal</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(detailData.createdAt))}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Order ID</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">#{detailModal}</p>
                    </div>
                  </div>

                  <h3 className="mb-3 text-sm font-bold text-slate-900">Item Pesanan</h3>
                  <div className="space-y-3">
                    {(detailData.orderItems ?? detailData.items ?? []).map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M4 5h16v11H4z" />
                              <path d="M9 20h6" />
                              <path d="M12 16v4" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{item.productName ?? item.product_name}</p>
                            <p className="text-sm text-slate-500">{item.qty} × {formatRupiah(item.productPrice ?? item.price)}</p>
                          </div>
                        </div>
                        <p className="font-bold text-slate-900">{formatRupiah(Number(item.productPrice ?? item.price) * item.qty)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                    <span className="font-semibold text-slate-700">Total Pembayaran</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatRupiah(detailData.totalPrice || detailData.total_price || 0)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="py-12 text-center text-sm text-slate-400">Data pesanan tidak ditemukan.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
