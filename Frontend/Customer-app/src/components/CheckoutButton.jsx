import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid"; 

// Dynamically inject Razorpay so it doesn't block page load
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutButton({ cartAmount, userId, sellerId, items, shippingAddress }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // 1. Generate unique idempotency key for this specific checkout attempt
      const idempotencyKey = uuidv4();

      // 2. Create Order in Backend via API Gateway (Port 3000)
      const orderRes = await fetch("http://localhost:3000/api/v1/orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-idempotency-key": idempotencyKey, 
        },
        body: JSON.stringify({ 
          totalAmount: cartAmount, 
          customerId: userId,
          sellerId: sellerId || "dummy_seller_id",
          items: items || [{ productId: "p1", productName: "Item", quantity: 1, price: cartAmount, subtotal: cartAmount }],
          shippingAddress: shippingAddress || { address: "123 Main St", city: "City", postalCode: "12345", country: "IN" },
          subtotal: cartAmount,
          paymentMethod: "RAZORPAY"
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || "Failed to create order");
      }

      // 3. Load SDK
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) throw new Error("Could not load payment gateway.");

      // 4. Configure popup options using payment details returned from backend
      const { payment } = orderData; // payment object contains Razorpay details

      const options = {
        key: payment.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID, // Key from backend or env
        amount: payment.amount,
        currency: payment.currency || "INR",
        name: "LocalMart",
        description: "Order Purchase",
        order_id: payment.razorpayOrderId,
        theme: { color: "#3399cc" },
        
        // 5. The Verification Handler calls API Gateway /payments/verify
        handler: async (response) => {
          const verifyRes = await fetch("http://localhost:3000/api/v1/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment successful! Order is confirmed.");
            // Redirect to success page here
          } else {
            alert("Payment verification failed.");
          }
        },
      };

      // 6. Open Modal
      const rzp = new window.Razorpay(options);
      
      // Handle the user closing the modal or payment failing
      rzp.on("payment.failed", function (response) {
        alert(`Payment Failed: ${response.error.description}`);
      });
      
      rzp.open();
      
    } catch (error) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={isProcessing}
      style={{ padding: "12px 24px", background: "#3399cc", color: "white", border: "none", borderRadius: "5px" }}
    >
      {isProcessing ? "Processing..." : `Pay ₹${cartAmount}`}
    </button>
  );
}
