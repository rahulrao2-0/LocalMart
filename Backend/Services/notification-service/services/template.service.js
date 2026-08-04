class TemplateService {
    getTemplate(type, data) {
        let subject = "LocalMart Notification";
        let htmlContent = `<h1>${data.title || "Notification"}</h1><p>${data.message}</p>`;

        switch (type) {
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
