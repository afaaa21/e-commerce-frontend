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

  if (!order) return <div className="text-center py-16 text-slate-500">Pesanan tidak ditemukan.</div>

  const items = order.orderItems ?? order.items ?? []
  const total = items.reduce((acc, item) => acc + (Number(item.productPrice ?? item.price) * item.qty), 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
        <span>←</span>
        Kembali
      </button>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-950 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-300">Detail Pesanan</p>
              <h1 className="mt-1 text-3xl font-bold">Order #{order.id}</h1>
              {order.shippingAddress && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Alamat: {order.shippingAddress}</p>
              )}
            </div>
            <span className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadgeClass(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] sm:p-8">
          <div>
            <h2 className="mb-4 text-lg font-bold text-slate-900">Item Pesanan</h2>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 ring-1 ring-slate-200">
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
          </div>

          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-900">Ringkasan</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Order ID</span>
                <span className="font-semibold text-slate-900">#{order.id}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-slate-900">{order.status}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Jumlah item</span>
                <span className="font-semibold text-slate-900">{items.length}</span>
              </div>
            </div>
            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="text-sm font-medium text-slate-500">Total Pembayaran</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {formatRupiah(order.totalPrice || order.total_price || total)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
