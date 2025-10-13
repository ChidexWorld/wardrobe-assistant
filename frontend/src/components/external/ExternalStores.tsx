import React, { useState } from 'react';
import { ApiService } from '../../services/api';

interface ExternalItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  color: string;
  category: string;
  sizes: string[];
  image_url: string;
  store_name: string;
  store_url: string;
  description: string;
  rating: number;
  availability: string;
  shipping_cost: number;
  total_cost: number;
}

const ExternalStores: React.FC = () => {
  const apiService = ApiService.getInstance();
  const [searchResults, setSearchResults] = useState<ExternalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [activeTab, setActiveTab] = useState<'search' | 'wishlist' | 'recommendations'>('search');

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'shirts', label: 'Shirts' },
    { value: 'pants', label: 'Pants' },
    { value: 'dresses', label: 'Dresses' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'jackets', label: 'Jackets' },
    { value: 'accessories', label: 'Accessories' },
  ];

  const performSearch = async (showRefreshIndicator = false) => {
    if (!searchQuery.trim()) return;

    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await apiService.searchExternalStores(searchQuery, category, 20) as { results?: ExternalItem[] };
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching external stores:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (searchQuery.trim()) {
      await performSearch(true);
    }
  };

  const addToWishlist = async (item: ExternalItem) => {
    try {
      await apiService.addToWishlist(
        'user123',
        item.id,
        item.store_name,
        `Found via search for "${searchQuery}"`
      );
      alert('Item added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add to wishlist');
    }
  };

  const getStoreColor = (storeName: string) => {
    const colors = {
      'Fashion Hub': 'bg-blue-100 text-blue-800',
      'Style Central': 'bg-purple-100 text-purple-800',
      'Trendy Closet': 'bg-pink-100 text-pink-800'
    };
    return colors[storeName as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">External Fashion Stores</h2>
        <p className="text-gray-600 mb-4">
          Find items from partner stores to complete your wardrobe or discover new styles.
        </p>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'search'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔍 Search Stores
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'wishlist'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ❤️ Wishlist
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'recommendations'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✨ Smart Suggestions
          </button>
        </div>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search Form */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search for clothing items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                />
              </div>

              <div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Color (optional)"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-1">
                <button
                  onClick={performSearch}
                  disabled={loading || !searchQuery.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Max Price:</span>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm font-medium text-gray-900">${maxPrice}</span>
              </label>
            </div>
          </div>

          {/* Search Results */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Searching across fashion stores...</span>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Found {searchResults.length} items for "{searchQuery}"
                </h3>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing || loading}
                  className="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  title="Refresh search results"
                >
                  <svg
                    className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map(item => (
                  <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl text-gray-300">👗</div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 flex-1">{item.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStoreColor(item.store_name)}`}>
                          {item.store_name}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-medium text-green-600">${item.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span className={item.shipping_cost === 0 ? 'text-green-600' : 'text-gray-600'}>
                            {item.shipping_cost === 0 ? 'Free' : `$${item.shipping_cost}`}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span className="text-blue-600">${item.total_cost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rating:</span>
                          <span>⭐ {item.rating}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className={
                            item.availability === 'In Stock'
                              ? 'text-green-600'
                              : 'text-orange-600'
                          }>
                            {item.availability}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => addToWishlist(item)}
                          className="flex-1 px-3 py-2 bg-pink-100 text-pink-700 rounded text-sm font-medium hover:bg-pink-200"
                        >
                          Add to Wishlist
                        </button>
                        <a
                          href={item.store_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 text-center"
                        >
                          View in Store
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Your Wishlist</h3>
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">💝</div>
            <p className="text-gray-600 mb-4">Your wishlist is empty</p>
            <p className="text-sm text-gray-500">
              Search for items and add them to your wishlist to track prices and availability
            </p>
            <button
              onClick={() => setActiveTab('search')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Start Shopping
            </button>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Smart Shopping Suggestions</h3>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h4 className="font-medium mb-2">🎯 Complete Your Wardrobe</h4>
              <p className="text-sm text-gray-600 mb-4">
                Based on your current wardrobe, we recommend adding these versatile pieces:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl mb-2">👔</div>
                  <h5 className="font-medium mb-1">Professional Blazer</h5>
                  <p className="text-xs text-gray-600 mb-2">Add versatility to your wardrobe</p>
                  <button className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                    Search Now
                  </button>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl mb-2">👠</div>
                  <h5 className="font-medium mb-1">Comfortable Flats</h5>
                  <p className="text-xs text-gray-600 mb-2">Perfect for everyday wear</p>
                  <button className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                    Search Now
                  </button>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl mb-2">🧥</div>
                  <h5 className="font-medium mb-1">Light Cardigan</h5>
                  <p className="text-xs text-gray-600 mb-2">Great for layering</p>
                  <button className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                    Search Now
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-medium mb-2">💰 Price Drop Alerts</h4>
              <p className="text-sm text-gray-600">
                We'll notify you when items on your wishlist go on sale or when similar items become available at better prices.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Results State */}
      {!loading && searchResults.length === 0 && searchQuery && activeTab === 'search' && (
        <div className="bg-white rounded-lg p-6 shadow-sm text-center">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
          <p className="text-gray-600 mb-2">No items found for "{searchQuery}"</p>
          <p className="text-sm text-gray-500">Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  );
};

export default ExternalStores;