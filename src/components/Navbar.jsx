import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-400 hover:text-blue-300">
            <span>🖥️</span>
            <span>TechStore</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/products" className="hover:text-blue-400 transition-colors">Produk</Link>

            {!user && (
              <>
                <Link to="/login" className="hover:text-blue-400 transition-colors">Masuk</Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                  Daftar
                </Link>
              </>
            )}

            {user && user.role === 'customer' && (
              <>
                <Link to="/builder" className="hover:text-blue-400 transition-colors">🔧 PC Builder</Link>
                <Link to="/cart" className="hover:text-blue-400 transition-colors">🛒 Keranjang</Link>
                <Link to="/orders" className="hover:text-blue-400 transition-colors">📦 Pesanan</Link>
                <Link to="/profile" className="hover:text-blue-400 transition-colors">👤 {user.name}</Link>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors">
                  Keluar
                </button>
              </>
            )}

            {user && user.role === 'admin' && (
              <>
                <Link to="/admin" className="hover:text-blue-400 transition-colors">Dashboard</Link>
                {/* PERBAIKAN: Ubah teks agar tidak dobel dengan menu publik */}
                <Link to="/admin/products" className="hover:text-blue-400 transition-colors">Kelola Produk</Link>
                <Link to="/admin/orders" className="hover:text-blue-400 transition-colors">Kelola Pesanan</Link>
                <span className="text-yellow-400 font-semibold">👑 {user.name}</span>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors">
                  Keluar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}