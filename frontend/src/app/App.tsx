import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { CustomerLayout } from '../layouts/CustomerLayout'
import {
  AccountPage,
  AuthPage,
  BrandPage,
  CartPage,
  CheckoutPage,
  CustomerOrdersPage,
  HomePage,
  InfoPage,
  NotFoundPage,
  OrderDetailPage,
  ProductPage,
  ShopPage,
  WholesalePage,
} from '../pages/StorePages'
import { OwnerGuard } from '../components/OwnerGuard'
import { OwnerLoginPage } from '../pages/OwnerLoginPage'

const AdminPage = lazy(() => import('../pages/AdminPage').then((module) => ({ default: module.AdminPage })))

export function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="brands/:slug" element={<BrandPage />} />
        <Route path="product/:id" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="login" element={<AuthPage />} />
        <Route path="register" element={<AuthPage register />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="account/orders" element={<CustomerOrdersPage />} />
        <Route path="account/orders/:id" element={<OrderDetailPage />} />
        <Route path="wholesale" element={<WholesalePage />} />
        <Route path="about" element={<InfoPage page="about" />} />
        <Route path="contact" element={<InfoPage page="contact" />} />
        <Route path="faq" element={<InfoPage page="faq" />} />
        <Route path="shipping" element={<InfoPage page="shipping" />} />
        <Route path="returns" element={<InfoPage page="returns" />} />
        <Route path="privacy" element={<InfoPage page="privacy" />} />
        <Route path="terms" element={<InfoPage page="terms" />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Owner sign-in lives on its own route, outside the customer shell */}
      <Route path="owner/login" element={<OwnerLoginPage />} />
      <Route path="owner" element={<OwnerLoginPage />} />

      {/* Owner & operations portal protected by OwnerGuard */}
      <Route
        path="admin"
        element={
          <OwnerGuard>
            <Suspense fallback={<div className="admin-loading">Loading operations portal…</div>}>
              <AdminPage />
            </Suspense>
          </OwnerGuard>
        }
      />
      <Route
        path="admin/:section"
        element={
          <OwnerGuard>
            <Suspense fallback={<div className="admin-loading">Loading operations portal…</div>}>
              <AdminPage />
            </Suspense>
          </OwnerGuard>
        }
      />
    </Routes>
  )
}
