export function formatRupiah(amount) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num)
}

export function getStatusBadgeClass(status) {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    diproses: 'bg-blue-100 text-blue-800',
    dikirim: 'bg-purple-100 text-purple-800',
    selesai: 'bg-green-100 text-green-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

export function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Terjadi kesalahan'
}
