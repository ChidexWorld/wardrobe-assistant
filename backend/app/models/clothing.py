from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..core.database import Base

class ClothingTypeEnum(enum.Enum):
    SHIRT = "shirt"
    PANTS = "pants"
    DRESS = "dress"
    JACKET = "jacket"
    SHOES = "shoes"
    ACCESSORIES = "accessories"
    UNDERWEAR = "underwear"
    ACTIVEWEAR = "activewear"
    FORMAL = "formal"
    CASUAL = "casual"

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
    tags = Column(Text)  # JSON array as string
    usage_count = Column(Integer, default=0)
    last_worn = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_business_item = Column(Boolean, default=False)
    business_id = Column(String(255), ForeignKey("businesses.id"))

    # Relationships
    user = relationship("User", back_populates="clothing_items")
    business = relationship("Business", back_populates="catalogue_items")

class User(Base):
    __tablename__ = "users"

    id = Column(String(255), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    user_type = Column(String(50), default="individual")  # individual or business
    preferences = Column(Text)  # JSON as string
    measurements = Column(Text)  # JSON as string
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    clothing_items = relationship("ClothingItem", back_populates="user")
    outfits = relationship("Outfit", back_populates="user")

class Outfit(Base):
    __tablename__ = "outfits"

    id = Column(String(255), primary_key=True)
    user_id = Column(String(255), ForeignKey("users.id"))
    name = Column(String(255), nullable=False)
    items = Column(Text)  # JSON array of item IDs as string
    event = Column(String(100))
    weather = Column(Text)  # JSON as string
    rating = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_worn = Column(DateTime)

    # Relationships
    user = relationship("User", back_populates="outfits")

class Business(Base):
    __tablename__ = "businesses"

    id = Column(String(255), primary_key=True)
    user_id = Column(String(255), ForeignKey("users.id"))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    catalogue_items = relationship("ClothingItem", back_populates="business")