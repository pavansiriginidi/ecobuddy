import React, { useState } from "react";
import PaymentModal from "./PaymentModal";

function CartSummary({ cart, getPrice, total, handlePayment, clearCart, username }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const onPaymentSuccess = (paymentDetails) => {
    handlePayment(paymentDetails);
  };

  return (
    <>
      <div className="cart-fab-container">
        <button
          className="cart-toggle-btn"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close cart" : "Open cart"}
          aria-expanded={isOpen}
        >
          <span className="cart-toggle-icon">🛒</span>
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </button>

        {isOpen && (
          <div className="cart-summary">
            <div className="cart-summary-header">
              <h3 className="cart-title">🛍️ Your Cart</h3>
              <button
                className="cart-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            <div className="cart-items">
              {Object.keys(cart).length === 0 ? (
                <p style={{ padding: "10px", textAlign: "center", color: "#999" }}>
                  No items yet
                </p>
              ) : (
                Object.entries(cart).map(([name, qty]) => (
                  <div key={name} className="cart-item">
                    <span className="cart-item-name">{name}</span>
                    <span className="cart-item-qty">{qty}</span>
                  </div>
                ))
              )}
            </div>

            {itemCount > 0 && (
              <>
                <div className="cart-user-chip" style={{ padding: "0 16px 10px", color: "#374151", fontSize: "0.9rem" }}>
                  <strong>User:</strong> {username || "Guest"}
                </div>
                <div className="cart-total">
                  <span>Total:</span>
                  <span>₹{total}</span>
                </div>
                <button
                  type="button"
                  className="clear-cart-btn"
                  onClick={clearCart}
                >
                  🗑️ Clear Cart
                </button>
                <button
                  className="checkout-btn"
                  onClick={() => setShowPaymentModal(true)}
                >
                  💳 Checkout ({itemCount} items)
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={total}
        itemCount={itemCount}
        cartItems={cart}
        username={username || "Guest"}
        onPaymentSuccess={onPaymentSuccess}
      />
    </>
  );
}

export default CartSummary;
