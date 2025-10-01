import React, { useState } from 'react';
import { ApiService } from '../../services/api';

interface ComparisonItem {
  store_name: string;
  item_name: string;
  price: number;
  shipping_cost: number;
  total_cost: number;
  image_url: string;
  store_url: string;
  availability: string;
  savings_vs_highest?: number;
  price_rank?: number;
}

interface ComparisonResponse {
  item_name: string;
  category: string;
  comparison: ComparisonItem[];
  summary: {
    stores_compared: number;
    lowest_price: number;
    highest_price: number;
    potential_savings: number;
    best_deal: ComparisonItem;
  };
}

const PriceComparison: React.FC = () => {
  const apiService = ApiService.getInstance();
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);

  const categories = [
    { value: 'shirts', label: 'Shirts' },
    { value: 'pants', label: 'Pants' },
    { value: 'dresses', label: 'Dresses' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'jackets', label: 'Jackets' },
    { value: 'accessories', label: 'Accessories' },
  ];

  const handleCompare = async () => {
    if (!itemName.trim() || !category) {
      alert('Please enter an item name and select a category');
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.comparePrices(itemName, category) as ComparisonResponse;
      setComparisonData(data);
    } catch (error) {
      console.error('Failed to compare prices:', error);
      alert('Failed to compare prices');
      setComparisonData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Price Comparison</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Compare prices across multiple stores to find the best deals
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Blue Jeans, White Sneakers"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={loading || !itemName.trim() || !category}
          className="mt-4 w-full sm:w-auto px-6 py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
        >
          {loading ? 'Comparing...' : 'Compare Prices'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-3 text-gray-600">Comparing prices across stores...</span>
        </div>
      )}

      {/* Comparison Results */}
      {!loading && comparisonData && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Comparison Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-600">Stores Compared</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                  {comparisonData.summary.stores_compared}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-600">Lowest Price</div>
                <div className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                  ${comparisonData.summary.lowest_price.toFixed(2)}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-600">Highest Price</div>
                <div className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
                  ${comparisonData.summary.highest_price.toFixed(2)}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-600">You Save</div>
                <div className="text-xl sm:text-2xl font-bold text-pink-600 mt-1">
                  ${comparisonData.summary.potential_savings.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Items */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Price Breakdown by Store
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {comparisonData.comparison.map((item, index) => (
                <div
                  key={index}
                  className={`bg-white border-2 rounded-lg overflow-hidden transition-shadow hover:shadow-lg ${
                    item.price_rank === 1
                      ? 'border-green-500'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Best Deal Badge */}
                  {item.price_rank === 1 && (
                    <div className="bg-green-500 text-white px-3 sm:px-4 py-2 text-center font-semibold text-sm sm:text-base">
                      🏆 Best Deal!
                    </div>
                  )}

                  <div className="p-4">
                    {/* Store Name */}
                    <h4 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">
                      {item.store_name}
                    </h4>

                    {/* Price Breakdown */}
                    <div className="space-y-2 mb-4 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Item Price:</span>
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span className={item.shipping_cost === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                          {item.shipping_cost === 0 ? 'Free' : `$${item.shipping_cost.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="font-bold text-pink-600 text-base sm:text-lg">
                          ${item.total_cost.toFixed(2)}
                        </span>
                      </div>
                      {item.savings_vs_highest && item.savings_vs_highest > 0 && (
                        <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs text-center">
                          Save ${item.savings_vs_highest.toFixed(2)} vs highest
                        </div>
                      )}
                    </div>

                    {/* Availability */}
                    <div className="mb-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          item.availability === 'In Stock'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {item.availability}
                      </span>
                    </div>

                    {/* Action Button */}
                    <a
                      href={item.store_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-4 py-2 bg-pink-600 text-white rounded-lg text-center font-medium hover:bg-pink-700 transition-colors text-sm sm:text-base"
                    >
                      View in Store
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3">💡 Shopping Tips</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span>✓</span>
                <span>Consider shipping costs when comparing total prices</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>✓</span>
                <span>Check return policies and customer reviews before purchasing</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>✓</span>
                <span>Add items to your wishlist to track price changes</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>✓</span>
                <span>Some stores offer price matching - contact them if you find a better deal</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && comparisonData && comparisonData.comparison.length === 0 && (
        <div className="bg-white rounded-lg p-8 sm:p-12 text-center">
          <div className="text-4xl sm:text-5xl mb-4">🔍</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-sm sm:text-base text-gray-600">
            We couldn't find "{itemName}" in our partner stores. Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
};

export default PriceComparison;
