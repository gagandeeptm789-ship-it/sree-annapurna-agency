import { useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ArrowRight, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { Notice } from '../components/common'

export function CustomerLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [headerSearch, setHeaderSearch] = useState('')
  const navigate = useNavigate()
  const { cart } = useStore()
  const count = cart.reduce((sum, item) => sum + item.quantity, 0)

  const closeMenu = () => setMenuOpen(false)

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (headerSearch.trim()) {
      navigate(`/shop?search=${encodeURIComponent(headerSearch.trim())}`)
      setHeaderSearch('')
      closeMenu()
    }
  }

  return (
    <div className="customer-shell">
      {/* 1. Refined Top Announcement Bar */}
      <div className="announcement">
        <div className="announcement-content container">
          <span className="announcement-badge">DIRECT FACTORY AGENCY</span>
          <span className="announcement-text">
            Sree Annapurna Agency · Authorized Regional FMCG Wholesale &amp; Retail Distributor
          </span>
          <Link to="/wholesale" className="announcement-link">
            Wholesale Enquiries <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* 2. Professional Header */}
      <header className="site-header">
        <div className="header-inner container">
          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo / Brand Lockup */}
          <Link className="brand-lockup" to="/" onClick={closeMenu}>
            <span className="brand-mark">
              <span>SA</span>
            </span>
            <span className="brand-wordmark">
              <strong>SREE ANNAPURNA</strong>
              <small>AGENCY · WHOLESALE &amp; DISTRIBUTION</small>
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <form className="header-search-form" onSubmit={handleSearchSubmit} role="search">
            <Search size={16} className="search-icon" />
            <input
              type="search"
              placeholder="Search packaged spices, pickles, instant mixes, home care..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              aria-label="Search product catalogue"
            />
            {headerSearch && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setHeaderSearch('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* Desktop Main Navigation */}
          <nav className="main-nav desktop-nav" aria-label="Main navigation">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Home
            </NavLink>
            <NavLink to="/shop" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              All Products
            </NavLink>
            <a href="/#brands" className="nav-link">
              Our Brands
            </a>
            <a href="/#categories" className="nav-link">
              Categories
            </a>
            <NavLink to="/wholesale" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Wholesale Supply
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Our Story
            </NavLink>
          </nav>

          {/* Header Actions (Account, Cart) */}
          <div className="header-actions">
            <Link className="action-btn account-action" aria-label="Customer Account & Orders" to="/account">
              <UserRound size={18} />
              <span className="action-label">Account</span>
            </Link>
            <Link className="action-btn cart-action" aria-label={`Shopping Basket, ${count} items`} to="/cart">
              <span className="cart-icon-wrapper">
                <ShoppingBag size={18} />
                {count > 0 && <span className="cart-badge">{count}</span>}
              </span>
              <span className="action-label">Cart</span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="mobile-drawer-overlay" onClick={closeMenu}>
            <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-drawer-header">
                <div className="brand-lockup">
                  <span className="brand-mark small"><span>SA</span></span>
                  <span className="brand-wordmark">
                    <strong>SREE ANNAPURNA</strong>
                    <small>AGENCY</small>
                  </span>
                </div>
                <button className="icon-btn" onClick={closeMenu} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Search */}
              <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
                <Search size={16} />
                <input
                  type="search"
                  placeholder="Search products..."
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                />
              </form>

              <nav className="mobile-nav-links">
                <NavLink onClick={closeMenu} to="/" end className="mobile-nav-item">
                  Home
                </NavLink>
                <NavLink onClick={closeMenu} to="/shop" className="mobile-nav-item">
                  Browse All 33 Products
                </NavLink>
                <a href="/#brands" onClick={closeMenu} className="mobile-nav-item">
                  Our 6 Principal Brands
                </a>
                <a href="/#categories" onClick={closeMenu} className="mobile-nav-item">
                  Product Categories
                </a>
                <NavLink onClick={closeMenu} to="/wholesale" className="mobile-nav-item">
                  Wholesale &amp; Institutional Supply
                </NavLink>
                <NavLink onClick={closeMenu} to="/about" className="mobile-nav-item">
                  Company Story &amp; Heritage
                </NavLink>
                <NavLink onClick={closeMenu} to="/account" className="mobile-nav-item">
                  My Orders &amp; Account
                </NavLink>
              </nav>

              <div className="mobile-drawer-footer">
                <p className="mobile-agency-note">
                  <strong>Authorized Regional Agency</strong>
                  <span>Direct distributor for Swastik, Rala, Monkey 555, Monkey VVV, Aruna Masala &amp; Deeppam.</span>
                </p>
                <Link to="/wholesale" onClick={closeMenu} className="button button-primary full-button">
                  Trade Enquiries
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Professional Footer */}
      <footer className="site-footer">
        <div className="footer-top-strip">
          <div className="container footer-strip-inner">
            <span>🛡️ 100% Genuine Factory-Sealed Packaging</span>
            <span>📦 Wholesale B2B &amp; Direct Retail Fulfilment</span>
            <span>📍 Regional Carrying &amp; Forwarding Agency</span>
          </div>
        </div>

        <div className="footer-main container">
          <div className="footer-col footer-brand-col">
            <Link className="brand-lockup" to="/">
              <span className="brand-mark"><span>SA</span></span>
              <span className="brand-wordmark">
                <strong>SREE ANNAPURNA</strong>
                <small>AGENCY · DISTRIBUTION</small>
              </span>
            </Link>
            <p className="footer-about-text">
              Authorized regional carrying, forwarding, and wholesale distribution agency representing premier South Indian packaged food manufacturers and household sanitation essentials.
            </p>
            <div className="footer-brands-pills">
              <span>Swastik</span>
              <span>Rala</span>
              <span>Monkey 555</span>
              <span>Monkey VVV</span>
              <span>Aruna Masala</span>
              <span>Deeppam</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Product Catalogue</h4>
            <Link to="/shop">All 33 Products</Link>
            <Link to="/#brands">Our 6 Brand Partners</Link>
            <Link to="/shop?category=Pickles">Swastik Pickles</Link>
            <Link to="/shop?category=Spice+powders">Spices &amp; Blends</Link>
            <Link to="/shop?category=Cleaning+tools">Cleaning &amp; Sanitation</Link>
            <Link to="/shop?category=Pooja+essentials">Pooja Oils</Link>
          </div>

          <div className="footer-col">
            <h4>Trade &amp; Support</h4>
            <Link to="/wholesale">Wholesale Supply Registration</Link>
            <Link to="/about">About Sree Annapurna Agency</Link>
            <Link to="/contact">Business Contact &amp; Location</Link>
            <Link to="/shipping">Delivery &amp; Logistics Policy</Link>
            <Link to="/faq">Frequently Asked Questions</Link>
            <Link to="/account/orders">Track My Order</Link>
          </div>

          <div className="footer-col footer-contact-col">
            <h4>Agency Office</h4>
            <p className="contact-address">
              <strong>Sree Annapurna Agency</strong><br />
              Wholesale Market Yard, APMC Road<br />
              Shimoga, Karnataka — 577201
            </p>
            <p className="contact-lines">
              <span>Supply Desk: Retail &amp; Kirana Distribution</span>
              <span>Trade Timings: Mon – Sat (9:00 AM – 7:30 PM)</span>
            </p>
          </div>
        </div>

        <div className="footer-bottom container">
          <p>© {new Date().getFullYear()} Sree Annapurna Agency. All rights reserved. Packaged goods distribution.</p>
          <div className="footer-bottom-links">
            <span>Authentic FMCG Stock</span>
            <span className="separator">·</span>
            <Link to="/admin" className="admin-demo-link" title="Open Owner Operations Console">
              Operations Console ↗
            </Link>
          </div>
        </div>
      </footer>

      {/* Global Notification Toast */}
      <Notice />
    </div>
  )
}
