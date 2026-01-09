# EL Qaser E-Commerce Platform

A modern, full-stack e-commerce platform built with Next.js, featuring serverless API routes and MongoDB Atlas.

## 🚀 Live Demo

- **Production**: [Your Vercel URL]
- **Status**: [![Vercel](https://img.shields.io/badge/vercel-deployed-success)](https://vercel.com)

## ✨ Features

- 🛍️ Product catalog with categories and filtering
- 🔐 Email-based authentication with OTP
- 🛒 Shopping cart functionality
- 💳 Checkout process
- 📱 Fully responsive design
- 🌐 Multi-language support (Arabic/English)
- 📧 Email notifications via Resend
- 💾 MongoDB Atlas database
- ⚡ Serverless API routes on Vercel

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React icons
- **State Management**: React Context API
- **HTTP Client**: Axios

### Backend (Serverless)
- **API Routes**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: JWT + Email OTP
- **Email Service**: Resend
- **SMS Service**: Twilio (optional)

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Resend account (for emails)
- Vercel account (for deployment)

## 🏃‍♂️ Local Development

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `RESEND_API_KEY` - Resend API key for emails

See [.env.example](.env.example) for all available variables.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

### Manual Deployment

1. **Setup MongoDB Atlas**
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Get your connection string
   - Whitelist Vercel IPs (`0.0.0.0/0`)

2. **Push to Git**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Deploy to Vercel**
   - Import your repository at [Vercel](https://vercel.com/new)
   - Add environment variables (see `.env.example`)
   - Deploy!

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 📁 Project Structure

```
frontend/
├── components/          # React components
│   ├── Header.js
│   ├── Footer.js
│   ├── ProductCard.js
│   └── ...
├── contexts/           # React Context providers
│   ├── AuthContext.js
│   ├── CartContext.js
│   └── LanguageContext.js
├── lib/                # Utility libraries
│   ├── api.js         # API client
│   ├── auth.js        # Auth utilities
│   ├── mongodb.js     # Database connection
│   └── emailService.js
├── models/             # MongoDB models
│   ├── Product.js
│   ├── User.js
│   ├── Order.js
│   └── Category.js
├── pages/              # Next.js pages
│   ├── api/           # API routes (serverless)
│   │   ├── auth/
│   │   ├── products/
│   │   ├── cart/
│   │   └── orders/
│   ├── index.js       # Homepage
│   ├── products.js    # Products page
│   ├── cart.js        # Cart page
│   └── ...
├── public/             # Static assets
│   ├── images/
│   └── ...
├── styles/             # Global styles
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore rules
├── next.config.js     # Next.js configuration
├── tailwind.config.js # Tailwind CSS configuration
└── vercel.json        # Vercel deployment config
```

## 🔧 Configuration Files

### vercel.json
Configures Vercel deployment settings, including:
- Serverless function memory (1024 MB)
- Function timeout (30 seconds)
- Region settings

### next.config.js
Next.js configuration for:
- Image optimization
- Environment variables
- Build settings

### tailwind.config.js
Tailwind CSS customization:
- Custom colors (luxury burgundy, gold, cream)
- Custom fonts
- Responsive breakpoints

## 📧 Email Templates

Email templates are located in `lib/emailService.js`:
- OTP verification emails
- Order confirmations
- Welcome emails

Emails are sent via [Resend](https://resend.com) using the verified domain `qasrnuts.com`.

## 🔐 Authentication Flow

1. User enters email address
2. System generates 6-digit OTP
3. OTP sent via email (Resend)
4. User enters OTP to verify
5. JWT token issued and stored in cookies
6. User authenticated for 30 days

## 🛒 Cart & Checkout

- Cart stored in MongoDB (for authenticated users)
- Guest cart stored in localStorage
- Weight-based pricing for products
- WhatsApp integration for order placement

## 🌐 Multi-Language Support

- Arabic (RTL) and English (LTR)
- Language switcher in header
- Translations stored in `contexts/LanguageContext.js`

## 📊 Database Schema

### Products
- Name, description, price
- Category and subcategory
- Images, stock quantity
- Weight options (250g, 500g, 1kg)
- Featured flag

### Users
- Email, name
- Authentication method (email/OAuth)
- Created/updated timestamps

### Orders
- User reference
- Items with quantities
- Total amount
- Status tracking

### Categories
- Name, slug
- Description
- Active flag

## 🔒 Security

- JWT-based authentication
- HTTP-only cookies
- Rate limiting on API routes
- Input validation
- CORS configuration
- Environment variable protection

## 🧪 Testing

```bash
# Run tests (if configured)
npm test

# Build for production
npm run build

# Start production server locally
npm start
```

## 📈 Performance

- Server-side rendering (SSR)
- Static generation where possible
- Image optimization with Next.js Image
- Code splitting
- Lazy loading

## 🐛 Troubleshooting

### Products not loading
- Check MongoDB Atlas connection
- Verify `MONGODB_URI` in environment variables
- Check network access in Atlas (allow `0.0.0.0/0`)

### Authentication issues
- Verify `RESEND_API_KEY` is correct
- Check email domain is verified in Resend
- Ensure `JWT_SECRET` is set

### Build errors
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules`: `rm -rf node_modules`
- Reinstall: `npm install`
- Rebuild: `npm run build`

## 📝 Environment Variables

See [.env.example](.env.example) for a complete list of environment variables.

**Required:**
- `MONGODB_URI`
- `JWT_SECRET`
- `RESEND_API_KEY`
- `FROM_EMAIL_AUTH`
- `ADMIN_EMAIL`

**Optional:**
- `TWILIO_*` (for SMS)
- `GOOGLE_*` (for OAuth)
- `STRIPE_*` (for payments)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Team

- **Company**: EL Qaser
- **Contact**: nourabdelreheemali@gmail.com

## 🔗 Links

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Vercel](https://vercel.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Resend Documentation](https://resend.com/docs)
- [Tailwind CSS](https://tailwindcss.com)

---

**Built with ❤️ by EL Qaser Team**
