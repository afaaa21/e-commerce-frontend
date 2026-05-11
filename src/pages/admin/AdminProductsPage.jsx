import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatRupiah, getErrorMessage } from '../../utils/helpers'

const CATEGORIES = ['CPU', 'Motherboard', 'RAM', 'Storage', 'GPU', 'PSU', 'Casing']
const EMPTY_FORM = { name: '', price: '', category: 'CPU', stock: '', image_url: '', specs: '{}' }

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const fetchProducts = () => {
    api.get('/products')
      .then(res => setProducts(res.data.products ?? res.data))
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setModal('add')
  }

  const openEdit = (product) => {
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
      image_url: product.image_url || '',
      specs: product.specs ? JSON.stringify(product.specs, null, 2) : '{}',
    })
    setModal({ type: 'edit', id: product.id })
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let specsObj = {}
      try { specsObj = JSON.parse(form.specs) } catch { specsObj = {} }

      const payload = {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock),
        image_url: form.image_url || null,
        specs: specsObj,
      }

      if (modal === 'add') {
        await api.post('/products', payload)
        toast.success('Produk berhasil ditambahkan!')
      } else {
        await api.put(`/products/${modal.id}`, payload)
        toast.success('Produk berhasil diperbarui!')
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

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📦 Manajemen Produk</h1>
        <button onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
          + Tambah Produk
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari produk..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">ID</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Nama</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Kategori</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Harga</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Stok</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada produk</td></tr>
                ) : filtered.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-500">#{product.id}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">{product.name}</td>
                    <td className="px-5 py-4">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{formatRupiah(product.price)}</td>
                    <td className="px-5 py-4">
                      <span className={product.stock > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(product)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs px-3 py-1 border border-blue-200 rounded-lg hover:bg-blue-50">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(product.id, product.name)}
                          className="text-red-600 hover:text-red-800 font-medium text-xs px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50">
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

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg my-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              {modal === 'add' ? '+ Tambah Produk Baru' : '✏️ Edit Produk'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                <input type="text" name="image_url" value={form.image_url} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spesifikasi (JSON)</label>
                <textarea name="specs" value={form.specs} onChange={handleChange} rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  placeholder='{"socket": "AM4", "cores": 6}' />
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
