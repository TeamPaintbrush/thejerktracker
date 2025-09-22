# TheJERKTracker 🥡

**Restaurant Pickup Tracking System with QR Code Integration**

A modern, responsive web application built with Next.js that helps restaurants track order pickups efficiently using QR codes. Designed for restaurant staff and delivery drivers to streamline the pickup process.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 🌟 Features

### ✅ **Current Features (MVP Complete)**
- **QR Code Integration**: Generate and scan QR codes for seamless order pickup
- **Order Management**: Complete CRUD operations for order tracking
- **Status Workflow**: 6-stage order progression (Pending → Preparing → Ready → Out for Delivery → Picked Up → Cancelled)
- **Real-time Updates**: Auto-refresh functionality every 3-5 seconds
- **Mobile Responsive**: Touch-friendly interface optimized for tablets and phones
- **Advanced Search**: Filter by order number, customer name, email, status, and date range
- **Admin Dashboard**: Comprehensive order management with status updates
- **Driver Interface**: Simple pickup confirmation for delivery drivers
- **CSV Export**: Export order data for business analytics
- **Toast Notifications**: User-friendly feedback for all actions
- **Error Handling**: Graceful error boundaries and recovery mechanisms

### 🚀 **Upcoming Features** (See [IMPROVEMENT_PLAN.md](./IMPROVEMENT_PLAN.md))
- Database integration with PostgreSQL + Prisma
- User authentication and role-based access control
- Real-time WebSocket updates
- Multi-restaurant support
- Push notifications and email alerts
- Advanced analytics and reporting

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: TailwindCSS, Framer Motion
- **Data Storage**: localStorage (transitioning to PostgreSQL)
- **QR Codes**: qrcode.react
- **Icons**: Lucide React
- **Build Tool**: Turbopack (Next.js)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TeamPaintbrush/pre-work-appx.git
   cd pre-work-appx/thejerktracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run dev:turbo    # Start with Turbopack (faster)

# Production
npm run build        # Build for production
npm run start        # Start production server
npm run build:static # Build static export

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 📱 Usage

### For Restaurant Staff

1. **Access Admin Dashboard**: Navigate to `/admin`
2. **Create New Order**: Fill out order form with customer details
3. **Generate QR Code**: Automatically generated for each order
4. **Track Orders**: View all orders with real-time status updates
5. **Update Status**: Click edit button to change order status
6. **Export Data**: Download CSV reports for analysis

### For Delivery Drivers

1. **Scan QR Code**: Use phone camera or QR scanner app
2. **Access Order**: Automatic redirect to order pickup page
3. **Confirm Pickup**: Enter driver details and confirm pickup
4. **Status Updated**: Order automatically marked as "Picked Up"

## 🏗️ Project Structure

```
thejerktracker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard
│   │   ├── order/             # Order pickup pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable React components
│   │   ├── Toast.tsx          # Notification system
│   │   ├── ErrorBoundary.tsx  # Error handling
│   │   └── StatusUpdate.tsx   # Order status management
│   ├── lib/                   # Utility functions
│   │   └── dataStore.ts       # Data management layer
│   └── types/                 # TypeScript definitions
│       └── order.ts           # Order interface
├── public/                    # Static assets
├── docs/                      # Documentation
├── IMPROVEMENT_PLAN.md        # Development roadmap
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (for future implementation)
DATABASE_URL="postgresql://username:password@localhost:5432/jerktracker"

# Authentication (for future implementation)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# External Services (for future implementation)
SENTRY_DSN=your-sentry-dsn
```

## 📊 Current Status

**Development Phase**: MVP Complete with Advanced Features  
**Production Readiness**: ⚠️ Requires Backend Implementation  
**Test Coverage**: Needs Implementation  
**Documentation**: ✅ Complete

### Known Limitations
- Data stored in localStorage (browser-specific, temporary)
- No user authentication (open admin access)
- Single-device usage only
- No real-time sync between devices

*See [IMPROVEMENT_PLAN.md](./IMPROVEMENT_PLAN.md) for detailed improvement roadmap.*

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Issue Reporting

- Use the issue templates provided
- Include detailed reproduction steps
- Add relevant labels and milestones
- Reference related issues or PRs

## 📋 Roadmap

### Phase 1: Foundation & Security (2-3 weeks)
- [ ] PostgreSQL + Prisma database integration
- [ ] NextAuth.js authentication system
- [ ] API route implementation
- [ ] Environment configuration

### Phase 2: Performance & Reliability (2-3 weeks)
- [ ] React Query implementation
- [ ] WebSocket real-time updates
- [ ] Error monitoring with Sentry
- [ ] Performance optimization

### Phase 3: Advanced Features (3-4 weeks)
- [ ] Multi-restaurant support
- [ ] Comprehensive testing suite
- [ ] Advanced analytics
- [ ] Notification system

### Phase 4: Production Deployment (2-3 weeks)
- [ ] CI/CD pipeline setup
- [ ] Production hosting
- [ ] Performance monitoring
- [ ] Scaling preparation

*Detailed timeline and requirements in [IMPROVEMENT_PLAN.md](./IMPROVEMENT_PLAN.md)*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- QR codes powered by [qrcode.react](https://github.com/zpao/qrcode.react)

## 📞 Support

- **Documentation**: Check our [docs](./docs/) folder
- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: Use GitHub Discussions for questions
- **Security**: See [SECURITY.md](./SECURITY.md) for reporting vulnerabilities

---

**Built with ❤️ for the restaurant industry**

*Last Updated: September 22, 2025*
