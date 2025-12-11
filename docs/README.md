# ERP System Documentation

Welcome to the Bangladesh RMG ERP System documentation! This folder contains all the documentation you need to understand, set up, and maintain the system.

## 📖 Documentation Structure

### Getting Started
Start here if you're new to the system:

- **[Setup Guide](getting-started/setup.md)** - Complete setup instructions from scratch
- **[Deployment Guide](getting-started/deployment.md)** - How to deploy to production
- **[Authentication Guide](getting-started/authentication.md)** - Login system and user management

### Architecture
Understanding how the system works:

- **[System Overview](architecture/overview.md)** - High-level architecture and technology stack
- **[Navigation Structure](architecture/navigation.md)** - ERP module organization and routing

### Maintenance
For ongoing system maintenance:

- **[Cleanup History](maintenance/cleanup-history.md)** - Record of codebase optimizations

### Theme
UI customization and theming:

- **[Theme Documentation](theme/documentation.pdf)** - Complete theme customization guide

## 🚀 Quick Start

1. **First Time Setup**: Read [Setup Guide](getting-started/setup.md)
2. **Understanding the System**: Read [System Overview](architecture/overview.md)
3. **Deploy to Production**: Follow [Deployment Guide](getting-started/deployment.md)

## 📋 Key Technologies

- **Frontend**: Next.js 15, React 19, TypeScript, shadcn/ui, Tailwind CSS
- **Backend**: FastAPI (Python), SQLAlchemy, Pydantic
- **Database**: PostgreSQL
- **Deployment**: Docker, Docker Compose

## 🏗️ Project Structure

```
erp-system/
├── app/                  # Next.js pages and routes
├── components/           # React components
├── backend/              # FastAPI backend
├── docs/                 # Documentation (you are here!)
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
└── public/               # Static assets
```

## 💡 Need Help?

- Check the relevant guide in this documentation
- Review the [System Overview](architecture/overview.md) for architecture questions
- See the [Navigation Structure](architecture/navigation.md) for ERP module information

## 📝 Contributing to Documentation

When adding new documentation:

1. Place it in the appropriate subdirectory
2. Update this README with a link
3. Use clear headings and examples
4. Keep it concise and practical

---

**Last Updated**: December 2025  
**Version**: 1.0
