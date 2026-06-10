import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatRupiah, getErrorMessage } from '../../utils/helpers'

const CATEGORIES = ['CPU', 'Motherboard', 'RAM', 'Storage', 'GPU', 'PSU', 'Casing']
const ITEMS_PER_PAGE = 5
// Spesifikasi di-set string kosong '' agar menerima ketikan teks bebas biasa
const EMPTY_FORM = { name: '', price: '', category: 'CPU', stock: '', specs: '' }

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedFile, setSelectedFile] = useState(null) // State untuk menyimpan file gambar fisik
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchProducts = () => {
    api.get('/products')
      .then(res => setProducts(res.data.products ?? res.data))
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  useEffect(() => { setCurrentPage(1) }, [search, dateFrom, dateTo])

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setSelectedFile(null) // Reset pilihan file gambar
    setModal('add')
  }

  const openEdit = (product) => {
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
      specs: product.specs || '', // Memuat data string spesifikasi bebas dari database
    })
    setSelectedFile(null) // Reset pilihan file gambar baru saat mulai edit
    setModal({ type: 'edit', id: product.id })
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  
  // Fungsi penangkap file gambar fisik yang di-upload admin
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      // Menggunakan objek FormData agar file fisik gambar bisa terkirim lewat network
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('price', form.price)
      formData.append('category', form.category)
      formData.append('stock', form.stock)
      formData.append('specs', form.specs) // Mengirimkan ketikan teks deskripsi bebas biasa

      // Jika admin mengunggah file gambar baru, masukkan ke form-data
      if (selectedFile) {
        formData.append('image', selectedFile) // Key 'image' harus sama dengan upload.single('image') backend
      }

      // Set konfigurasi header wajib multipart/form-data
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      }

      if (modal === 'add') {
        await api.post('/products', formData, config)
        toast.success('Produk berhasil ditambahkan ke AWS S3!')
      } else {
        await api.put(`/products/${modal.id}`, formData, config)
        toast.success('Produk & berkas S3 berhasil diperbarui!')
      }
      
      setModal(null)
      fetchProducts()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus produk "${name}"?`)) return
    try {
      await api.delete(`/products/${id}`)
      toast.success('Produk dihapus')
      setProducts(products.filter(p => p.id !== id))
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const filtered = products.filter(p => {
    const keyword = search.toLowerCase()
    const matchesSearch = p.name.toLowerCase().includes(keyword) || p.category.toLowerCase().includes(keyword) || String(p.price).includes(keyword) || String(p.stock).includes(keyword)
    if (!matchesSearch) return false
    if (dateFrom || dateTo) {
      const created = p.createdAt || p.created_at || p.date
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 7.5 12 3l8 4.5-8 4.5L4 7.5Z" />
                <path d="M4 7.5v9L12 21l8-4.5v-9" />
                <path d="M12 12v9" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Admin Produk</p>
              <h1 className="text-2xl font-bold text-slate-900">Manajemen Produk</h1>
              <p className="mt-1 text-sm text-slate-500">Kelola katalog, harga, kategori, dan stok produk TechStore.</p>
            </div>
          </div>
          <button onClick={openAdd}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
            + Tambah Produk
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Daftar Produk</p>
          <p className="text-xs text-slate-500">{filtered.length} produk ditampilkan dari {products.length} total item</p>
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
            placeholder="Cari nama, kategori, harga..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-900">
                <tr>
                  <th className="text-left px-5 py-4 font-semibold text-slate-100">ID</th>
                  <th className="text-left px-5 py-4 font-semibold text-slate-100">Gambar</th>
                  <th className="text-left px-5 py-4 font-semibold text-slate-100">Nama</th>
                  <th className="text-left px-5 py-4 font-semibold text-slate-100">Kategori</th>
                  <th className="text-left px-5 py-4 font-semibold text-slate-100">Harga</th>
                  <th className="text-left px-5 py-4 font-semibold text-slate-100">Stok</th>
                  <th className="text-left px-5 py-4 font-semibold text-slate-100">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">Tidak ada produk</td></tr>
                ) : paginated.map((product, index) => (
                  <tr key={product.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">#{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                        {product.image_url || product.imageUrl || product.image ? (
                          <img
                            src={product.image_url || product.imageUrl || product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={e => { e.currentTarget.style.display = 'none' }}
                          />
                        ) : (
                          <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M4 5h16v11H4z" />
                            <path d="M9 20h6" />
                            <path d="M12 16v4" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{product.name}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">{formatRupiah(product.price)}</td>
                    <td className="px-5 py-4">
                      <span className={product.stock > 0 ? 'rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100' : 'rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-100'}>
                        {product.stock} unit
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(product)}
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(product.id, product.name)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg my-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              {modal === 'add' ? 'Tambah Produk Baru' : 'Edit Produk'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp) *</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} required min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok *</label>
                  <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Gambar File *</label>
                <input type="file" accept="image/*" onChange={handleFileChange} required={modal === 'add'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spesifikasi / Deskripsi Produk</label>
                <textarea name="specs" value={form.specs} onChange={handleChange} rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Contoh: Socket AM5, 6 Cores, Garansi Resmi 3 Tahun..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// test push s3
