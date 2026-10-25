import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, Check, Clock, Copy, CreditCard, FileText, Loader2, MapPin, Minus, PackageCheck, Phone, Plus, QrCode, Search, ShieldCheck, ShoppingBag, Truck, User, X } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { categories } from '../data/catalog'
import type { Product } from '../types'
import { EmptyState, ImageAsset, ProductCard, SectionTitle } from '../components/common'
import { apiClient } from '../services/apiClient'

const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

export function HomePage() {
  const { brands, products } = useStore()
  const activeProducts = products.filter((product) => product.active)
  const featured = activeProducts.slice(0, 8)
  const heroPicks = activeProducts.slice(0, 4)

  const categoryGroups = [
    {
      title: 'Food products',
      items: ['Pickles', 'Spice powders', 'Blended masalas', 'Instant mixes', 'Pantry staples', 'Herbs'],
    },
    {
      title: 'Household and pooja care',
      items: ['Cleaning tools', 'Cleaning liquids', 'Cleaning powders', 'Laundry care', 'Dish care', 'Pooja essentials'],
    },
  ]

  const countInCategories = (list: string[]) =>
    activeProducts.filter((product) => list.includes(product.category)).length

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1 className="hero-heading">
              Regional FMCG brands for <em>shops and households</em>.
            </h1>
            <p className="hero-lead">
              Sree Annapurna Agency distributes six South Indian packaged brands — pickles, ground spices, masala
              blends, instant mixes, home cleaning and pooja essentials — from our Shimoga depot to retailers and
              households.
            </p>
            <div className="hero-cta-group">
              <Link className="button button-primary" to="/shop">
                Shop products
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link className="button button-secondary" to="/wholesale">
                Wholesale enquiry
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <div className="hero-facts">
              <div className="hero-fact">
                <strong>{brands.length}</strong>
                <span>brand lines distributed</span>
              </div>
              <div className="hero-fact">
                <strong>{activeProducts.length}</strong>
                <span>catalogue products</span>
              </div>
              <div className="hero-fact">
                <strong>Retail &amp; trade</strong>
                <span>ordering paths</span>
              </div>
            </div>
          </div>

          <div className="hero-lineup">
            <div className="lineup-head">
              <strong>Selected from the catalogue</strong>
              <span>{activeProducts.length} products</span>
            </div>
            <div className="lineup-grid">
              {heroPicks.map((product) => (
                <Link className="lineup-tile" key={product.id} to={`/product/${product.id}`}>
                  <span className="lineup-media">
                    <ImageAsset
                      src={product.image}
                      alt={`${product.name} packaging illustration`}
                      fallback="Packaging illustration"
                      fit="contain"
                      loading="eager"
                    />
                  </span>
                  <span className="lineup-meta">
                    <strong>{product.name}</strong>
                    <span>
                      {product.pack} · {money(product.price)}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
            <p className="lineup-footnote">
              <PackageCheck size={13} aria-hidden="true" /> Illustrative packaging; actual pack artwork may differ.
            </p>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="highlights">
          <div className="highlight">
            <div className="highlight-top">
              <Truck size={17} aria-hidden="true" />
              <strong>Agency distribution</strong>
            </div>
            <p>
              Carrying and forwarding agency for {brands.length} regional manufacturers, dispatching sealed retail packs
              and case lots from the Shimoga depot.
            </p>
          </div>
          <div className="highlight">
            <div className="highlight-top">
              <ShoppingBag size={17} aria-hidden="true" />
              <strong>Retail and trade ordering</strong>
            </div>
            <p>
              Households can order retail packs online with cash on delivery. Retailers, caterers and institutions
              submit requirements through the wholesale desk.
            </p>
          </div>
          <div className="highlight">
            <div className="highlight-top">
              <PackageCheck size={17} aria-hidden="true" />
              <strong>Packaging shown as supplied</strong>
            </div>
            <p>
              Catalogue images are illustrations of the manufacturer packaging we distribute. Actual pack artwork,
              weight and batch details come with the stock.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Polished Brand Showcase */}
      <section className="section container" id="brands">
        <SectionTitle
          title="Brands we distribute"
          description={`Six manufacturer relationships covering ${activeProducts.length} products in the current catalogue.`}
          action="Shop all products"
        />
        <div className="brand-grid">
          {brands.map((brand) => {
            const count = products.filter((p) => p.brandId === brand.id).length
            return (
              <article className="brand-card" key={brand.id}>
                <div className="brand-card-media">
                  <ImageAsset
                    src={brand.image}
                    alt={`${brand.name} brand artwork`}
                    fallback="Brand artwork"
                    className="brand-card-asset"
                    fit="contain"
                  />
                </div>
                <div className="brand-card-body">
                  <div className="brand-card-topline">
                    <span>{brand.category}</span>
                    <span>{count} products</span>
                  </div>
                  <h3>{brand.name}</h3>
                  <p>{brand.description}</p>
                </div>
                
                <Link to={`/brands/${brand.slug}`} className="brand-card-link">
                  <span>View {count} products</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </article>
            )
          })}
        </div>
      </section>

      {/* Featured products */}
      <section className="section section-tint">
        <div className="container">
          <SectionTitle
            title="Featured products"
            description="A cross-section of the catalogue — packaged food lines and household essentials."
            action="Shop all products"
          />
          {featured.length ? (
            <div className="product-grid">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No products in the catalogue</h3>
              <p>Product information is currently being updated.</p>
            </div>
          )}
        </div>
      </section>

      {/* Category directory */}
      <section className="section container" id="categories">
        <SectionTitle
          title="Browse by category"
          description="Categories follow what is actually stocked, with food lines and household care grouped separately."
        />
        <div className="category-directory">
          {categoryGroups.map((group) => (
            <div className="category-group" key={group.title}>
              <div className="category-group-head">
                <h3>{group.title}</h3>
                <span>{countInCategories(group.items)} products</span>
              </div>
              {group.items.map((item) => {
                const total = activeProducts.filter((product) => product.category === item).length
                return (
                  <Link className="category-row" key={item} to={`/shop?category=${encodeURIComponent(item)}`}>
                    <span className="category-row-name">{item}</span>
                    <span className="category-row-count">
                      {total} product{total === 1 ? '' : 's'}
                    </span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </section>

      {/* Wholesale supply */}
      <section className="container">
        <div className="wholesale-banner">
          <div className="wholesale-copy">
            <p className="eyebrow light">Wholesale supply</p>
            <h2>Case-lot supply for retailers, caterers and institutions</h2>
            <p>
              Send your requirement to the wholesale desk. The agency prepares pricing and dispatch options based on the
              brand lines, pack sizes and quantities you need.
            </p>
            <div className="wholesale-features">
              <div>
                <Check size={14} aria-hidden="true" /> Cartons and case lots from the stocked range
              </div>
              <div>
                <Check size={14} aria-hidden="true" /> Manufacturer-sealed packs with batch details
              </div>
              <div>
                <Check size={14} aria-hidden="true" /> Dispatch arranged from the Shimoga depot
              </div>
              <div>
                <Check size={14} aria-hidden="true" /> Written enquiry kept for trade follow-up
              </div>
            </div>
            <div className="wholesale-actions">
              <Link className="button button-cream" to="/wholesale">
                Submit wholesale enquiry
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <aside className="wholesale-aside">
            <h3>Catalogue at a glance</h3>
            <dl>
              <div>
                <dt>Brand lines</dt>
                <dd>{brands.length}</dd>
              </div>
              <div>
                <dt>Catalogue products</dt>
                <dd>{activeProducts.length}</dd>
              </div>
              <div>
                <dt>Dispatch base</dt>
                <dd>Shimoga</dd>
              </div>
              <div>
                <dt>Trade hours</dt>
                <dd>Mon – Sat</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {/* Contact the agency */}
      <section className="container contact-section">
        <div>
          <h2>Talk to the agency</h2>
          <p className="lede">
            For retail order questions, delivery coordination or wholesale supply, use the desk that matches your
            requirement.
          </p>
          <div className="hero-cta-group contact-actions">
            <Link className="button button-primary" to="/wholesale">
              Wholesale enquiry
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link className="button button-secondary" to="/contact">
              Contact details
            </Link>
          </div>
        </div>
        <div className="contact-detail-grid">
          <div className="contact-block">
            <span>Depot</span>
            <strong>
              Wholesale Market Yard, APMC Road
              <br />
              Shimoga, Karnataka — 577201
            </strong>
            <small>Carrying and forwarding point for the stocked range.</small>
          </div>
          <div className="contact-block">
            <span>Wholesale desk</span>
            <a href="mailto:wholesale@sreeannapurnaagency.com">wholesale@sreeannapurnaagency.com</a>
            <small>Pricing, case lots and distributor terms.</small>
          </div>
          <div className="contact-block">
            <span>Customer care</span>
            <a href="mailto:contact@sreeannapurnaagency.com">contact@sreeannapurnaagency.com</a>
            <small>Retail orders, delivery and returns.</small>
          </div>
          <div className="contact-block">
            <span>Trade hours</span>
            <strong>
              Monday – Saturday
              <br />
              9:00 AM – 7:00 PM
            </strong>
            <small>Order dispatch on working days.</small>
          </div>
        </div>
      </section>
    </>
  )
}

export function ShopPage() {
  const { products, brands } = useStore()
  const [params, setParams] = useSearchParams();
  const queryFromUrl = params.get('q') ?? params.get('search') ?? '';
  const [query, setQuery] = useState(queryFromUrl);
  const category = params.get('category') ?? 'All categories';
  const brandId = params.get('brand') ?? 'All brands';
  const sort = params.get('sort') ?? 'featured';
  const available = params.get('available') === 'true';
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setQuery(queryFromUrl);
    setVisibleCount(12);
  }, [queryFromUrl]);

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
          <h1>All products</h1>
          <p>
            Packaged foods and household essentials from the {brands.length} brand lines the agency distributes. Prices
            shown are the unit price for the pack size listed.
          </p>
        </div>
      </div>

      <div className="shop-toolbar">
        <label className="search-field">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search by product name, brand, category or SKU</span>
          <input
            value={query}
            onChange={(event) => { setQuery(event.target.value); setVisibleCount(12) }}
            placeholder="Search product, brand or SKU"
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
                <span>Business-supplied product photograph</span>
              </div>
            ) : (
              <div className="packaging-visual-badge">
                <PackageCheck size={15} />
                <span>Illustration of the manufacturer packaging; actual pack artwork may differ.</span>
              </div>
            )}
            {isOwnerAuthenticated && (
              <Link to="/admin/products" className="owner-upload-shortcut">
                Upload packaging image in owner panel
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
              className="button button-primary"
              disabled={unavailable}
              onClick={() => addToCart(product, quantity)}
            >
              Add to cart
              <Plus size={16} aria-hidden="true" />
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
            title={`More from ${brand?.name ?? 'this brand'}`}
            action="View brand"
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
  const { cart, products, brands, setCartQuantity, removeFromCart, customer } = useStore()
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
          <h1>Your basket ({details.length} item{details.length === 1 ? '' : 's'})</h1>
          <p>Quantities can be changed here before you continue to checkout.</p>
        </div>
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
          <Link
            className="button button-primary full-button"
            to={customer ? '/checkout' : '/login?redirect=/checkout'}
          >
            {customer ? 'Proceed to checkout' : 'Sign in to checkout'}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          {!customer && (
            <p className="summary-note" style={{ marginTop: '10px', fontSize: '0.8125rem', color: '#68716B' }}>
              🔒 Customer sign-in required before placing an order. Your basket items are preserved.
            </p>
          )}
          <Link className="continue-link" to="/shop">
            <ArrowLeft size={15} /> Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  )
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, products, brands, removeFromCart, notify, placeOrderAsync, updateOrder, customer } = useStore()

  // Mandatory customer sign-in: Redirect unauthenticated guests to login with redirect back to checkout
  useEffect(() => {
    if (!customer) {
      notify('Please sign in or create an account to proceed with checkout.')
      navigate('/login?redirect=/checkout', { replace: true })
    }
  }, [customer, navigate, notify])

  const [placed, setPlaced] = useState(false)
  const [orderReference, setOrderReference] = useState('')
  const [orderAccessToken, setOrderAccessToken] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE' | 'UPI'>('COD')
  const [utrNumber, setUtrNumber] = useState('')
  const [upiNotes, setUpiNotes] = useState('')
  const [copiedNumber, setCopiedNumber] = useState(false)

  const copyUpiNumber = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('6360074675')
      setCopiedNumber(true)
      setTimeout(() => setCopiedNumber(false), 2500)
      notify('UPI Number 6360074675 copied to clipboard.')
    }
  }
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid' | 'Failed'>('Pending')
  const [orderStatus, setOrderStatus] = useState<string>('Pending')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false)
  const [sandboxModalOpen, setSandboxModalOpen] = useState(false)
  const [sandboxData, setSandboxData] = useState<{
    orderId: string
    amount: number
    sandboxTransactionId?: string
    testSignature?: string
  } | null>(null)

  const [name, setName] = useState(customer?.name ?? '')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(customer?.email ?? '')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')
  const [notes, setNotes] = useState('') 
  
  const useCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not available in this browser. Please enter your address manually.')
      return
    }

    setIsLocating(true)
    setLocationMessage('')

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        })
      })

      const query = new URLSearchParams({
        latitude: String(position.coords.latitude),
        longitude: String(position.coords.longitude),
        localityLanguage: 'en',
      })
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${query}`)
      if (!response.ok) {
        throw new Error('Address lookup failed')
      }

      const result = await response.json() as {
        locality?: string
        city?: string
        principalSubdivision?: string
        postcode?: string
      }
      const detectedCity = result.city?.trim() || result.locality?.trim() || result.principalSubdivision?.trim() || ''
      const detectedAddress = result.locality?.trim() || detectedCity
      const detectedPincode = result.postcode?.trim() || ''

      if (!detectedAddress && !detectedCity && !detectedPincode) {
        setLocationMessage('We could not find an address for this location. Please enter your address manually.')
        return
      }

      if (detectedAddress) setAddress(detectedAddress)
      if (detectedCity) setCity(detectedCity)
      if (detectedPincode) setPincode(detectedPincode)
      setLocationMessage('Location found. Please review and edit your delivery address before placing the order.')
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage('Location permission was denied. You can enter your address manually.')
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationMessage('Your location is unavailable right now. Please enter your address manually.')
        } else {
          setLocationMessage('We could not get your location in time. Please try again or enter your address manually.')
        }
      } else {
        setLocationMessage('We could not look up an address for your location. Please enter your address manually.')
      }
    } finally {
      setIsLocating(false)
    }
  }

  useEffect(() => {
    if (customer) {
      if (!name && customer.name) setName(customer.name)
      if (!email && customer.email) setEmail(customer.email)
    }
  }, [customer])

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

  const handleDownloadInvoice = async () => {
    if (!orderReference) return
    setIsDownloadingInvoice(true)
    const fallbackOrder = placedSnapshot ? {
      orderId: orderReference,
      accessToken: orderAccessToken,
      customer: placedSnapshot.delivery.name,
      customerEmail: placedSnapshot.delivery.email,
      phone: placedSnapshot.delivery.phone,
      deliveryDetails: placedSnapshot.delivery,
      items: placedSnapshot.items.map((i) => ({
        name: i.product.name,
        pack: i.pack,
        quantity: i.quantity,
        unitPrice: i.product.price,
      })),
      total: placedSnapshot.total,
      status: orderStatus,
      payment: paymentStatus,
      paymentMethod: paymentMethod === 'ONLINE' ? 'Online Payment (UPI/Cards)' : paymentMethod === 'UPI' ? 'UPI / PhonePe' : 'Cash on Delivery / Agency Invoice',
      paymentDetails: paymentMethod === 'UPI' ? {
        provider: 'phonepe_upi',
        payeeName: 'GAGAN DEEP',
        payeeUpiNumber: '6360074675',
        utrNumber: utrNumber.trim(),
        verificationStatus: 'Pending Verification',
      } : undefined,
    } : undefined

    const res = await apiClient.downloadInvoicePdf(orderReference, orderAccessToken || undefined, fallbackOrder)
    setIsDownloadingInvoice(false)
    if (res.success) {
      notify('Official Sree Annapurna Agency PDF invoice downloaded.')
    } else {
      notify(res.message || 'Unable to download PDF invoice. Please try again.')
    }
  }

  const handleSandboxSuccess = async () => {
    if (!sandboxData) return
    setIsProcessingPayment(true)
    const verified = await apiClient.verifyPayment({
      orderId: sandboxData.orderId,
      sandboxTransactionId: sandboxData.sandboxTransactionId,
      testSignature: sandboxData.testSignature,
    })
    setIsProcessingPayment(false)
    setSandboxModalOpen(false)
    if (verified) {
      setPaymentStatus('Paid')
      setOrderStatus('Confirmed')
      updateOrder(sandboxData.orderId, { payment: 'Paid', status: 'Confirmed' })
      setPlaced(true)
      notify('Online payment verified successfully! Order confirmed.')
    } else {
      setPaymentStatus('Failed')
      updateOrder(sandboxData.orderId, { payment: 'Failed' })
      setPlaced(true)
      notify('Payment verification failed on the server.')
    }
  }

  const handleSandboxFailure = async () => {
    if (!sandboxData) return
    setIsProcessingPayment(true)
    await apiClient.recordPaymentFailure(sandboxData.orderId, 'Customer cancelled or dismissed test transaction')
    setIsProcessingPayment(false)
    setSandboxModalOpen(false)
    setPaymentStatus('Failed')
    setOrderStatus('Pending')
    updateOrder(sandboxData.orderId, { payment: 'Failed' })
    setPlaced(true)
    notify('Payment marked as Failed/Cancelled. You can retry anytime.')
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
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

    setIsProcessingPayment(true)
    try {
      const res = await placeOrderAsync({
        total: subtotal,
        customerName: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        notes: notes.trim() || undefined,
        paymentMethod,
      })

      const finalOrderId = res.orderId
      const finalToken = res.accessToken || ''
      setOrderReference(finalOrderId)
      setOrderAccessToken(finalToken)

      if (paymentMethod === 'ONLINE') {
        // Initiate Razorpay payment
        const paymentOrder = await apiClient.createPaymentOrder(finalOrderId)
        if (paymentOrder && (paymentOrder.mode === 'sandbox_test_gateway' || paymentOrder.mode === 'test_mode')) {
          // Open interactive test payment simulation
          setSandboxData({
            orderId: finalOrderId,
            amount: paymentOrder.displayAmount || paymentOrder.amount ? (paymentOrder.displayAmount || (paymentOrder.amount / 100)) : subtotal,
            sandboxTransactionId: paymentOrder.sandboxTransactionId,
            testSignature: paymentOrder.testSignature,
          })
          setSandboxModalOpen(true)
          setIsProcessingPayment(false)
          return
        }

        if (paymentOrder && (window as any).Razorpay && paymentOrder.razorpayOrderId) {
          const rzp = new (window as any).Razorpay({
            key: paymentOrder.keyId,
            amount: paymentOrder.amount,
            currency: 'INR',
            name: 'Sree Annapurna Agency',
            description: `Order ${finalOrderId}`,
            order_id: paymentOrder.razorpayOrderId,
            prefill: {
              name: name.trim(),
              email: email.trim(),
              contact: phone.trim(),
            },
            theme: { color: '#B52B24' },
            handler: async (resp: any) => {
              const verified = await apiClient.verifyPayment({
                orderId: finalOrderId,
                razorpayPaymentId: resp.razorpay_payment_id,
                razorpayOrderId: resp.razorpay_order_id,
                razorpaySignature: resp.razorpay_signature,
              })
              if (verified) {
                setPaymentStatus('Paid')
                setOrderStatus('Confirmed')
                updateOrder(finalOrderId, { payment: 'Paid', status: 'Confirmed' })
                setPlaced(true)
                notify('Online payment verified successfully! Order confirmed.')
              } else {
                setPaymentStatus('Failed')
                updateOrder(finalOrderId, { payment: 'Failed' })
                setPlaced(true)
                notify('Payment verification failed.')
              }
            },
            modal: {
              ondismiss: async () => {
                await apiClient.recordPaymentFailure(finalOrderId, 'Customer dismissed payment gateway')
                setPaymentStatus('Failed')
                updateOrder(finalOrderId, { payment: 'Failed' })
                setPlaced(true)
                notify('Payment cancelled by customer.')
              }
            }
          })
          rzp.open()
          setIsProcessingPayment(false)
          return
        }

        // Fallback to test gateway modal if SDK not loaded
        setSandboxData({
          orderId: finalOrderId,
          amount: subtotal,
          sandboxTransactionId: paymentOrder?.sandboxTransactionId,
          testSignature: paymentOrder?.testSignature,
        })
        setSandboxModalOpen(true)
        setIsProcessingPayment(false)
        return
      }

      // COD flow
      setPaymentStatus('Pending')
      setOrderStatus('Pending')
      setPlaced(true)
      notify('Order placed successfully! We will prepare your dispatch.')
    } catch (err: any) {
      setCheckoutError(err?.message || 'Failed to place order. Please try again.')
    } finally {
      setIsProcessingPayment(false)
    }
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
          <p className="eyebrow">Order placed</p>
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
            <span className={`status-pill status-${orderStatus.toLowerCase()}`}>
              {orderStatus === 'Confirmed' ? 'Agency Confirmed' : 'Pending Agency Confirmation'}
            </span>
          </div>
          <div className="overview-chip">
            <span>Payment Method</span>
            <span className={`payment-pill payment-${paymentStatus.toLowerCase()}`}>
              {paymentMethod === 'ONLINE' ? 'Online Payment (UPI/Cards)' : 'Cash on Delivery / Agency Invoice'}
            </span>
          </div>
          <div className="overview-chip">
            <span>Payment Status</span>
            <span className={`payment-pill payment-${paymentStatus.toLowerCase()}`}>
              {paymentStatus}
            </span>
          </div>
          <div className="overview-chip">
            <span>Total</span>
            <strong>{money(placedSnapshot.total)}</strong>
          </div>
        </div>

        {paymentStatus === 'Failed' && (
          <div style={{ padding: '16px 20px', background: '#fdf2f2', border: '1px solid #f8b4b4', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9b1c1c' }}>
              <AlertCircle size={22} />
              <div>
                <strong>Online Payment Unsuccessful</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem' }}>Your order is saved under reference {orderReference}. You can retry online payment now or settle upon delivery.</p>
              </div>
            </div>
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                setSandboxData({ orderId: orderReference, amount: placedSnapshot.total })
                setSandboxModalOpen(true)
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <CreditCard size={16} /> Retry Online Payment
            </button>
          </div>
        )}

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

        {/* 4 Customer Actions Buttons (Never links to /admin) */}
        <div className="customer-order-buttons-bar">
          <Link
            to={`/account/orders/${orderReference}${orderAccessToken ? `?token=${encodeURIComponent(orderAccessToken)}` : ''}`}
            className="button button-dark"
          >
            <Truck size={17} />
            Track My Order
          </Link>
          <button
            type="button"
            className="button button-outline"
            onClick={handleDownloadInvoice}
            disabled={isDownloadingInvoice}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {isDownloadingInvoice ? <Loader2 size={17} className="animate-spin" /> : <FileText size={17} />}
            {isDownloadingInvoice ? 'Downloading PDF...' : 'Download Invoice (PDF)'}
          </button>
          <Link to="/account/orders" className="button button-outline">
            <PackageCheck size={17} />
            View My Orders
          </Link>
          <Link to="/shop" className="continue-link">
            <ArrowLeft size={15} />
            Continue Shopping
          </Link>
        </div>

        {sandboxModalOpen && sandboxData && (
          <div className="modal-backdrop" role="presentation" onClick={() => setSandboxModalOpen(false)}>
            <div
              className="admin-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Payment Gateway Simulator"
              style={{ maxWidth: '520px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-heading">
                <div>
                  <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', background: '#f5eee6', color: '#B52B24', borderRadius: '4px', marginBottom: '4px' }}>
                    ONLINE PAYMENT GATEWAY
                  </span>
                  <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Razorpay Sandbox Simulator</h2>
                </div>
                <button className="icon-button" onClick={() => setSandboxModalOpen(false)} aria-label="Close dialog">
                  <X size={19} />
                </button>
              </div>

              <div style={{ padding: '16px 20px', background: '#faf8f2', borderRadius: '8px', margin: '16px 0', border: '1px solid #e7e8e2' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.875rem', color: '#68716b' }}>
                  Merchant: <strong style={{ color: '#202722' }}>SREE ANNAPURNA AGENCY</strong>
                </p>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.875rem', color: '#68716b' }}>
                  Order Reference: <strong style={{ color: '#202722' }}>{sandboxData.orderId}</strong>
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', marginTop: '10px', borderTop: '1px dashed #d0d2ca' }}>
                  <span style={{ fontWeight: 600, color: '#202722' }}>Total Payable</span>
                  <strong style={{ fontSize: '1.4rem', color: '#B52B24' }}>{money(sandboxData.amount)}</strong>
                </div>
              </div>

              <div style={{ padding: '12px 14px', background: '#fff9ea', border: '1px solid #f2e3b6', borderRadius: '6px', marginBottom: '20px', fontSize: '0.8125rem', color: '#7a5b00' }}>
                ℹ️ <strong>Sandbox Gateway Notice:</strong> Live Razorpay API keys are not yet configured in <code>backend/.env</code>. You can simulate success to test the verified order confirmation and invoice generation lifecycle, or simulate failure to test cancellation handling.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  className="button button-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={isProcessingPayment}
                  onClick={handleSandboxSuccess}
                >
                  {isProcessingPayment ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Simulate Payment Success (Mark Paid &amp; Confirmed)
                </button>
                <button
                  type="button"
                  className="button button-outline"
                  style={{ width: '100%', justifyContent: 'center', borderColor: '#d32f2f', color: '#d32f2f' }}
                  disabled={isProcessingPayment}
                  onClick={handleSandboxFailure}
                >
                  <X size={16} />
                  Simulate Payment Failure / Cancel
                </button>
              </div>
            </div>
          </div>
        )}
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
          <h1>Checkout</h1>
          <p>
            Delivery and contact details for this order. Placing the order records it with the agency; confirmation
            follows after review.
          </p>
        </div>
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
            <div>
              <button
                type="button"
                className="button button-outline"
                onClick={useCurrentLocation}
                disabled={isLocating}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {isLocating ? <Loader2 size={16} className="animate-spin" /> : null}
                {isLocating ? 'Getting Location...' : '📍 Use My Current Location'}
              </button>
              {locationMessage && <p role="status" style={{ margin: '8px 0 0', fontSize: '0.875rem' }}>{locationMessage}</p>}
            </div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('COD')}
                style={{ cursor: 'pointer' }}
              >
                <span className="payment-radio-bullet" />
                <div>
                  <strong>Cash on Delivery / Agency Invoice</strong>
                  <p>Payment collected upon delivery or via authorized wholesale agency terms.</p>
                </div>
              </div>

              <div
                className={`payment-option ${paymentMethod === 'ONLINE' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('ONLINE')}
                style={{ cursor: 'pointer' }}
              >
                <span className="payment-radio-bullet" />
                <div>
                  <strong>Online Payment (UPI, Debit/Credit Card, NetBanking)</strong>
                  <p>Instant online settlement via Razorpay with instant order confirmation.</p>
                </div>
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
          <button
            className="button button-primary full-button"
            type="submit"
            disabled={isProcessingPayment}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {isProcessingPayment ? <Loader2 size={16} className="animate-spin" /> : null}
            {isProcessingPayment ? 'Processing Order...' : paymentMethod === 'ONLINE' ? 'Proceed to Online Payment' : 'Place Order'}
            {!isProcessingPayment && <ArrowRight size={16} aria-hidden="true" />}
          </button>
          <p className="summary-note">By placing your order, you confirm delivery details with Sree Annapurna Agency.</p>
        </aside>
      </form>

      {sandboxModalOpen && sandboxData && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSandboxModalOpen(false)}>
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Payment Gateway Simulator"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', background: '#f5eee6', color: '#B52B24', borderRadius: '4px', marginBottom: '4px' }}>
                  ONLINE PAYMENT GATEWAY
                </span>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Razorpay Sandbox Simulator</h2>
              </div>
              <button className="icon-button" onClick={() => setSandboxModalOpen(false)} aria-label="Close dialog">
                <X size={19} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', background: '#faf8f2', borderRadius: '8px', margin: '16px 0', border: '1px solid #e7e8e2' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.875rem', color: '#68716b' }}>
                Merchant: <strong style={{ color: '#202722' }}>SREE ANNAPURNA AGENCY</strong>
              </p>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.875rem', color: '#68716b' }}>
                Order Reference: <strong style={{ color: '#202722' }}>{sandboxData.orderId}</strong>
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', marginTop: '10px', borderTop: '1px dashed #d0d2ca' }}>
                <span style={{ fontWeight: 600, color: '#202722' }}>Total Payable</span>
                <strong style={{ fontSize: '1.4rem', color: '#B52B24' }}>{money(sandboxData.amount)}</strong>
              </div>
            </div>

            <div style={{ padding: '12px 14px', background: '#fff9ea', border: '1px solid #f2e3b6', borderRadius: '6px', marginBottom: '20px', fontSize: '0.8125rem', color: '#7a5b00' }}>
              ℹ️ <strong>Sandbox Gateway Notice:</strong> Live Razorpay API keys are not yet configured in <code>backend/.env</code>. You can simulate success to test the verified order confirmation and invoice generation lifecycle, or simulate failure to test cancellation handling.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="button button-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={isProcessingPayment}
                onClick={handleSandboxSuccess}
              >
                {isProcessingPayment ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Simulate Payment Success (Mark Paid &amp; Confirmed)
              </button>
              <button
                type="button"
                className="button button-outline"
                style={{ width: '100%', justifyContent: 'center', borderColor: '#d32f2f', color: '#d32f2f' }}
                disabled={isProcessingPayment}
                onClick={handleSandboxFailure}
              >
                <X size={16} />
                Simulate Payment Failure / Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function CustomerOrdersPage() {
  const { getCustomerOrders, customer } = useStore()
  const orders = getCustomerOrders()

  if (!customer) {
    return (
      <div className="container page-space">
        <div className="breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/account">Account</Link>
          <span>/</span>
          <span>My Orders</span>
        </div>
        <div className="auth-prompt" style={{ textAlign: 'center', padding: '60px 20px', background: '#faf8f2', borderRadius: '8px', border: '1px solid #e7e8e2', margin: '40px auto', maxWidth: '640px' }}>
          <p className="eyebrow" style={{ color: '#B52B24', fontWeight: 700 }}>Customer Sign-in Required</p>
          <h1 style={{ fontSize: '1.75rem', margin: '8px 0 12px 0' }}>View Your Order History</h1>
          <p style={{ color: '#68716B', marginBottom: '24px' }}>
            Please sign in to your Sree Annapurna Agency account to view your past orders, delivery tracking, and download official PDF invoices.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="button button-primary" to="/login?redirect=/account/orders">
              Sign In <ArrowRight size={16} />
            </Link>
            <Link className="button button-outline" to="/register?redirect=/account/orders">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
          <p>Orders for {customer.name} ({customer.email})</p>
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

              <div className="customer-order-footer" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Link to={`/account/orders/${order.id}`} className="button button-dark button-small">
                  <Truck size={14} />
                  Track Order
                </Link>
                <button
                  type="button"
                  className="button button-outline button-small"
                  onClick={() => apiClient.downloadInvoicePdf(order.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <FileText size={14} />
                  Invoice (PDF)
                </button>
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
  const [searchParams] = useSearchParams()
  const tokenParam = searchParams.get('token')
  const { orders, products, brands, getCustomerOrders, isOwnerAuthenticated, customer, notify } = useStore()
  const [isDownloading, setIsDownloading] = useState(false)
  const order = orders.find((item) => item.id === id)
  const myOrders = getCustomerOrders()

  if (!order) return <NotFoundPage />

  // Customer isolation check (owner, authenticated customer owning this order, or matching guest token)
  const isCustomerOwner = customer && order.customerEmail && order.customerEmail.toLowerCase() === customer.email.toLowerCase()
  const isAuthorized = isOwnerAuthenticated || isCustomerOwner || myOrders.some((o) => o.id === order.id) || (tokenParam && order.accessToken === tokenParam)

  if (!isAuthorized) {
    return (
      <div className="container page-space">
        <div className="breadcrumbs">
          <Link to="/">Home</Link><span>/</span><Link to="/account/orders">My Orders</Link>
        </div>
        <div className="unauthorized-order-state">
          <p className="eyebrow">Access Notice</p>
          <h2>Order Record Restricted</h2>
          <p>This order is associated with another customer account. Please sign in with the customer account used to place this order.</p>
          <div className="auth-buttons">
            <Link to="/login" className="button button-dark">Sign In</Link>
            <Link to="/account/orders" className="button button-outline">View My Orders</Link>
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
          <h1>Order {order.id}</h1>
          <p>
            Placed {order.date} · Current status: <strong>{order.status}</strong>
          </p>
        </div>
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
              Payment Status: <span className={`payment-pill payment-${order.payment.toLowerCase()}`}>{order.payment}</span> {order.paymentMethod ? `(${order.paymentMethod})` : '(Cash on delivery / Agency invoice)'}
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
          <div><span>Order Status</span><strong>{order.status}</strong></div>
          <div><span>Payment Status</span><strong>{order.payment}</strong></div>
          {order.paymentMethod && <div><span>Payment Method</span><small style={{ fontSize: '0.78125rem', color: '#68716b' }}>{order.paymentMethod}</small></div>}
          <div className="summary-total"><span>Grand Total</span><strong>{money(order.total)}</strong></div>
          
          <button
            type="button"
            className="button button-primary full-button"
            onClick={async () => {
              setIsDownloading(true)
              const res = await apiClient.downloadInvoicePdf(order.id, order.accessToken || tokenParam || undefined)
              setIsDownloading(false)
              if (res.success) {
                notify(`Official PDF invoice for ${order.id} downloaded.`)
              } else {
                notify(res.message || 'Unable to download invoice.')
              }
            }}
            disabled={isDownloading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}
          >
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {isDownloading ? 'Downloading PDF...' : 'Download Invoice (PDF)'}
          </button>

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
  const { signInLocal, signInRemote, registerRemote, notify } = useStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/account'
  const isFromCheckout = redirectTarget === '/checkout'

  const [passwordVisible, setPasswordVisible] = useState(false)
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    const name = String(data.get('name') ?? '').trim()
    const phone = String(data.get('phone') ?? '').trim()

    if (register && data.get('password') !== data.get('confirmPassword')) {
      setFormError('The passwords do not match. Please re-enter them.')
      notify('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      if (register) {
        const res = await registerRemote({ name, email, password, phone })
        if (res.success) {
          notify(`Welcome to Sree Annapurna Agency, ${name}!`)
          navigate(redirectTarget)
          return
        } else {
          // Fallback to local session
          signInLocal(name, email)
          notify(`Signed in as ${name}`)
          navigate(redirectTarget)
          return
        }
      } else {
        const res = await signInRemote(email, password)
        if (res.success) {
          notify('Signed in successfully!')
          navigate(redirectTarget)
          return
        } else {
          // Fallback to local session
          signInLocal(name || email.split('@')[0], email)
          notify(`Signed in as ${email}`)
          navigate(redirectTarget)
          return
        }
      }
    } catch {
      signInLocal(name || email.split('@')[0], email)
      navigate(redirectTarget)
    } finally {
      setLoading(false)
    }
  }

  const togglePassword = () => setPasswordVisible((visible) => !visible)
  const passwordLabel = passwordVisible ? 'Hide password' : 'Show password'

  return (
    <div className="container page-space auth-page">
      <div className="auth-shell">
        <aside className="auth-context">
          <Link className="brand-lockup" to="/">
            <span className="brand-mark" aria-hidden="true">
              <span>SA</span>
            </span>
            <span className="brand-wordmark">
              <strong>SREE ANNAPURNA</strong>
              <small>Agency · wholesale &amp; distribution</small>
            </span>
          </Link>
          <h2>{register ? 'One account for your retail orders.' : 'Your order history, kept together.'}</h2>
          <p>
            An account keeps your order references, delivery details and invoices in one place. Trade buyers use the
            same sign-in and contact the wholesale desk for case lots.
          </p>
          <ul className="auth-context-list">
            <li>
              <Check size={15} aria-hidden="true" /> Track the status of orders you place
            </li>
            <li>
              <Check size={15} aria-hidden="true" /> Reuse delivery details at checkout
            </li>
            <li>
              <Check size={15} aria-hidden="true" /> Keep order references for trade follow-up
            </li>
          </ul>
        </aside>

        <div className="auth-card">
          <div className="auth-card-shop-header" style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e7e8e2', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f5eee6', color: '#B52B24', padding: '4px 12px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
              <ShieldCheck size={13} />
              OFFICIAL CUSTOMER PORTAL
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: '1.75rem', margin: '4px 0 4px 0', color: '#173F35', letterSpacing: '-0.02em', fontWeight: 800 }}>
              SREE ANNAPURNA AGENCY
            </h2>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#68716B', fontWeight: 500 }}>
              Wholesale &amp; Retail Consumer Goods Distribution · Shimoga
            </p>
          </div>

          {isFromCheckout && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: '#fdf2f2', border: '1px solid #f8b4b4', borderRadius: '6px', marginBottom: '18px', fontSize: '0.8125rem', color: '#9b1c1c' }}>
              <ShoppingBag size={18} style={{ flexShrink: 0 }} />
              <span><strong>Sign-in required for checkout:</strong> Please sign in or register to complete your order. Your basket items are safely preserved.</span>
            </div>
          )}

          <div>
            <h1 style={{ fontSize: '1.35rem', marginBottom: '4px' }}>{register ? 'Create an account' : 'Sign in'}</h1>
            <p className="auth-intro">
              {register
                ? 'Enter your details to create a customer account with Sree Annapurna Agency.'
                : 'Enter your details to continue to your customer account.'}
            </p>
          </div>

          <form className="form-stack" onSubmit={submit}>
            <div className="form-field">
              <label htmlFor="account-name">Full name</label>
              <input id="account-name" name="name" autoComplete="name" placeholder="Your name" required />
            </div>

            <div className="form-field">
              <label htmlFor="account-email">Email address</label>
              <input
                id="account-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="account-password">Password</label>
              <span className="password-input">
                <input
                  id="account-password"
                  name="password"
                  type={passwordVisible ? 'text' : 'password'}
                  autoComplete={register ? 'new-password' : 'current-password'}
                  minLength={6}
                  placeholder="At least 6 characters"
                  required
                />
                <button type="button" onClick={togglePassword} aria-label={passwordLabel}>
                  {passwordVisible ? 'Hide' : 'Show'}
                </button>
              </span>
            </div>

            {register && (
              <div className="form-field">
                <label htmlFor="account-confirm-password">Confirm password</label>
                <span className="password-input">
                  <input
                    id="account-confirm-password"
                    name="confirmPassword"
                    type={passwordVisible ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={6}
                    placeholder="Repeat your password"
                    required
                  />
                  <button type="button" onClick={togglePassword} aria-label={passwordLabel}>
                    {passwordVisible ? 'Hide' : 'Show'}
                  </button>
                </span>
              </div>
            )}

            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            <button className="button button-primary full-button" type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Please wait...' : register ? 'Create account' : 'Sign in'}
              {!loading && <ArrowRight size={16} aria-hidden="true" />}
            </button>
          </form>

          <p className="auth-switch">
            {register ? 'Already have an account?' : 'New to Sree Annapurna Agency?'}{' '}
            <Link to={register ? `/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}` : `/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`}>
              {register ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
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
