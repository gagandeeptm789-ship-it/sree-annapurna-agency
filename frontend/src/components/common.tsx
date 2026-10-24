import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Plus, ShoppingBag } from 'lucide-react'
import type { Product } from '../types'
import { useStore } from '../context/StoreContext'

const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

export function ImageAsset({
  src,
  alt,
  fallback,
  className = '',
  fallbackClassName = '',
  loading = 'lazy',
  fit = 'contain',
}: {
  src: string
  alt: string
  fallback: string
  className?: string
  fallbackClassName?: string
  loading?: 'eager' | 'lazy'
  fit?: 'contain' | 'cover'
}) {
  const [loadedSrc, setLoadedSrc] = useState('')
  const [failedSrc, setFailedSrc] = useState('')
  const hasImage = Boolean(src) && failedSrc !== src
  const isLoaded = loadedSrc === src

  return (
    <span className={`image-asset ${className}`} aria-busy={hasImage && !isLoaded}>
      {hasImage ? (
        <>
          <img
            src={src}
            alt={alt}
            loading={loading}
            decoding="async"
            data-loaded={isLoaded}
            data-fit={fit}
            onLoad={() => setLoadedSrc(src)}
            onError={() => setFailedSrc(src)}
          />
          {!isLoaded && <span className="image-loading" aria-hidden="true" />}
        </>
      ) : (
        <span className={`image-fallback ${fallbackClassName}`} role="img" aria-label={alt || fallback}>
          {failedSrc === src && src ? 'Image unavailable' : fallback}
        </span>
      )}
    </span>
  )
}

export function ProductCard({ product }: { product: Product }) {
  const { brands, addToCart, isOwnerAuthenticated } = useStore()
  const brand = brands.find((item) => item.id === product.brandId)
  const unavailable = !product.active || product.price <= 0 || product.stock <= 0
  const description =
    product.description.length > 96 ? `${product.description.slice(0, 96).trimEnd()}…` : product.description

  return (
    <article className="product-card">
      <Link
        to={`/product/${product.id}`}
        className="product-image-well"
        aria-label={`View ${product.name}`}
        tabIndex={-1}
      >
        <ImageAsset
          src={product.image}
          alt={`${product.name} packaging illustration`}
          fallback="Packaging illustration"
          className="product-image-asset"
          fallbackClassName="product-image-empty"
          fit="contain"
        />
        {product.pack && (
          <div className="product-card-tags">
            <span className="product-pack-tag">{product.pack}</span>
          </div>
        )}
      </Link>

      <div className="product-card-info">
        <div className="product-brand-line">
          {brand ? (
            <Link to={`/brands/${brand.slug}`} className="product-card-brand">
              {brand.name}
            </Link>
          ) : (
            <span className="product-card-brand">Sree Annapurna Agency</span>
          )}
          {product.sku && <span className="product-sku-code">{product.sku}</span>}
        </div>

        <Link to={`/product/${product.id}`} className="product-name" title={product.name}>
          {product.name}
        </Link>

        <p className="product-short-desc">{description}</p>

        <div className="product-card-meta">
          <div className="product-pricing-block">
            <strong>{product.price > 0 ? money(product.price) : 'Price on enquiry'}</strong>
            <span className="unit-label">{product.price > 0 ? 'Unit price' : 'Contact agency'}</span>
          </div>
          <span className={`product-stock ${product.stock > 0 ? '' : 'out'}`}>
            {product.stock > 0 ? 'In stock' : 'Out of stock'}
          </span>
        </div>

        <div className="product-card-actions">
          <button
            className="button button-primary button-small add-to-basket-btn"
            aria-label={`Add ${product.name} to cart`}
            disabled={unavailable}
            onClick={() => addToCart(product)}
          >
            {unavailable ? <Check size={14} /> : <Plus size={14} />}
            <span>{unavailable ? 'Unavailable' : 'Add to cart'}</span>
          </button>
          <Link className="view-details-link" to={`/product/${product.id}`}>
            View details <ArrowRight size={13} />
          </Link>
        </div>

        {isOwnerAuthenticated && (
          <Link to="/admin/products" className="owner-photo-hint" title="Update packaging image in the owner panel">
            Update packaging image
          </Link>
        )}
      </div>
    </article>
  )
}

export function SectionTitle({
  kicker,
  title,
  description,
  action,
  to = '/shop',
}: {
  kicker?: string
  title: string
  description?: string
  action?: string
  to?: string
}) {
  return (
    <div className="section-title">
      <div className="section-title-copy">
        {kicker && <p className="eyebrow">{kicker}</p>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && (
        <Link className="section-action-link" to={to}>
          <span>{action}</span>
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}

export function EmptyState({
  title,
  text,
  link = '/shop',
  actionText = 'Browse product catalogue',
}: {
  title: string
  text: string
  link?: string
  actionText?: string
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <ShoppingBag size={22} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      <Link className="button button-primary" to={link}>
        {actionText}
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}

export function Notice() {
  const { notice } = useStore()
  if (!notice) return null
  return (
    <div role="status" aria-live="polite" className="toast">
      <Check size={16} aria-hidden="true" />
      <span>{notice}</span>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card product-card-skeleton" aria-hidden="true">
      <div className="skeleton product-skeleton-media" />
      <div className="product-card-info">
        <div className="skeleton product-skeleton-line" style={{ width: '42%' }} />
        <div className="skeleton product-skeleton-line" style={{ width: '88%', height: 16 }} />
        <div className="skeleton product-skeleton-line" style={{ width: '64%' }} />
        <div className="skeleton product-skeleton-line" style={{ width: '100%', height: 36, marginTop: 8 }} />
      </div>
    </div>
  )
}
