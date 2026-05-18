import React, { useState } from "react";

function PaymentModal({ isOpen, onClose, total, itemCount, onPaymentSuccess, cartItems }) {
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [formData, setFormData] = useState({
    upiId: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: ""
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); 

  const validateUPI = (upiId) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiRegex.test(upiId);
  };

  const validateCard = () => {
    const newErrors = {};
    
    if (!formData.cardNumber.replace(/\s/g, "").match(/^\d{16}$/)) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }
    if (!formData.cardName.trim()) {
      newErrors.cardName = "Cardholder name is required";
    }
    if (!formData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiryDate = "Format: MM/YY";
    } else {
      const [month, year] = formData.expiryDate.split("/");
      const expiry = new Date(2000 + parseInt(year), parseInt(month));
      if (expiry < new Date()) {
        newErrors.expiryDate = "Card has expired";
      }
    }
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = "CVV must be 3-4 digits";
    }
    
    return newErrors;
  };

  const validateForm = () => {
    const newErrors = {};

    if (paymentMethod === "upi") {
      if (!formData.upiId.trim()) {
        newErrors.upiId = "UPI ID is required";
      } else if (!validateUPI(formData.upiId)) {
        newErrors.upiId = "Invalid UPI ID format (e.g., name@bank)";
      }
    } else if (paymentMethod === "card") {
      return validateCard();
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = value.replace(/\D/g, "").slice(0, 16);
      formattedValue = formattedValue.replace(/(\d{4})/g, "$1 ").trim();
    } else if (name === "expiryDate") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + "/" + formattedValue.slice(2);
      }
    } else if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setFormData({ ...formData, [name]: formattedValue });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const processPayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Random success/failure (90% success rate for demo)
      const success = Math.random() < 0.9;

      if (success) {
        setPaymentStatus("success");
        setTimeout(() => {
          onPaymentSuccess();
          resetModal();
        }, 1500);
      } else {
        setPaymentStatus("error");
        setTimeout(() => {
          setIsProcessing(false);
          setPaymentStatus(null);
        }, 2000);
      }
    }, 2000);
  };

  const resetModal = () => {
    setFormData({
      upiId: "",
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: ""
    });
    setErrors({});
    setIsProcessing(false);
    setPaymentStatus(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={resetModal}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        {/* Payment Status - Success */}
        {paymentStatus === "success" && (
          <div className="payment-success-screen">
            <div className="success-animation">✓</div>
            <h2>Payment Successful! 🎉</h2>
            <p>Transaction completed successfully</p>
            <p className="success-amount">Amount: ₹{total}</p>
          </div>
        )}

        {/* Payment Status - Error */}
        {paymentStatus === "error" && (
          <div className="payment-error-screen">
            <div className="error-icon">✕</div>
            <h2>Payment Failed 😢</h2>
            <p>Please try again or use a different payment method</p>
            <button 
              className="retry-btn"
              onClick={() => setPaymentStatus(null)}
              disabled={isProcessing}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Payment Form */}
        {paymentStatus === null && (
          <>
            <div className="payment-header">
              <h2>💳 Payment Gateway</h2>
              <button className="payment-close" onClick={resetModal}>×</button>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <h3>Order Summary</h3>
              <p>{itemCount} items in cart</p>
              <div className="summary-total">
                <strong>Total Amount:</strong>
                <strong style={{ color: "#10b981" }}>₹{total}</strong>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="payment-method-tabs">
              <button
                className={`method-tab ${paymentMethod === "upi" ? "active" : ""}`}
                onClick={() => {
                  setPaymentMethod("upi");
                  setErrors({});
                }}
              >
                📱 UPI Payment
              </button>
              <button
                className={`method-tab ${paymentMethod === "card" ? "active" : ""}`}
                onClick={() => {
                  setPaymentMethod("card");
                  setErrors({});
                }}
              >
                💳 Card Payment
              </button>
            </div>

            {/* UPI Payment Form */}
            {paymentMethod === "upi" && (
              <div className="payment-form">
                <div className="form-group">
                  <label htmlFor="upiId">UPI ID</label>
                  <input
                    id="upiId"
                    type="text"
                    name="upiId"
                    placeholder="yourname@bankname"
                    value={formData.upiId}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                    className={errors.upiId ? "input-error" : ""}
                  />
                  {errors.upiId && <span className="error-msg">{errors.upiId}</span>}
                  <small>Format: username@bankname (e.g., john@okhdfcbank)</small>
                </div>

                <div className="upi-info">
                  <p>💡 <strong>Test UPI IDs:</strong></p>
                  <ul>
                    <li>user@paytm</li>
                    <li>test@okhdfcbank</li>
                    <li>demo@ibl</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Card Payment Form */}
            {paymentMethod === "card" && (
              <div className="payment-form">
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    id="cardNumber"
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                    maxLength="19"
                    className={errors.cardNumber ? "input-error" : ""}
                  />
                  {errors.cardNumber && <span className="error-msg">{errors.cardNumber}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="cardName">Cardholder Name</label>
                  <input
                    id="cardName"
                    type="text"
                    name="cardName"
                    placeholder="John Doe"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                    className={errors.cardName ? "input-error" : ""}
                  />
                  {errors.cardName && <span className="error-msg">{errors.cardName}</span>}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                      id="expiryDate"
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      disabled={isProcessing}
                      maxLength="5"
                      className={errors.expiryDate ? "input-error" : ""}
                    />
                    {errors.expiryDate && <span className="error-msg">{errors.expiryDate}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      id="cvv"
                      type="password"
                      name="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      disabled={isProcessing}
                      maxLength="4"
                      className={errors.cvv ? "input-error" : ""}
                    />
                    {errors.cvv && <span className="error-msg">{errors.cvv}</span>}
                  </div>
                </div>

                <div className="card-info">
                  <p>💡 <strong>Test Card Numbers:</strong></p>
                  <ul>
                    <li>4111 1111 1111 1111 (Visa)</li>
                    <li>5555 5555 5555 4444 (Mastercard)</li>
                  </ul>
                  <p style={{ fontSize: "0.85rem", marginTop: "8px", color: "#666" }}>
                    Use any future expiry date and any 3-digit CVV
                  </p>
                </div>
              </div>
            )}

            {/* Payment Button */}
            <div className="payment-actions">
              <button
                className="payment-cancel-btn"
                onClick={resetModal}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                className="payment-submit-btn"
                onClick={processPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  `Pay ₹${total}`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;
