import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import ProductsPage from './pages/customer/ProductsPage'
import ProductDetailPage from './pages/customer/ProductDetailPage'
import CartPage from './pages/customer/CartPage'
import OrdersPage from './pages/customer/OrdersPage'
import OrderDetailPage from './pages/customer/OrderDetailPage'
import ProfilePage from './pages/customer/ProfilePage'
import PCBuilderPage from './pages/customer/PCBuilderPage'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/products" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />

              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/builder" element={<ProtectedRoute><PCBuilderPage /></ProtectedRoute>} />

              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />

              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <h1 className="text-6xl font-bold text-gray-200">404</h1>
                  <p className="text-gray-500 mt-4">Halaman tidak ditemukan</p>
                  <a href="/" className="mt-4 text-blue-600 hover:underline">← Kembali ke beranda</a>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
