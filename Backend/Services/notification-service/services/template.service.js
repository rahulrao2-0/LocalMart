class TemplateService {
    getTemplate(type, data) {
        let subject = "LocalMart Notification";
        let htmlContent = `<h1>${data.title || "Notification"}</h1><p>${data.message}</p>`;

        switch (type) {
            case 'ORDER_CREATED':
                subject = "Order Placed Successfully - LocalMart";
                htmlContent = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #6C5DD3;">🛒 Order Placed Successfully!</h2>
                        <p>Hi,</p>
                        <p>Your order has been placed. We are currently waiting for payment confirmation.</p>
                        <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #6C5DD3; margin: 20px 0;">
                            <strong>Message:</strong> ${data.message}
                        </blockquote>
                        <p>Thank you for shopping with LocalMart!</p>
                    </div>
                `;
                break;
            case 'ORDER_CONFIRMED':
                subject = "Order Confirmed! - LocalMart";
                htmlContent = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #4caf50;">✅ Order Confirmed!</h2>
                        <p>Hi,</p>
                        <p>Great news! Your payment was successful, and your order has been confirmed.</p>
                        
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #333;">Order Details</h3>
                            <p><strong>Order ID:</strong> ${data.metadata?.orderNumber || data.metadata?.orderId}</p>
                            <p><strong>Amount Paid:</strong> ₹${data.metadata?.totalAmount || '0.00'}</p>
                            <p><strong>Date & Time:</strong> ${data.metadata?.createdAt ? new Date(data.metadata.createdAt).toLocaleString() : new Date().toLocaleString()}</p>
                            <p><strong>Fulfillment Method:</strong> ${data.metadata?.fulfillmentMode === 'PICKUP' ? '🛍️ Store Self-Pickup' : '🚚 Home Delivery'}</p>
                        </div>

                        ${data.metadata?.fulfillmentMode === 'PICKUP' 
                            ? `<p><strong>Note for Pickup:</strong> Please head to the store to collect your order. You can show this email or your Order ID at the counter.</p>` 
                            : `<p>Your order is now being processed by the merchant and a delivery partner will be assigned soon. Track it inside your profile app.</p>`}
                        
                        <p>Thank you for shopping with LocalMart!</p>
                    </div>
                `;
                break;
            case 'ORDER_CANCELLED':
                subject = "Order Cancelled - LocalMart";
                htmlContent = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #f44336;">❌ Order Cancelled</h2>
                        <p>Hi,</p>
                        <p>We wanted to let you know that your order has been cancelled.</p>
                        <blockquote style="background: #fdf2f2; padding: 15px; border-left: 4px solid #f44336; margin: 20px 0;">
                            <strong>Message:</strong> ${data.message}
                        </blockquote>
                        <p>If you have any questions, please contact our helpline.</p>
                    </div>
                `;
                break;
            case 'ORDER_STATUS_UPDATED':
                subject = `Order Update: ${data.title || "Status Updated"} - LocalMart`;
                htmlContent = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #2196f3;">📦 Order Update</h2>
                        <p>Hi,</p>
                        <p>${data.message}</p>
                        <blockquote style="background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0;">
                            <strong>Status:</strong> ${data.metadata?.newStatus || 'Updated'}
                        </blockquote>
                        <p>Thank you for shopping with LocalMart!</p>
                    </div>
                `;
                break;
            case 'PAYMENT_FAILED':
                subject = "Payment Failed - LocalMart";
                htmlContent = `<h1>Payment Failed</h1><p>Dear user, your payment failed. Please try again. Details: ${data.message}</p>`;
                break;
            case 'REVIEW_RECEIVED':
                subject = "New Review Received - LocalMart";
                htmlContent = `<h1>New Review!</h1><p>You received a new review on your product. ${data.message}</p>`;
                break;
            case 'DELIVERY_ASSIGNED':
                subject = "Delivery Assigned - LocalMart";
                htmlContent = `<h1>Delivery Assigned</h1><p>Your order has been assigned for delivery. ${data.message}</p>`;
                break;
            case 'DELIVERY_COMPLETED':
                subject = "Delivery Completed - LocalMart";
                htmlContent = `<h1>Delivery Completed</h1><p>Your order has been delivered successfully! ${data.message}</p>`;
                break;
        }

        return { subject, htmlContent };
    }
}

export default new TemplateService();
