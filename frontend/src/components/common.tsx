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
          {!isLoaded && <span className="image-loading" aria-hidden="true">Loading image…</span>}
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

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-wrap">
        <ImageAsset
          src={product.image}
          alt={product.name}
          fallback="Packaged retail product"
          className="product-image-asset"
          fallbackClassName="product-image-empty"
          fit="contain"
        />
        <div className="product-card-tags">
          {product.category && <span className="product-tag">{product.category}</span>}
          {product.pack && <span className="product-pack-tag">{product.pack}</span>}
        </div>
      </Link>

      <div className="product-card-info">
        <div className="product-brand-line">
          <Link to={`/brands/${brand?.slug}`} className="product-card-brand">
            {brand?.name ?? 'Sree Annapurna Agency'}
          </Link>
          {product.sku && <span className="product-sku-code">{product.sku}</span>}
        </div>

        <Link to={`/product/${product.id}`} className="product-name" title={product.name}>
          {product.name}
        </Link>

        <p className="product-short-desc">
          {product.description.length > 80 ? `${product.description.slice(0, 80)}…` : product.description}
        </p>

        <div className="product-card-bottom">
          <div className="product-pricing-block">
            <strong>{product.price > 0 ? money(product.price) : 'Trade Enquiries'}</strong>
            {product.price > 0 && <small className="unit-label">Retail / Unit Price</small>}
          </div>

          <div className="product-card-actions">
            {isOwnerAuthenticated && (
              <Link
                to="/admin/products"
                className="owner-photo-hint"
                title="Update photo in Owner Panel"
              >
                📷 Photo
              </Link>
            )}
            <button
              className="button button-dark button-small add-to-basket-btn"
              aria-label={`Add ${product.name} to cart`}
              disabled={unavailable}
              onClick={() => addToCart(product)}
            >
              {unavailable ? <Check size={14} /> : <Plus size={14} />}
              <span>{unavailable ? 'Unavailable' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export function SectionTitle({ kicker, title, action, to = '/shop' }: { kicker?: string; title: string; action?: string; to?: string }) {
  return (
    <div className="section-title">
      <div>
        {kicker && <p className="eyebrow">{kicker}</p>}
        <h2>{title}</h2>
      </div>
      {action && (
        <Link className="text-link" to={to}>
          {action}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}

export function EmptyState({ title, text, link = '/shop' }: { title: string; text: string; link?: string }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><ShoppingBag size={24} /></span>
      <h3>{title}</h3>
      <p>{text}</p>
      <Link className="button button-dark" to={link}>
        Explore the shop
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}

export function Notice() {
  const { notice } = useStore()
  return notice ? <div role="status" className="toast"><Check size={17} />{notice}</div> : null
}
