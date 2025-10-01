# Interactive Visual Wardrobe & Style Assistant

A comprehensive wardrobe management and style recommendation platform built with Python FastAPI backend and React TypeScript frontend.

## Features

### ✅ Implemented
- **Wardrobe Management**: Upload, categorize, and view clothing items
- **Image Processing**: Automatic image optimization and feature extraction
- **Responsive Design**: Clean, modern UI with drag-and-drop functionality
- **RESTful API**: FastAPI backend with comprehensive endpoints

### 🚧 In Progress
- **Visual Outfit Builder**: Drag-and-drop interface for outfit creation
- **AI Recommendations**: Smart outfit suggestions based on weather, events, and preferences
- **Sustainability Insights**: Usage tracking and eco-friendly suggestions
- **Business Features**: Catalogue management for small businesses
- **External Store Integration**: Connect to fashion retailers

### 📋 Planned
- **User Authentication**: Secure login and user management
- **Weather Integration**: Real-time weather data for outfit suggestions
- **Mobile Optimization**: Full mobile app experience
- **Social Features**: Outfit sharing and community feedback

## Tech Stack

### Backend
- **Python 3.9+**
- **FastAPI** - Modern web framework
- **SQLAlchemy** - Database ORM
- **Pillow & OpenCV** - Image processing
- **Uvicorn** - ASGI server

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Modern ES6+** features

## Getting Started

### Prerequisites
- Python 3.9 or higher
- Node.js 16 or higher
- npm or yarn package manager

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

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the backend server:**
   ```bash
   python -m app.main
   # or
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at: http://localhost:8000
API documentation: http://localhost:8000/docs

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be available at: http://localhost:5173

## Project Structure

```
wardrobe-assistant/
├── backend/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── core/          # Core configurations
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── static/            # Static files and uploads
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── package.json       # Node.js dependencies
└── README.md
```

## API Endpoints

### Wardrobe Management
- `POST /wardrobe/items` - Upload new clothing item
- `GET /wardrobe/items` - Get user's wardrobe items
- `GET /wardrobe/items/{item_id}` - Get specific item
- `PUT /wardrobe/items/{item_id}` - Update item
- `DELETE /wardrobe/items/{item_id}` - Delete item
- `POST /wardrobe/items/{item_id}/worn` - Mark item as worn

### Health & Status
- `GET /` - API welcome message
- `GET /health` - Health check endpoint

## Development

### Running in Development Mode

1. **Start backend with hot reload:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Start frontend with hot reload:**
   ```bash
   cd frontend
   npm run dev
   ```

### Building for Production

1. **Backend:** The FastAPI app can be deployed using any ASGI server like Gunicorn + Uvicorn
2. **Frontend:** Build the React app:
   ```bash
   cd frontend
   npm run build
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please open an issue in the GitHub repository.