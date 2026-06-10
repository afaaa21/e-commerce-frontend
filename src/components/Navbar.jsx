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
    <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 text-white shadow-sm backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold text-white hover:text-blue-200">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 5h16v11H4z" />
                <path d="M9 20h6" />
                <path d="M12 16v4" />
              </svg>
            </span>
            <span>TechStore</span>
          </Link>

          <div className="flex items-center gap-2 text-sm font-medium">
            <Link to="/products" className="rounded-lg px-3 py-2 text-slate-200 transition-colors hover:bg-slate-800 hover:text-blue-300">Produk</Link>

            {!user && (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-slate-200 transition-colors hover:bg-slate-800 hover:text-blue-300">Masuk</Link>
                <Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700">
                  Daftar
                </Link>
              </>
            )}

            {user && user.role === 'customer' && (
              <>
                <Link to="/builder" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-slate-200 transition-colors hover:bg-slate-800 hover:text-blue-300">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M14.7 6.3a4 4 0 0 0-5 5L4 17v3h3l5.7-5.7a4 4 0 0 0 5-5l-2.2 2.2-3-3 2.2-2.2Z" />
                  </svg>
                  PC Builder
                </Link>
                <Link to="/cart" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-slate-200 transition-colors hover:bg-slate-800 hover:text-blue-300">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M5 6h16l-2 8H8L5 3H2" />
                    <path d="M9 20h.01" />
                    <path d="M18 20h.01" />
                  </svg>
                  Keranjang
                </Link>
                <Link to="/orders" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-slate-200 transition-colors hover:bg-slate-800 hover:text-blue-300">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 4h12v16H6z" />
                    <path d="M9 8h6" />
                    <path d="M9 12h6" />
                  </svg>
                  Pesanan
                </Link>
                <Link to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-200 transition-colors hover:bg-slate-800 hover:text-blue-300">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-blue-300 ring-1 ring-slate-700">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  {user.name}
                </Link>
                <button onClick={handleLogout} className="rounded-lg bg-red-600 px-4 py-2 font-semibold transition-colors hover:bg-red-700">
                  Keluar
                </button>
              </>
            )}

            {user && user.role === 'admin' && (
              <>
                <Link to="/admin" className="rounded-lg px-3 py-2 text-slate-200 transition-colors hover:bg-slate-800 hover:text-blue-300">Dashboard</Link>
                <Link to="/admin/products" className="rounded-lg px-3 py-2 text-slate-200 transition-colors hover:bg-slate-800 hover:text-blue-300">Produk</Link>
                <Link to="/admin/orders" className="rounded-lg px-3 py-2 text-slate-200 transition-colors hover:bg-slate-800 hover:text-blue-300">Pesanan</Link>
                <span className="flex items-center gap-2 font-semibold text-blue-300">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-xs ring-1 ring-blue-400/30">
                    {user.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                  {user.name}
                </span>
                <button onClick={handleLogout} className="rounded-lg bg-red-600 px-4 py-2 font-semibold transition-colors hover:bg-red-700">
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
