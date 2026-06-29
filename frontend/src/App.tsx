import { Routes, Route } from 'react-router-dom';
import StorefrontLayout from './components/Layout/StorefrontLayout';
import AdminLayout from './components/Layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import CatalogPage from './features/storefront/CatalogPage';
import ProductDetailPage from './features/storefront/ProductDetailPage';
import CartPage from './features/storefront/CartPage';
import CheckoutPage from './features/storefront/CheckoutPage';
import OrderConfirmationPage from './features/storefront/OrderConfirmationPage';
import OrderHistoryPage from './features/storefront/OrderHistoryPage';
import OrderDetailPage from './features/storefront/OrderDetailPage';

import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';

import AdminDashboardPage from './features/admin/AdminDashboardPage';
import AdminProductsPage from './features/admin/AdminProductsPage';
import ProductFormPage from './features/admin/ProductFormPage';
import AdminOrdersPage from './features/admin/AdminOrdersPage';

export default function App() {
  return (
    <Routes>
      {/* Auth pages (no layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Admin panel */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
      </Route>

      {/* Storefront */}
      <Route element={<StorefrontLayout />}>
        <Route index element={<CatalogPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-confirmation/:orderId"
          element={
            <ProtectedRoute>
              <OrderConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
