import React, { useEffect, useState } from "react";
import { searchPexelsImage, FALLBACK_IMAGES } from "../services/imageService";

function ProductCard({ product, cart, updateQty, getPrice }) {
  const qty = cart[product.name] || 0;
  const [imgSrc, setImgSrc] = useState(product.img || FALLBACK_IMAGES[product.name] || "");

  const handleAddToCart = () => {
    updateQty(product, 1);
  };

  const handleRemoveFromCart = () => {
    if (qty > 0) {
      updateQty(product, -1);
    }
  };

  const handleEcoSuggest = () => {
    updateQty(product, 1);
  };

  useEffect(() => {
    let mounted = true;
    if (product.img) {
      setImgSrc(product.img);
      return;
    }

    const load = async () => {
      try {
        const url = await searchPexelsImage(product.name);
        if (mounted) setImgSrc(url || FALLBACK_IMAGES[product.name] || "");
      } catch {
        if (mounted) setImgSrc(FALLBACK_IMAGES[product.name] || "");
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [product]);

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img src={imgSrc} alt={product.name} className="product-image" />
        <span className="product-category-badge">{product.category}</span>
      </div>
      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">₹{product.price}</p>
        
        <div className="product-actions">
          <button 
            className="product-btn add-to-cart-btn"
            onClick={handleAddToCart}
          >
            + Add
          </button>
          <button 
            className="product-btn eco-suggest-btn"
            onClick={handleEcoSuggest}
            title="Get eco tips"
          >
            💡 Tips
          </button>
        </div>

        {qty > 0 && (
          <div style={{ 
            padding: '10px', 
            background: '#f0fdf4', 
            borderRadius: '8px', 
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            <strong>In Cart: {qty}</strong>
            <button 
              onClick={handleRemoveFromCart}
              style={{
                display: 'block',
                width: '100%',
                marginTop: '8px',
                padding: '6px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
