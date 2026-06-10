'use client'
import { useState, useEffect } from 'react'

// Shared product visual. Shows a real packaging photo when a working image URL
// is supplied, gracefully falling back large → 400px → illustrated brand pack
// if an image is missing or fails to load (dead link, offline).
export default function ProductPack({ product, compact = false, large = false }) {
  const candidates = []
  if (large && product.imageLarge) candidates.push(product.imageLarge)
  if (product.image) candidates.push(product.image)

  const [idx, setIdx] = useState(0)
  useEffect(() => { setIdx(0) }, [product.image, product.imageLarge])

  if (!compact && idx < candidates.length) {
    return (
      <div className="product-image-container">
        <img
          src={candidates[idx]}
          alt={product.name}
          className="product-real-image"
          loading="lazy"
          onError={() => setIdx((i) => i + 1)}
        />
      </div>
    )
  }

  return (
    <div
      className={`product-pack ${compact ? 'compact' : ''}`}
      style={{ '--pack': product.color, '--ink': product.ink }}
    >
      <span className="pack-company">{product.brand}</span>
      <strong>{product.accent}</strong>
      <span className="pack-line" />
      <small>{product.category}</small>
    </div>
  )
}
