const { Resend } = require('resend');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to check if Resend is configured
const isResendConfigured = () => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not found. Email features will be disabled.');
    return false;
  }
  return true;
};

// Send OTP verification code for login/signup
const sendOTPEmail = async (email, otpCode, isNewUser = false) => {
  if (!isResendConfigured()) {
    console.log('Resend not configured. Skipping OTP email.');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const greeting = isNewUser ? 'Welcome to ALKASR! 🎉' : 'Welcome back! 👋';
    const message = isNewUser
      ? 'To complete your account creation and get started, please verify your email with the code below.'
      : 'To continue signing in to your account, please use the verification code below.';

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ALKASR - Verification Code</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #ffffff;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .container {
            max-width: 500px;
            margin: 0 auto;
          }
          
          .email-card {
            background: linear-gradient(145deg, #2a2a3e 0%, #1e1e2e 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .logo {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            letter-spacing: -1px;
          }
          
          .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          
          .content {
            padding: 40px 30px;
            background: linear-gradient(145deg, #2a2a3e 0%, #1e1e2e 100%);
          }
          
          .greeting {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .greeting h2 {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #ffffff;
          }
          
          .greeting p {
            font-size: 16px;
            color: #b8b8b8;
            line-height: 1.5;
          }
          
          .verification-section {
            background: linear-gradient(145deg, #3a3a4e 0%, #2a2a3e 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
          }
          
          .verification-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
          }
          
          .verification-label {
            font-size: 14px;
            font-weight: 500;
            color: #b8b8b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
          }
          
          .verification-code {
            font-size: 48px;
            font-weight: 800;
            color: #667eea;
            letter-spacing: 8px;
            margin: 20px 0;
            font-family: 'Inter', monospace;
          }
          
          .security-note {
            background: linear-gradient(145deg, #2d3748 0%, #1a202c 100%);
            border: 1px solid rgba(255, 193, 7, 0.3);
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: left;
          }
          
          .security-note h4 {
            font-size: 14px;
            font-weight: 600;
            color: #fbbf24;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .security-note p {
            font-size: 14px;
            color: #cbd5e0;
            line-height: 1.4;
          }
          
          .footer {
            background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
            padding: 30px;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .footer p {
            font-size: 14px;
            color: #718096;
            margin-bottom: 8px;
          }
          
          .footer .highlight {
            color: #667eea;
            font-weight: 600;
          }
          
          .disclaimer {
            font-size: 12px;
            color: #4a5568;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          @media (max-width: 600px) {
            body { padding: 10px; }
            .header, .content, .footer { padding: 20px; }
            .verification-code {
              font-size: 36px;
              letter-spacing: 6px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-card">
            <div class="header">
              <div class="logo">ALKASR</div>
              <h1>Verification Code</h1>
              <p>${greeting}</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                <h2>Email Verification 📧</h2>
                <p>${message}</p>
              </div>
              
              <div class="verification-section">
                <div class="verification-label">Your Verification Code</div>
                <div class="verification-code">${otpCode}</div>
                <p style="color: #b8b8b8; font-size: 14px; margin-top: 10px;">Enter this code to continue</p>
              </div>
              
              <div class="security-note">
                <h4>🔒 Security Information</h4>
                <p>This verification code will expire in <strong>10 minutes</strong> for your security. Never share this code with anyone. If you didn't request this code, please ignore this email.</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for choosing <span class="highlight">ALKASR</span>!</p>
              <p>If you have any questions, our support team is here to help.</p>
              
              <div class="disclaimer">
                <p>This email was sent to ${email}. If you didn't request this code, please ignore this email.</p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL_AUTH || 'onboarding@resend.dev',
      to: email,
      subject: '🔐 ALKASR - Your Verification Code',
      html: emailHTML,
    });

    if (error) {
      console.error('Resend API error:', error);
      return { success: false, error: error.message };
    }

    console.log('OTP email sent successfully:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send order confirmation email to customer
const sendOrderConfirmationEmail = async (order, customerEmail, customerName = '') => {
  if (!isResendConfigured()) {
    console.log('Resend not configured. Skipping order confirmation email.');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    // Format order items with weight options if available
    const orderItems = order.items.map(item => {
      const itemPrice = item.price || item.weightOption?.price || 0;
      const itemTotal = itemPrice * item.quantity;
      const weightLabel = item.weightOption ? ` (${item.weightOption.label})` : '';

      return `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; display: block;">` : '<div style="width: 60px; height: 60px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">No Image</div>'}
          </td>
          <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${item.name}${weightLabel}</div>
            <div style="font-size: 14px; color: #6b7280;">Quantity: ${item.quantity}</div>
          </td>
          <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111827;">
            EGP ${itemTotal.toFixed(2)}
          </td>
        </tr>
      `;
    }).join('');

    // Calculate totals
    const subtotal = order.subtotal || order.pricing?.itemsPrice || order.items.reduce((sum, item) => {
      const itemPrice = item.price || item.weightOption?.price || 0;
      return sum + (itemPrice * item.quantity);
    }, 0);
    const shipping = order.shippingCost || order.pricing?.shippingPrice || (subtotal >= 100 ? 0 : 10);
    const total = order.total || order.pricing?.totalPrice || (subtotal + shipping);

    // Format shipping address
    const shippingAddr = order.shippingAddress || {};
    const addressLines = [
      shippingAddr.fullName || customerName,
      shippingAddr.address || shippingAddr.street,
      shippingAddr.city ? `${shippingAddr.city}${shippingAddr.state ? ', ' + shippingAddr.state : ''} ${shippingAddr.zipCode || ''}`.trim() : '',
      shippingAddr.country || 'Egypt',
      shippingAddr.phone ? `Phone: ${shippingAddr.phone}` : ''
    ].filter(line => line);

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - ALKASR</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #111827;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
            padding: 40px 30px;
            text-align: center;
            color: #ffffff;
          }
          
          .logo {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            letter-spacing: -1px;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .content { padding: 40px 30px; }
          
          .order-info {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            border-left: 4px solid #d4af37;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
          }
          
          .info-label { color: #6b7280; font-weight: 500; }
          .info-value { color: #111827; font-weight: 600; }
          
          .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .shipping-address {
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            border: 1px solid #e5e7eb;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .summary-box {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
            border: 2px solid #e5e7eb;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-size: 16px;
          }
          
          .summary-label { color: #6b7280; font-weight: 500; }
          .summary-value { color: #111827; font-weight: 600; }
          
          .total-row {
            padding-top: 15px;
            border-top: 2px solid #d4af37;
            margin-top: 15px;
            font-size: 20px;
          }
          
          .total-row .summary-label { color: #111827; font-weight: 700; }
          .total-row .summary-value { color: #d4af37; font-weight: 800; font-size: 24px; }
          
          .footer {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            padding: 30px;
            text-align: center;
            color: #ffffff;
          }
          
          .footer p { margin-bottom: 10px; color: #d1d5db; font-size: 14px; }
          .footer .highlight { color: #d4af37; font-weight: 600; }
          
          .disclaimer {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">ALKASR</div>
            <h1>Order Confirmation</h1>
            <p>Thank you for your purchase! 🎉</p>
          </div>
          
          <div class="content">
            <div class="order-info">
              <div class="info-row">
                <span class="info-label">Order Number:</span>
                <span class="info-value">${order.orderNumber || order._id}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Order Date:</span>
                <span class="info-value">${new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">${(order.status || order.orderStatus || 'Pending').charAt(0).toUpperCase() + (order.status || order.orderStatus || 'Pending').slice(1)}</span>
              </div>
              <div class="info-row" style="margin-bottom: 0;">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${(order.paymentInfo?.method || order.paymentMethod || 'Cash on Delivery').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
            </div>
            
            <h2 class="section-title">Shipping Address</h2>
            <div class="shipping-address">
              <p>${addressLines.join('<br>')}</p>
            </div>
            
            <h2 class="section-title">Order Items</h2>
            <table class="items-table">
              <tbody>
                ${orderItems}
              </tbody>
            </table>
            
            <div class="summary-box">
              <div class="summary-row">
                <span class="summary-label">Subtotal:</span>
                <span class="summary-value">EGP ${subtotal.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Shipping:</span>
                <span class="summary-value">${shipping === 0 ? 'Free' : 'EGP ' + shipping.toFixed(2)}</span>
              </div>
              <div class="summary-row total-row">
                <span class="summary-label">Total:</span>
                <span class="summary-value">EGP ${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for shopping with <span class="highlight">ALKASR</span>!</p>
            <p>We appreciate your business and look forward to serving you again.</p>
            <p>If you have any questions, our support team is here to help.</p>
            
            <div class="disclaimer">
              <p>This email was sent to ${customerEmail}. If you didn't make this order, please contact us immediately.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL_ORDERS || 'onboarding@resend.dev',
      to: customerEmail,
      subject: `Order Confirmation #${order.orderNumber || order._id} - ALKASR`,
      html: emailHTML,
    });

    if (error) {
      console.error('Resend API error:', error);
      return { success: false, error: error.message };
    }

    console.log('Order confirmation email sent successfully:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send order notification email to admin
const sendAdminNotificationEmail = async (order) => {
  if (!isResendConfigured()) {
    console.log('Resend not configured. Skipping admin notification email.');
    return { success: false, message: 'Email service not configured' };
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn('ADMIN_EMAIL not configured. Cannot send admin notification.');
    return { success: false, message: 'Admin email not configured' };
  }

  try {
    // Format order items
    const orderItems = order.items.map(item => {
      const itemPrice = item.price || item.weightOption?.price || 0;
      const itemTotal = itemPrice * item.quantity;
      const weightLabel = item.weightOption ? ` (${item.weightOption.label})` : '';

      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong>${item.name}${weightLabel}</strong>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">EGP ${itemPrice.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">EGP ${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    // Calculate totals
    const subtotal = order.subtotal || order.pricing?.itemsPrice || order.items.reduce((sum, item) => {
      const itemPrice = item.price || item.weightOption?.price || 0;
      return sum + (itemPrice * item.quantity);
    }, 0);
    const shipping = order.shippingCost || order.pricing?.shippingPrice || (subtotal >= 100 ? 0 : 10);
    const total = order.total || order.pricing?.totalPrice || (subtotal + shipping);

    // Format shipping address
    const shippingAddr = order.shippingAddress || {};
    const customerInfo = {
      name: shippingAddr.fullName || 'Not provided',
      address: shippingAddr.address || shippingAddr.street || 'Not provided',
      city: shippingAddr.city || 'Not provided',
      state: shippingAddr.state || '',
      zipCode: shippingAddr.zipCode || '',
      country: shippingAddr.country || 'Egypt',
      phone: shippingAddr.phone || 'Not provided'
    };

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Notification - ALKASR</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #111827;
            background: #f3f4f6;
            padding: 20px;
          }
          
          .email-container {
            max-width: 700px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }
          
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 30px;
            color: #ffffff;
            text-align: center;
          }
          
          .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.95;
          }
          
          .alert-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            margin: 20px 30px;
            border-radius: 6px;
          }
          
          .alert-box p {
            color: #92400e;
            font-weight: 600;
            font-size: 14px;
          }
          
          .content { padding: 30px; }
          
          .info-section {
            background: #f9fafb;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 25px;
            border: 1px solid #e5e7eb;
          }
          
          .info-section h3 {
            font-size: 16px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #d1d5db;
          }
          
          .info-row {
            display: flex;
            margin-bottom: 10px;
            font-size: 14px;
          }
          
          .info-label {
            flex: 0 0 140px;
            color: #6b7280;
            font-weight: 500;
          }
          
          .info-value {
            flex: 1;
            color: #111827;
            font-weight: 600;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .items-table th {
            background: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-size: 13px;
            font-weight: 700;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .items-table th:nth-child(2),
          .items-table th:nth-child(3),
          .items-table th:nth-child(4) {
            text-align: right;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 15px;
          }
          
          .summary-row.total {
            border-top: 2px solid #10b981;
            margin-top: 10px;
            padding-top: 15px;
            font-size: 18px;
          }
          
          .summary-row.total .label { color: #111827; font-weight: 700; }
          .summary-row.total .value { color: #10b981; font-weight: 800; }
          
          .footer {
            background: #f9fafb;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          
          .footer p {
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🔔 New Order Received</h1>
            <p>Order #${order.orderNumber || order._id}</p>
          </div>
          
          <div class="alert-box">
            <p>⚡ Action Required: A new order has been placed and requires processing.</p>
          </div>
          
          <div class="content">
            <div class="info-section">
              <h3>Order Information</h3>
              <div class="info-row">
                <span class="info-label">Order Number:</span>
                <span class="info-value">${order.orderNumber || order._id}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Order Date:</span>
                <span class="info-value">${new Date(order.createdAt || Date.now()).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Order Status:</span>
                <span class="info-value">${(order.status || 'Pending').charAt(0).toUpperCase() + (order.status || 'Pending').slice(1)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${(order.paymentInfo?.method || 'Cash on Delivery').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Status:</span>
                <span class="info-value">${(order.paymentInfo?.status || 'Pending').charAt(0).toUpperCase() + (order.paymentInfo?.status || 'Pending').slice(1)}</span>
              </div>
            </div>
            
            <div class="info-section">
              <h3>Customer & Shipping Information</h3>
              <div class="info-row">
                <span class="info-label">Customer Name:</span>
                <span class="info-value">${customerInfo.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Phone Number:</span>
                <span class="info-value">${customerInfo.phone}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Delivery Address:</span>
                <span class="info-value">${customerInfo.address}</span>
              </div>
              <div class="info-row">
                <span class="info-label">City:</span>
                <span class="info-value">${customerInfo.city}${customerInfo.state ? ', ' + customerInfo.state : ''} ${customerInfo.zipCode}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Country:</span>
                <span class="info-value">${customerInfo.country}</span>
              </div>
            </div>
            
            <div class="info-section">
              <h3>Order Items</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItems}
                </tbody>
              </table>
              
              <div class="summary-row">
                <span class="label">Subtotal:</span>
                <span class="value">EGP ${subtotal.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span class="label">Shipping:</span>
                <span class="value">${shipping === 0 ? 'Free' : 'EGP ' + shipping.toFixed(2)}</span>
              </div>
              <div class="summary-row total">
                <span class="label">Total Amount:</span>
                <span class="value">EGP ${total.toFixed(2)}</span>
              </div>
            </div>
            
            ${order.notes?.customer ? `
              <div class="info-section">
                <h3>Customer Notes</h3>
                <p style="color: #374151; font-size: 14px; line-height: 1.6;">${order.notes.customer}</p>
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>This is an automated notification from ALKASR Admin System</p>
            <p>Sent to: ${adminEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL_NOTIFICATIONS || 'onboarding@resend.dev',
      to: adminEmail,
      subject: `🔔 New Order Received #${order.orderNumber || order._id} - ALKASR`,
      html: emailHTML,
    });

    if (error) {
      console.error('Resend API error sending admin notification:', error);
      return { success: false, error: error.message };
    }

    console.log('Admin notification email sent successfully:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return { success: false, error: error.message };
  }
};

// Keep other functions for backward compatibility
const sendShippingNotificationEmail = async (order, user) => {
  console.log('Shipping notification not yet implemented with Resend');
  return { success: false, message: 'Not implemented' };
};

const sendPasswordResetEmail = async (user, resetUrl) => {
  console.log('Password reset not yet implemented with Resend');
  return { success: false, message: 'Not implemented' };
};

const sendVerificationEmail = async (user, verificationCode) => {
  console.log('Email verification delegated to sendOTPEmail');
  return sendOTPEmail(user.email, verificationCode, true);
};

module.exports = {
  sendOTPEmail,
  sendOrderConfirmationEmail,
  sendAdminNotificationEmail,
  sendShippingNotificationEmail,
  sendPasswordResetEmail,
  sendVerificationEmail
};
