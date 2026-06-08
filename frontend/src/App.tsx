/**
 * App.tsx — Root routing configuration
 *
 * THAY ĐỔI:
 * - /admin/login → /login (chung cho admin + staff)
 * - Thêm /staff/* routes cho StaffLayout
 * - /admin/login redirect về /login (backward compatible)
 * - Thêm trang InvoiceManage cho admin
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';

import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';
import PublicLayout from './layouts/PublicLayout';
import Login from './pages/Login';
import Dashboard from './pages/Admin/Dashboard';

import CategoryManage from './pages/Admin/Menu/CategoryManage';
import ProductManage from './pages/Admin/Menu/ProductManage';
import ToppingManage from './pages/Admin/Menu/ToppingManage';

import AreaManage from './pages/Admin/Areas/AreaManage';
import TableManage from './pages/Admin/Tables/TableManage';

import OrderManage from './pages/Admin/Orders/OrderManage';
import InvoiceManage from './pages/Admin/Invoices/InvoiceManage';

import UserManage from './pages/Admin/Users/UserManage';
import CouponManage from './pages/Admin/Coupons/CouponManage';
import ProfilePage from './pages/Admin/ProfilePage';

// Staff pages
import POSPage from './pages/Staff/POSPage';
import StaffOrderBoard from './pages/Staff/StaffOrderBoard';
import TableMapPage from './pages/Staff/TableMapPage';
import StaffInvoiceList from './pages/Staff/StaffInvoiceList';

// Public pages
import MenuPage from './pages/Public/MenuPage';
import CheckoutPage from './pages/Public/CheckoutPage';
import TrackingPage from './pages/Public/TrackingPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Login (chung) ──────────────────────────── */}
          <Route path="/login" element={<Login />} />
          {/* Backward compatible — redirect old login URL */}
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />

          {/* ── Public routes (khách quét QR) ──────────── */}
          <Route path="/table/:tableCode" element={<PublicLayout />}>
            <Route index element={<MenuPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="tracking" element={<TrackingPage />} />
          </Route>

          {/* ── Admin routes ──────────────────────────── */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pos" element={<POSPage />} />

            <Route path="categories" element={<CategoryManage />} />
            <Route path="products" element={<ProductManage />} />
            <Route path="toppings" element={<ToppingManage />} />

            <Route path="areas" element={<AreaManage />} />
            <Route path="tables" element={<TableManage />} />

            <Route path="orders" element={<OrderManage />} />
            <Route path="invoices" element={<InvoiceManage />} />

            <Route path="users" element={<UserManage />} />
            <Route path="coupons" element={<CouponManage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* ── Staff routes ──────────────────────────── */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<Navigate to="pos" replace />} />
            <Route path="pos" element={<POSPage />} />
            <Route path="orders" element={<StaffOrderBoard />} />
            <Route path="tables" element={<TableMapPage />} />
            <Route path="invoices" element={<StaffInvoiceList />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* ── Root ──────────────────────────────────── */}
          <Route path="/" element={
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100vh', background: '#faf8f5', fontFamily: 'var(--admin-font)',
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 48, marginBottom: 12 }}>☕</p>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#292018' }}>Quán Cafe</h2>
                <p style={{ color: '#a8a29e', marginTop: 8, fontSize: 14 }}>Quét mã QR trên bàn để đặt món</p>
              </div>
            </div>
          } />

          <Route path="*" element={
            <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--admin-font)' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#292018' }}>404 — Không tìm thấy</h2>
            </div>
          } />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
