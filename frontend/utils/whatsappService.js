/**
 * WhatsApp Business Cloud API Service
 * Sends order notifications to admin via Meta's WhatsApp Business Cloud API
 */

/**
 * Send WhatsApp order notification to admin
 * @param {Object} order - Order document from MongoDB
 * @returns {Promise<Object>} - { success: boolean, message: string }
 */
async function sendWhatsAppOrderNotification(order) {
  try {
    // Get environment variables
    const accessToken = process.env.META_WA_TOKEN;
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
    const adminPhoneNumber = process.env.ADMIN_WHATSAPP_NUMBER || '201005801990';

    // Validate required environment variables
    if (!accessToken || !phoneNumberId) {
      console.error('WhatsApp notification: Missing required environment variables');
      return {
        success: false,
        message: 'WhatsApp service not configured. Missing META_WA_TOKEN or META_PHONE_NUMBER_ID'
      };
    }

    // Format phone number (remove + if present, ensure it starts with country code)
    const recipientPhone = adminPhoneNumber.replace(/^\+/, '');

    // Format order items for message
    const itemsList = order.items
      .map((item, index) => {
        // Handle weight options if present
        const weightInfo = item.weightOption 
          ? ` (${item.weightOption.label || `${item.weightOption.grams}g`})` 
          : '';
        // Calculate item total
        const itemTotal = item.total || (item.price * item.quantity);
        return `${index + 1}. ${item.name}${weightInfo} - Qty: ${item.quantity} x ${item.price} EGP = ${itemTotal} EGP`;
      })
      .join('\n');

    // Format full address
    const fullAddress = [
      order.shippingAddress.address,
      order.shippingAddress.city,
      order.shippingAddress.state,
      order.shippingAddress.zipCode,
      order.shippingAddress.country
    ].filter(Boolean).join(', ');

    // Prepare template parameters
    // Template variables mapping:
    // {{1}} = Order ID
    // {{2}} = Customer Name
    // {{3}} = Customer Phone
    // {{4}} = City
    // {{5}} = Full Address
    // {{6}} = Items List
    // {{7}} = Order Total
    // {{8}} = Payment Method
    const templateParams = [
      order.orderNumber || order._id.toString(), // {{1}}
      order.shippingAddress.fullName || 'Customer', // {{2}}
      order.shippingAddress.phone || 'N/A', // {{3}}
      order.shippingAddress.city || 'N/A', // {{4}}
      fullAddress, // {{5}}
      itemsList, // {{6}}
      `${order.pricing.totalPrice} EGP`, // {{7}}
      order.paymentInfo.method === 'cash_on_delivery' ? 'Cash on Delivery' : 
      order.paymentInfo.method === 'stripe' ? 'Stripe (Paid)' : 
      order.paymentInfo.method || 'N/A' // {{8}}
    ];

    // Meta WhatsApp API endpoint
    const apiUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

    // Request payload for template message
    const payload = {
      messaging_product: 'whatsapp',
      to: recipientPhone,
      type: 'template',
      template: {
        name: 'qaser_new_order', // Template name (must be approved in Meta)
        language: {
          code: 'en' // or 'ar' for Arabic
        },
        components: [
          {
            type: 'body',
            parameters: templateParams.map(param => ({
              type: 'text',
              text: String(param)
            }))
          }
        ]
      }
    };

    // Make API request to Meta
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData
      });
      
      return {
        success: false,
        message: `WhatsApp API error: ${responseData.error?.message || response.statusText}`,
        error: responseData
      };
    }

    console.log('WhatsApp notification sent successfully:', {
      orderNumber: order.orderNumber,
      messageId: responseData.messages?.[0]?.id,
      recipient: recipientPhone
    });

    return {
      success: true,
      message: 'WhatsApp notification sent successfully',
      messageId: responseData.messages?.[0]?.id
    };

  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return {
      success: false,
      message: `Failed to send WhatsApp notification: ${error.message}`,
      error: error.message
    };
  }
}

/**
 * Send WhatsApp notification with retry logic
 * @param {Object} order - Order document
 * @param {Number} maxRetries - Maximum number of retry attempts (default: 1)
 * @returns {Promise<Object>}
 */
async function sendWhatsAppOrderNotificationWithRetry(order, maxRetries = 1) {
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      // Wait 2 seconds before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Retrying WhatsApp notification (attempt ${attempt + 1}/${maxRetries + 1})...`);
    }

    const result = await sendWhatsAppOrderNotification(order);
    
    if (result.success) {
      return result;
    }
    
    lastError = result;
  }

  return lastError;
}

module.exports = {
  sendWhatsAppOrderNotification,
  sendWhatsAppOrderNotificationWithRetry
};
