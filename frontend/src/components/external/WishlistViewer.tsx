import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';

interface WishlistItem {
  id: string;
  item_id: string;
  store_name: string;
  item_name: string;
  price: number;
  image_url: string;
  notes?: string;
  added_at: string;
  price_alerts: boolean;
  current_availability: string;
}

const WishlistViewer: React.FC = () => {
  const apiService = ApiService.getInstance();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await apiService.getWishlist('user123');
      setWishlist(response.wishlist || []);
      setTotalValue(response.total_value || 0);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const getStoreColor = (storeName: string) => {
    const colors: Record<string, string> = {
      'Fashion Hub': 'bg-blue-100 text-blue-800',
      'Style Central': 'bg-purple-100 text-purple-800',
      'Trendy Closet': 'bg-pink-100 text-pink-800',
    };
    return colors[storeName] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        <span className="ml-3 text-gray-600">Loading wishlist...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Wishlist</h2>
          <p className="text-sm text-gray-600 mt-1">
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        {wishlist.length > 0 && (
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 px-4 sm:px-6 py-3 rounded-lg">
            <div className="text-xs sm:text-sm text-gray-600">Total Value</div>
            <div className="text-xl sm:text-2xl font-bold text-pink-600">${totalValue.toFixed(2)}</div>
          </div>
        )}
      </div>

      {/* Wishlist Items */}
      {wishlist.length === 0 ? (
        <div className="bg-white rounded-lg p-8 sm:p-12 text-center">
          <div className="text-4xl sm:text-5xl mb-4">💝</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Search for items in external stores and add them to your wishlist
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            We'll notify you when prices drop or items go on sale
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="aspect-square bg-gray-100 relative">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.item_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl sm:text-5xl text-gray-300">👗</span>
                  </div>
                )}
                {/* Store Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStoreColor(item.store_name)}`}>
                    {item.store_name}
                  </span>
                </div>
                {/* Price Alert Badge */}
                {item.price_alerts && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                      🔔 Price Alert
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">
                  {item.item_name}
                </h3>

                {item.notes && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.notes}
                  </p>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg sm:text-xl font-bold text-pink-600">
                    ${item.price.toFixed(2)}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      item.current_availability === 'In Stock'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {item.current_availability}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Added {new Date(item.added_at).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button className="flex-1 px-3 py-2 bg-pink-600 text-white rounded text-xs sm:text-sm font-medium hover:bg-pink-700 transition-colors">
                    View Details
                  </button>
                  <button className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded text-xs sm:text-sm font-medium hover:bg-red-200 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {wishlist.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3">💡 Wishlist Tips</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-start space-x-2">
              <span className="text-lg">🔔</span>
              <div>
                <h4 className="font-medium mb-1">Price Alerts</h4>
                <p className="text-gray-600">Get notified when items go on sale</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-lg">📊</span>
              <div>
                <h4 className="font-medium mb-1">Price History</h4>
                <p className="text-gray-600">Track price changes over time</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-lg">🛍️</span>
              <div>
                <h4 className="font-medium mb-1">Quick Purchase</h4>
                <p className="text-gray-600">Buy directly from partner stores</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-lg">💰</span>
              <div>
                <h4 className="font-medium mb-1">Save Money</h4>
                <p className="text-gray-600">Compare prices across stores</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistViewer;
