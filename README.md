# Hardware Shop POS System - Frontend Repository

## 📋 Repository Overview

**Repository Name:** `hardware-pos-frontend`  
**Technology Stack:** React.js + TypeScript + Vite  
**Purpose:** Multi-tenant hardware shop point-of-sale system frontend application  
**License:** Proprietary  
**Version:** 1.0.0

---

## 🎯 Project Description

The Hardware Shop POS System Frontend is a modern, responsive web application built with React and TypeScript that provides a comprehensive interface for managing hardware shop operations. This application supports multi-tenant architecture, enabling multiple hardware shops to operate independently within a single system.

### Key Features

- **🔐 Authentication & Authorization** - Role-based access control (Owner, Manager, Cashier, Store Keeper, Accountant)
- **🏪 Multi-Branch Operations** - Support for multiple shops, branches, and warehouses
- **📦 Product Management** - Complete product catalog with variants, images, and barcodes
- **📊 Inventory Control** - Real-time stock tracking, transfers, and adjustments
- **💰 Point of Sale (POS)** - Fast, intuitive sales interface with barcode scanning
- **👥 Customer Management** - Customer profiles, addresses, and loyalty programs
- **🛒 Supplier Management** - Supplier tracking, purchase orders, and GRN processing
- **💳 Payment Processing** - Multiple payment methods (Cash, Card, Bank Transfer, Mobile Payment)
- **📈 Reporting & Analytics** - Comprehensive business intelligence dashboards
- **🧾 Tax Compliance** - Sri Lankan VAT/NBT calculation and reporting
- **🔔 Notifications** - Real-time alerts for low stock, expiring items, and business events
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

---

## 🏗️ Architecture

### Technology Stack

#### Core Framework
- **React 18.3+** - Modern React with hooks and concurrent features
- **TypeScript 5.x** - Type-safe development
- **Vite 5.x** - Lightning-fast build tool and dev server

#### UI Framework & Styling
- **Tailwind CSS 3.x** - Utility-first CSS framework
- **shadcn/ui** - High-quality accessible component library
- **Lucide React** - Beautiful icon library
- **Recharts** - Data visualization and charts

#### State Management
- **React Query (TanStack Query)** - Server state management
- **Zustand** - Lightweight client state management
- **React Context API** - Authentication and theme management

#### Form Handling
- **React Hook Form** - Performant form validation
- **Zod** - TypeScript-first schema validation

#### Routing
- **React Router v6** - Declarative routing

#### HTTP Client
- **Axios** - Promise-based HTTP client with interceptors

#### Additional Libraries
- **date-fns** - Modern date utility library
- **html5-qrcode** - QR/Barcode scanner integration
- **react-hot-toast** - Elegant notification system
- **clsx / tailwind-merge** - Conditional className utilities

---

## 📁 Project Structure

```
hardware-pos-frontend/
├── public/                          # Static assets
│   ├── favicon.ico
│   ├── logo.png
│   └── thermal-print.css           # Thermal printer styles
│
├── src/
│   ├── api/                        # API service layer
│   │   ├── axios-instance.ts       # Configured axios instance
│   │   ├── auth.api.ts            # Authentication endpoints
│   │   ├── products.api.ts        # Product management
│   │   ├── inventory.api.ts       # Inventory operations
│   │   ├── sales.api.ts           # Sales transactions
│   │   ├── purchases.api.ts       # Purchase orders
│   │   ├── customers.api.ts       # Customer management
│   │   ├── suppliers.api.ts       # Supplier management
│   │   ├── reports.api.ts         # Reporting endpoints
│   │   └── index.ts               # API exports
│   │
│   ├── components/                 # Reusable components
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── RoleGuard.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MainLayout.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductSearch.tsx
│   │   │   ├── BarcodeGenerator.tsx
│   │   │   └── VariantManager.tsx
│   │   │
│   │   ├── inventory/
│   │   │   ├── StockTable.tsx
│   │   │   ├── StockAdjustmentForm.tsx
│   │   │   ├── StockTransferForm.tsx
│   │   │   └── LowStockAlert.tsx
│   │   │
│   │   ├── pos/
│   │   │   ├── POSInterface.tsx
│   │   │   ├── ProductScanner.tsx
│   │   │   ├── CartDisplay.tsx
│   │   │   ├── PaymentModal.tsx
│   │   │   └── ReceiptPrint.tsx
│   │   │
│   │   ├── sales/
│   │   │   ├── SalesInvoiceList.tsx
│   │   │   ├── SalesInvoiceDetail.tsx
│   │   │   ├── QuotationForm.tsx
│   │   │   └── ReturnForm.tsx
│   │   │
│   │   ├── purchases/
│   │   │   ├── PurchaseOrderForm.tsx
│   │   │   ├── PurchaseOrderList.tsx
│   │   │   ├── GRNForm.tsx
│   │   │   └── SupplierPayment.tsx
│   │   │
│   │   ├── customers/
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── CustomerList.tsx
│   │   │   ├── CustomerDetail.tsx
│   │   │   └── LoyaltyPoints.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── DashboardCards.tsx
│   │   │   ├── SalesChart.tsx
│   │   │   ├── InventoryChart.tsx
│   │   │   └── ReportFilters.tsx
│   │   │
│   │   └── shared/
│   │       ├── DataTable.tsx
│   │       ├── SearchInput.tsx
│   │       ├── DateRangePicker.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts             # Authentication hook
│   │   ├── useProducts.ts         # Product queries
│   │   ├── useInventory.ts        # Inventory queries
│   │   ├── useSales.ts            # Sales queries
│   │   ├── useDebounce.ts         # Debounce utility
│   │   ├── useLocalStorage.ts     # Local storage hook
│   │   └── usePrinter.ts          # Thermal printer integration
│   │
│   ├── store/                      # State management
│   │   ├── authStore.ts           # Authentication state
│   │   ├── cartStore.ts           # POS cart state
│   │   ├── settingsStore.ts       # App settings
│   │   └── notificationStore.ts   # Notification state
│   │
│   ├── types/                      # TypeScript definitions
│   │   ├── auth.types.ts
│   │   ├── product.types.ts
│   │   ├── inventory.types.ts
│   │   ├── sales.types.ts
│   │   ├── customer.types.ts
│   │   ├── supplier.types.ts
│   │   ├── report.types.ts
│   │   └── common.types.ts
│   │
│   ├── utils/                      # Utility functions
│   │   ├── formatters.ts          # Number, date, currency formatters
│   │   ├── validators.ts          # Validation helpers
│   │   ├── calculations.ts        # Business logic calculations
│   │   ├── constants.ts           # App constants
│   │   ├── permissions.ts         # Role-based permissions
│   │   └── storage.ts             # LocalStorage utilities
│   │
│   ├── pages/                      # Page components
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   └── ResetPassword.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductCreate.tsx
│   │   │   ├── ProductEdit.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Categories.tsx
│   │   │   └── Brands.tsx
│   │   │
│   │   ├── inventory/
│   │   │   ├── StockOverview.tsx
│   │   │   ├── StockAdjustment.tsx
│   │   │   ├── StockTransfer.tsx
│   │   │   └── BinLocations.tsx
│   │   │
│   │   ├── pos/
│   │   │   └── PointOfSale.tsx
│   │   │
│   │   ├── sales/
│   │   │   ├── SalesInvoices.tsx
│   │   │   ├── Quotations.tsx
│   │   │   ├── Returns.tsx
│   │   │   └── CreditNotes.tsx
│   │   │
│   │   ├── purchases/
│   │   │   ├── PurchaseOrders.tsx
│   │   │   ├── GoodsReceived.tsx
│   │   │   └── PurchaseInvoices.tsx
│   │   │
│   │   ├── customers/
│   │   │   ├── CustomerList.tsx
│   │   │   └── CustomerDetail.tsx
│   │   │
│   │   ├── suppliers/
│   │   │   ├── SupplierList.tsx
│   │   │   └── SupplierDetail.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── SalesReports.tsx
│   │   │   ├── InventoryReports.tsx
│   │   │   ├── PurchaseReports.tsx
│   │   │   ├── CustomerReports.tsx
│   │   │   └── TaxReports.tsx
│   │   │
│   │   ├── settings/
│   │   │   ├── ShopSettings.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── BranchSettings.tsx
│   │   │   ├── WarehouseSettings.tsx
│   │   │   ├── TaxSettings.tsx
│   │   │   └── SystemSettings.tsx
│   │   │
│   │   └── NotFound.tsx
│   │
│   ├── styles/                     # Global styles
│   │   ├── globals.css            # Tailwind imports + global styles
│   │   └── print.css              # Print-specific styles
│   │
│   ├── App.tsx                     # Root component
│   ├── main.tsx                    # Entry point
│   ├── router.tsx                  # Route configuration
│   └── vite-env.d.ts              # Vite types
│
├── .env.example                    # Environment variables template
├── .env.development               # Development environment
├── .env.production                # Production environment
├── .gitignore
├── .eslintrc.json                 # ESLint configuration
├── .prettierrc                    # Prettier configuration
├── index.html                     # HTML template
├── package.json
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.node.json
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # Tailwind configuration
├── postcss.config.js              # PostCSS configuration
└── README.md                      # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x or **yarn** >= 1.22.x or **pnpm** >= 8.x
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/hardware-pos-frontend.git
cd hardware-pos-frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Setup**

Create `.env.development` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Hardware POS System
VITE_APP_VERSION=1.0.0
VITE_ENABLE_MOCK_API=false
VITE_THERMAL_PRINTER_WIDTH=80
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 📜 Available Scripts

### Development
```bash
npm run dev          # Start development server with hot reload
npm run dev:host     # Start dev server accessible from network
```

### Building
```bash
npm run build        # Build for production
npm run build:dev    # Build with development configuration
npm run build:staging # Build for staging environment
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors automatically
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript compiler check
```

### Testing
```bash
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run e2e          # Run end-to-end tests
```

### Preview
```bash
npm run preview      # Preview production build locally
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | - | ✅ |
| `VITE_APP_NAME` | Application name | Hardware POS | ❌ |
| `VITE_APP_VERSION` | Application version | 1.0.0 | ❌ |
| `VITE_ENABLE_MOCK_API` | Enable mock API for development | false | ❌ |
| `VITE_THERMAL_PRINTER_WIDTH` | Thermal printer paper width (mm) | 80 | ❌ |
| `VITE_SESSION_TIMEOUT` | Session timeout in minutes | 30 | ❌ |
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | false | ❌ |

### Tailwind Configuration

The project uses a custom Tailwind theme:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          // ... color scales
          900: '#0c4a6e',
        },
        // Custom brand colors
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

---

## 🔐 Authentication Flow

The application implements JWT-based authentication:

1. **Login** - User submits credentials
2. **Token Receipt** - Server returns access token and refresh token
3. **Token Storage** - Tokens stored in httpOnly cookies (secure)
4. **Authenticated Requests** - Access token sent in Authorization header
5. **Token Refresh** - Automatic refresh before expiration
6. **Logout** - Tokens cleared from storage

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Owner** | Full system access, user management, settings |
| **Manager** | All operations except user management, system settings |
| **Cashier** | POS operations, view products, view customers |
| **Store Keeper** | Inventory management, stock transfers, GRN processing |
| **Accountant** | Financial reports, payments, invoices |

---

## 🎨 UI Components

The project uses **shadcn/ui** components, which are:
- Fully customizable
- Accessible by default (WCAG 2.1 AA compliant)
- Built with Radix UI primitives
- Styled with Tailwind CSS

### Key Components

- **Data Tables** - Sortable, filterable, paginated tables
- **Forms** - Validated forms with error handling
- **Modals/Dialogs** - Accessible modal overlays
- **Dropdowns** - Select, combobox, dropdown menus
- **Date Pickers** - Calendar and date range selection
- **Toast Notifications** - Success, error, warning messages
- **Loading States** - Skeletons and spinners

---

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1536px

### Mobile Optimization
- Touch-friendly interfaces
- Simplified navigation
- Optimized forms for mobile input
- Gesture support for common actions

---

## 🖨️ Printing

### Thermal Printer Support

The system supports thermal receipt printers (58mm, 80mm):

```typescript
// Print receipt example
import { printReceipt } from '@/utils/printer';

const handlePrint = () => {
  printReceipt({
    invoice: invoiceData,
    format: '80mm',
    copies: 2
  });
};
```

### A4 Invoice Printing

Full-page invoices with company branding and tax details.

---

## 🌐 Internationalization (i18n)

The application supports multiple languages:
- English (default)
- Sinhala
- Tamil

Language can be changed from user settings.

---

## 📊 State Management Strategy

### Server State (React Query)
- API data fetching
- Caching and synchronization
- Background refetching
- Optimistic updates

### Client State (Zustand)
- POS cart
- User preferences
- UI state (modals, drawers)

### Local State (React Hooks)
- Form inputs
- Component-specific state

---

## 🔍 Search & Filtering

The application implements advanced search capabilities:

- **Real-time search** - As-you-type filtering
- **Fuzzy matching** - Handles typos and partial matches
- **Multi-field search** - Search across name, SKU, barcode
- **Advanced filters** - Category, brand, price range, stock status
- **Search history** - Recent searches saved locally

---

## 📈 Performance Optimization

### Implemented Optimizations

1. **Code Splitting** - Lazy loading of route components
2. **Image Optimization** - Lazy loading, WebP format, responsive images
3. **Virtual Scrolling** - Large lists rendered efficiently
4. **Memoization** - React.memo, useMemo, useCallback
5. **Bundle Optimization** - Tree shaking, minification
6. **Caching** - React Query smart caching
7. **Debouncing** - Search and filter inputs

### Performance Targets

- **First Contentful Paint (FCP)**: < 1.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Lighthouse Score**: > 90

---

## 🧪 Testing

### Testing Stack

- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **MSW** - API mocking

### Test Coverage Goals

- **Unit Tests**: > 80% coverage
- **Integration Tests**: Critical user flows
- **E2E Tests**: Main user journeys

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

Output: `dist/` directory

### Deployment Platforms

**Recommended Platforms:**
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- DigitalOcean App Platform

### Environment-Specific Builds

```bash
npm run build:staging    # Staging environment
npm run build:production # Production environment
```

---

## 🐛 Debugging

### Development Tools

- **React Developer Tools** - Component inspection
- **Redux DevTools** - State debugging (if using Redux)
- **React Query Devtools** - Query inspection
- **Network Tab** - API call monitoring

### Debug Mode

Enable debug logging:
```typescript
localStorage.setItem('DEBUG', 'true');
```

---

## 📖 Best Practices

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier rules
- Use functional components with hooks
- Implement proper error boundaries
- Write meaningful component names
- Keep components small and focused

### Performance

- Avoid unnecessary re-renders
- Use React.memo for expensive components
- Implement pagination for large datasets
- Optimize images before uploading
- Use debouncing for search inputs

### Security

- Never store sensitive data in localStorage
- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS in production
- Implement CSRF protection
- Keep dependencies updated

---

## 🤝 Contributing

### Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature-name`
2. Make changes and commit: `git commit -m "feat: add new feature"`
3. Push to branch: `git push origin feature/your-feature-name`
4. Create Pull Request

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add customer loyalty feature
fix: resolve invoice calculation bug
docs: update API documentation
style: format code with prettier
refactor: simplify product search logic
test: add unit tests for cart
chore: update dependencies
```

---

## 📞 Support & Documentation

### Additional Resources

- **API Documentation**: See Backend API README
- **User Guide**: `/docs/user-guide.md`
- **Developer Guide**: `/docs/developer-guide.md`
- **Component Library**: Run `npm run storybook`

### Getting Help

- **Technical Issues**: Create issue on GitHub
- **Feature Requests**: Use GitHub Discussions
- **Security Issues**: Email security@company.com

---

## 📄 License

Proprietary - All rights reserved  
© 2025 Futura Solutions PVT LTD

---

## 👥 Team

**Developed by:** Futura Solutions PVT LTD  
**Contact:** info@futurasolutions.lk  
**Address:** No 5, Wijaya Road, Colombo, Sri Lanka

---

## 🎯 Roadmap

### Current Version (v1.0.0)
- ✅ Core POS functionality
- ✅ Inventory management
- ✅ Multi-branch support
- ✅ Customer & supplier management
- ✅ Basic reporting

### Upcoming Features (v1.1.0)
- 🔄 Advanced analytics dashboard
- 🔄 Mobile app (React Native)
- 🔄 Offline mode support
- 🔄 Barcode scanner app integration
- 🔄 WhatsApp notifications
- 🔄 Export to accounting software

### Future Enhancements (v2.0.0)
- ⏳ AI-powered demand forecasting
- ⏳ Advanced loyalty program
- ⏳ E-commerce integration
- ⏳ Multi-currency support
- ⏳ Advanced warehouse management

---

**Last Updated:** January 2025  
**Documentation Version:** 1.0.0
