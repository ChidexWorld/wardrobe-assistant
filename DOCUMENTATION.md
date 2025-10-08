# Interactive Visual Wardrobe & Style Assistant - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend Documentation](#backend-documentation)
4. [Frontend Documentation](#frontend-documentation)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [Development Guide](#development-guide)
8. [Deployment Guide](#deployment-guide)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

### Introduction

The Interactive Visual Wardrobe & Style Assistant is a comprehensive wardrobe management and style recommendation platform that combines AI-powered suggestions with an intuitive visual interface. The application helps users organize their clothing, create outfits, and make sustainable fashion choices.

### Key Features

#### Implemented Features
- **Wardrobe Management**: Upload, categorize, and view clothing items with image support
- **Image Processing**: Automatic image optimization, resizing, and feature extraction
- **User Authentication**: Secure JWT-based authentication system
- **Visual Outfit Builder**: Drag-and-drop interface for creating outfit combinations
- **Smart Recommendations**: AI-powered outfit suggestions based on weather, events, and preferences
- **Sustainability Insights**: Track usage patterns and receive eco-friendly suggestions
- **Responsive Design**: Modern, mobile-friendly UI built with React and Tailwind CSS

#### Planned Features
- Weather API integration for real-time outfit recommendations
- Social sharing capabilities
- Mobile native applications
- External store integration for price comparison
- Business catalogue management

### Technology Stack

#### Backend
- **Framework**: FastAPI 0.100+
- **Language**: Python 3.9+
- **Database**: SQLAlchemy ORM (MySQL/SQLite)
- **Image Processing**: Pillow, OpenCV
- **Authentication**: JWT (python-jose)
- **Server**: Uvicorn ASGI server
- **Migration**: Alembic

#### Frontend
- **Framework**: React 18
- **Language**: TypeScript 5.8
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3.4
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **UI Components**: Custom components with react-dnd
- **Notifications**: react-toastify

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Components   │  │   Services   │  │   Context    │      │
│  │ - Dashboard  │  │   - API      │  │   - Auth     │      │
│  │ - Wardrobe   │  │   - Auth     │  │              │      │
│  │ - Outfits    │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTP/REST API (JSON)
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ API Routes   │  │   Services   │  │    Core      │      │
│  │ - Wardrobe   │  │   - Image    │  │   - Auth     │      │
│  │ - Outfits    │  │   - AI Rec   │  │   - Database │      │
│  │ - Auth       │  │   - External │  │   - Deps     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    SQLAlchemy ORM
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Database (MySQL/SQLite)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Users     │  │   Clothing   │  │   Outfits    │      │
│  │              │  │    Items     │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
wardrobe-assistant/
├── backend/
│   ├── app/
│   │   ├── api/                    # API route handlers
│   │   │   ├── wardrobe.py        # Wardrobe CRUD operations
│   │   │   ├── outfits.py         # Outfit management
│   │   │   └── external_stores.py # External integrations
│   │   ├── core/                   # Core functionality
│   │   │   ├── auth.py            # JWT authentication
│   │   │   ├── database.py        # Database configuration
│   │   │   └── dependencies.py    # Dependency injection
│   │   ├── models/                 # SQLAlchemy models
│   │   │   └── clothing.py        # Database models
│   │   ├── schemas/                # Pydantic schemas
│   │   │   └── auth.py            # Request/response schemas
│   │   ├── routes/                 # Additional routes
│   │   │   └── auth.py            # Authentication routes
│   │   ├── services/               # Business logic
│   │   │   ├── image_processing.py
│   │   │   ├── recommendation_engine.py
│   │   │   └── external_stores.py
│   │   └── main.py                # Application entry point
│   ├── alembic/                    # Database migrations
│   ├── static/                     # Static files & uploads
│   ├── requirements.txt            # Python dependencies
│   └── init_sample_data.py        # Sample data script
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── auth/              # Authentication components
│   │   │   ├── wardrobe/          # Wardrobe components
│   │   │   ├── outfits/           # Outfit components
│   │   │   ├── recommendations/   # AI recommendation UI
│   │   │   ├── sustainability/    # Sustainability dashboard
│   │   │   ├── business/          # Business features
│   │   │   ├── external/          # External store integration
│   │   │   └── Dashboard.tsx      # Main dashboard
│   │   ├── context/               # React context providers
│   │   │   └── AuthContext.tsx    # Authentication context
│   │   ├── services/              # API services
│   │   │   ├── api.ts             # API client
│   │   │   └── auth.ts            # Auth service
│   │   ├── types/                 # TypeScript types
│   │   │   └── index.ts           # Type definitions
│   │   ├── App.tsx                # Root component
│   │   ├── main.tsx               # Application entry
│   │   └── config.ts              # Configuration
│   ├── package.json               # Node dependencies
│   ├── tsconfig.json              # TypeScript config
│   ├── vite.config.ts             # Vite configuration
│   └── tailwind.config.js         # Tailwind CSS config
└── README.md
```

---

## Backend Documentation

### Overview

The backend is built with FastAPI, a modern Python web framework that provides automatic API documentation, type validation, and async support.

### Core Components

#### 1. Main Application (`app/main.py`)

The main application file configures FastAPI, middleware, and routes.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="Interactive Visual Wardrobe & Style Assistant API",
    description="Backend API for wardrobe management",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(wardrobe.router)
app.include_router(outfits.router)
app.include_router(external_stores.router)
```

**Key Features:**
- Automatic OpenAPI documentation at `/docs`
- CORS support for frontend communication
- Static file serving for uploads
- Modular router structure

#### 2. Database Configuration (`app/core/database.py`)

Manages database connections using SQLAlchemy.

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./wardrobe_assistant.db")

# Create engine with MySQL/SQLite support
if "mysql" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300
    )
else:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Features:**
- Support for both MySQL and SQLite
- Connection pooling for MySQL
- Dependency injection for route handlers

#### 3. Authentication System (`app/core/auth.py`)

JWT-based authentication with password hashing.

```python
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

**Security Features:**
- Bcrypt password hashing
- JWT tokens with expiration
- Secure token validation

#### 4. Image Processing Service (`app/services/image_processing.py`)

Handles image optimization and feature extraction.

**Key Methods:**

- `process_clothing_image(image_path)`: Resizes, enhances, and optimizes uploaded images
- `extract_clothing_features(image_path)`: Extracts dominant colors and texture features
- `_extract_dominant_colors(img)`: Uses K-means clustering to find dominant colors
- `_detect_clothing_type(img)`: Simple clothing type detection based on aspect ratio
- `_analyze_texture(img)`: Analyzes texture using gradient magnitude

**Image Processing Pipeline:**
1. Convert to RGB format
2. Resize to max dimensions (800x800) maintaining aspect ratio
3. Enhance contrast and sharpness
4. Save optimized version (85% quality JPEG)
5. Create thumbnail (200x200)
6. Extract features for AI analysis

#### 5. Recommendation Engine (`app/services/recommendation_engine.py`)

AI-powered outfit recommendation system.

**Features:**
- Event-based recommendations (work, casual, formal, party)
- Weather-appropriate suggestions
- Color coordination
- Style preference matching
- Usage analytics for sustainability

**Scoring Algorithm:**
- Base score from color matching and style preferences
- Weather appropriateness bonus
- Event suitability scoring
- Underutilized items prioritization
- Confidence calculation based on multiple factors

### Database Models

#### User Model
```python
class User(Base):
    __tablename__ = "users"

    id = Column(String(255), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    user_type = Column(String(50), default="individual")
    preferences = Column(Text)  # JSON
    measurements = Column(Text)  # JSON
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### ClothingItem Model
```python
class ClothingItem(Base):
    __tablename__ = "clothing_items"

    id = Column(String(255), primary_key=True)
    user_id = Column(String(255), ForeignKey("users.id"))
    name = Column(String(255), nullable=False)
    clothing_type = Column(String(100), nullable=False)
    color = Column(String(100), nullable=False)
    size = Column(String(50))
    brand = Column(String(255))
    price = Column(Float)
    image_url = Column(String(500))
    tags = Column(Text)  # JSON array
    usage_count = Column(Integer, default=0)
    last_worn = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_business_item = Column(Boolean, default=False)
    business_id = Column(String(255), ForeignKey("businesses.id"))
```

#### Outfit Model
```python
class Outfit(Base):
    __tablename__ = "outfits"

    id = Column(String(255), primary_key=True)
    user_id = Column(String(255), ForeignKey("users.id"))
    name = Column(String(255), nullable=False)
    items = Column(Text)  # JSON array of item IDs
    event = Column(String(100))
    weather = Column(Text)  # JSON
    rating = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_worn = Column(DateTime)
```

### Dependencies and Middleware

#### Authentication Dependency
```python
async def get_current_user_id(
    authorization: str = Header(None),
    db = Depends(get_db)
) -> str:
    if not authorization:
        # Development fallback
        return "default_user"

    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### Environment Variables

Required environment variables in `.env`:

```bash
# Database
DATABASE_URL=mysql+pymysql://user:password@host:port/database
# or
DATABASE_URL=sqlite:///./wardrobe_assistant.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# File Upload
UPLOAD_DIR=static/uploads
MAX_UPLOAD_SIZE=10485760  # 10MB
```

---

## Frontend Documentation

### Overview

The frontend is a React 18 application built with TypeScript and Vite, featuring a modern, responsive design with Tailwind CSS.

### Core Components

#### 1. Application Entry (`App.tsx`)

The root component manages authentication state and routing.

```typescript
function App() {
  return (
    <AuthProvider>
      <AppContent />
      <ToastContainer />
    </AuthProvider>
  );
}
```

**Features:**
- Authentication state management
- Loading states
- Conditional rendering (landing page vs. dashboard)
- Toast notifications

#### 2. Authentication Context (`context/AuthContext.tsx`)

Provides global authentication state using React Context.

```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Authentication methods...
}
```

**Key Methods:**
- `login()`: Authenticates user and stores JWT token
- `register()`: Creates new user account
- `logout()`: Clears session and redirects
- Token persistence in localStorage

#### 3. Dashboard Component (`components/Dashboard.tsx`)

Main application interface with tabbed navigation.

**Features:**
- Tab-based navigation (Wardrobe, Outfits, Recommendations, etc.)
- User profile display
- Logout functionality
- Component lazy loading

**Tabs:**
1. My Wardrobe - View and manage clothing items
2. Create Outfit - Visual outfit builder
3. Recommendations - AI-powered suggestions
4. Sustainability - Usage analytics
5. Business Features - Catalogue management
6. External Stores - Price comparison and wishlist

#### 4. Wardrobe Upload (`components/wardrobe/WardrobeUpload.tsx`)

Form component for uploading new clothing items.

**Features:**
- Image file upload with preview
- Form validation
- Clothing type selection
- Color picker
- Size, brand, price inputs
- Tag management
- Success/error handling

#### 5. Outfit Builder (`components/outfits/OutfitBuilder.tsx`)

Drag-and-drop interface for creating outfits.

**Features:**
- React DnD for drag-and-drop
- Canvas for outfit visualization
- Item filtering by type
- Outfit saving
- Undo/redo functionality

```typescript
const [{ isDragging }, drag] = useDrag(() => ({
  type: 'clothing-item',
  item: { id: item.id, type: item.type },
  collect: (monitor) => ({
    isDragging: !!monitor.isDragging()
  })
}));
```

#### 6. Smart Recommendations (`components/recommendations/SmartRecommendations.tsx`)

AI-powered outfit suggestion interface.

**Features:**
- Event-based filtering
- Weather condition input
- Confidence scoring display
- Reasoning explanations
- Save recommendations as outfits

#### 7. Sustainability Dashboard (`components/sustainability/SustainabilityDashboard.tsx`)

Analytics and insights for sustainable fashion.

**Features:**
- Sustainability score visualization
- Most/least worn items
- Usage statistics
- Eco-friendly suggestions
- Wardrobe efficiency metrics

### Services

#### API Service (`services/api.ts`)

Centralized API client with authentication.

```typescript
class ApiService {
  private baseURL: string;

  async uploadClothingItem(formData: FormData): Promise<ClothingItem> {
    const response = await fetch(`${this.baseURL}/wardrobe/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: formData
    });
    return response.json();
  }

  async getWardrobeItems(type?: string): Promise<ClothingItem[]> {
    // Implementation...
  }

  async getOutfitRecommendations(params): Promise<Recommendation[]> {
    // Implementation...
  }
}
```

#### Auth Service (`services/auth.ts`)

Authentication API calls.

```typescript
export const authService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  async register(data: RegisterData) {
    // Implementation...
  }
};
```

### Type Definitions (`types/index.ts`)

TypeScript interfaces for type safety.

**Key Types:**
- `ClothingItem`: Wardrobe item structure
- `Outfit`: Outfit combination
- `User`: User profile
- `WeatherCondition`: Weather data
- `OutfitRecommendation`: AI recommendation
- `SustainabilityInsights`: Analytics data

### Styling

The application uses Tailwind CSS for styling with a custom configuration:

**Theme:**
- Primary color: Pink (500-600)
- Gradient backgrounds
- Glassmorphism effects
- Responsive breakpoints
- Custom animations

**Design Principles:**
- Mobile-first approach
- Consistent spacing
- Accessible color contrast
- Smooth transitions
- Loading states

---

## API Reference

### Authentication Endpoints

#### POST `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "user_type": "individual"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Email already exists
- 422: Validation error

#### POST `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Wardrobe Endpoints

#### POST `/wardrobe/items`

Upload a new clothing item with image.

**Request:** multipart/form-data
- `name` (string, required): Item name
- `clothing_type` (string, required): Type of clothing
- `color` (string, required): Primary color
- `size` (string, optional): Size
- `brand` (string, optional): Brand name
- `price` (float, optional): Price
- `tags` (string, optional): JSON array of tags
- `file` (file, required): Image file

**Response:**
```json
{
  "id": "uuid",
  "message": "Clothing item uploaded successfully",
  "item": {
    "id": "uuid",
    "name": "Blue Denim Jeans",
    "type": "pants",
    "color": "blue",
    "imageUrl": "/static/uploads/uuid.jpg"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Invalid file type
- 500: Processing error

#### GET `/wardrobe/items`

Get all clothing items for authenticated user.

**Query Parameters:**
- `clothing_type` (optional): Filter by type

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Blue Denim Jeans",
      "type": "pants",
      "color": "blue",
      "size": "M",
      "brand": "Levi's",
      "price": 79.99,
      "imageUrl": "/static/uploads/uuid.jpg",
      "tags": ["casual", "denim"],
      "usageCount": 5,
      "lastWorn": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 25
}
```

#### GET `/wardrobe/items/{item_id}`

Get specific clothing item details.

**Response:**
```json
{
  "id": "uuid",
  "name": "Blue Denim Jeans",
  "type": "pants",
  "color": "blue",
  "size": "M",
  "brand": "Levi's",
  "price": 79.99,
  "imageUrl": "/static/uploads/uuid.jpg",
  "tags": ["casual", "denim"],
  "usageCount": 5,
  "lastWorn": "2024-01-15",
  "createdAt": "2024-01-01"
}
```

#### PUT `/wardrobe/items/{item_id}`

Update clothing item details.

**Request Body:**
```json
{
  "name": "Updated Name",
  "tags": ["casual", "summer"]
}
```

#### DELETE `/wardrobe/items/{item_id}`

Delete clothing item.

**Response:**
```json
{
  "message": "Item deleted successfully",
  "item_id": "uuid"
}
```

#### POST `/wardrobe/items/{item_id}/worn`

Mark item as worn (increment usage count).

**Response:**
```json
{
  "message": "Item marked as worn",
  "item_id": "uuid",
  "new_usage_count": 6
}
```

### Outfit Endpoints

#### POST `/outfits/`

Create a new outfit.

**Request Body:**
```json
{
  "name": "Casual Friday",
  "items": ["item_id_1", "item_id_2", "item_id_3"],
  "event": "work",
  "weather": {
    "temperature": 22,
    "condition": "sunny"
  }
}
```

**Response:**
```json
{
  "message": "Outfit created successfully",
  "outfit": {
    "id": "uuid",
    "name": "Casual Friday",
    "items": ["item_id_1", "item_id_2", "item_id_3"],
    "event": "work",
    "weather": {...},
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

#### GET `/outfits/`

Get all user outfits.

**Query Parameters:**
- `limit` (default: 20): Number of results
- `offset` (default: 0): Pagination offset

**Response:**
```json
{
  "outfits": [...],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

#### GET `/outfits/{outfit_id}`

Get specific outfit details.

#### PUT `/outfits/{outfit_id}`

Update outfit.

**Request Body:**
```json
{
  "name": "Updated Name",
  "rating": 5
}
```

#### DELETE `/outfits/{outfit_id}`

Delete outfit.

#### POST `/outfits/{outfit_id}/wear`

Record outfit wear.

**Response:**
```json
{
  "message": "Outfit wear recorded",
  "outfit_id": "uuid",
  "new_wear_count": 4,
  "last_worn": "2024-01-20T08:30:00Z"
}
```

#### POST `/outfits/{outfit_id}/rate`

Rate an outfit (1-5 stars).

**Request Body:**
```json
{
  "rating": 5
}
```

### Recommendation Endpoints

#### GET `/outfits/recommendations/smart`

Get AI-powered outfit recommendations.

**Query Parameters:**
- `user_id` (required): User ID
- `event` (optional): Event type
- `weather_temp` (optional): Temperature
- `weather_condition` (optional): Weather condition
- `limit` (default: 5): Number of recommendations

**Response:**
```json
{
  "recommendations": [
    {
      "id": "rec_1",
      "name": "Outfit Suggestion 1",
      "items": ["item1", "item2", "item3"],
      "confidence": 0.85,
      "reasoning": "Great color coordination for a professional work environment",
      "weather_appropriate": true,
      "event_match": 0.9,
      "style_score": 0.87
    }
  ],
  "criteria": {
    "event": "work",
    "weather": {...},
    "user_preferences": "Based on your style history"
  }
}
```

#### GET `/outfits/sustainability/insights`

Get sustainability insights and analytics.

**Query Parameters:**
- `user_id` (required): User ID

**Response:**
```json
{
  "user_id": "uuid",
  "sustainability_score": 72.5,
  "insights": {
    "total_items": 50,
    "average_usage": 6.4,
    "most_worn": [
      {
        "id": "item1",
        "name": "White T-Shirt",
        "usage_count": 25
      }
    ],
    "rarely_worn": [
      {
        "id": "item8",
        "name": "Red Dress",
        "usage_count": 1
      }
    ]
  },
  "recommendations": [
    "Try to wear rarely-used items more often",
    "Consider creating new outfit combinations with existing pieces"
  ]
}
```

### Health Check

#### GET `/`

API welcome message.

**Response:**
```json
{
  "message": "Interactive Visual Wardrobe & Style Assistant API"
}
```

#### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ name            │
│ hashed_password │
│ is_active       │
│ user_type       │
│ preferences     │
│ measurements    │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────┴────────┐         ┌─────────────────┐
│ ClothingItems   │         │   Businesses    │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ user_id (FK)    │         │ user_id (FK)    │
│ name            │         │ name            │
│ clothing_type   │         │ description     │
│ color           │         │ created_at      │
│ size            │         └─────────────────┘
│ brand           │
│ price           │
│ image_url       │
│ tags            │
│ usage_count     │
│ last_worn       │
│ created_at      │
│ is_business_item│
│ business_id (FK)│
└─────────────────┘

┌─────────────────┐
│    Outfits      │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ name            │
│ items (JSON)    │
│ event           │
│ weather (JSON)  │
│ rating          │
│ created_at      │
│ last_worn       │
└─────────────────┘
```

### Table Definitions

#### users
- Primary key: `id` (String, UUID)
- Unique constraint: `email`
- Indexes: `email`

#### clothing_items
- Primary key: `id` (String, UUID)
- Foreign keys: `user_id`, `business_id`
- Indexes: `user_id`, `clothing_type`, `created_at`

#### outfits
- Primary key: `id` (String, UUID)
- Foreign key: `user_id`
- Indexes: `user_id`, `created_at`

#### businesses
- Primary key: `id` (String, UUID)
- Foreign key: `user_id`
- Indexes: `user_id`

---

## Development Guide

### Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- npm or yarn
- MySQL (optional, SQLite for development)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```
   DATABASE_URL=sqlite:///./wardrobe_assistant.db
   SECRET_KEY=your-secret-key-change-this
   ALLOWED_ORIGINS=http://localhost:5173
   ```

5. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

6. **Load sample data (optional):**
   ```bash
   python init_sample_data.py
   ```

7. **Start development server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   Server will be available at: http://localhost:8000
   API docs: http://localhost:8000/docs

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API endpoint:**

   Edit `src/config.ts`:
   ```typescript
   export const API_URL = 'http://localhost:8000';
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Application will be available at: http://localhost:5173

### Development Workflow

1. **Backend development:**
   - Make changes to Python files
   - Uvicorn auto-reloads on file changes
   - Check logs in terminal
   - Test with `/docs` interactive API

2. **Frontend development:**
   - Make changes to TypeScript/React files
   - Vite hot-module replacement updates instantly
   - Check browser console for errors
   - Use React DevTools for debugging

3. **Database changes:**
   ```bash
   # Create new migration
   alembic revision --autogenerate -m "description"

   # Apply migration
   alembic upgrade head

   # Rollback
   alembic downgrade -1
   ```

### Code Style

#### Backend (Python)
- Follow PEP 8 style guide
- Use type hints
- Document functions with docstrings
- Keep functions small and focused

#### Frontend (TypeScript)
- Use TypeScript strict mode
- Follow ESLint rules
- Use functional components with hooks
- Keep components small and reusable

---

## Deployment Guide

### Production Environment Setup

#### Backend Deployment

**1. Prepare Production Environment:**

```bash
# Install production dependencies
pip install -r requirements.txt

# Set production environment variables
export DATABASE_URL="mysql+pymysql://user:pass@host:port/db"
export SECRET_KEY="secure-random-key"
export ALLOWED_ORIGINS="https://yourdomain.com"
```

**2. Run with Gunicorn:**

```bash
pip install gunicorn

gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

**3. Use systemd service:**

Create `/etc/systemd/system/wardrobe-api.service`:
```ini
[Unit]
Description=Wardrobe Assistant API
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/wardrobe-assistant/backend
Environment="PATH=/var/www/wardrobe-assistant/backend/venv/bin"
ExecStart=/var/www/wardrobe-assistant/backend/venv/bin/gunicorn \
  app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
```

**4. Nginx reverse proxy:**

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /var/www/wardrobe-assistant/backend/static/;
    }
}
```

#### Frontend Deployment

**1. Build production bundle:**

```bash
cd frontend
npm run build
```

**2. Serve with Nginx:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/wardrobe-assistant/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**3. Enable SSL with Let's Encrypt:**

```bash
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

### Docker Deployment

**Backend Dockerfile:**

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "app.main:app", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000"]
```

**Frontend Dockerfile:**

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  db:
    image: mysql:8
    environment:
      MYSQL_DATABASE: wardrobe_assistant
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: mysql+pymysql://root:${DB_PASSWORD}@db:3306/wardrobe_assistant
      SECRET_KEY: ${SECRET_KEY}
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  db_data:
```

### Cloud Platform Deployment

#### Render.com

**Backend (render.yaml):**
```yaml
services:
  - type: web
    name: wardrobe-api
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT"
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: wardrobe-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true

databases:
  - name: wardrobe-db
    databaseName: wardrobe_assistant
    user: wardrobe_user
```

**Frontend:**
- Deploy as static site
- Build command: `npm run build`
- Publish directory: `dist`

#### Heroku

```bash
# Backend
heroku create wardrobe-api
heroku addons:create cleardb:ignite
git subtree push --prefix backend heroku main

# Frontend
heroku create wardrobe-frontend
heroku buildpacks:set heroku/nodejs
git subtree push --prefix frontend heroku main
```

---

## Testing

### Backend Testing

**Setup pytest:**

```bash
pip install pytest pytest-asyncio httpx
```

**Example test file (`tests/test_wardrobe.py`):**

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "version": "1.0.0"}

def test_upload_clothing_item():
    files = {"file": ("test.jpg", open("test.jpg", "rb"), "image/jpeg")}
    data = {
        "name": "Test Shirt",
        "clothing_type": "shirt",
        "color": "blue"
    }
    response = client.post("/wardrobe/items", files=files, data=data)
    assert response.status_code == 200
```

**Run tests:**
```bash
pytest tests/
```

### Frontend Testing

**Setup Jest and React Testing Library:**

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

**Example test (`src/components/__tests__/Dashboard.test.tsx`):**

```typescript
import { render, screen } from '@testing-library/react';
import Dashboard from '../Dashboard';

test('renders dashboard tabs', () => {
  render(<Dashboard />);
  expect(screen.getByText('My Wardrobe')).toBeInTheDocument();
  expect(screen.getByText('Create Outfit')).toBeInTheDocument();
});
```

**Run tests:**
```bash
npm test
```

---

## Troubleshooting

### Common Backend Issues

**1. Database connection errors:**
```
Solution: Check DATABASE_URL in .env file
- Verify database server is running
- Check credentials
- For MySQL: ensure PyMySQL is installed
```

**2. Image upload fails:**
```
Solution:
- Check UPLOAD_DIR exists and has write permissions
- Verify file size limits
- Check supported image formats
```

**3. CORS errors:**
```
Solution: Add frontend URL to ALLOWED_ORIGINS in .env
Example: ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**4. JWT token errors:**
```
Solution:
- Verify SECRET_KEY is set
- Check token expiration time
- Ensure Authorization header format: "Bearer <token>"
```

### Common Frontend Issues

**1. API connection failed:**
```
Solution: Check API_URL in config.ts matches backend URL
- Verify backend is running
- Check network tab in browser DevTools
```

**2. Build errors:**
```
Solution:
- Delete node_modules and package-lock.json
- Run npm install
- Clear Vite cache: rm -rf node_modules/.vite
```

**3. TypeScript errors:**
```
Solution:
- Run npm run type-check
- Update type definitions
- Check tsconfig.json settings
```

**4. Image upload not working:**
```
Solution:
- Check file input accepts correct types
- Verify FormData is properly constructed
- Check backend logs for error details
```

### Performance Issues

**Backend:**
- Enable database query logging: `echo=True` in engine config
- Use database connection pooling
- Implement caching for frequent queries
- Optimize image processing (reduce max size)

**Frontend:**
- Use React.memo for expensive components
- Implement lazy loading for images
- Use pagination for large lists
- Optimize bundle size with code splitting

---

## Contributing

### Development Guidelines

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pytest` (backend), `npm test` (frontend)
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Submit a pull request

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests added for new features
- [ ] Documentation updated
- [ ] No console.log or print statements
- [ ] Error handling implemented
- [ ] Type hints/types added
- [ ] Security considerations addressed

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support and Contact

For issues, questions, or contributions:
- GitHub Issues: [Create an issue]
- Documentation: This file
- API Documentation: http://localhost:8000/docs (when running locally)

---

## Changelog

### Version 1.0.0 (Current)

**Features:**
- User authentication with JWT
- Wardrobe management (CRUD operations)
- Image upload and processing
- Outfit creation and management
- AI-powered recommendations
- Sustainability insights
- Responsive UI with drag-and-drop

**Backend:**
- FastAPI framework
- SQLAlchemy ORM
- Image processing with Pillow/OpenCV
- MySQL/SQLite support

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS styling
- React DnD for outfit builder
- Toast notifications

---

**Last Updated:** 2025-01-06
**Documentation Version:** 1.0.0
