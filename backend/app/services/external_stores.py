from typing import List, Dict, Optional
from dataclasses import dataclass
import json
import requests
from urllib.parse import urlencode

@dataclass
class ExternalStoreItem:
    id: str
    name: str
    brand: str
    price: float
    color: str
    category: str
    size: List[str]
    image_url: str
    store_name: str
    store_url: str
    description: str
    rating: float
    availability: str
    shipping_cost: float

class ExternalStoreIntegration:

    def __init__(self):
        # Mock store APIs - in production, these would be real API endpoints
        self.store_configs = {
            "Fashion Hub": {
                "api_url": "https://api.fashionhub.com/v1/search",
                "api_key": "mock_api_key_fashion_hub",
                "enabled": True
            },
            "Style Central": {
                "api_url": "https://api.stylecentral.com/products/search",
                "api_key": "mock_api_key_style_central",
                "enabled": True
            },
            "Trendy Closet": {
                "api_url": "https://api.trendycloset.com/items/find",
                "api_key": "mock_api_key_trendy_closet",
                "enabled": True
            }
        }

    async def search_items(
        self,
        query: str,
        category: Optional[str] = None,
        color: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        size: Optional[str] = None,
        limit: int = 20
    ) -> List[ExternalStoreItem]:
        """Search for items across multiple external stores"""

        all_items = []

        # In a real implementation, we would make actual API calls
        # For now, return mock data
        mock_items = self._get_mock_search_results(query, category, color, min_price, max_price, size)

        # Simulate different stores having different items
        for i, item_data in enumerate(mock_items[:limit]):
            store_name = list(self.store_configs.keys())[i % len(self.store_configs)]

            item = ExternalStoreItem(
                id=f"ext_{store_name.lower().replace(' ', '_')}_{item_data['id']}",
                name=item_data['name'],
                brand=item_data['brand'],
                price=item_data['price'],
                color=item_data['color'],
                category=item_data['category'],
                size=item_data['sizes'],
                image_url=item_data['image_url'],
                store_name=store_name,
                store_url=f"https://www.{store_name.lower().replace(' ', '')}.com/product/{item_data['id']}",
                description=item_data['description'],
                rating=item_data['rating'],
                availability=item_data['availability'],
                shipping_cost=item_data['shipping_cost']
            )
            all_items.append(item)

        # Sort by relevance/price
        all_items.sort(key=lambda x: (x.price, -x.rating))

        return all_items

    def _get_mock_search_results(
        self,
        query: str,
        category: Optional[str] = None,
        color: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        size: Optional[str] = None
    ) -> List[Dict]:
        """Generate mock search results based on query parameters"""

        mock_database = [
            {
                "id": "ext_001",
                "name": "Classic White Button-Down Shirt",
                "brand": "Professional Wear Co.",
                "price": 45.99,
                "color": "white",
                "category": "shirts",
                "sizes": ["XS", "S", "M", "L", "XL"],
                "image_url": "/api/placeholder/300/400",
                "description": "Crisp white cotton shirt perfect for professional settings",
                "rating": 4.5,
                "availability": "In Stock",
                "shipping_cost": 5.99
            },
            {
                "id": "ext_002",
                "name": "Dark Wash Skinny Jeans",
                "brand": "Denim Masters",
                "price": 79.99,
                "color": "dark blue",
                "category": "pants",
                "sizes": ["26", "28", "30", "32", "34"],
                "image_url": "/api/placeholder/300/400",
                "description": "Comfortable stretch denim jeans with modern fit",
                "rating": 4.2,
                "availability": "In Stock",
                "shipping_cost": 7.99
            },
            {
                "id": "ext_003",
                "name": "Little Black Dress",
                "brand": "Evening Elegance",
                "price": 129.99,
                "color": "black",
                "category": "dresses",
                "sizes": ["XS", "S", "M", "L"],
                "image_url": "/api/placeholder/300/400",
                "description": "Timeless black dress suitable for any formal occasion",
                "rating": 4.8,
                "availability": "Limited Stock",
                "shipping_cost": 0.00
            },
            {
                "id": "ext_004",
                "name": "Casual Blazer",
                "brand": "Smart Casual",
                "price": 89.99,
                "color": "navy",
                "category": "jackets",
                "sizes": ["S", "M", "L", "XL"],
                "image_url": "/api/placeholder/300/400",
                "description": "Versatile blazer that transitions from office to dinner",
                "rating": 4.3,
                "availability": "In Stock",
                "shipping_cost": 5.99
            },
            {
                "id": "ext_005",
                "name": "Leather Ankle Boots",
                "brand": "Walk in Style",
                "price": 149.99,
                "color": "brown",
                "category": "shoes",
                "sizes": ["6", "7", "8", "9", "10"],
                "image_url": "/api/placeholder/300/400",
                "description": "Premium leather boots with comfortable sole",
                "rating": 4.6,
                "availability": "In Stock",
                "shipping_cost": 9.99
            },
            {
                "id": "ext_006",
                "name": "Silk Scarf",
                "brand": "Luxury Accessories",
                "price": 35.99,
                "color": "multicolor",
                "category": "accessories",
                "sizes": ["One Size"],
                "image_url": "/api/placeholder/300/400",
                "description": "Elegant silk scarf with vibrant pattern",
                "rating": 4.4,
                "availability": "In Stock",
                "shipping_cost": 3.99
            },
            {
                "id": "ext_007",
                "name": "Cozy Knit Sweater",
                "brand": "Warmth & Style",
                "price": 65.99,
                "color": "cream",
                "category": "sweaters",
                "sizes": ["XS", "S", "M", "L", "XL"],
                "image_url": "/api/placeholder/300/400",
                "description": "Soft cashmere-blend sweater for chilly days",
                "rating": 4.7,
                "availability": "In Stock",
                "shipping_cost": 5.99
            },
            {
                "id": "ext_008",
                "name": "High-Waisted Trousers",
                "brand": "Modern Fits",
                "price": 69.99,
                "color": "black",
                "category": "pants",
                "sizes": ["XS", "S", "M", "L"],
                "image_url": "/api/placeholder/300/400",
                "description": "Tailored trousers with flattering high-waist cut",
                "rating": 4.1,
                "availability": "In Stock",
                "shipping_cost": 6.99
            }
        ]

        # Filter results based on query parameters
        filtered_items = []
        query_lower = query.lower() if query else ""

        for item in mock_database:
            # Filter by search query
            if query_lower and not any(query_lower in str(value).lower() for value in [
                item['name'], item['brand'], item['description'], item['category']
            ]):
                continue

            # Filter by category
            if category and item['category'] != category.lower():
                continue

            # Filter by color
            if color and color.lower() not in item['color'].lower():
                continue

            # Filter by price range
            if min_price and item['price'] < min_price:
                continue
            if max_price and item['price'] > max_price:
                continue

            # Filter by size
            if size and size not in item['sizes']:
                continue

            filtered_items.append(item)

        return filtered_items

    async def get_item_details(self, store_name: str, item_id: str) -> Optional[ExternalStoreItem]:
        """Get detailed information about a specific item from an external store"""

        # Mock implementation - in production, make actual API call
        mock_item = {
            "id": item_id,
            "name": "Detailed Item",
            "brand": "Sample Brand",
            "price": 99.99,
            "color": "blue",
            "category": "shirts",
            "sizes": ["S", "M", "L"],
            "image_url": "/api/placeholder/300/400",
            "description": "Detailed description of the item",
            "rating": 4.5,
            "availability": "In Stock",
            "shipping_cost": 5.99
        }

        return ExternalStoreItem(
            id=f"ext_{store_name.lower()}_{item_id}",
            name=mock_item['name'],
            brand=mock_item['brand'],
            price=mock_item['price'],
            color=mock_item['color'],
            category=mock_item['category'],
            size=mock_item['sizes'],
            image_url=mock_item['image_url'],
            store_name=store_name,
            store_url=f"https://www.{store_name.lower()}.com/product/{item_id}",
            description=mock_item['description'],
            rating=mock_item['rating'],
            availability=mock_item['availability'],
            shipping_cost=mock_item['shipping_cost']
        )

    def get_supported_stores(self) -> List[Dict[str, str]]:
        """Get list of supported external stores"""
        return [
            {"name": name, "enabled": config["enabled"]}
            for name, config in self.store_configs.items()
        ]

    async def check_price_comparison(self, item_name: str, category: str) -> List[Dict]:
        """Compare prices for similar items across different stores"""

        similar_items = await self.search_items(
            query=item_name,
            category=category,
            limit=10
        )

        # Group by store and return price comparison
        price_comparison = []
        for item in similar_items:
            price_comparison.append({
                "store_name": item.store_name,
                "item_name": item.name,
                "price": item.price,
                "shipping_cost": item.shipping_cost,
                "total_cost": item.price + item.shipping_cost,
                "rating": item.rating,
                "availability": item.availability,
                "url": item.store_url
            })

        # Sort by total cost
        price_comparison.sort(key=lambda x: x['total_cost'])

        return price_comparison