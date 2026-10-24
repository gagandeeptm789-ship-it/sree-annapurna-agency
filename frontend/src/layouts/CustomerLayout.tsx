import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { Notice } from '../components/common'

export function CustomerLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { cart } = useStore()
  const count = cart.reduce((sum, item) => sum + item.quantity, 0)
  const closeMenu = () => setMenuOpen(false)
  return (
    <div className="customer-shell">
      <div className="announcement"><span>Sree Annapurna Agency · Authorized Regional Brand Distributor</span><Link to="/wholesale">Wholesale enquiries <span aria-hidden="true">→</span></Link></div>
      <header className="site-header">
        <button className="mobile-menu icon-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <Link className="brand-lockup" to="/" onClick={closeMenu}><span className="brand-mark">sa<span>.</span></span><span className="brand-wordmark"><strong>SREE ANNAPURNA</strong><small>AGENCY</small></span></Link>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <NavLink onClick={closeMenu} to="/" end>Home</NavLink>
          <NavLink onClick={closeMenu} to="/shop">Shop all</NavLink>
          <a href="/#brands" onClick={closeMenu}>Our brands</a>
          <a href="/#categories" onClick={closeMenu}>Categories</a>
          <NavLink onClick={closeMenu} to="/wholesale">Wholesale</NavLink>
          <NavLink onClick={closeMenu} to="/about">Our story</NavLink>
        </nav>
        <div className="header-actions">
          <Link className="icon-button header-icon" aria-label="Search products" to="/shop"><Search /></Link>
          <Link className="icon-button header-icon" aria-label="Account" to="/account"><UserRound /></Link>
          <Link className="icon-button header-icon cart-icon" aria-label={`Basket, ${count} items`} to="/cart"><ShoppingBag />{count > 0 && <span className="cart-count">{count}</span>}</Link>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand"><Link className="brand-lockup" to="/"><span className="brand-mark">sa<span>.</span></span><span className="brand-wordmark"><strong>SREE ANNAPURNA</strong><small>AGENCY</small></span></Link><p>Authorized regional distributor representing Swastik, Rala, Monkey 555, Monkey VVV, Aruna Masala, and Deeppam Aarti.</p></div>
          <div><h4>Explore</h4><Link to="/shop">Shop all</Link><Link to="/#brands">Our brands</Link><Link to="/wholesale">Wholesale</Link><Link to="/about">About us</Link></div>
          <div><h4>Help & information</h4><Link to="/contact">Contact</Link><Link to="/faq">Frequently asked questions</Link><Link to="/shipping">Shipping policy</Link><Link to="/returns">Returns policy</Link></div>
          <div><h4>Business details</h4><p>Supplying supermarkets, grocery stores, and households with authentic regional branded products.</p></div>
        </div>
        <div className="footer-bottom"><span>Sree Annapurna Agency © {new Date().getFullYear()}</span><span>Authentic Brands & Household Essentials</span><Link to="/admin">Operations demo ↗</Link></div>
      </footer>
      <Notice />
    </div>
  )
}
