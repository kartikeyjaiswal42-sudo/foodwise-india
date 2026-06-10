import { useState, useEffect } from 'react'

// Shared product visual. Shows a real packaging photo when a working image URL
// is supplied, and gracefully falls back to the illustrated brand pack if the
// image is missing or fails to load (e.g. dead CDN link, offline).
export default function ProductPack({ product, compact = false }) {
  const [imgFailed, setImgFailed] = useState(false)

  // Reset the failure flag if this component instance is reused for a different image.
  useEffect(() => {
    setImgFailed(false)
  }, [product.image])

  if (product.image && !compact && !imgFailed) {
    return (
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-real-image"
          loading="lazy"
          onError={() => setImgFailed(true)}
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
