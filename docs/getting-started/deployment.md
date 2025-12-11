# RMG ERP System - Deployment Checklist

## ✅ Pre-Deployment Verification

### System Requirements
- [ ] Docker Desktop installed and running
- [ ] Port 2222 available (frontend)
- [ ] Port 8000 available (backend API)
- [ ] Port 5432 available (PostgreSQL)
- [ ] At least 2GB free RAM
- [ ] At least 5GB free disk space

### Files Created
- [x] `docker-compose.yml` - Multi-container orchestration
- [x] `Dockerfile.frontend` - Frontend container config
- [x] `backend/Dockerfile` - Backend container config
- [x] `backend/requirements.txt` - Python dependencies
- [x] `.dockerignore` - Docker ignore rules
- [x] `.env.example` - Environment template
- [x] `backend/.env` - Backend environment config

### Backend Files
- [x] `backend/app/main.py` - FastAPI application
- [x] `backend/app/core/config.py` - Configuration
- [x] `backend/app/core/database.py` - Database setup
- [x] `backend/app/core/security.py` - Authentication
- [x] `backend/app/init_data.py` - Sample data initialization

#### Database Models (backend/app/models/)
- [x] `user.py` - User authentication
- [x] `client.py` - Buyers, Suppliers, Contacts, Shipping, Banking
- [x] `sample.py` - Styles, Samples, Operations
- [x] `operation.py` - IE operations and SMV
- [x] `order.py` - Order management

#### API Routes (backend/app/api/)
- [x] `auth.py` - Authentication endpoints
- [x] `buyers.py` - Buyer management
- [x] `suppliers.py` - Supplier management
- [x] `samples.py` - Sample workflow
- [x] `operations.py` - Operations and SMV
- [x] `orders.py` - Order management

#### Schemas (backend/app/schemas/)
- [x] `user.py` - User schemas
- [x] `buyer.py` - Buyer, Contact, Shipping, Banking schemas
- [x] `sample.py` - Sample and Style schemas

### Frontend Files
- [x] `lib/api.ts` - API client
- [x] `app/dashboard/(auth)/erp/buyers/page.tsx` - Buyer management UI
- [x] `app/dashboard/(auth)/erp/samples/page.tsx` - Sample department UI
- [x] `next.config.ts` - Updated with API rewrites

### Documentation
- [x] `QUICKSTART.md` - Quick start guide
- [x] `RMG_ERP_README.md` - Complete documentation
- [x] `PROJECT_SUMMARY.md` - Project overview
- [x] `ERP_NAVIGATION.md` - Navigation guide
- [x] `DEPLOYMENT_CHECKLIST.md` - This file

### Startup Scripts
- [x] `start-erp.bat` - Windows startup script
- [x] `start-erp.sh` - Linux/Mac startup script

## 🚀 Deployment Steps

### Step 1: Verify Environment
```bash
# Check Docker is running
docker --version
docker-compose --version

# Check ports are free (Windows)
netstat -ano | findstr :2222
netstat -ano | findstr :8000
netstat -ano | findstr :5432

# Check ports are free (Linux/Mac)
lsof -i :2222
lsof -i :8000
lsof -i :5432
```

### Step 2: Start the System
```bash
# Navigate to project directory
cd d:\shad-theme-dashboard\shad-theme-dashboard

# Start all services
docker-compose up
```

### Step 3: Wait for Initialization
Wait for these messages in the logs:
- ✅ `Database tables created successfully!`
- ✅ `Sample data created successfully!`
- ✅ `Application startup complete`
- ✅ `Uvicorn running on http://0.0.0.0:8000`

This usually takes 30-60 seconds on first run.

### Step 4: Verify Services

#### Check Backend Health
```bash
# Should return: {"status": "healthy"}
curl http://localhost:8000/health
```

#### Check Frontend
Open browser: http://localhost:2222

#### Check API Docs
Open browser: http://localhost:8000/docs

### Step 5: Login and Test

1. **Login**
   - URL: http://localhost:2222
   - Username: `admin`
   - Password: `admin`

2. **Test Buyer Management**
   - Navigate to: http://localhost:2222/dashboard/erp/buyers
   - Verify 3 buyers are visible (H&M, Zara, Gap)
   - Click "Add Buyer"
   - Create a test buyer
   - Verify it appears in the list

3. **Test Sample Department**
   - Navigate to: http://localhost:2222/dashboard/erp/samples
   - Create a sample in Part 1
   - Select it in Part 2 and verify auto-fill
   - Complete Part 3
   - Test status changes in Part 5

4. **Test Database**
   ```bash
   # Connect to PostgreSQL
   docker exec -it rmg_erp_postgres psql -U postgres -d rmg_erp

   # Check tables
   \dt

   # Check data
   SELECT * FROM buyers;
   SELECT * FROM samples;
   SELECT * FROM users;

   # Exit
   \q
   ```

## 🔍 Post-Deployment Verification

### Database Checks
- [ ] All 13+ tables created
- [ ] 1 user created (admin)
- [ ] 3 buyers created (H&M, Zara, Gap)
- [ ] 1 supplier created
- [ ] 2 styles created
- [ ] 5 operations created
- [ ] 4 SMV settings created

### API Checks
- [ ] `/health` endpoint responds
- [ ] `/api/v1/auth/login` works
- [ ] `/api/v1/buyers/` returns data
- [ ] `/api/v1/samples/` responds
- [ ] API docs accessible at `/docs`

### Frontend Checks
- [ ] Login page loads
- [ ] Login with admin/admin works
- [ ] Buyers page loads and displays data
- [ ] Can create new buyer
- [ ] Can edit buyer
- [ ] Can delete buyer
- [ ] Samples page loads
- [ ] Can create sample
- [ ] Auto-fill works in Part 2
- [ ] Status update works in Part 5
- [ ] Round increments on rejection

### Performance Checks
- [ ] Frontend loads in < 3 seconds
- [ ] API responds in < 500ms
- [ ] No console errors in browser
- [ ] No errors in Docker logs

## 🐛 Troubleshooting

### Issue: Port Already in Use
```bash
# Stop conflicting services
docker-compose down

# Or change ports in docker-compose.yml
```

### Issue: Database Connection Failed
```bash
# Check database is running
docker-compose ps

# Restart database
docker-compose restart db

# Check logs
docker-compose logs db
```

### Issue: Frontend Build Errors
```bash
# Rebuild frontend
docker-compose up --build frontend
```

### Issue: Backend Import Errors
```bash
# Rebuild backend
docker-compose up --build backend
```

### Issue: Data Not Persisting
```bash
# Check volumes
docker volume ls

# Recreate with clean state
docker-compose down -v
docker-compose up
```

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Check Resource Usage
```bash
docker stats
```

### Check Running Containers
```bash
docker-compose ps
```

## 🛑 Shutdown

### Graceful Shutdown
```bash
# Stop services (keeps data)
docker-compose down
```

### Complete Cleanup
```bash
# Stop and remove volumes (deletes data)
docker-compose down -v
```

## 🔄 Restart Fresh

```bash
# Complete cleanup and restart
docker-compose down -v
docker-compose up
```

This will:
1. Delete all data
2. Recreate database
3. Recreate tables
4. Re-insert sample data
5. Start all services

## ✅ Production Readiness Checklist

For production deployment, ensure:
- [ ] Change `SECRET_KEY` in backend/.env
- [ ] Update PostgreSQL password
- [ ] Configure proper CORS origins
- [ ] Set up SSL/HTTPS
- [ ] Configure backup strategy
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Configure logging (ELK stack)
- [ ] Set up CI/CD pipeline
- [ ] Configure environment-specific settings
- [ ] Implement rate limiting
- [ ] Add API authentication middleware
- [ ] Set up database replication
- [ ] Configure load balancing

## 🎯 Success Criteria

System is successfully deployed when:
- ✅ All services start without errors
- ✅ Database is populated with sample data
- ✅ Frontend is accessible at port 2222
- ✅ Backend API is accessible at port 8000
- ✅ Login works with default credentials
- ✅ Buyer CRUD operations work
- ✅ Sample workflow functions correctly
- ✅ No errors in browser console
- ✅ No errors in Docker logs
- ✅ Can connect to database with pgAdmin

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Docker logs: `docker-compose logs`
3. Check individual service logs
4. Verify all ports are available
5. Ensure Docker has sufficient resources
6. Review environment variables
7. Check file permissions

---

**Deployment Complete!** ✨

Your RMG ERP system should now be fully operational at http://localhost:2222
