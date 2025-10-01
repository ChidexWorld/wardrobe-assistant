import { authService } from './auth';

const API_BASE_URL = 'http://localhost:8000';

export class ApiService {
  private static instance: ApiService;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await authService.authenticatedFetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async uploadClothingItem(formData: FormData) {
    const response = await authService.authenticatedFetch(`${API_BASE_URL}/wardrobe/items`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getWardrobeItems(clothingType?: string) {
    const params = clothingType ? `?clothing_type=${clothingType}` : '';
    return this.request(`/wardrobe/items${params}`);
  }

  async getOutfitRecommendations(userId: string, event?: string, weatherTemp?: number) {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    if (event) params.append('event', event);
    if (weatherTemp) params.append('weather_temp', weatherTemp.toString());

    return this.request(`/outfits/recommendations/smart?${params.toString()}`);
  }

  async getSustainabilityInsights(userId: string) {
    const params = new URLSearchParams();
    params.append('user_id', userId);
    return this.request(`/outfits/sustainability/insights?${params.toString()}`);
  }

  async createOutfit(outfit: {
    name: string;
    items: string[];
    event?: string;
    weather?: { temperature?: number; condition?: string };
  }) {
    return this.request('/outfits', {
      method: 'POST',
      body: JSON.stringify(outfit),
    });
  }

  async getBusinessCatalogue(businessId: string) {
    return this.request(`/business/catalogue/${businessId}`);
  }

  async searchExternalStores(query: string, category?: string, limit = 10) {
    const params = new URLSearchParams();
    params.append('query', query);
    if (category) params.append('category', category);
    params.append('limit', limit.toString());

    return this.request(`/external-stores/search?${params.toString()}`);
  }

  async getOutfits(limit = 20, offset = 0) {
    return this.request(`/outfits?limit=${limit}&offset=${offset}`);
  }

  async getOutfit(outfitId: string) {
    return this.request(`/outfits/${outfitId}`);
  }

  async markOutfitAsWorn(outfitId: string) {
    return this.request(`/outfits/${outfitId}/wear`, {
      method: 'POST',
    });
  }

  async rateOutfit(outfitId: string, rating: number) {
    return this.request(`/outfits/${outfitId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    });
  }

  // Wardrobe item operations
  async updateClothingItem(itemId: string, updates: any) {
    return this.request(`/wardrobe/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteClothingItem(itemId: string) {
    return this.request(`/wardrobe/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async markItemAsWorn(itemId: string) {
    return this.request(`/wardrobe/items/${itemId}/worn`, {
      method: 'POST',
    });
  }

  async getClothingItem(itemId: string) {
    return this.request(`/wardrobe/items/${itemId}`);
  }

  // Outfit operations
  async updateOutfit(outfitId: string, updates: any) {
    return this.request(`/outfits/${outfitId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteOutfit(outfitId: string) {
    return this.request(`/outfits/${outfitId}`, {
      method: 'DELETE',
    });
  }

  // External stores - detailed operations
  async getExternalItemDetails(storeName: string, itemId: string) {
    return this.request(`/external-stores/item/${storeName}/${itemId}`);
  }

  async getSupportedStores() {
    return this.request('/external-stores/stores');
  }

  async comparePrices(itemName: string, category: string) {
    const params = new URLSearchParams();
    params.append('item_name', itemName);
    params.append('category', category);
    return this.request(`/external-stores/price-comparison?${params.toString()}`);
  }

  async getWishlist(userId: string) {
    return this.request(`/external-stores/wishlist/${userId}`);
  }

  async addToWishlist(userId: string, itemId: string, storeName: string, notes?: string) {
    return this.request('/external-stores/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, item_id: itemId, store_name: storeName, notes }),
    });
  }

  async getOutfitCompletionSuggestions(wardrobeItems: string[], targetStyle = 'casual', budgetMax?: number) {
    return this.request('/external-stores/recommendations/complete-outfit', {
      method: 'POST',
      body: JSON.stringify({
        user_wardrobe_items: wardrobeItems,
        target_style: targetStyle,
        budget_max: budgetMax,
      }),
    });
  }

  // Auth verification
  async verifyToken() {
    return this.request('/auth/verify-token');
  }
}