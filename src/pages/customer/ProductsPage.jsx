import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { formatRupiah, getErrorMessage } from '../../utils/helpers'

const CATEGORIES = ['Semua', 'CPU', 'Motherboard', 'RAM', 'Storage', 'GPU', 'PSU', 'Casing']

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('Semua')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/products')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? res.data?.products ?? [])
        setProducts(data)
        setFiltered(data)
      })
      .catch(err => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = products
    if (category !== 'Semua') result = result.filter(p => p.category === category)
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    setFiltered(result)
  }, [category, search, products])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Semua Produk</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari produk..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-16">Tidak ada produk ditemukan.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(product => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="bg-white rounded-xl shadow hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group"
            >
              <div className="bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="object-cover h-full w-full group-hover:scale-105 transition-transform"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <span className="text-5xl">🖥️</span>
                )}
              </div>
              <div className="p-4">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  {product.category}
                </span>
                <h3 className="font-semibold text-gray-900 mt-2 line-clamp-2">{product.name}</h3>
                <p className="text-blue-600 font-bold mt-1">{formatRupiah(product.price)}</p>
                <p className="text-xs text-gray-500 mt-1">Stok: {product.stock}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
