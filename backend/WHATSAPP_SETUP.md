# WhatsApp Business Cloud API Setup Guide

This document explains how to configure WhatsApp order notifications using Meta's WhatsApp Business Cloud API.

## Overview

The system automatically sends WhatsApp notifications to the admin when orders are placed. Notifications are sent for:
- Orders with `cash_on_delivery` payment method
- Orders with `completed` payment status (e.g., Stripe payments)

## Environment Variables

Add the following variables to your `.env` file:

```env
# WhatsApp Business Cloud API Configuration
META_WA_TOKEN=your_access_token_here
META_PHONE_NUMBER_ID=your_phone_number_id_here
ADMIN_WHATSAPP_NUMBER=201005801990
```

### Variable Descriptions

- **META_WA_TOKEN**: Your WhatsApp Business Cloud API access token
  - Get this from Meta for Developers dashboard
  - Navigate to: Your App → WhatsApp → API Setup → Access Token

- **META_PHONE_NUMBER_ID**: Your WhatsApp Business Phone Number ID
  - Found in Meta for Developers dashboard
  - Navigate to: Your App → WhatsApp → API Setup → Phone number ID

- **ADMIN_WHATSAPP_NUMBER**: Admin phone number to receive notifications
  - Format: Country code + number (without + sign)
  - Example: `201005801990` for +201005801990
  - Default: `201005801990`

## Getting Your Credentials

### Step 1: Create a Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add "WhatsApp" product to your app

### Step 2: Get Access Token

1. In your app dashboard, go to **WhatsApp** → **API Setup**
2. Copy the **Temporary Access Token** (for testing)
3. For production, generate a **Permanent Access Token**:
   - Go to **WhatsApp** → **API Setup** → **Access Tokens**
   - Generate a permanent token with appropriate permissions

### Step 3: Get Phone Number ID

1. In **WhatsApp** → **API Setup**
2. Find your **Phone number ID** (usually a long number)
3. Copy this value

### Step 4: Verify Phone Number

1. Add a phone number to your WhatsApp Business Account
2. Verify it through Meta's verification process
3. This number will be used to send messages

## Message Template Setup

Meta requires approved message templates for sending messages. You need to create and get approval for a template named `qaser_new_order`.

### Template Details

**Template Name:** `qaser_new_order`  
**Category:** Transactional  
**Language:** English (or Arabic)

**Template Body:**
```
📦 New Order – Qaser

Order ID: {{1}}
Customer: {{2}}
Phone: {{3}}
City: {{4}}
Address: {{5}}

Items:
{{6}}

Total: {{7}}
Payment: {{8}}
```

### Creating the Template

1. Go to **WhatsApp** → **Message Templates**
2. Click **Create Template**
3. Fill in:
   - **Name:** `qaser_new_order`
   - **Category:** Transactional
   - **Language:** English
   - **Body:** Use the template above with placeholders {{1}} through {{8}}
4. Submit for approval (usually takes 24-48 hours)

### Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| {{1}} | Order Number | ORD-1234567890-ABC |
| {{2}} | Customer Name | John Doe |
| {{3}} | Customer Phone | +201234567890 |
| {{4}} | City | Cairo |
| {{5}} | Full Address | 123 Main St, Cairo, Egypt |
| {{6}} | Items List | Formatted product list |
| {{7}} | Total Price | 500 EGP |
| {{8}} | Payment Method | Cash on Delivery |

## Testing

### Test Mode

During development, you can use Meta's test phone numbers:
- Add test numbers in **WhatsApp** → **API Setup** → **To**
- Use these numbers to test without approval

### Production

1. Ensure template is approved
2. Verify all environment variables are set
3. Place a test order
4. Check admin WhatsApp for notification

## Error Handling

The system is designed to **never block order creation** if WhatsApp notification fails:

- Errors are logged to console
- Order is still saved successfully
- One retry attempt is made automatically
- If retry fails, error is logged but order continues

## Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Check that `META_WA_TOKEN` and `META_PHONE_NUMBER_ID` are set in `.env`
   - Restart the server after adding variables

2. **"Template not found"**
   - Ensure template `qaser_new_order` is created and approved
   - Check template name matches exactly (case-sensitive)

3. **"Invalid phone number"**
   - Verify `ADMIN_WHATSAPP_NUMBER` format (no + sign, country code included)
   - Ensure phone number is verified in Meta dashboard

4. **"Access token expired"**
   - Generate a new permanent access token
   - Update `META_WA_TOKEN` in `.env`

### Checking Logs

Check server console logs for WhatsApp notification errors:
```bash
# Look for:
# - "WhatsApp notification sent successfully"
# - "Failed to send WhatsApp notification"
# - "WhatsApp API Error"
```

## Free Tier Limits

Meta's WhatsApp Business Cloud API free tier includes:
- **1,000 conversations/month** (free)
- Each order notification = 1 conversation
- After limit, charges apply per conversation

## Security Notes

- Never commit `.env` file to version control
- Keep access tokens secure
- Rotate tokens periodically
- Use permanent tokens for production (not temporary)

## Support

For issues with Meta's API:
- [Meta WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Meta for Developers Support](https://developers.facebook.com/support)
