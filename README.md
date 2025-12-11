# Bangladesh RMG ERP System

A comprehensive Enterprise Resource Planning (ERP) system designed specifically for the Ready Made Garments (RMG) industry in Bangladesh.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 14+

### Running the Application

**Option 1: Using Scripts** (Easiest)
```bash
# Windows
.\scripts\start-erp.bat

# Linux/Mac
chmod +x ./scripts/start-erp.sh
./scripts/start-erp.sh
```

**Option 2: Manual Start**
```bash
# Terminal 1: Start Backend
cd backend
python main.py

# Terminal 2: Start Frontend
npm run dev
```

**Option 3: Docker**
```bash
cd docker
docker-compose up
```

Visit:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📁 Project Structure

```
erp-system/
├── app/                      # Next.js application routes
│   └── dashboard/
│       ├── (authenticated)/  # Protected ERP routes
│       │   └── erp/          # Main ERP modules
│       └── (public)/         # Public routes (login, etc.)
│
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── layout/               # Header, sidebar, footer
│   ├── theme/                # Theme customization
│   ├── providers/            # React context providers
│   └── shared/               # Shared components
│
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   ├── models/           # Database models
│   │   └── schemas/          # Pydantic schemas
│   ├── main.py               # Backend entry point
│   └── database.py           # Database configuration
│
├── docs/                     # 📚 Documentation
│   ├── getting-started/      # Setup & deployment guides
│   ├── architecture/         # System architecture docs
│   ├── maintenance/          # Maintenance guides
│   └── theme/                # Theme documentation
│
├── scripts/                  # Utility scripts
│   ├── start-erp.bat         # Windows startup script
│   └── start-erp.sh          # Linux/Mac startup script
│
├── docker/                   # Docker configuration
│   ├── docker-compose.yml    # Development setup
│   └── docker-compose.prod.yml  # Production setup
│
├── lib/                      # Utility functions
├── hooks/                    # Custom React hooks
└── public/                   # Static assets
```

## 📖 Documentation

All documentation is now organized in the [`docs/`](docs/) directory:

- **[Getting Started Guide](docs/getting-started/setup.md)** - Complete setup from scratch
- **[Deployment Guide](docs/getting-started/deployment.md)** - Production deployment
- **[System Architecture](docs/architecture/overview.md)** - Technical overview
- **[Navigation Structure](docs/architecture/navigation.md)** - ERP modules guide

For more documentation, see [`docs/README.md`](docs/README.md)

## 🏗️ ERP Modules

### Client Management
- **Buyers** - Customer/buyer information management
- **Suppliers** - Supplier database and tracking
- **Contacts** - Contact person management
- **Shipping** - Shipping address management
- **Banking** - Banking details for clients

### Sample Management
- **Style Summary** - Garment style master data
- **Style Variants** - Color and size variations
- **Required Materials** - BOM with UOM conversion (85+ units)
- **Operations** - Production operations tracking
- **SMV** - Standard Minute Value calculations
- **MRP** - Material Requirements Planning
- **TNA** - Time and Action calendar

### Production & Inventory
- **Orders** - Order management and tracking
- **Production** - Production monitoring
- **Inventory** - Stock management
- **Reports** - Analytics and reporting

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **State**: React Query (TanStack Query)

### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Validation**: Pydantic
- **Database**: PostgreSQL

### DevOps
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx

## 🔑 Default Credentials

For testing purposes:
- **Username**: admin
- **Password**: admin

> ⚠️ **Important**: Change these credentials in production!

## 🧪 Development

### Frontend Development
```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run start        # Start production server
```

### Backend Development
```bash
cd backend
python main.py       # Start development server
```

The API will automatically reload on code changes.

## 📦 Key Features

✅ Complete client management (buyers, suppliers, contacts)  
✅ Comprehensive sample management workflow  
✅ UOM (Unit of Measure) conversion system (85+ units)  
✅ Bangladesh RMG standard measurements  
✅ Material requirements planning (MRP)  
✅ Production tracking and monitoring  
✅ Inventory management  
✅ Style and variant management  
✅ SMV calculations for costing  
✅ Time and Action (TNA) planning  
✅ Responsive design for all screen sizes  
✅ Light/Dark theme support  
✅ Role-based authentication  

## 🤝 Contributing

1. Read the [System Architecture](docs/architecture/overview.md)
2. Follow the code structure in [`docs/`](docs/)
3. Test changes with `npm run build`
4. Submit pull requests with clear descriptions

## 📞 Support

For issues or questions:
1. Check the [documentation](docs/README.md)
2. Review the [architecture guide](docs/architecture/overview.md)
3. Open an issue on GitHub

## 📄 License

Proprietary - All rights reserved

---

**Last Updated**: December 2025  
**Version**: 1.0.0