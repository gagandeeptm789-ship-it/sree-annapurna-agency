import { useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Clock, MapPin, Minus, PackageCheck, Phone, Plus, ShieldCheck, Sparkles, Truck, User, X } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { categories } from '../data/catalog'
import type { Product } from '../types'
import { EmptyState, ImageAsset, ProductCard, SectionTitle } from '../components/common'

const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

const fmcgCategoryShowcase = [
  { title: 'Traditional Pickles', filter: 'Pickles', desc: 'Aged in mustard oil & spices (Swastik)', count: '2 SKUs' },
  { title: 'Spices & Curry Masalas', filter: 'Spice powders', desc: 'Single-origin powders & blends (Rala, Aruna, Swastik)', count: '17 SKUs' },
  { title: 'Instant Food Mixes', filter: 'Instant mixes', desc: 'Rava idli, badam powder & gulab jamun (Swastik, Aruna)', count: '4 SKUs' },
  { title: 'Pantry Staples', filter: 'Pantry staples', desc: 'Premium roasted vermicelli packs (Swastik, Aruna)', count: '2 SKUs' },
  { title: 'Home Care & Sanitation', filter: 'Cleaning tools', desc: 'Brooms, mops, phenyl & detergents (Monkey 555, VVV)', count: '7 SKUs' },
  { title: 'Sacred Pooja Essentials', filter: 'Pooja essentials', desc: 'Pure formulated aarti lighting oil (Deeppam)', count: '1 SKU' },
]

export function HomePage() {
  const { brands, products } = useStore()
  const featured = products.filter((product) => product.active).slice(0, 8)

  return (
    <>
      {/* 1. Redesigned Corporate FMCG Hero */}
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AUTHORIZED REGIONAL FMCG &amp; HOUSEHOLD DISTRIBUTOR
          </div>
          <h1>Authentic Brands.<br />Direct Distribution.</h1>
          <p className="hero-description">
            Connecting supermarkets, regional merchants, and households with authentic South Indian pickles, pure ground spices, instant food mixes, home sanitation tools, and pooja essentials. Carrying and forwarding agency for six premier regional manufacturers across Karnataka &amp; South India.
          </p>
          <div className="hero-actions">
            <Link className="button button-cream" to="/wholesale">
              Wholesale &amp; Trade Supply
              <ArrowRight size={17} />
            </Link>
            <Link className="button button-outline-light" to="/shop">
              Browse Product Catalogue
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-pillars">
            <div className="hero-pillar-item">
              <strong>6 Principal Brands</strong>
              <span>Direct Manufacturer Partner</span>
            </div>
            <div className="hero-pillar-item">
              <strong>33 Verified SKUs</strong>
              <span>100% Sealed Factory Stock</span>
            </div>
            <div className="hero-pillar-item">
              <strong>Dual Fulfilment</strong>
              <span>Wholesale B2B &amp; Retail Supply</span>
            </div>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-graphic-wrap">
            <img
              src="/images/hero-fmcg-packaging.svg"
              alt="Sree Annapurna Agency Authorized Distribution Network"
              className="hero-graphic-img"
            />
          </div>
        </div>
      </section>

      {/* 2. Assurance Strip */}
      <div className="assurance-row">
        <span><ShieldCheck size={17} /> Direct Manufacturer Sealed Supply</span>
        <span><Truck size={17} /> Wholesale Agency &amp; Retail Distribution</span>
        <span><Sparkles size={17} /> Six Verified Regional Brand Families</span>
        <span><PackageCheck size={17} /> Temperature &amp; Hygiene Controlled Warehouse</span>
      </div>

      {/* 3. Polished Brand Showcase */}
      <section className="section container" id="brands">
        <SectionTitle
          kicker="Principal Brand Portfolio"
          title="Six Established Regional FMCG Brands"
          action="Explore All 33 Products"
        />
        <div className="brand-grid">
          {brands.map((brand) => {
            const count = products.filter((p) => p.brandId === brand.id).length
            return (
              <article className="brand-showcase-card" key={brand.id}>
                <div className="brand-card-header" style={{ borderTopColor: brand.color }}>
                  <div className="brand-card-topline">
                    <span className="brand-category-badge">{brand.category}</span>
                    <span className="brand-count-pill">{count} Verified SKUs</span>
                  </div>
                  <h3>{brand.name}</h3>
                  <p className="brand-card-desc">{brand.description}</p>
                </div>
                
                <div className="brand-card-image-box">
                  <ImageAsset
                    src={brand.image}
                    alt={`${brand.name} official brand portfolio`}
                    fallback="Brand Portfolio"
                    className="brand-card-asset"
                    fit="contain"
                  />
                </div>

                <div className="brand-card-footer">
                  <span className="brand-distributor-tag">Authorized Regional Agency</span>
                  <Link to={`/brands/${brand.slug}`} className="brand-view-link">
                    Explore Brand Products <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* 4. Featured Catalogue Products */}
      <section className="section section-tint">
        <div className="container">
          <SectionTitle
            kicker="Authentic Packaged Catalogue"
            title="Featured Retail &amp; Wholesale Products"
            action="Shop Full Catalogue"
          />
          {featured.length ? (
            <div className="product-grid">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No products in catalogue</h3>
              <p>Product information is currently being updated.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Category Directory */}
      <section className="section container" id="categories">
        <SectionTitle kicker="Distribution Segments" title="Browse by Product Category" />
        <div className="category-grid">
          {fmcgCategoryShowcase.map((cat, index) => (
            <Link
              className="category-card"
              key={cat.title}
              to={`/shop?category=${encodeURIComponent(cat.filter)}`}
            >
              <div className="category-card-top">
                <span className="category-number">0{index + 1}</span>
                <span className="category-sku-badge">{cat.count}</span>
              </div>
              <div className="category-card-body">
                <strong>{cat.title}</strong>
                <p>{cat.desc}</p>
              </div>
              <span className="category-card-arrow">
                View Category Products <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Wholesale & Institutional Banner */}
      <section className="wholesale-banner container">
        <div className="wholesale-copy">
          <p className="eyebrow light">B2B Wholesale Distribution</p>
          <h2>Wholesale Agency Supply for Supermarkets, Retailers &amp; Institutions</h2>
          <p>
            Sree Annapurna Agency serves supermarket chains, independent kirana grocers, hospitality groups, and institutional buyers across regional trade zones with manufacturer-direct pricing, bulk credit terms, and reliable scheduled restocking.
          </p>
          <div className="wholesale-features">
            <div>✓ Tier-1 volume wholesale pricing</div>
            <div>✓ Factory-sealed direct manufacturer stock</div>
            <div>✓ Local delivery van &amp; logistics dispatch</div>
            <div>✓ Dedicated trade account representative</div>
          </div>
          <Link className="button button-cream" to="/wholesale">
            Submit Wholesale Supply Enquiry
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="wholesale-art">
          <div className="wholesale-seal-box">
            <span className="seal-kicker">AUTHORIZED CLEARING &amp; FORWARDING</span>
            <strong>Direct Factory Agency</strong>
            <p>Karnataka &amp; South Zone</p>
          </div>
        </div>
      </section>

      {/* 7. Corporate Values / Heritage */}
      <section className="section container values-section">
        <div>
          <p className="eyebrow">Agency Overview</p>
          <h2>Rooted in trust.<br />Committed to authenticity.</h2>
        </div>
        <div className="values-copy">
          <p>
            Sree Annapurna Agency bridges leading FMCG manufacturers with regional retail shelves and consumers. We do not deal in loose or unverified commodities; every product we dispatch carries official manufacturer tamper-evident packaging and certified quality seals.
          </p>
          <Link className="text-link" to="/about">
            Read our company story <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Newsletter />
    </>
  )
}

function Newsletter() {
  return (
    <section className="newsletter">
      <div>
        <p className="eyebrow light">Trade &amp; Catalogue Updates</p>
        <h2>Connect with Sree Annapurna Agency.</h2>
        <p>Enquire about new seasonal product arrivals, distributor bulk rates, and festival stock allocations.</p>
      </div>
      <Link to="/wholesale" className="button button-cream">
        Enquire for Distribution
        <ArrowRight size={16} />
      </Link>
    </section>
  )
}

export function ShopPage() {
  const { products, brands } = useStore()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const category = params.get('category') ?? 'All categories'
  const brandId = params.get('brand') ?? 'All brands'
  const sort = params.get('sort') ?? 'featured'
  const available = params.get('available') === 'true'
  const [visibleCount, setVisibleCount] = useState(12)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((product) => {
      const brand = brands.find((item) => item.id === product.brandId)?.name ?? ''
      const matchesText = !q || `${product.name} ${brand} ${product.category} ${product.sku}`.toLowerCase().includes(q)
      return product.active && matchesText &&
        (category === 'All categories' || product.category === category) &&
        (brandId === 'All brands' || product.brandId === brandId) &&
        (!available || product.stock > 0)
    }).sort((a, b) =>
      sort === 'name' ? a.name.localeCompare(b.name) :
      sort === 'price-low' ? a.price - b.price :
      sort === 'price-high' ? b.price - a.price : 0
    )
  }, [products, brands, query, category, brandId, sort, available])

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'All categories' || value === 'All brands' || value === 'featured') next.delete(key)
    else next.set(key, value)
    setParams(next)
    setVisibleCount(12)
  }

  const clearAllFilters = () => {
    setQuery('')
    setParams(new URLSearchParams())
    setVisibleCount(12)
  }

  const hasActiveFilters = Boolean(query || category !== 'All categories' || brandId !== 'All brands' || available)

  return (
    <div className="container page-space">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Product Catalogue</span>
      </div>

      <div className="page-heading shop-heading">
        <div>
          <p className="eyebrow">Agency Product Catalogue</p>
          <h1>Shop All Products</h1>
          <p>Browse genuine, packaged FMCG essentials across our six partner brand families.</p>
        </div>
        <span className="demo-label">Authorized Distribution</span>
      </div>

      <div className="shop-toolbar">
        <label className="search-field">
          <span className="sr-only">Search products, brands or SKU</span>
          <input
            value={query}
            onChange={(event) => { setQuery(event.target.value); setVisibleCount(12) }}
            placeholder="Search by product name, brand, category, or SKU..."
          />
          {query && (
            <button aria-label="Clear search" onClick={() => { setQuery(''); setVisibleCount(12) }}>
              <X size={16} />
            </button>
          )}
        </label>
        <select aria-label="Filter by brand" value={brandId} onChange={(event) => update('brand', event.target.value)}>
          <option>All brands</option>
          {brands.map((brand) => (
            <option value={brand.id} key={brand.id}>{brand.name}</option>
          ))}
        </select>
        <select aria-label="Filter by category" value={category} onChange={(event) => update('category', event.target.value)}>
          <option>All categories</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select aria-label="Sort products" value={sort} onChange={(event) => update('sort', event.target.value)}>
          <option value="featured">Featured / Default</option>
          <option value="name">Product Name: A–Z</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      <div className="shop-options-bar">
        <div className="active-filters-wrap">
          <span className="results-counter">
            Showing <strong>{filtered.length}</strong> of {products.length} products
          </span>
          {hasActiveFilters && (
            <div className="filter-chips">
              {brandId !== 'All brands' && (
                <button className="filter-chip" onClick={() => update('brand', 'All brands')}>
                  Brand: {brands.find(b => b.id === brandId)?.name} <X size={12} />
                </button>
              )}
              {category !== 'All categories' && (
                <button className="filter-chip" onClick={() => update('category', 'All categories')}>
                  Category: {category} <X size={12} />
                </button>
              )}
              {available && (
                <button className="filter-chip" onClick={() => update('available', '')}>
                  In Stock Only <X size={12} />
                </button>
              )}
              {query && (
                <button className="filter-chip" onClick={() => setQuery('')}>
                  Query: "{query}" <X size={12} />
                </button>
              )}
              <button className="clear-all-link" onClick={clearAllFilters}>
                Clear all
              </button>
            </div>
          )}
        </div>

        <label className="in-stock-switch">
          <input
            type="checkbox"
            checked={available}
            onChange={(event) => update('available', event.target.checked ? 'true' : '')}
          />
          <span>In stock only</span>
        </label>
      </div>

      {filtered.length ? (
        <>
          <div className="product-grid">
            {filtered.slice(0, visibleCount).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <div className="load-more-wrap">
              <button className="button button-outline" onClick={() => setVisibleCount((count) => count + 12)}>
                Load more products ({filtered.length - visibleCount} remaining)
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No products match your filter"
          text="Try clearing your search query or selecting a different brand or category filter."
          link="/shop"
        />
      )}
    </div>
  )
}

export function BrandPage() {
  const { slug } = useParams()
  const { brands, products } = useStore()
  const brand = brands.find((item) => item.slug === slug)
  const [query, setQuery] = useState('')

  if (!brand) return <NotFoundPage />

  const items = products.filter(
    (product) => product.brandId === brand.id &&
      product.active &&
      `${product.name} ${product.category} ${product.sku}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="container page-space">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Brands</Link>
        <span>/</span>
        <span>{brand.name}</span>
      </div>

      <section className="brand-hero-card" style={{ '--brand-color': brand.color } as CSSProperties}>
        <div className="brand-hero-content">
          <div className="brand-hero-topline">
            <span className="brand-pill">{brand.category}</span>
            <span className="brand-auth-pill">Authorized Agency Partner</span>
          </div>
          <h1>{brand.name}</h1>
          <p>{brand.description}</p>
          <div className="brand-hero-meta">
            <span><strong>{items.length}</strong> catalogue products</span>
            <span>·</span>
            <span>100% Genuine Manufacturer Sealed</span>
          </div>
        </div>
        <div className="brand-hero-asset-box">
          <ImageAsset
            src={brand.image}
            alt={`${brand.name} official identity`}
            fallback="Brand visual"
            className="brand-hero-asset-img"
            fit="contain"
          />
        </div>
      </section>

      <div className="section-title brand-products-title">
        <div>
          <p className="eyebrow">{brand.name} Portfolio</p>
          <h2>{items.length} Packaged Products</h2>
        </div>
        <input
          className="small-search"
          placeholder={`Search ${brand.name} catalogue...`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={`Search ${brand.name} products`}
        />
      </div>

      {items.length ? (
        <div className="product-grid">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No products found"
          text={`No products match "${query}" in the ${brand.name} collection.`}
          link={`/brands/${brand.slug}`}
        />
      )}

      <div className="other-brands-section">
        <p className="eyebrow">Explore Other Principal Brands</p>
        <div className="other-brands-pills">
          {brands.filter((item) => item.id !== brand.id).map((item) => (
            <Link key={item.id} to={`/brands/${item.slug}`} className="other-brand-pill">
              <strong>{item.name}</strong>
              <small>{item.category}</small>
              <ArrowRight size={14} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProductPage() {
  const { id } = useParams()
  const { products, brands, addToCart, isOwnerAuthenticated } = useStore()
  const product = products.find((item) => item.id === id)
  const [quantity, setQuantity] = useState(1)
  const navigate = useNavigate()

  if (!product) return <NotFoundPage />

  const brand = brands.find((item) => item.id === product.brandId)
  const unavailable = !product.active || product.price <= 0 || product.stock < 1
  const related = products.filter((item) => item.brandId === product.brandId && item.id !== product.id && item.price > 0).slice(0, 4)

  const isCustomPhoto = product.image.startsWith('data:image/') || (product.image.startsWith('http') && !product.image.includes('localhost'))

  return (
    <div className="container page-space">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <Link to={`/brands/${brand?.slug}`}>{brand?.name ?? 'Brand'}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="product-detail-layout">
        <div className="product-gallery-box">
          <div className="product-detail-visual">
            <ImageAsset
              src={product.image}
              alt={product.name}
              fallback="Packaged product"
              className="detail-product-image"
              fallbackClassName="product-image-empty"
              fit="contain"
            />
          </div>
          
          <div className="product-image-notice">
            {isCustomPhoto ? (
              <div className="authentic-photo-badge">
                <Check size={15} />
                <span>Authentic Company-Supplied Packaging Photography</span>
              </div>
            ) : (
              <div className="packaging-visual-badge">
                <PackageCheck size={15} />
                <span>Packaged Retail Product Visual · Factory Sealed Stock Guaranteed</span>
              </div>
            )}
            {isOwnerAuthenticated && (
              <Link to="/admin/products" className="owner-upload-shortcut">
                📷 Upload Real Photo in Owner Panel
              </Link>
            )}
          </div>
        </div>

        <div className="product-detail-info">
          <div className="detail-brand-badge">
            <Link to={`/brands/${brand?.slug}`}>{brand?.name ?? 'Sree Annapurna Agency'}</Link>
            <span>·</span>
            <span>{product.category}</span>
          </div>

          <h1>{product.name}</h1>
          <p className="detail-description">{product.description}</p>

          <div className="detail-price-box">
            <div className="price-num">
              {product.price > 0 ? money(product.price) : 'Price On Enquiry'}
              {product.pack && <span className="pack-suffix"> / {product.pack}</span>}
            </div>
            <p className="wholesale-hint">
              Wholesale volume rates available for bulk orders &amp; commercial supply.
            </p>
          </div>

          <div className="stock-status-row">
            <span className={`stock-indicator ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`} />
            <strong>{product.stock > 0 ? `In Stock (${product.stock} units on hand)` : 'Stock currently unavailable online'}</strong>
            {product.sku && <span className="sku-tag">SKU: {product.sku}</span>}
          </div>

          <div className="quantity-and-actions">
            <div className="quantity-control">
              <button
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                <Minus size={15} />
              </button>
              <span>{quantity}</span>
              <button
                aria-label="Increase quantity"
                disabled={quantity >= product.stock}
                onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
              >
                <Plus size={15} />
              </button>
            </div>

            <button
              className="button button-dark"
              disabled={unavailable}
              onClick={() => addToCart(product, quantity)}
            >
              Add to basket
              <Plus size={16} />
            </button>

            <button
              className="button button-outline"
              disabled={unavailable}
              onClick={() => {
                if (addToCart(product, quantity)) navigate('/checkout')
              }}
            >
              Buy now
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="product-specifications-panel">
            <h3>Product &amp; Distribution Specifications</h3>
            <div className="specs-grid">
              <div><span>Pack Size</span><strong>{product.pack || 'Standard Pack'}</strong></div>
              <div><span>Category</span><strong>{product.category}</strong></div>
              <div><span>SKU Identifier</span><strong>{product.sku || 'N/A'}</strong></div>
              <div><span>Distributor</span><strong>Sree Annapurna Agency</strong></div>
              <div><span>Packaging Condition</span><strong>Sealed Manufacturer Packaging</strong></div>
              <div><span>Supply Scope</span><strong>Wholesale &amp; Retail</strong></div>
            </div>
          </div>

          <div className="agency-guarantee-box">
            <p><Check size={16} /> <strong>100% Genuine Sealed Stock:</strong> Supplied directly from authorized manufacturer batches.</p>
            <p><Truck size={16} /> <strong>Regional Distribution:</strong> Fast dispatch for city orders and regional merchant logistics.</p>
            <p><ShieldCheck size={16} /> <strong>Wholesale Enquiries:</strong> Supermarkets and institutional buyers can contact for custom case-lot quotes.</p>
          </div>

          <div className="b2b-enquiry-prompt">
            <span>Buying in commercial volumes?</span>
            <Link to="/wholesale" className="text-link">Request Wholesale Pricing Sheet <ArrowRight size={14} /></Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <SectionTitle
            kicker={`More from ${brand?.name}`}
            title="Related Products from This Brand"
            action="View All"
            to={`/brands/${brand?.slug}`}
          />
          <div className="product-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export function CartPage() {
  const { cart, products, brands, setCartQuantity, removeFromCart } = useStore()
  const details = cart.map((line) => ({
    line,
    product: products.find((product) => product.id === line.productId)
  })).filter((item): item is { line: typeof cart[number]; product: Product } => !!item.product)

  const subtotal = details.reduce((sum, item) => sum + item.product.price * item.line.quantity, 0)

  if (!details.length) {
    return (
      <div className="container page-space">
        <div className="breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Shopping Basket</span>
        </div>
        <EmptyState
          title="Your basket is empty"
          text="Browse the authentic catalogue across our six brands and add products to your basket."
          link="/shop"
        />
      </div>
    )
  }

  return (
    <div className="container page-space">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Shopping Basket</span>
      </div>

      <div className="page-heading">
        <div>
          <p className="eyebrow">Order Basket</p>
          <h1>Your Basket ({details.length} item{details.length === 1 ? '' : 's'})</h1>
        </div>
        <span className="demo-label">Local Order Management</span>
      </div>

      <div className="cart-layout">
        <div className="cart-list">
          {details.map(({ line, product }) => (
            <article className="cart-row" key={product.id}>
              <Link to={`/product/${product.id}`} className="cart-image">
                <ImageAsset
                  src={product.image}
                  alt={product.name}
                  fallback="Product"
                  className="cart-product-image"
                  fit="contain"
                />
              </Link>
              <div className="cart-product">
                <Link to={`/product/${product.id}`}>
                  <strong>{product.name}</strong>
                </Link>
                <span>{brands.find((b) => b.id === product.brandId)?.name} · {line.pack}</span>
                <button className="remove-button" onClick={() => removeFromCart(product.id)}>
                  Remove from basket
                </button>
              </div>
              <div className="quantity-control cart-quantity">
                <button
                  aria-label="Decrease quantity"
                  disabled={line.quantity <= 1}
                  onClick={() => setCartQuantity(product.id, line.quantity - 1)}
                >
                  <Minus size={14} />
                </button>
                <span>{line.quantity}</span>
                <button
                  aria-label="Increase quantity"
                  disabled={line.quantity >= product.stock}
                  onClick={() => setCartQuantity(product.id, line.quantity + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>
              <strong className="cart-line-price">
                {money(product.price * line.quantity)}
              </strong>
            </article>
          ))}
        </div>

        <aside className="order-summary">
          <h2>Order Summary</h2>
          <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
          <div><span>Estimated Delivery</span><strong>Standard Agency Logistics</strong></div>
          <div className="summary-total"><span>Total Payable</span><strong>{money(subtotal)}</strong></div>
          <Link className="button button-dark full-button" to="/checkout">
            Proceed to Checkout
            <ArrowRight size={16} />
          </Link>
          <Link className="continue-link" to="/shop">
            <ArrowLeft size={15} /> Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  )
}

export function CheckoutPage() {
  const { cart, products, brands, removeFromCart, notify, placeOrder, customer } = useStore()
  const [placed, setPlaced] = useState(false)
  const [orderReference, setOrderReference] = useState('')
  const [checkoutError, setCheckoutError] = useState('')

  const [name, setName] = useState(customer?.name ?? '')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(customer?.email ?? '')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')
  const [notes, setNotes] = useState('')

  const [placedSnapshot, setPlacedSnapshot] = useState<{
    items: { product: Product; quantity: number; pack: string }[]
    total: number
    delivery: {
      name: string
      phone: string
      email: string
      address: string
      city: string
      pincode: string
      notes?: string
    }
  } | null>(null)

  const cartDetails = cart.map((item) => ({
    line: item,
    product: products.find((p) => p.id === item.productId)
  })).filter((item): item is { line: typeof cart[number]; product: Product } => !!item.product)

  const subtotal = cartDetails.reduce((sum, item) => sum + item.product.price * item.line.quantity, 0)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCheckoutError('')

    if (!cart.length) {
      setCheckoutError('Your basket is empty. Please add items before placing an order.')
      return
    }

    const valid = cart.every((item) => {
      const product = products.find((entry) => entry.id === item.productId)
      return !!product && product.active && product.price > 0 && item.quantity > 0 && item.quantity <= product.stock
    })
    if (!valid) {
      setCheckoutError('One or more items in your basket are currently unavailable or out of stock.')
      notify('Please review product availability in your basket.')
      return
    }

    if (!name.trim()) {
      setCheckoutError('Please enter your full name.')
      return
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setCheckoutError('Please enter a valid phone number (at least 10 digits).')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setCheckoutError('Please enter a valid email address.')
      return
    }
    if (!address.trim()) {
      setCheckoutError('Please enter your complete delivery street address.')
      return
    }
    if (!city.trim()) {
      setCheckoutError('Please enter your city or town.')
      return
    }
    if (!pincode.trim() || pincode.trim().length < 5) {
      setCheckoutError('Please enter a valid postal PIN code.')
      return
    }

    const deliveryData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      notes: notes.trim() || undefined,
    }

    setPlacedSnapshot({
      items: cartDetails.map((cd) => ({
        product: cd.product,
        quantity: cd.line.quantity,
        pack: cd.line.pack,
      })),
      total: subtotal,
      delivery: deliveryData,
    })

    const newId = placeOrder({
      total: subtotal,
      customerName: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      notes: notes.trim() || undefined,
    })

    setOrderReference(newId)
    setPlaced(true)
    notify('Order placed successfully! We will prepare your dispatch.')
  }

  if (!cart.length && !placed) {
    return (
      <div className="container page-space">
        <EmptyState title="Your basket is empty" text="Add products before heading to checkout." link="/shop" />
      </div>
    )
  }

  if (placed && placedSnapshot) {
    return (
      <div className="container page-space order-placed-container">
        <div className="order-success-banner">
          <div className="success-icon-badge">
            <Check size={28} />
          </div>
          <p className="eyebrow light">Order Placed Successfully</p>
          <h1>Thank you for your order!</h1>
          <p className="success-lead">
            Your order has been recorded under reference <strong>{orderReference}</strong>. Sree Annapurna Agency has received your request and will prepare it for delivery.
          </p>
        </div>

        <div className="order-overview-chips">
          <div className="overview-chip">
            <span>Order ID</span>
            <strong>{orderReference}</strong>
          </div>
          <div className="overview-chip">
            <span>Status</span>
            <span className="status-pill status-pending">Pending Agency Confirmation</span>
          </div>
          <div className="overview-chip">
            <span>Payment Method</span>
            <span className="payment-pill payment-pending">Cash on Delivery / Agency Invoice</span>
          </div>
          <div className="overview-chip">
            <span>Total Payable</span>
            <strong>{money(placedSnapshot.total)}</strong>
          </div>
        </div>

        <div className="order-details-duo">
          <section className="form-panel order-summary-block">
            <h2>Ordered Items ({placedSnapshot.items.length})</h2>
            <div className="success-items-list">
              {placedSnapshot.items.map(({ product, quantity, pack }) => (
                <div className="success-item-row" key={product.id}>
                  <div className="success-item-thumb">
                    <ImageAsset src={product.image} alt={product.name} fallback="Product" className="cart-product-image" fit="contain" />
                  </div>
                  <div className="success-item-info">
                    <strong>{product.name}</strong>
                    <span>{brands.find((b) => b.id === product.brandId)?.name ?? 'Agency Brand'} · {pack}</span>
                    <small>Qty {quantity} × {money(product.price)}</small>
                  </div>
                  <strong className="success-item-total">{money(product.price * quantity)}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="form-panel order-summary-block">
            <h2>Delivery Details</h2>
            <div className="delivery-card-summary">
              <p><User size={15} /> <strong>Recipient:</strong> {placedSnapshot.delivery.name}</p>
              <p><Phone size={15} /> <strong>Phone:</strong> {placedSnapshot.delivery.phone}</p>
              <p><span>@</span> <strong>Email:</strong> {placedSnapshot.delivery.email}</p>
              <p><MapPin size={15} /> <strong>Address:</strong> {placedSnapshot.delivery.address}, {placedSnapshot.delivery.city} – {placedSnapshot.delivery.pincode}</p>
              {placedSnapshot.delivery.notes && (
                <p><Clock size={15} /> <strong>Instructions:</strong> {placedSnapshot.delivery.notes}</p>
              )}
            </div>

            <div className="confirmation-totals">
              <div><span>Subtotal</span><strong>{money(placedSnapshot.total)}</strong></div>
              <div><span>Estimated delivery</span><span>Standard Agency Delivery</span></div>
              <div className="confirmation-grand-total"><span>Total</span><strong>{money(placedSnapshot.total)}</strong></div>
            </div>
          </section>
        </div>

        {/* 3 Customer Actions Buttons (Never links to /admin) */}
        <div className="customer-order-buttons-bar">
          <Link to={`/account/orders/${orderReference}`} className="button button-dark">
            <Truck size={17} />
            Track My Order
          </Link>
          <Link to="/account/orders" className="button button-outline">
            <PackageCheck size={17} />
            View My Orders
          </Link>
          <Link to="/shop" className="continue-link">
            <ArrowLeft size={15} />
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container page-space">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/cart">Basket</Link>
        <span>/</span>
        <span>Checkout</span>
      </div>

      <div className="page-heading">
        <div>
          <p className="eyebrow">Customer Checkout</p>
          <h1>Complete Your Order</h1>
          <p>Please enter your delivery and contact details for agency fulfillment.</p>
        </div>
        <span className="demo-label">Sree Annapurna Agency</span>
      </div>

      <form className="checkout-layout" onSubmit={submit}>
        <div className="checkout-fields">
          <section className="form-panel form-stack">
            <h2>1. Contact &amp; Customer Details</h2>
            <div className="field-grid">
              <label>
                Full Name *
                <input
                  name="customerName"
                  required
                  autoComplete="name"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label>
                Phone Number (for delivery coordination) *
                <input
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
            </div>
            <label>
              Email Address (for order tracking &amp; invoices) *
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          </section>

          <section className="form-panel form-stack">
            <h2>2. Delivery Address</h2>
            <label>
              Street Address, Door No., Building *
              <input
                name="address"
                required
                autoComplete="street-address"
                placeholder="Street address, landmark, area"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </label>
            <div className="field-grid">
              <label>
                City / Town *
                <input
                  name="city"
                  required
                  placeholder="e.g. Bengaluru, Mysuru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </label>
              <label>
                Postal PIN Code *
                <input
                  name="pincode"
                  required
                  placeholder="e.g. 560001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </label>
            </div>
            <label>
              Delivery Notes / Special Instructions (Optional)
              <textarea
                name="notes"
                rows={2}
                placeholder="E.g. Delivery timings, landmark near store, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
          </section>

          <section className="form-panel">
            <h2>3. Payment Method</h2>
            <div className="payment-option selected">
              <span className="payment-radio-bullet" />
              <div>
                <strong>Cash on Delivery / Agency Invoice</strong>
                <p>Payment collected upon delivery or via authorized wholesale agency terms.</p>
              </div>
            </div>
          </section>

          {checkoutError && <p className="form-error">{checkoutError}</p>}
        </div>

        <aside className="order-summary checkout-summary">
          <h2>Your Order ({cartDetails.length})</h2>
          {cartDetails.map(({ line, product }) => (
            <div className="checkout-item" key={product.id}>
              <span>
                {product.name}
                <small>{line.pack} · Qty {line.quantity}</small>
              </span>
              <strong>{money(product.price * line.quantity)}</strong>
              <button
                type="button"
                className="remove-mini"
                aria-label={`Remove ${product.name}`}
                onClick={() => removeFromCart(product.id)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <div className="summary-line">
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <div className="summary-line">
            <span>Estimated delivery</span>
            <strong>Standard Agency Delivery</strong>
          </div>
          <div className="summary-total">
            <span>Grand Total</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <button className="button button-dark full-button" type="submit">
            Place Order
            <ArrowRight size={16} />
          </button>
          <p className="summary-note">By placing your order, you confirm delivery details with Sree Annapurna Agency.</p>
        </aside>
      </form>
    </div>
  )
}

export function CustomerOrdersPage() {
  const { getCustomerOrders, customer } = useStore()
  const orders = getCustomerOrders()

  return (
    <div className="container page-space">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/account">Account</Link>
        <span>/</span>
        <span>My Orders</span>
      </div>

      <div className="page-heading">
        <div>
          <p className="eyebrow">Customer Account</p>
          <h1>My Orders</h1>
          <p>{customer ? `Orders for ${customer.name} (${customer.email})` : 'Orders placed in this shopping session'}</p>
        </div>
        <Link to="/shop" className="button button-outline button-small">
          Shop catalogue <ArrowRight size={14} />
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders placed yet"
          text="When you place an order with Sree Annapurna Agency, its tracking details and invoices will appear here."
          link="/shop"
        />
      ) : (
        <div className="customer-orders-list">
          {orders.map((order) => (
            <article className="customer-order-card" key={order.id}>
              <div className="customer-order-head">
                <div>
                  <span className="order-id-label">Order</span>
                  <strong>{order.id}</strong>
                  <span className="order-date-label">Placed {order.date}</span>
                </div>
                <div className="customer-order-status-group">
                  <span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span>
                  <span className={`payment-pill payment-${order.payment.toLowerCase()}`}>{order.payment}</span>
                </div>
              </div>

              <div className="customer-order-body">
                <div className="customer-order-items-summary">
                  <strong>{order.items?.length ?? 0} item{(order.items?.length ?? 0) === 1 ? '' : 's'}</strong>
                  {order.items && order.items.length > 0 && (
                    <p className="order-item-names">
                      {order.items.map((it) => `${it.name} (${it.pack} × ${it.quantity})`).join(', ')}
                    </p>
                  )}
                  {order.deliveryDetails?.city && (
                    <small className="order-delivery-city">Delivery: {order.deliveryDetails.address}, {order.deliveryDetails.city}</small>
                  )}
                </div>
                <div className="customer-order-total-block">
                  <span>Order Total</span>
                  <strong>{money(order.total)}</strong>
                </div>
              </div>

              <div className="customer-order-footer">
                <Link to={`/account/orders/${order.id}`} className="button button-dark button-small">
                  <Truck size={14} />
                  Track Order
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export function OrderDetailPage() {
  const { id } = useParams()
  const { orders, products, brands, getCustomerOrders, isOwnerAuthenticated } = useStore()
  const order = orders.find((item) => item.id === id)
  const myOrders = getCustomerOrders()

  if (!order) return <NotFoundPage />

  // Customer isolation check
  const isAuthorized = isOwnerAuthenticated || myOrders.some((o) => o.id === order.id)
  if (!isAuthorized) {
    return (
      <div className="container page-space">
        <div className="breadcrumbs">
          <Link to="/">Home</Link><span>/</span><Link to="/account/orders">My Orders</Link>
        </div>
        <div className="unauthorized-order-state">
          <p className="eyebrow">Access Notice</p>
          <h2>Order Record Restricted</h2>
          <p>This order is associated with another customer account. You can only inspect orders placed by your account.</p>
          <div className="auth-buttons">
            <Link to="/account/orders" className="button button-dark">View My Orders</Link>
            <Link to="/shop" className="button button-outline">Return to Shop</Link>
          </div>
        </div>
      </div>
    )
  }

  const steps = [
    { key: 'Pending', label: 'Order Received', desc: 'Placed & queued for agency review' },
    { key: 'Confirmed', label: 'Confirmed by Agency', desc: 'Verified and accepted for fulfillment' },
    { key: 'Processing', label: 'Processing & Packaging', desc: 'Sealed items packaged in warehouse' },
    { key: 'Dispatched', label: 'Dispatched for Delivery', desc: 'Out for delivery to customer address' },
    { key: 'Delivered', label: 'Delivered', desc: 'Received & fulfilled' },
  ]

  const statusHierarchy: Record<string, number> = {
    Pending: 0,
    Confirmed: 1,
    Processing: 2,
    Dispatched: 3,
    Delivered: 4,
    Cancelled: -1,
  }

  const currentLevel = statusHierarchy[order.status] ?? 0
  const isCancelled = order.status === 'Cancelled'
  const d = order.deliveryDetails

  return (
    <div className="container page-space">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/account/orders">My Orders</Link>
        <span>/</span>
        <span>{order.id}</span>
      </div>

      <div className="page-heading">
        <div>
          <p className="eyebrow">Customer Order Tracking</p>
          <h1>Order {order.id}</h1>
          <p>Placed {order.date} · Current Status: <strong>{order.status}</strong></p>
        </div>
        <span className="demo-label">Live Agency Tracking</span>
      </div>

      <div className="order-detail-layout">
        <div className="account-content">
          <section className="form-panel tracking-panel">
            <h2>Order Fulfillment Timeline</h2>
            {isCancelled ? (
              <div className="order-cancelled-banner">
                <strong>Order Cancelled</strong>
                <p>This order request has been marked cancelled. Please contact Sree Annapurna Agency if you require assistance.</p>
              </div>
            ) : (
              <div className="order-timeline customer-timeline">
                {steps.map((step, index) => {
                  const isDone = index < currentLevel
                  const isCurrent = index === currentLevel
                  return (
                    <div className={`timeline-step ${isDone ? 'complete' : ''} ${isCurrent ? 'active' : ''}`} key={step.key}>
                      <span className="step-marker">
                        {isDone ? <Check size={14} /> : index + 1}
                      </span>
                      <div className="step-content">
                        <strong>{step.label}</strong>
                        <small>{isDone ? 'Completed' : isCurrent ? 'In progress' : step.desc}</small>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <p className="payment-note-line">
              Payment Status: <span className={`payment-pill payment-${order.payment.toLowerCase()}`}>{order.payment}</span> (Cash on delivery / Agency invoice)
            </p>
          </section>

          {d && (
            <section className="form-panel">
              <h2>Delivery Address</h2>
              <div className="delivery-card-summary">
                <p><User size={15} /> <strong>Name:</strong> {d.name}</p>
                <p><Phone size={15} /> <strong>Phone:</strong> {d.phone}</p>
                <p><span>@</span> <strong>Email:</strong> {d.email}</p>
                <p><MapPin size={15} /> <strong>Address:</strong> {d.address}, {d.city} – {d.pincode}</p>
                {d.notes && <p><Clock size={15} /> <strong>Delivery Instructions:</strong> {d.notes}</p>}
              </div>
            </section>
          )}

          <section className="form-panel">
            <h2>Items in this order ({order.items?.length ?? 0})</h2>
            {order.items?.length ? (
              <div className="order-items-detail-list">
                {order.items.map((item, idx) => {
                  const product = products.find((entry) => entry.id === item.productId)
                  return (
                    <div className="order-detail-item" key={`${item.productId}-${idx}`}>
                      <span className="cart-image">
                        <ImageAsset src={item.image || product?.image || ''} alt={item.name} fallback="No image" className="cart-product-image" fit="contain" />
                      </span>
                      <span className="order-item-desc">
                        <strong>{item.name}</strong>
                        <small>{brands.find((brand) => brand.id === product?.brandId)?.name ?? 'Agency Brand'} · {item.pack}</small>
                        <small>Qty: {item.quantity} × {money(item.unitPrice)}</small>
                      </span>
                      <strong className="order-item-price">{money(item.unitPrice * item.quantity)}</strong>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="summary-note">No itemized line items recorded.</p>
            )}
          </section>
        </div>

        <aside className="order-summary">
          <h2>Order Summary</h2>
          <div><span>Order Total</span><strong>{money(order.total)}</strong></div>
          <div><span>Delivery</span><span>Standard Delivery</span></div>
          <div><span>Payment Status</span><strong>{order.payment}</strong></div>
          <div className="summary-total"><span>Grand Total</span><strong>{money(order.total)}</strong></div>
          
          <Link className="button button-outline full-button" to="/account/orders">
            <ArrowLeft size={15} /> Back to My Orders
          </Link>
          <Link className="continue-link" to="/shop">
            Continue Shopping →
          </Link>
        </aside>
      </div>
    </div>
  )
}

export function AuthPage({ register = false }: { register?: boolean }) {
  const { signInLocal, notify } = useStore()
  const navigate = useNavigate()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (register && data.get('password') !== data.get('confirmPassword')) { notify('Passwords do not match.'); return }
    signInLocal(String(data.get('name')), String(data.get('email')))
    notify(`Signed in as ${data.get('name')}`)
    navigate('/account')
  }
  return <div className="container page-space auth-page"><div className="auth-card"><p className="eyebrow">Your account</p><h1>{register ? 'Create an account' : 'Welcome back'}</h1><p className="auth-intro">Sign in to view your order history and manage your business preferences.</p><form className="form-stack" onSubmit={submit}><label>Your name<input name="name" autoComplete="name" required /></label><label>Email address<input name="email" type="email" autoComplete="email" required /></label><label>Password<span className="password-input"><input name="password" type={passwordVisible ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} minLength={6} required /><button type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? 'Hide password' : 'Show password'}>{passwordVisible ? 'Hide' : 'Show'}</button></span></label>{register && <label>Confirm password<span className="password-input"><input name="confirmPassword" type={passwordVisible ? 'text' : 'password'} autoComplete="new-password" minLength={6} required /><button type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? 'Hide password' : 'Show password'}>{passwordVisible ? 'Hide' : 'Show'}</button></span></label>}<button className="button button-dark full-button">{register ? 'Register' : 'Sign in'}<ArrowRight size={16} /></button></form><p className="auth-switch">{register ? 'Already have an account?' : 'New to Sree Annapurna Agency?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create account'}</Link></p></div></div>
}

export function AccountPage() {
  const { customer, signOutLocal, getCustomerOrders } = useStore()
  const orders = getCustomerOrders()
  if (!customer) return <div className="container page-space"><div className="auth-prompt"><p className="eyebrow">Your space</p><h1>Account login</h1><p>Please sign in to view your account details and order history.</p><div><Link className="button button-dark" to="/login">Sign in<ArrowRight size={16} /></Link><Link className="button button-outline" to="/register">Create an account</Link></div></div></div>
  return <div className="container page-space"><div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>Your account</span></div><div className="page-heading"><div><p className="eyebrow">Customer account</p><h1>Hello, {customer.name}</h1></div><button className="button button-outline" onClick={signOutLocal}>Sign out</button></div><div className="account-grid"><aside className="account-menu"><a className="is-active" href="#profile">Profile</a><Link to="/account/orders">Orders ({orders.length})</Link><a href="#addresses">Addresses</a><a href="#wishlist">Wishlist</a></aside><div className="account-content"><section id="profile" className="form-panel"><p className="eyebrow">Profile</p><h2>{customer.name}</h2><p>{customer.email}</p><span className="demo-label">Active customer session</span></section><section id="orders" className="form-panel"><div className="panel-heading-row"><div><p className="eyebrow">Order history</p><h2>Recent orders</h2></div><Link to="/account/orders" className="text-link">View all orders ({orders.length}) <ArrowRight size={14} /></Link></div>{orders.length ? orders.slice(0, 3).map((order) => <div className="account-order" key={order.id}><span><Link to={`/account/orders/${order.id}`}><strong>{order.id}</strong></Link><small>{order.date}</small></span><span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span><strong>{money(order.total)}</strong></div>) : <p>No orders placed yet.</p>}</section><section id="addresses" className="form-panel"><h2>Saved addresses</h2><p>No addresses saved yet.</p></section><section id="wishlist" className="form-panel"><h2>Saved products</h2><p>No saved items yet.</p><Link className="text-link" to="/shop">Browse products <ArrowRight size={15} /></Link></section></div></div></div>
}

export function WholesalePage() {
  const { notify } = useStore()
  const [submitted, setSubmitted] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    notify('Thank you for your wholesale enquiry. Our distribution team will prepare terms and get in touch within 24 hours.')
  }

  return (
    <div className="container page-space">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Wholesale Distribution</span>
      </div>

      <div className="wholesale-page-heading">
        <p className="eyebrow">B2B Trade Supply</p>
        <h1>Wholesale Supply &amp; Agency Distribution</h1>
        <p>Direct supply partnerships for supermarkets, grocery stores, hotels, caterers, and regional institutions.</p>
      </div>

      <div className="wholesale-form-layout">
        <div className="wholesale-info-panel">
          <h2>Wholesale Agency Terms</h2>
          <p>
            Sree Annapurna Agency provides authorized carrying &amp; forwarding services for retail chains and bulk buyers across six premier regional brands.
          </p>
          <div className="wholesale-benefit-list">
            <div>
              <strong>Direct Factory Pricing</strong>
              <p>Tiered case-lot rates directly from manufacturer agreements.</p>
            </div>
            <div>
              <strong>Sealed Stock Assurance</strong>
              <p>100% factory-sealed retail cartons with verifiable batch codes.</p>
            </div>
            <div>
              <strong>Scheduled Restocking</strong>
              <p>Regular weekly van dispatch routes across urban and regional markets.</p>
            </div>
            <div>
              <strong>Commercial Credit Accounts</strong>
              <p>Flexible commercial credit terms for verified registered trade partners.</p>
            </div>
          </div>
          <span className="demo-label">Authorized FMCG Clearing &amp; Forwarding</span>
        </div>

        {submitted ? (
          <div className="form-panel wholesale-confirmed">
            <div className="success-icon-badge"><Check size={24} /></div>
            <h3>Wholesale Enquiry Received</h3>
            <p>Thank you for reaching out. An agency trade representative will contact you with volume pricing sheets and delivery schedule options.</p>
            <button className="button button-dark" onClick={() => setSubmitted(false)}>Submit another enquiry</button>
          </div>
        ) : (
          <form className="form-panel form-stack" onSubmit={submit}>
            <h3>Submit Wholesale Requirements</h3>
            <label>
              Business / Supermarket / Enterprise Name *
              <input required placeholder="E.g. Sri Krishna Supermarket / Hotel Royal" />
            </label>
            <label>
              Contact Person Name &amp; Designation *
              <input required placeholder="E.g. Ramesh Kumar (Store Manager)" />
            </label>
            <div className="field-grid">
              <label>
                Business Email Address *
                <input type="email" required placeholder="purchase@business.com" />
              </label>
              <label>
                Phone / WhatsApp Number *
                <input type="tel" required placeholder="+91 98765 43210" />
              </label>
            </div>
            <div className="field-grid">
              <label>
                Trade Location / City *
                <input required placeholder="E.g. Bengaluru, Mysuru, Hubballi" />
              </label>
              <label>
                GSTIN / Trade License (Optional)
                <input placeholder="29XXXXX0000X1Z5" />
              </label>
            </div>
            <label>
              Brand Lines of Interest *
              <select defaultValue="Multiple categories / Full catalogue">
                <option>Multiple categories / Full catalogue</option>
                <option>Swastik Pickles &amp; Masalas</option>
                <option>Rala Food Specialists (Spices)</option>
                <option>Monkey 555 (Sanitation Tools &amp; Phenyl)</option>
                <option>Monkey VVV (Detergents &amp; Dishwash)</option>
                <option>Aruna Masala (Curry &amp; Non-Veg Blends)</option>
                <option>Deeppam Aarti (Pooja Lighting Oil)</option>
              </select>
            </label>
            <label>
              Estimated Monthly Volume / Product Quantities
              <textarea rows={4} placeholder="Please specify carton quantities or brand lines required for regular restocking..." />
            </label>
            <button className="button button-dark full-button" type="submit">
              Submit Wholesale Enquiry
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const infoContent: Record<string, { title: string; kicker: string; text: string[] }> = {
  about: {
    title: 'About Sree Annapurna Agency',
    kicker: 'Heritage & Trust',
    text: [
      'Sree Annapurna Agency is an established carrying & forwarding agency and wholesale distributor representing six leading household brand families: Swastik Pickles & Masalas, Rala Food Specialists, Monkey 555, Monkey VVV, Aruna Masala, and Deeppam Aarti.',
      'Headquartered in South India, our mission is to provide supermarket shelves, independent merchants, and family kitchens with verified authentic culinary staples and proven home sanitation products.',
      'From traditional sun-cured pickles and pure aromatic ground spices to durable cleaning tools and pooja lighting essentials, our entire inventory is dispatched directly from manufacturer factory seals with zero loose or unverified commodities.',
      'We combine old-world commercial integrity with modern supply-chain reliability, offering transparent wholesale agency pricing and dedicated trade support.',
    ],
  },
  contact: {
    title: 'Contact Sree Annapurna Agency',
    kicker: 'Customer & Trade Support',
    text: [
      'Reach out to Sree Annapurna Agency for retail orders, agency distributorship, and bulk institutional supply.',
      'Commercial Hub: Sree Annapurna Agency Wholesale Distribution Depot.',
      'Wholesale Trade Desk: wholesale@sreeannapurnaagency.com',
      'Customer Care & Support: contact@sreeannapurnaagency.com',
      'Operating Hours: Monday to Saturday, 9:00 AM – 7:00 PM IST (Warehouse dispatch operating 6 days a week).',
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    kicker: 'Help & Information',
    text: [
      'What brands does Sree Annapurna Agency represent? We are authorized carrying and forwarding distributors for Swastik Pickles & Masalas, Rala Food Specialists, Monkey 555, Monkey VVV, Aruna Masala, and Deeppam Aarti.',
      'Are products genuine manufacturer-sealed? Yes, 100%. Every item in our catalogue is factory-sealed by its original manufacturer and carries complete batch and expiry labeling.',
      'How do wholesale orders work? Retailers, supermarkets, and institutions can submit wholesale enquiries via our portal. We provide tiered price sheets, invoice terms, and dedicated van dispatch schedules.',
      'Can retail customers order online? Yes. Retail customers can order directly through this catalogue. Orders are fulfilled via local dispatch with payment on delivery.',
    ],
  },
  shipping: {
    title: 'Shipping & Delivery Policy',
    kicker: 'Logistics',
    text: [
      'We provide prompt delivery for both retail dispatches and commercial bulk shipments.',
      'Timelines: In-stock orders are processed within 24 hours of agency confirmation.',
      'Logistics fleet: Dedicated local delivery vans for city retail routes and trusted freight carriers for inter-district commercial consignments.',
      'Packaging standard: All orders are packed in heavy-duty protective corrugated cartons to ensure zero transit damage.',
    ],
  },
  returns: {
    title: 'Returns & Damages Policy',
    kicker: 'Quality Assurance',
    text: [
      'All goods supplied by Sree Annapurna Agency carry authentic manufacturer seals.',
      'In the rare event of transit damage or packaging breach, please report within 48 hours of delivery.',
      'Our dispatch team will promptly arrange verification and immediate replacement or commercial credit note adjustment.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    kicker: 'Data Protection',
    text: [
      'Sree Annapurna Agency respects your business and personal privacy.',
      'Customer and trade information collected during checkout, wholesale enquiries, and account creation is used strictly for fulfilling orders and communicating business updates.',
      'We do not sell, rent, or trade your contact or business records to third parties.',
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    kicker: 'Commercial Terms',
    text: [
      'All catalogue prices, packing formats, and minimum order quantities are subject to standard agency distribution terms.',
      'Commercial wholesale accounts and credit facilities are governed by written distributor agreements.',
      'Goods remain the property of Sree Annapurna Agency until fully settled in accordance with invoice terms.',
    ],
  },
}

export function InfoPage({ page }: { page: keyof typeof infoContent }) {
  const info = infoContent[page]
  return (
    <div className="container page-space">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>{info.title}</span>
      </div>
      <div className="info-page">
        <p className="eyebrow">{info.kicker}</p>
        <h1>{info.title}</h1>
        <div className="info-copy">
          {info.text.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
        <Link className="button button-dark" to="/contact">
          Contact Agency Support
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="container page-space">
      <div className="confirmation not-found">
        <p className="eyebrow">404 · Page Not Found</p>
        <h1>Let’s find our way back.</h1>
        <p>The page you are looking for may have moved or the address is incorrect.</p>
        <Link className="button button-dark" to="/">
          Return to Home
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
