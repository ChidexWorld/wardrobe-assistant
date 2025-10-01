#!/usr/bin/env python3
"""
Initialize the database with sample data for testing and demonstration.
"""

import uuid
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.models.clothing import User, ClothingItem, Outfit, Business
from app.core.auth import get_password_hash

def create_sample_user():
    """Create a sample user"""
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email="demo@example.com",
        name="Demo User",
        hashed_password=get_password_hash("demo123"),  # Default password: demo123
        is_active=True,
        user_type="individual",
        preferences=json.dumps({
            "favorite_colors": ["blue", "black", "white"],
            "preferred_styles": ["casual", "professional"],
            "budget_range": {"min": 50, "max": 200}
        }),
        measurements=json.dumps({
            "chest": 38,
            "waist": 32,
            "height": 170,
            "weight": 70
        })
    )
    return user

def create_sample_clothing_items(user_id: str):
    """Create sample clothing items"""
    items = [
        ClothingItem(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name="Classic Blue Jeans",
            clothing_type="jeans",
            color="blue",
            size="32",
            brand="Levi's",
            price=79.99,
            image_url="/static/uploads/sample_jeans.jpg",
            tags=json.dumps(["casual", "everyday", "denim"]),
            usage_count=15,
            last_worn=datetime.now() - timedelta(days=3),
            is_business_item=False
        ),
        ClothingItem(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name="White Cotton T-Shirt",
            clothing_type="t-shirt",
            color="white",
            size="L",
            brand="H&M",
            price=19.99,
            image_url="/static/uploads/sample_tshirt.jpg",
            tags=json.dumps(["casual", "basic", "cotton"]),
            usage_count=25,
            last_worn=datetime.now() - timedelta(days=1),
            is_business_item=False
        ),
        ClothingItem(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name="Black Leather Shoes",
            clothing_type="shoes",
            color="black",
            size="10",
            brand="Cole Haan",
            price=159.99,
            image_url="/static/uploads/sample_shoes.jpg",
            tags=json.dumps(["formal", "leather", "professional"]),
            usage_count=8,
            last_worn=datetime.now() - timedelta(days=7),
            is_business_item=False
        ),
        ClothingItem(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name="Navy Blue Blazer",
            clothing_type="blazer",
            color="navy",
            size="L",
            brand="Hugo Boss",
            price=299.99,
            image_url="/static/uploads/sample_blazer.jpg",
            tags=json.dumps(["formal", "professional", "business"]),
            usage_count=6,
            last_worn=datetime.now() - timedelta(days=14),
            is_business_item=False
        ),
        ClothingItem(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name="White Dress Shirt",
            clothing_type="shirt",
            color="white",
            size="L",
            brand="Calvin Klein",
            price=65.99,
            image_url="/static/uploads/sample_dress_shirt.jpg",
            tags=json.dumps(["formal", "professional", "cotton"]),
            usage_count=12,
            last_worn=datetime.now() - timedelta(days=5),
            is_business_item=False
        ),
        ClothingItem(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name="Black Wool Sweater",
            clothing_type="sweater",
            color="black",
            size="L",
            brand="Zara",
            price=49.99,
            image_url="/static/uploads/sample_sweater.jpg",
            tags=json.dumps(["casual", "warm", "winter"]),
            usage_count=3,
            last_worn=datetime.now() - timedelta(days=30),
            is_business_item=False
        ),
    ]
    return items

def create_sample_outfits(user_id: str, clothing_items):
    """Create sample outfits"""
    outfits = [
        Outfit(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name="Professional Meeting Look",
            items=json.dumps([clothing_items[2].id, clothing_items[3].id, clothing_items[4].id]),  # shoes, blazer, dress shirt
            event="work",
            weather=json.dumps({"temperature": 22, "condition": "sunny"}),
            rating=5,
            last_worn=datetime.now() - timedelta(days=7)
        ),
        Outfit(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name="Casual Weekend",
            items=json.dumps([clothing_items[0].id, clothing_items[1].id]),  # jeans, t-shirt
            event="casual",
            weather=json.dumps({"temperature": 25, "condition": "sunny"}),
            rating=4,
            last_worn=datetime.now() - timedelta(days=2)
        ),
    ]
    return outfits

def create_sample_business(user_id: str):
    """Create a sample business"""
    business_id = str(uuid.uuid4())
    business = Business(
        id=business_id,
        user_id=user_id,  # Use the same user as business owner
        name="Style Studio Boutique",
        description="Professional styling services and curated fashion collection"
    )
    return business

def init_sample_data():
    """Initialize the database with sample data"""
    db: Session = SessionLocal()

    try:
        # Check if data already exists
        existing_user = db.query(User).filter(User.email == "demo@example.com").first()
        if existing_user:
            print("Sample data already exists. Skipping initialization.")
            return

        print("Creating sample data...")

        # Create sample user
        user = create_sample_user()
        db.add(user)
        db.flush()  # Get the user ID

        # Create sample clothing items
        clothing_items = create_sample_clothing_items(user.id)
        for item in clothing_items:
            db.add(item)
        db.flush()

        # Create sample outfits
        outfits = create_sample_outfits(user.id, clothing_items)
        for outfit in outfits:
            db.add(outfit)

        # Create sample business
        business = create_sample_business(user.id)
        db.add(business)

        # Commit all changes
        db.commit()

        print(f"Successfully created sample data:")
        print(f"- User: {user.email}")
        print(f"- Clothing items: {len(clothing_items)}")
        print(f"- Outfits: {len(outfits)}")
        print(f"- Business: {business.name}")

    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing database with sample data...")
    init_sample_data()
    print("Sample data initialization complete!")