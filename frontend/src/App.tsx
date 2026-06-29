import { Routes, Route } from 'react-router-dom';
import StorefrontLayout from './components/Layout/StorefrontLayout';
import AdminLayout from './components/Layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import LandingPage from './features/storefront/LandingPage';
import CatalogPage from './features/storefront/CatalogPage';
import ProductDetailPage from './features/storefront/ProductDetailPage';
import CartPage from './features/storefront/CartPage';
import WishlistPage from './features/storefront/WishlistPage';
import CheckoutPage from './features/storefront/CheckoutPage';
import OrderConfirmationPage from './features/storefront/OrderConfirmationPage';
import OrderHistoryPage from './features/storefront/OrderHistoryPage';
import OrderDetailPage from './features/storefront/OrderDetailPage';

import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';

import NotFoundPage from './features/storefront/NotFoundPage';
import AdminDashboardPage from './features/admin/AdminDashboardPage';
import AdminProductsPage from './features/admin/AdminProductsPage';
import ProductFormPage from './features/admin/ProductFormPage';
import AdminOrdersPage from './features/admin/AdminOrdersPage';
import AdminCategoriesPage from './features/admin/AdminCategoriesPage';

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
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
      </Route>

      {/* Storefront */}
      <Route element={<StorefrontLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="/shop" element={<CatalogPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
