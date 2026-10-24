import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  MapPin,
  Menu,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
  X,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { Notice } from '../components/common'

const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'nav-link active' : 'nav-link')

export function CustomerLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [headerSearch, setHeaderSearch] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { cart, products, brands } = useStore()
  const count = cart.reduce((sum, item) => sum + item.quantity, 0)
  const activeProducts = products.filter((product) => product.active)

  const closeMenu = () => setMenuOpen(false)

  // Anchor links such as /#brands should resolve without a full page reload.
  useEffect(() => {
    closeMenu()
    if (!location.hash) return
    const target = document.getElementById(location.hash.slice(1))
    if (target) {
      window.requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    const term = headerSearch.trim()
    if (!term) return
    navigate(`/shop?q=${encodeURIComponent(term)}`)
    setHeaderSearch('')
    closeMenu()
  }

  return (
    <div className="customer-shell">
      <div className="announcement">
        <div className="announcement-content container">
          <span className="announcement-badge">Authorized agency</span>
          <span className="announcement-text">
            Sree Annapurna Agency · FMCG wholesale and retail distribution · Shimoga, Karnataka
          </span>
          <Link to="/wholesale" className="announcement-link">
            Wholesale enquiries <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      <header className="site-header">
        <div className="header-masthead">
          <div className="header-masthead-inner container">
            <button
              className="mobile-menu-btn"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link className="brand-lockup" to="/" onClick={closeMenu} aria-label="Sree Annapurna Agency home">
              <span className="brand-mark" aria-hidden="true">
                <span>SA</span>
              </span>
              <span className="brand-wordmark">
                <strong>SREE ANNAPURNA</strong>
                <small>Agency · wholesale &amp; distribution</small>
              </span>
            </Link>

            <form className="header-search-form" onSubmit={handleSearchSubmit} role="search">
              <Search size={16} className="search-icon" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search product, brand or SKU"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                aria-label="Search the product catalogue"
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

            <div className="header-actions">
              <Link className="action-btn account-action" aria-label="Customer account and orders" to="/account">
                <UserRound size={18} aria-hidden="true" />
                <span className="action-label">Account</span>
              </Link>
              <Link
                className="action-btn cart-action"
                aria-label={`Shopping basket, ${count} item${count === 1 ? '' : 's'}`}
                to="/cart"
              >
                <span className="cart-icon-wrapper">
                  <ShoppingBag size={18} aria-hidden="true" />
                  {count > 0 && <span className="cart-badge">{count > 99 ? '99+' : count}</span>}
                </span>
                <span className="action-label">Basket</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="header-navrow">
          <div className="header-navrow-inner container">
            <nav className="main-nav desktop-nav" aria-label="Main navigation">
              <NavLink to="/" end className={navClass}>
                Home
              </NavLink>
              <NavLink to="/shop" className={navClass}>
                All products
              </NavLink>
              <Link to="/#brands" className="nav-link">
                Brands
              </Link>
              <Link to="/#categories" className="nav-link">
                Categories
              </Link>
              <NavLink to="/about" className={navClass}>
                About
              </NavLink>
              <NavLink to="/contact" className={navClass}>
                Contact
              </NavLink>
            </nav>
            <Link to="/wholesale" className="navrow-trade-link">
              Wholesale desk
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div className="mobile-drawer-overlay" onClick={closeMenu} role="presentation">
            <div
              className="mobile-drawer"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="mobile-drawer-header">
                <Link className="brand-lockup" to="/" onClick={closeMenu}>
                  <span className="brand-mark small" aria-hidden="true">
                    <span>SA</span>
                  </span>
                  <span className="brand-wordmark">
                    <strong>SREE ANNAPURNA</strong>
                    <small>Agency</small>
                  </span>
                </Link>
                <button className="icon-btn" onClick={closeMenu} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>

              <form className="mobile-search-form" onSubmit={handleSearchSubmit} role="search">
                <Search size={16} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search product, brand or SKU"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  aria-label="Search the product catalogue"
                />
              </form>

              <nav className="mobile-nav-links" aria-label="Mobile navigation">
                <NavLink onClick={closeMenu} to="/" end className="mobile-nav-item">
                  Home
                </NavLink>
                <NavLink onClick={closeMenu} to="/shop" className="mobile-nav-item">
                  All products ({activeProducts.length})
                </NavLink>
                <Link to="/#brands" onClick={closeMenu} className="mobile-nav-item">
                  Brands ({brands.length})
                </Link>
                <Link to="/#categories" onClick={closeMenu} className="mobile-nav-item">
                  Categories
                </Link>
                <NavLink onClick={closeMenu} to="/wholesale" className="mobile-nav-item">
                  Wholesale supply
                </NavLink>
                <NavLink onClick={closeMenu} to="/about" className="mobile-nav-item">
                  About the agency
                </NavLink>
                <NavLink onClick={closeMenu} to="/contact" className="mobile-nav-item">
                  Contact
                </NavLink>
                <NavLink onClick={closeMenu} to="/account" className="mobile-nav-item">
                  My account &amp; orders
                </NavLink>
              </nav>

              <div className="mobile-drawer-footer">
                <p className="mobile-agency-note">
                  <strong>Authorized regional agency</strong>
                  <span>Distributing Swastik, Rala, Monkey 555, Monkey VVV, Aruna Masala and Deeppam Aarti.</span>
                </p>
                <Link to="/wholesale" onClick={closeMenu} className="button button-primary full-button">
                  Wholesale enquiry
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-top-strip">
          <div className="container footer-strip-inner">
            <span className="footer-strip-item">
              <ShieldCheck size={16} aria-hidden="true" /> Manufacturer-sealed packaged stock
            </span>
            <span className="footer-strip-item">
              <Truck size={16} aria-hidden="true" /> Retail orders and wholesale supply
            </span>
            <span className="footer-strip-item">
              <MapPin size={16} aria-hidden="true" /> Distribution from Shimoga, Karnataka
            </span>
            <span className="footer-strip-item">
              <PackageCheck size={16} aria-hidden="true" /> {activeProducts.length} catalogue products
            </span>
          </div>
        </div>

        <div className="footer-main container">
          <div className="footer-col footer-brand-col">
            <Link className="brand-lockup" to="/">
              <span className="brand-mark" aria-hidden="true">
                <span>SA</span>
              </span>
              <span className="brand-wordmark">
                <strong>SREE ANNAPURNA</strong>
                <small>Agency · distribution</small>
              </span>
            </Link>
            <p className="footer-about-text">
              Carrying, forwarding and wholesale distribution agency for South Indian packaged food brands and
              household cleaning essentials. Retail packs for households, case lots for trade buyers.
            </p>
            <div className="footer-brands-pills">
              {brands.map((brand) => (
                <span key={brand.id}>{brand.name}</span>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>Product catalogue</h4>
            <Link to="/shop">All products ({activeProducts.length})</Link>
            <Link to="/#brands">Brands ({brands.length})</Link>
            <Link to="/shop?category=Pickles">Pickles</Link>
            <Link to="/shop?category=Spice+powders">Spice powders</Link>
            <Link to="/shop?category=Blended+masalas">Blended masalas</Link>
            <Link to="/shop?category=Cleaning+tools">Cleaning tools</Link>
            <Link to="/shop?category=Pooja+essentials">Pooja essentials</Link>
          </div>

          <div className="footer-col">
            <h4>Trade &amp; support</h4>
            <Link to="/wholesale">Wholesale enquiry</Link>
            <Link to="/about">About Sree Annapurna Agency</Link>
            <Link to="/contact">Contact and location</Link>
            <Link to="/shipping">Delivery policy</Link>
            <Link to="/returns">Returns and damages</Link>
            <Link to="/faq">Frequently asked questions</Link>
            <Link to="/account/orders">Track an order</Link>
          </div>

          <div className="footer-col footer-contact-col">
            <h4>Agency office</h4>
            <p className="contact-address">
              <strong>Sree Annapurna Agency</strong>
              <br />
              Wholesale Market Yard, APMC Road
              <br />
              Shimoga, Karnataka — 577201
            </p>
            <p className="contact-lines">
              <span>Wholesale desk: wholesale@sreeannapurnaagency.com</span>
              <span>Customer care: contact@sreeannapurnaagency.com</span>
              <span>Trade hours: Mon – Sat, 9:00 AM – 7:00 PM</span>
            </p>
          </div>
        </div>

        <div className="footer-bottom container">
          <p>© {new Date().getFullYear()} Sree Annapurna Agency. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy</Link>
            <span className="separator">·</span>
            <Link to="/terms">Terms</Link>
            <span className="separator">·</span>
            <Link to="/owner/login" className="admin-demo-link" title="Agency owner sign in">
              Owner sign in
            </Link>
          </div>
        </div>
      </footer>

      <Notice />
    </div>
  )
}
