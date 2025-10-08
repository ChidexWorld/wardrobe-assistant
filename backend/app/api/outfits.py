from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime
from ..services.recommendation_engine import RecommendationEngine, ClothingItem
from ..core.dependencies import get_current_user_id
from ..core.database import get_db

router = APIRouter(prefix="/outfits", tags=["outfits"])
recommendation_engine = RecommendationEngine()

class OutfitCreate(BaseModel):
    name: str
    items: List[str]  # List of clothing item IDs
    event: Optional[str] = None
    weather: Optional[dict] = None

class OutfitUpdate(BaseModel):
    name: Optional[str] = None
    items: Optional[List[str]] = None
    event: Optional[str] = None
    weather: Optional[dict] = None
    rating: Optional[int] = None

@router.post("/")
async def create_outfit(
    outfit: OutfitCreate,
    current_user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Create a new outfit"""

    outfit_id = str(uuid.uuid4())

    # In a real implementation, save to database
    outfit_data = {
        "id": outfit_id,
        "user_id": current_user_id,
        "name": outfit.name,
        "items": outfit.items,
        "event": outfit.event,
        "weather": outfit.weather,
        "rating": None,
        "created_at": datetime.now().isoformat(),
        "last_worn": None,
        "wear_count": 0
    }

    return {
        "message": "Outfit created successfully",
        "outfit": outfit_data
    }

@router.get("/")
async def get_user_outfits(
    limit: int = 20,
    offset: int = 0,
    current_user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Get all outfits for a user"""

    # Mock data for now
    mock_outfits = [
        {
            "id": "outfit_1",
            "user_id": user_id,
            "name": "Casual Friday",
            "items": ["item1", "item2", "item3"],
            "event": "work",
            "weather": {"temp": 22, "condition": "sunny"},
            "rating": 4,
            "created_at": "2024-01-15T10:00:00",
            "last_worn": "2024-01-20T08:30:00",
            "wear_count": 3
        },
        {
            "id": "outfit_2",
            "user_id": user_id,
            "name": "Weekend Brunch",
            "items": ["item4", "item5", "item6"],
            "event": "casual",
            "weather": {"temp": 18, "condition": "cloudy"},
            "rating": 5,
            "created_at": "2024-01-10T14:00:00",
            "last_worn": "2024-01-21T11:00:00",
            "wear_count": 2
        }
    ]

    # Apply pagination
    total = len(mock_outfits)
    paginated_outfits = mock_outfits[offset:offset + limit]

    return {
        "outfits": paginated_outfits,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@router.get("/{outfit_id}")
async def get_outfit(outfit_id: str):
    """Get a specific outfit by ID"""

    # Mock data
    outfit = {
        "id": outfit_id,
        "user_id": "user_123",
        "name": "Casual Friday",
        "items": ["item1", "item2", "item3"],
        "event": "work",
        "weather": {"temp": 22, "condition": "sunny"},
        "rating": 4,
        "created_at": "2024-01-15T10:00:00",
        "last_worn": "2024-01-20T08:30:00",
        "wear_count": 3
    }

    return outfit

@router.put("/{outfit_id}")
async def update_outfit(outfit_id: str, updates: OutfitUpdate):
    """Update an existing outfit"""

    # In a real implementation, update database
    updated_outfit = {
        "id": outfit_id,
        "message": "Outfit updated successfully",
        "updates": updates.dict(exclude_unset=True)
    }

    return updated_outfit

@router.delete("/{outfit_id}")
async def delete_outfit(outfit_id: str):
    """Delete an outfit"""

    # In a real implementation, delete from database
    return {
        "message": "Outfit deleted successfully",
        "outfit_id": outfit_id
    }

@router.post("/{outfit_id}/wear")
async def record_outfit_wear(outfit_id: str):
    """Record that an outfit was worn (increment wear count, update last_worn)"""

    # In a real implementation, update database
    return {
        "message": "Outfit wear recorded",
        "outfit_id": outfit_id,
        "new_wear_count": 4,
        "last_worn": datetime.now().isoformat()
    }

@router.post("/{outfit_id}/rate")
async def rate_outfit(outfit_id: str, rating: int):
    """Rate an outfit (1-5 stars)"""

    if not 1 <= rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    # In a real implementation, update database
    return {
        "message": "Outfit rated successfully",
        "outfit_id": outfit_id,
        "rating": rating
    }

@router.get("/recommendations/smart")
async def get_smart_outfit_recommendations(
    user_id: str,
    event: Optional[str] = None,
    weather_temp: Optional[float] = None,
    weather_condition: Optional[str] = None,
    limit: int = 5
):
    """Get AI-powered outfit recommendations based on user preferences, event, and weather"""

    # Mock wardrobe data - in real app, fetch from database
    mock_wardrobe = [
        ClothingItem(
            id="item1", name="Blue Jeans", type="jeans", color="blue",
            tags=["casual", "everyday"], usage_count=8, last_worn=None,
            is_formal=False, is_seasonal=False
        ),
        ClothingItem(
            id="item2", name="White T-Shirt", type="t-shirt", color="white",
            tags=["casual", "basic"], usage_count=12, last_worn=None,
            is_formal=False, is_seasonal=False
        ),
        ClothingItem(
            id="item3", name="Black Sneakers", type="shoes", color="black",
            tags=["casual", "comfortable"], usage_count=10, last_worn=None,
            is_formal=False, is_seasonal=False
        ),
        ClothingItem(
            id="item4", name="Denim Jacket", type="jacket", color="blue",
            tags=["casual", "layering"], usage_count=5, last_worn=None,
            is_formal=False, is_seasonal=False
        ),
        ClothingItem(
            id="item5", name="Black Blazer", type="blazer", color="black",
            tags=["formal", "professional"], usage_count=3, last_worn=None,
            is_formal=True, is_seasonal=False
        ),
        ClothingItem(
            id="item6", name="White Dress Shirt", type="shirt", color="white",
            tags=["formal", "professional"], usage_count=6, last_worn=None,
            is_formal=True, is_seasonal=False
        ),
        ClothingItem(
            id="item7", name="Black Dress Pants", type="pants", color="black",
            tags=["formal", "professional"], usage_count=4, last_worn=None,
            is_formal=True, is_seasonal=False
        )
    ]

    # Prepare weather data
    weather = None
    if weather_temp is not None or weather_condition:
        weather = {
            "temperature": weather_temp or 20,
            "condition": weather_condition or "sunny"
        }

    # Get recommendations from AI engine
    recommendations = recommendation_engine.generate_recommendations(
        wardrobe_items=mock_wardrobe,
        event=event,
        weather=weather,
        user_preferences={"favorite_colors": ["blue", "white"], "preferred_styles": ["casual"]},
        count=limit
    )

    # Convert to response format
    response_recommendations = []
    for i, rec in enumerate(recommendations):
        response_recommendations.append({
            "id": f"rec_{i+1}",
            "name": f"Outfit Suggestion {i+1}",
            "items": rec.items,
            "confidence": round(rec.confidence, 2),
            "reasoning": rec.reasoning,
            "weather_appropriate": rec.weather_appropriate,
            "event_match": rec.event_match,
            "style_score": round(rec.style_score, 2)
        })

    return {
        "recommendations": response_recommendations,
        "criteria": {
            "event": event,
            "weather": weather,
            "user_preferences": "Based on your style history"
        }
    }

@router.get("/sustainability/insights")
async def get_sustainability_insights(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Get sustainability insights and wardrobe usage analytics"""
    import json
    from ..models import clothing as db_models

    # Fetch actual clothing items from database
    db_items = db.query(db_models.ClothingItem).filter(
        db_models.ClothingItem.user_id == current_user_id
    ).all()

    # If no items, return empty state with suggestions
    if not db_items:
        return {
            "user_id": current_user_id,
            "sustainability_score": 0,
            "insights": {
                "total_items": 0,
                "average_usage": 0,
                "rarely_worn": [],
                "most_worn": [],
                "color_distribution": {},
                "type_distribution": {},
                "suggestions": [
                    "Start by adding items to your wardrobe to track sustainability",
                    "Upload your clothing items to get personalized insights"
                ]
            },
            "recommendations": [
                "Add clothing items to your wardrobe to get started",
                "Track your outfit usage to improve sustainability",
                "Build a sustainable wardrobe by choosing quality over quantity"
            ]
        }

    # Convert database items to recommendation engine format
    wardrobe_items = []
    for db_item in db_items:
        # Parse tags from JSON string
        tags = json.loads(db_item.tags) if db_item.tags else []

        # Determine if formal based on tags or type
        is_formal = any(tag in ['formal', 'professional', 'business'] for tag in tags) or \
                   db_item.clothing_type in ['blazer', 'suit', 'dress shirt']

        wardrobe_items.append(
            ClothingItem(
                id=db_item.id,
                name=db_item.name,
                type=db_item.clothing_type,
                color=db_item.color,
                tags=tags,
                usage_count=db_item.usage_count or 0,
                last_worn=db_item.last_worn,
                is_formal=is_formal,
                is_seasonal=False
            )
        )

    # Get sustainability analysis from recommendation engine
    insights = recommendation_engine.analyze_wardrobe_usage(wardrobe_items)

    # Calculate sustainability score
    total_items = insights['total_items']
    avg_usage = insights['average_usage']
    rarely_worn_count = len(insights['rarely_worn'])

    # Score based on usage efficiency (higher usage = more sustainable)
    # Base score: average usage per item (capped at 100)
    usage_efficiency = min(100, (avg_usage / 10) * 100) if avg_usage > 0 else 0

    # Penalty for too many rarely worn items (items with <2 uses)
    rarely_worn_penalty = (rarely_worn_count / total_items) * 50 if total_items > 0 else 0

    # Bonus for having a reasonable wardrobe size (not too many items)
    # Optimal range: 30-50 items. Penalty for having too many items
    if total_items > 100:
        size_penalty = 10
    elif total_items > 70:
        size_penalty = 5
    else:
        size_penalty = 0

    sustainability_score = max(0, min(100, usage_efficiency - rarely_worn_penalty - size_penalty))

    # Generate personalized recommendations
    recommendations = []

    if rarely_worn_count > 0:
        recommendations.append(f"You have {rarely_worn_count} rarely-worn items. Try incorporating them into new outfit combinations.")

    if avg_usage < 3:
        recommendations.append("Increase your items' usage by creating more outfit combinations with existing pieces.")

    if total_items > 50:
        recommendations.append("Consider donating items you haven't worn in over a year to streamline your wardrobe.")

    recommendations.append("Before buying new items, check if you can create similar looks with what you have.")

    if len(insights['most_worn']) > 0:
        top_item = insights['most_worn'][0]['name']
        recommendations.append(f"Your '{top_item}' is well-loved! Look for similar versatile pieces.")

    # Add default recommendation if list is short
    if len(recommendations) < 3:
        recommendations.append("Track your outfit usage regularly to improve sustainability over time.")

    return {
        "user_id": current_user_id,
        "sustainability_score": round(sustainability_score, 1),
        "insights": insights,
        "recommendations": recommendations
    }