from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
import uuid
import os
from pathlib import Path
import shutil
from PIL import Image
import json

from ..models.clothing import ClothingItem, User
from ..services.image_processing import ImageProcessor
from ..core.database import get_db
from ..core.dependencies import get_current_user_id

router = APIRouter(prefix="/wardrobe", tags=["wardrobe"])

UPLOAD_DIR = Path("static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/items")
async def upload_clothing_item(
    name: str = Form(...),
    clothing_type: str = Form(...),
    color: str = Form(...),
    size: str = Form(None),
    brand: str = Form(None),
    price: float = Form(None),
    tags: str = Form("[]"),
    file: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Upload a new clothing item with image"""

    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Generate unique filename
    item_id = str(uuid.uuid4())
    file_extension = Path(file.filename).suffix
    filename = f"{item_id}{file_extension}"
    file_path = UPLOAD_DIR / filename

    try:
        # Save uploaded file
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Process image (resize, optimize)
        processor = ImageProcessor()
        processed_path = await processor.process_clothing_image(file_path)

        # Create clothing item record
        item = ClothingItem(
            id=item_id,
            user_id=current_user_id,
            name=name,
            clothing_type=clothing_type,
            color=color,
            size=size,
            brand=brand,
            price=price,
            image_url=f"/static/uploads/{filename}",
            tags=tags,
            usage_count=0
        )

        # Save to database
        db.add(item)
        db.commit()
        db.refresh(item)

        return {
            "id": item_id,
            "message": "Clothing item uploaded successfully",
            "item": {
                "id": item.id,
                "name": item.name,
                "type": item.clothing_type,
                "color": item.color,
                "imageUrl": item.image_url
            }
        }

    except Exception as e:
        # Clean up file if processing failed
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")

@router.get("/items")
async def get_wardrobe_items(
    clothing_type: Optional[str] = None,
    current_user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Get all clothing items for the authenticated user, optionally filtered by type"""

    query = db.query(ClothingItem).filter(ClothingItem.user_id == current_user_id)
    if clothing_type:
        query = query.filter(ClothingItem.clothing_type == clothing_type)
    items = query.all()

    # Convert to dict format
    items_data = []
    for item in items:
        items_data.append({
            "id": item.id,
            "name": item.name,
            "type": item.clothing_type,
            "color": item.color,
            "size": item.size,
            "brand": item.brand,
            "price": item.price,
            "imageUrl": item.image_url,
            "tags": json.loads(item.tags) if item.tags else [],
            "usageCount": item.usage_count,
            "lastWorn": item.last_worn.isoformat() if item.last_worn else None
        })

    return {
        "items": items_data,
        "total": len(items_data)
    }

@router.get("/items/{item_id}")
async def get_clothing_item(
    item_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Get a specific clothing item by ID"""

    item = db.query(ClothingItem).filter(
        ClothingItem.id == item_id,
        ClothingItem.user_id == current_user_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    return {
        "id": item.id,
        "name": item.name,
        "type": item.clothing_type,
        "color": item.color,
        "size": item.size,
        "brand": item.brand,
        "price": item.price,
        "imageUrl": item.image_url,
        "tags": json.loads(item.tags) if item.tags else [],
        "usageCount": item.usage_count,
        "lastWorn": item.last_worn.isoformat() if item.last_worn else None,
        "createdAt": item.created_at.isoformat() if item.created_at else None
    }

@router.put("/items/{item_id}")
async def update_clothing_item(
    item_id: str,
    updates: dict,
    current_user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Update a clothing item"""

    item = db.query(ClothingItem).filter(
        ClothingItem.id == item_id,
        ClothingItem.user_id == current_user_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Update allowed fields
    allowed_fields = ['name', 'clothing_type', 'color', 'size', 'brand', 'price', 'tags']
    for field, value in updates.items():
        if field in allowed_fields and hasattr(item, field):
            if field == 'tags' and isinstance(value, list):
                setattr(item, field, json.dumps(value))
            else:
                setattr(item, field, value)

    db.commit()
    db.refresh(item)

    return {
        "message": "Item updated successfully",
        "item_id": item_id,
        "item": {
            "id": item.id,
            "name": item.name,
            "type": item.clothing_type,
            "color": item.color,
            "size": item.size,
            "brand": item.brand,
            "price": item.price,
            "imageUrl": item.image_url,
            "tags": json.loads(item.tags) if item.tags else []
        }
    }

@router.delete("/items/{item_id}")
async def delete_clothing_item(
    item_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Delete a clothing item"""

    item = db.query(ClothingItem).filter(
        ClothingItem.id == item_id,
        ClothingItem.user_id == current_user_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Delete the image file if it exists
    if item.image_url:
        try:
            file_path = Path(f".{item.image_url}")
            if file_path.exists():
                file_path.unlink()
        except Exception as e:
            print(f"Error deleting file: {e}")

    # Delete from database
    db.delete(item)
    db.commit()

    return {
        "message": "Item deleted successfully",
        "item_id": item_id
    }

@router.post("/items/{item_id}/worn")
async def mark_item_worn(
    item_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db = Depends(get_db)
):
    """Mark an item as worn (increment usage count)"""

    item = db.query(ClothingItem).filter(
        ClothingItem.id == item_id,
        ClothingItem.user_id == current_user_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Increment usage count and update last_worn
    from datetime import datetime
    item.usage_count = (item.usage_count or 0) + 1
    item.last_worn = datetime.utcnow()

    db.commit()
    db.refresh(item)

    return {
        "message": "Item marked as worn",
        "item_id": item_id,
        "new_usage_count": item.usage_count,
        "last_worn": item.last_worn.isoformat()
    }