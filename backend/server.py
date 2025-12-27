from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request, Cookie
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import asyncpg
import httpx
from contextlib import asynccontextmanager

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database connection pool
db_pool = None

async def get_db_pool():
    global db_pool
    if db_pool is None:
        db_pool = await asyncpg.create_pool(
            os.environ['DATABASE_URL'],
            min_size=2,
            max_size=10
        )
    return db_pool

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await get_db_pool()
    await init_db()
    yield
    # Shutdown
    if db_pool:
        await db_pool.close()

# Create the main app
app = FastAPI(lifespan=lifespan)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Mileage Tracker API", "status": "running"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "database": "postgresql"}
# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Models
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime

class SessionDataResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

class Vehicle(BaseModel):
    vehicle_id: str
    user_id: str
    name: str
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    business_percentage: int = 100
    created_at: datetime

class VehicleCreate(BaseModel):
    name: str
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    business_percentage: int = 100

class Trip(BaseModel):
    trip_id: str
    user_id: str
    vehicle_id: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    distance: float
    start_location: Optional[str] = None
    end_location: Optional[str] = None
    purpose: Optional[str] = None
    is_business: bool = True
    is_automatic: bool = False
    created_at: datetime

class TripCreate(BaseModel):
    vehicle_id: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    distance: float
    start_location: Optional[str] = None
    end_location: Optional[str] = None
    purpose: Optional[str] = None
    is_business: bool = True
    is_automatic: bool = False

class TripUpdate(BaseModel):
    vehicle_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    distance: Optional[float] = None
    start_location: Optional[str] = None
    end_location: Optional[str] = None
    purpose: Optional[str] = None
    is_business: Optional[bool] = None

class Expense(BaseModel):
    expense_id: str
    user_id: str
    vehicle_id: Optional[str] = None
    amount: float
    category: str
    date: datetime
    notes: Optional[str] = None
    receipt_image_base64: Optional[str] = None
    created_at: datetime

class ExpenseCreate(BaseModel):
    vehicle_id: Optional[str] = None
    amount: float
    category: str
    date: datetime
    notes: Optional[str] = None
    receipt_image_base64: Optional[str] = None

class TaxReport(BaseModel):
    total_miles: float
    business_miles: float
    total_deduction: float
    total_expenses: float
    total_tax_savings: float
    period_start: datetime
    period_end: datetime

class SubscriptionStatus(BaseModel):
    plan_type: str
    is_active: bool
    features: List[str]

# Database initialization
async def init_db():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Create tables
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255),
                picture TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        ''')
        
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
                session_token VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        ''')
        
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS vehicles (
                id SERIAL PRIMARY KEY,
                vehicle_id VARCHAR(255) UNIQUE NOT NULL,
                user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                make VARCHAR(255),
                model VARCHAR(255),
                year INTEGER,
                business_percentage INTEGER DEFAULT 100,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        ''')
        
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS trips (
                id SERIAL PRIMARY KEY,
                trip_id VARCHAR(255) UNIQUE NOT NULL,
                user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
                vehicle_id VARCHAR(255) REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
                start_time TIMESTAMP WITH TIME ZONE NOT NULL,
                end_time TIMESTAMP WITH TIME ZONE,
                distance FLOAT NOT NULL,
                start_location TEXT,
                end_location TEXT,
                purpose TEXT,
                is_business BOOLEAN DEFAULT TRUE,
                is_automatic BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        ''')
        
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                expense_id VARCHAR(255) UNIQUE NOT NULL,
                user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
                vehicle_id VARCHAR(255) REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
                amount FLOAT NOT NULL,
                category VARCHAR(255) NOT NULL,
                date TIMESTAMP WITH TIME ZONE NOT NULL,
                notes TEXT,
                receipt_image_base64 TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        ''')
        
        logger.info("Database initialized successfully")

# Authentication helpers
async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)) -> Optional[User]:
    # Check cookie first, then Authorization header
    token = session_token
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    
    if not token:
        return None
    
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Get session
        session = await conn.fetchrow(
            "SELECT user_id, expires_at FROM user_sessions WHERE session_token = $1",
            token
        )
        
        if not session:
            return None
        
        # Check if session expired
        if session['expires_at'] < datetime.now(timezone.utc):
            return None
        
        # Get user
        user = await conn.fetchrow(
            "SELECT user_id, email, name, picture, created_at FROM users WHERE user_id = $1",
            session['user_id']
        )
        
        if user:
            return User(**dict(user))
        return None

async def require_auth(request: Request, session_token: Optional[str] = Cookie(None)) -> User:
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# Auth endpoints
@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Exchange session_id for session data
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            resp.raise_for_status()
            user_data = resp.json()
        except Exception as e:
            logger.error(f"Failed to exchange session: {e}")
            raise HTTPException(status_code=400, detail="Invalid session_id")
    
    # Save or update user
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        
        # Check if user exists
        existing = await conn.fetchrow(
            "SELECT user_id FROM users WHERE email = $1",
            user_data['email']
        )
        
        if existing:
            user_id = existing['user_id']
        else:
            # Create new user
            await conn.execute(
                "INSERT INTO users (user_id, email, name, picture) VALUES ($1, $2, $3, $4)",
                user_id, user_data['email'], user_data['name'], user_data.get('picture')
            )
        
        # Create session
        session_token = user_data['session_token']
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        await conn.execute(
            "INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)",
            user_id, session_token, expires_at
        )
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60,
        path="/"
    )
    
    return SessionDataResponse(**user_data)

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(require_auth)):
    return current_user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, session_token: Optional[str] = Cookie(None)):
    token = session_token
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    
    if token:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                "DELETE FROM user_sessions WHERE session_token = $1",
                token
            )
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# Vehicle endpoints
@api_router.post("/vehicles", response_model=Vehicle)
async def create_vehicle(vehicle: VehicleCreate, current_user: User = Depends(require_auth)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        vehicle_id = f"vehicle_{uuid.uuid4().hex[:12]}"
        
        await conn.execute(
            """INSERT INTO vehicles (vehicle_id, user_id, name, make, model, year, business_percentage)
               VALUES ($1, $2, $3, $4, $5, $6, $7)""",
            vehicle_id, current_user.user_id, vehicle.name, vehicle.make, 
            vehicle.model, vehicle.year, vehicle.business_percentage
        )
        
        created = await conn.fetchrow(
            "SELECT * FROM vehicles WHERE vehicle_id = $1",
            vehicle_id
        )
        
        return Vehicle(**dict(created))

@api_router.get("/vehicles", response_model=List[Vehicle])
async def get_vehicles(current_user: User = Depends(require_auth)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        vehicles = await conn.fetch(
            "SELECT * FROM vehicles WHERE user_id = $1 ORDER BY created_at DESC",
            current_user.user_id
        )
        return [Vehicle(**dict(v)) for v in vehicles]

@api_router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: str, current_user: User = Depends(require_auth)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM vehicles WHERE vehicle_id = $1 AND user_id = $2",
            vehicle_id, current_user.user_id
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Vehicle not found")
        return {"message": "Vehicle deleted"}

# Trip endpoints
@api_router.post("/trips", response_model=Trip)
async def create_trip(trip: TripCreate, current_user: User = Depends(require_auth)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        trip_id = f"trip_{uuid.uuid4().hex[:12]}"
        
        await conn.execute(
            """INSERT INTO trips (trip_id, user_id, vehicle_id, start_time, end_time, 
               distance, start_location, end_location, purpose, is_business, is_automatic)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)""",
            trip_id, current_user.user_id, trip.vehicle_id, trip.start_time, 
            trip.end_time, trip.distance, trip.start_location, trip.end_location,
            trip.purpose, trip.is_business, trip.is_automatic
        )
        
        created = await conn.fetchrow(
            "SELECT * FROM trips WHERE trip_id = $1",
            trip_id
        )
        
        return Trip(**dict(created))

@api_router.get("/trips", response_model=List[Trip])
async def get_trips(current_user: User = Depends(require_auth)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        trips = await conn.fetch(
            "SELECT * FROM trips WHERE user_id = $1 ORDER BY start_time DESC LIMIT 100",
            current_user.user_id
        )
        return [Trip(**dict(t)) for t in trips]

@api_router.put("/trips/{trip_id}", response_model=Trip)
async def update_trip(trip_id: str, trip_update: TripUpdate, current_user: User = Depends(require_auth)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Build update query dynamically
        updates = []
        values = []
        param_count = 1
        
        for field, value in trip_update.dict(exclude_unset=True).items():
            if value is not None:
                updates.append(f"{field} = ${param_count}")
                values.append(value)
                param_count += 1
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.extend([trip_id, current_user.user_id])
        query = f"UPDATE trips SET {', '.join(updates)} WHERE trip_id = ${param_count} AND user_id = ${param_count+1} RETURNING *"
        
        updated = await conn.fetchrow(query, *values)
        
        if not updated:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        return Trip(**dict(updated))

@api_router.delete("/trips/{trip_id}")
async def delete_trip(trip_id: str, current_user: User = Depends(require_auth)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM trips WHERE trip_id = $1 AND user_id = $2",
            trip_id, current_user.user_id
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Trip not found")
        return {"message": "Trip deleted"}

# Expense endpoints
@api_router.post("/expenses", response_model=Expense)
async def create_expense(expense: ExpenseCreate, current_user: User = Depends(require_auth)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        expense_id = f"expense_{uuid.uuid4().hex[:12]}"
        
        await conn.execute(
            """INSERT INTO expenses (expense_id, user_id, vehicle_id, amount, category, 
               date, notes, receipt_image_base64)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)""",
            expense_id, current_user.user_id, expense.vehicle_id, expense.amount,
            expense.category, expense.date, expense.notes, expense.receipt_image_base64
        )
        
        created = await conn.fetchrow(
            "SELECT * FROM expenses WHERE expense_id = $1",
            expense_id
        )
        
        return Expense(**dict(created))

@api_router.get("/expenses", response_model=List[Expense])
async def get_expenses(current_user: User = Depends(require_auth)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        expenses = await conn.fetch(
            "SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC LIMIT 100",
            current_user.user_id
        )
        return [Expense(**dict(e)) for e in expenses]

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, current_user: User = Depends(require_auth)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM expenses WHERE expense_id = $1 AND user_id = $2",
            expense_id, current_user.user_id
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Expense not found")
        return {"message": "Expense deleted"}

# Dashboard stats
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(require_auth)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Get current month and year stats
        now = datetime.now(timezone.utc)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Monthly miles
        month_miles = await conn.fetchval(
            "SELECT COALESCE(SUM(distance), 0) FROM trips WHERE user_id = $1 AND is_business = TRUE AND start_time >= $2",
            current_user.user_id, month_start
        )
        
        # Yearly miles
        year_miles = await conn.fetchval(
            "SELECT COALESCE(SUM(distance), 0) FROM trips WHERE user_id = $1 AND is_business = TRUE AND start_time >= $2",
            current_user.user_id, year_start
        )
        
        # Total expenses
        total_expenses = await conn.fetchval(
            "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id = $1 AND date >= $2",
            current_user.user_id, year_start
        )
        
        # IRS 2025 rate: $0.67 per mile
        IRS_RATE = 0.67
        mileage_deduction = year_miles * IRS_RATE
        total_deduction = mileage_deduction + total_expenses
        
        # Estimated tax savings (assuming 25% tax bracket)
        estimated_tax_savings = total_deduction * 0.25
        
        return {
            "month_miles": round(month_miles, 2),
            "year_miles": round(year_miles, 2),
            "total_expenses": round(total_expenses, 2),
            "mileage_deduction": round(mileage_deduction, 2),
            "total_deduction": round(total_deduction, 2),
            "estimated_tax_savings": round(estimated_tax_savings, 2)
        }

# Reports
@api_router.get("/reports/tax", response_model=TaxReport)
async def get_tax_report(
    start_date: str,
    end_date: str,
    current_user: User = Depends(require_auth)
):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        # Get trips
        total_miles = await conn.fetchval(
            "SELECT COALESCE(SUM(distance), 0) FROM trips WHERE user_id = $1 AND start_time BETWEEN $2 AND $3",
            current_user.user_id, start, end
        )
        
        business_miles = await conn.fetchval(
            "SELECT COALESCE(SUM(distance), 0) FROM trips WHERE user_id = $1 AND is_business = TRUE AND start_time BETWEEN $2 AND $3",
            current_user.user_id, start, end
        )
        
        # Get expenses
        total_expenses = await conn.fetchval(
            "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id = $1 AND date BETWEEN $2 AND $3",
            current_user.user_id, start, end
        )
        
        IRS_RATE = 0.67
        total_deduction = (business_miles * IRS_RATE) + total_expenses
        total_tax_savings = total_deduction * 0.25
        
        return TaxReport(
            total_miles=round(total_miles or 0, 2),
            business_miles=round(business_miles or 0, 2),
            total_deduction=round(total_deduction or 0, 2),
            total_expenses=round(total_expenses or 0, 2),
            total_tax_savings=round(total_tax_savings or 0, 2),
            period_start=start,
            period_end=end
        )

# Subscription (mock)
@api_router.get("/subscription/status", response_model=SubscriptionStatus)
async def get_subscription_status(current_user: User = Depends(require_auth)):
    # Mock pro subscription for testing
    return SubscriptionStatus(
        plan_type="pro",
        is_active=True,
        features=[
            "Automatic GPS tracking",
            "Unlimited expenses",
            "Tax reports (PDF/CSV)",
            "Multiple vehicles"
        ]
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
