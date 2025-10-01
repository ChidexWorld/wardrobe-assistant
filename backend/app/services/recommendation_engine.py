from typing import List, Dict, Optional, Tuple
import json
from datetime import datetime, timedelta
import random
from dataclasses import dataclass

@dataclass
class OutfitRecommendation:
    items: List[str]  # List of clothing item IDs
    confidence: float  # 0.0 to 1.0
    reasoning: str
    weather_appropriate: bool
    event_match: bool
    style_score: float

@dataclass
class ClothingItem:
    id: str
    name: str
    type: str
    color: str
    tags: List[str]
    usage_count: int
    last_worn: Optional[datetime]
    is_formal: bool
    is_seasonal: bool

class RecommendationEngine:

    def __init__(self):
        # Color compatibility matrix
        self.color_harmony = {
            'neutral': ['black', 'white', 'grey', 'gray', 'beige', 'cream', 'navy'],
            'warm': ['red', 'orange', 'yellow', 'pink', 'burgundy', 'brown'],
            'cool': ['blue', 'green', 'purple', 'turquoise', 'teal'],
            'earth': ['brown', 'tan', 'khaki', 'olive', 'beige']
        }

        # Weather-appropriate clothing
        self.weather_mapping = {
            'hot': ['shorts', 'tank_top', 't-shirt', 'dress', 'sandals', 'light_fabric'],
            'warm': ['jeans', 't-shirt', 'shirt', 'sneakers', 'dress'],
            'cool': ['jeans', 'sweater', 'jacket', 'boots', 'long_sleeve'],
            'cold': ['coat', 'sweater', 'boots', 'scarf', 'thick_fabric', 'layering']
        }

        # Event-appropriate styles
        self.event_styles = {
            'work': ['formal', 'business_casual', 'professional'],
            'casual': ['casual', 'comfortable', 'everyday'],
            'formal': ['formal', 'dress_up', 'elegant', 'sophisticated'],
            'party': ['trendy', 'stylish', 'fun', 'colorful'],
            'outdoor': ['casual', 'comfortable', 'practical', 'layering'],
            'date': ['stylish', 'attractive', 'confident', 'nice'],
            'workout': ['activewear', 'comfortable', 'breathable']
        }

    def generate_recommendations(
        self,
        wardrobe_items: List[ClothingItem],
        event: Optional[str] = None,
        weather: Optional[Dict] = None,
        user_preferences: Optional[Dict] = None,
        count: int = 5
    ) -> List[OutfitRecommendation]:
        """Generate smart outfit recommendations based on various factors"""

        recommendations = []

        # Generate multiple outfit combinations
        for _ in range(count * 3):  # Generate more to filter best ones
            recommendation = self._create_outfit_combination(
                wardrobe_items, event, weather, user_preferences
            )
            if recommendation:
                recommendations.append(recommendation)

        # Sort by confidence score and return top recommendations
        recommendations.sort(key=lambda x: x.confidence, reverse=True)
        return recommendations[:count]

    def _create_outfit_combination(
        self,
        items: List[ClothingItem],
        event: Optional[str],
        weather: Optional[Dict],
        preferences: Optional[Dict]
    ) -> Optional[OutfitRecommendation]:
        """Create a single outfit combination"""

        # Categorize items by type
        tops = [item for item in items if item.type in ['shirt', 't-shirt', 'blouse', 'sweater', 'tank_top']]
        bottoms = [item for item in items if item.type in ['pants', 'jeans', 'shorts', 'skirt']]
        shoes = [item for item in items if item.type == 'shoes']
        outerwear = [item for item in items if item.type in ['jacket', 'coat', 'blazer', 'cardigan']]
        dresses = [item for item in items if item.type == 'dress']
        accessories = [item for item in items if item.type in ['accessories', 'scarf', 'bag', 'belt']]

        outfit_items = []
        reasoning_parts = []
        confidence_factors = []

        # Decide on dress vs top+bottom
        if dresses and random.random() > 0.7:  # 30% chance for dress
            dress = random.choice(dresses)
            outfit_items.append(dress.id)
            reasoning_parts.append(f"Selected {dress.name} as the main piece")
            confidence_factors.append(0.8)
        else:
            # Select top and bottom
            if not tops or not bottoms:
                return None

            top = random.choice(tops)
            bottom = random.choice(bottoms)

            # Check color harmony
            color_score = self._calculate_color_harmony(top.color, bottom.color)
            confidence_factors.append(color_score)

            outfit_items.extend([top.id, bottom.id])
            reasoning_parts.append(f"Paired {top.name} with {bottom.name}")

        # Add shoes
        if shoes:
            shoe = random.choice(shoes)
            outfit_items.append(shoe.id)
            confidence_factors.append(0.7)

        # Add outerwear based on weather
        if weather and self._needs_outerwear(weather):
            if outerwear:
                outer = random.choice(outerwear)
                outfit_items.append(outer.id)
                reasoning_parts.append(f"Added {outer.name} for weather")
                confidence_factors.append(0.8)

        # Add accessories (optional)
        if accessories and random.random() > 0.6:  # 40% chance
            accessory = random.choice(accessories)
            outfit_items.append(accessory.id)
            confidence_factors.append(0.6)

        # Calculate scores
        weather_appropriate = self._is_weather_appropriate(outfit_items, items, weather)
        event_match = self._matches_event(outfit_items, items, event)
        style_score = self._calculate_style_score(outfit_items, items, preferences)

        # Calculate overall confidence
        base_confidence = sum(confidence_factors) / len(confidence_factors) if confidence_factors else 0.5
        weather_bonus = 0.2 if weather_appropriate else -0.3
        event_bonus = 0.2 if event_match else -0.1
        style_bonus = style_score * 0.1

        confidence = min(1.0, max(0.0, base_confidence + weather_bonus + event_bonus + style_bonus))

        # Create reasoning
        reasoning = "; ".join(reasoning_parts)
        if weather:
            reasoning += f" (for {weather.get('condition', 'current')} weather)"
        if event:
            reasoning += f" (suitable for {event})"

        return OutfitRecommendation(
            items=outfit_items,
            confidence=confidence,
            reasoning=reasoning,
            weather_appropriate=weather_appropriate,
            event_match=event_match,
            style_score=style_score
        )

    def _calculate_color_harmony(self, color1: str, color2: str) -> float:
        """Calculate how well two colors work together"""
        color1_lower = color1.lower()
        color2_lower = color2.lower()

        # Same color family gets high score
        if color1_lower == color2_lower:
            return 0.9

        # Check if both colors are in the same harmony group
        for group, colors in self.color_harmony.items():
            if color1_lower in colors and color2_lower in colors:
                return 0.8

        # Neutrals go with everything
        if (color1_lower in self.color_harmony['neutral'] or
            color2_lower in self.color_harmony['neutral']):
            return 0.7

        # Default medium compatibility
        return 0.5

    def _needs_outerwear(self, weather: Dict) -> bool:
        """Determine if outerwear is needed based on weather"""
        if not weather:
            return False

        temp = weather.get('temperature', weather.get('temp', 20))
        condition = weather.get('condition', '')

        return temp < 15 or condition in ['rainy', 'snowy', 'windy']

    def _is_weather_appropriate(self, outfit_items: List[str], all_items: List[ClothingItem], weather: Optional[Dict]) -> bool:
        """Check if outfit is appropriate for the weather"""
        if not weather:
            return True

        temp = weather.get('temperature', weather.get('temp', 20))
        condition = weather.get('condition', 'sunny')

        # Get weather category
        if temp > 25:
            weather_cat = 'hot'
        elif temp > 15:
            weather_cat = 'warm'
        elif temp > 5:
            weather_cat = 'cool'
        else:
            weather_cat = 'cold'

        appropriate_types = self.weather_mapping.get(weather_cat, [])

        # Check if outfit contains weather-appropriate items
        outfit_types = []
        for item_id in outfit_items:
            item = next((item for item in all_items if item.id == item_id), None)
            if item:
                outfit_types.extend([item.type] + item.tags)

        return any(appropriate_type in outfit_types for appropriate_type in appropriate_types)

    def _matches_event(self, outfit_items: List[str], all_items: List[ClothingItem], event: Optional[str]) -> bool:
        """Check if outfit matches the event"""
        if not event:
            return True

        appropriate_styles = self.event_styles.get(event.lower(), [])
        if not appropriate_styles:
            return True

        # Check if outfit contains event-appropriate styles
        outfit_tags = []
        for item_id in outfit_items:
            item = next((item for item in all_items if item.id == item_id), None)
            if item:
                outfit_tags.extend(item.tags)
                if item.is_formal and event.lower() in ['work', 'formal']:
                    return True

        return any(style in outfit_tags for style in appropriate_styles)

    def _calculate_style_score(self, outfit_items: List[str], all_items: List[ClothingItem], preferences: Optional[Dict]) -> float:
        """Calculate how well the outfit matches user preferences"""
        if not preferences:
            return 0.5

        score = 0.5

        # Check favorite colors
        favorite_colors = preferences.get('favorite_colors', [])
        if favorite_colors:
            outfit_colors = []
            for item_id in outfit_items:
                item = next((item for item in all_items if item.id == item_id), None)
                if item:
                    outfit_colors.append(item.color.lower())

            color_matches = sum(1 for color in outfit_colors if color in [c.lower() for c in favorite_colors])
            if color_matches > 0:
                score += 0.2

        # Check preferred styles
        preferred_styles = preferences.get('preferred_styles', [])
        if preferred_styles:
            outfit_tags = []
            for item_id in outfit_items:
                item = next((item for item in all_items if item.id == item_id), None)
                if item:
                    outfit_tags.extend([tag.lower() for tag in item.tags])

            style_matches = sum(1 for style in preferred_styles if style.lower() in outfit_tags)
            if style_matches > 0:
                score += 0.2

        return min(1.0, score)

    def analyze_wardrobe_usage(self, items: List[ClothingItem]) -> Dict:
        """Analyze wardrobe usage patterns and provide insights"""
        if not items:
            return {
                'total_items': 0,
                'average_usage': 0,
                'rarely_worn': [],
                'most_worn': [],
                'color_distribution': {},
                'type_distribution': {},
                'suggestions': []
            }

        total_items = len(items)
        total_usage = sum(item.usage_count for item in items)
        average_usage = total_usage / total_items if total_items > 0 else 0

        # Find rarely worn items (less than average usage)
        rarely_worn = [item for item in items if item.usage_count < average_usage * 0.5]

        # Find most worn items
        most_worn = sorted(items, key=lambda x: x.usage_count, reverse=True)[:5]

        # Color distribution
        color_distribution = {}
        for item in items:
            color = item.color.lower()
            color_distribution[color] = color_distribution.get(color, 0) + 1

        # Type distribution
        type_distribution = {}
        for item in items:
            type_name = item.type
            type_distribution[type_name] = type_distribution.get(type_name, 0) + 1

        # Generate suggestions
        suggestions = []
        if len(rarely_worn) > total_items * 0.3:
            suggestions.append("Consider donating or repurposing items you rarely wear")

        if color_distribution.get('black', 0) > total_items * 0.4:
            suggestions.append("Try adding more colorful items to diversify your wardrobe")

        if type_distribution.get('jeans', 0) > 5:
            suggestions.append("You have many jeans - consider other bottom types for variety")

        return {
            'total_items': total_items,
            'average_usage': round(average_usage, 1),
            'rarely_worn': [{'id': item.id, 'name': item.name, 'usage_count': item.usage_count} for item in rarely_worn[:10]],
            'most_worn': [{'id': item.id, 'name': item.name, 'usage_count': item.usage_count} for item in most_worn],
            'color_distribution': color_distribution,
            'type_distribution': type_distribution,
            'suggestions': suggestions
        }