export interface ClothingItem {
  id: string;
  name: string;
  type: ClothingType;
  color: string;
  size: string;
  brand?: string;
  price?: number;
  imageUrl: string;
  tags: string[];
  usageCount: number;
  lastWorn?: Date;
  createdAt: Date;
  isBusinessItem?: boolean;
  businessId?: string;
}

export interface Outfit {
  id: string;
  name: string;
  items: ClothingItem[];
  event: string;
  weather?: WeatherCondition;
  rating?: number;
  createdAt: Date;
  lastWorn?: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'individual' | 'business';
  preferences: UserPreferences;
  measurements?: Measurements;
}

export interface UserPreferences {
  favoriteColors: string[];
  preferredStyles: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  sustainabilityPriority: 'low' | 'medium' | 'high';
}

export interface Measurements {
  chest?: number;
  waist?: number;
  hips?: number;
  height?: number;
  weight?: number;
}

export interface BusinessCatalogue {
  id: string;
  businessId: string;
  items: ClothingItem[];
  name: string;
  description?: string;
}

export interface WeatherCondition {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  humidity: number;
}

export interface OutfitRecommendation {
  outfit: Outfit;
  confidence: number;
  reason: string;
  alternatives?: ClothingItem[];
}

export interface SustainabilityInsights {
  totalItems: number;
  averageUsagePerItem: number;
  rarelyWornItems: ClothingItem[];
  sustainabilityScore: number;
  suggestions: string[];
}

export type ClothingType =
  | 'shirt'
  | 'pants'
  | 'dress'
  | 'jacket'
  | 'shoes'
  | 'accessories'
  | 'underwear'
  | 'activewear'
  | 'formal'
  | 'casual';