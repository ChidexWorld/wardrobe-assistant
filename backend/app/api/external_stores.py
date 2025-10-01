from fastapi import APIRouter, Query
from typing import List, Optional
from ..services.external_stores import ExternalStoreIntegration

router = APIRouter(prefix="/external-stores", tags=["external-stores"])
store_integration = ExternalStoreIntegration()

@router.get("/search")
async def search_external_stores(
    query: str = Query(..., description="Search query for items"),
    category: Optional[str] = Query(None, description="Item category (shirts, pants, shoes, etc.)"),
    color: Optional[str] = Query(None, description="Preferred color"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    size: Optional[str] = Query(None, description="Preferred size"),
    limit: int = Query(20, description="Maximum number of results")
):
    """Search for items across multiple external fashion stores"""

    items = await store_integration.search_items(
        query=query,
        category=category,
        color=color,
        min_price=min_price,
        max_price=max_price,
        size=size,
        limit=limit
    )

    # Convert to response format
    return {
        "query": {
            "search_term": query,
            "category": category,
            "color": color,
            "price_range": {"min": min_price, "max": max_price},
            "size": size
        },
        "results": [
            {
                "id": item.id,
                "name": item.name,
                "brand": item.brand,
                "price": item.price,
                "color": item.color,
                "category": item.category,
                "sizes": item.size,
                "image_url": item.image_url,
                "store_name": item.store_name,
                "store_url": item.store_url,
                "description": item.description,
                "rating": item.rating,
                "availability": item.availability,
                "shipping_cost": item.shipping_cost,
                "total_cost": item.price + item.shipping_cost
            }
            for item in items
        ],
        "total_found": len(items)
    }

@router.get("/item/{store_name}/{item_id}")
async def get_external_item_details(store_name: str, item_id: str):
    """Get detailed information about a specific item from an external store"""

    item = await store_integration.get_item_details(store_name, item_id)

    if not item:
        return {"error": "Item not found"}

    return {
        "id": item.id,
        "name": item.name,
        "brand": item.brand,
        "price": item.price,
        "color": item.color,
        "category": item.category,
        "sizes": item.size,
        "image_url": item.image_url,
        "store_name": item.store_name,
        "store_url": item.store_url,
        "description": item.description,
        "rating": item.rating,
        "availability": item.availability,
        "shipping_cost": item.shipping_cost,
        "total_cost": item.price + item.shipping_cost
    }

@router.get("/stores")
async def get_supported_stores():
    """Get list of supported external fashion stores"""

    stores = store_integration.get_supported_stores()

    return {
        "supported_stores": stores,
        "total_stores": len(stores)
    }

@router.get("/price-comparison")
async def compare_prices(
    item_name: str = Query(..., description="Name of the item to compare"),
    category: str = Query(..., description="Item category")
):
    """Compare prices for similar items across different stores"""

    comparison = await store_integration.check_price_comparison(item_name, category)

    if not comparison:
        return {
            "item_name": item_name,
            "category": category,
            "comparison": [],
            "message": "No similar items found in external stores"
        }

    # Calculate savings compared to most expensive
    max_price = max(comp['total_cost'] for comp in comparison)
    min_price = min(comp['total_cost'] for comp in comparison)
    potential_savings = max_price - min_price

    # Add savings information to each item
    for comp in comparison:
        comp['savings_vs_highest'] = max_price - comp['total_cost']
        comp['price_rank'] = sorted([c['total_cost'] for c in comparison]).index(comp['total_cost']) + 1

    return {
        "item_name": item_name,
        "category": category,
        "comparison": comparison,
        "summary": {
            "stores_compared": len(comparison),
            "lowest_price": min_price,
            "highest_price": max_price,
            "potential_savings": potential_savings,
            "best_deal": comparison[0]  # Already sorted by total cost
        }
    }

@router.post("/wishlist/add")
async def add_to_wishlist(
    user_id: str,
    item_id: str,
    store_name: str,
    notes: Optional[str] = None
):
    """Add an external store item to user's wishlist"""

    # In a real implementation, save to database
    # For now, return success response

    return {
        "message": "Item added to wishlist successfully",
        "wishlist_item": {
            "user_id": user_id,
            "item_id": item_id,
            "store_name": store_name,
            "notes": notes,
            "added_at": "2024-01-24T10:30:00Z"
        }
    }

@router.get("/wishlist/{user_id}")
async def get_user_wishlist(user_id: str):
    """Get user's wishlist items from external stores"""

    # Mock wishlist data - in real app, fetch from database
    mock_wishlist = [
        {
            "id": "wish_1",
            "item_id": "ext_fashion_hub_001",
            "store_name": "Fashion Hub",
            "item_name": "Designer Handbag",
            "price": 199.99,
            "image_url": "/api/placeholder/200/200",
            "notes": "Perfect for work meetings",
            "added_at": "2024-01-20T15:30:00Z",
            "price_alerts": True,
            "current_availability": "In Stock"
        }
    ]

    return {
        "user_id": user_id,
        "wishlist": mock_wishlist,
        "total_items": len(mock_wishlist),
        "total_value": sum(item['price'] for item in mock_wishlist)
    }

@router.post("/recommendations/complete-outfit")
async def suggest_missing_items(
    user_wardrobe_items: List[str],
    target_style: str = "casual",
    budget_max: Optional[float] = None
):
    """Suggest external store items to complete an outfit based on existing wardrobe"""

    # Analyze user's wardrobe to identify gaps
    # This is a simplified version - in reality, would use AI to analyze wardrobe

    missing_categories = []

    # Mock analysis based on common wardrobe gaps
    if "shoes" not in str(user_wardrobe_items).lower():
        missing_categories.append("shoes")
    if "accessory" not in str(user_wardrobe_items).lower():
        missing_categories.append("accessories")
    if "jacket" not in str(user_wardrobe_items).lower():
        missing_categories.append("jackets")

    # Search for items in missing categories
    suggestions = []

    for category in missing_categories:
        items = await store_integration.search_items(
            query=f"{target_style} {category}",
            category=category,
            max_price=budget_max,
            limit=3
        )

        for item in items:
            suggestions.append({
                "category": category,
                "item": {
                    "id": item.id,
                    "name": item.name,
                    "brand": item.brand,
                    "price": item.price,
                    "color": item.color,
                    "image_url": item.image_url,
                    "store_name": item.store_name,
                    "store_url": item.store_url,
                    "rating": item.rating
                },
                "reasoning": f"Complete your {target_style} look with this {category.rstrip('s')}",
                "priority": "high" if category == "shoes" else "medium"
            })

    return {
        "target_style": target_style,
        "budget_max": budget_max,
        "wardrobe_gaps": missing_categories,
        "suggestions": suggestions,
        "total_suggestions": len(suggestions)
    }