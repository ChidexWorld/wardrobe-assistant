import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';

interface CatalogueItem {
  id: string;
  name: string;
  type: string;
  color: string;
  size: string[];
  price: number;
  brand: string;
  description: string;
  imageUrl?: string;
  inStock: boolean;
  stockQuantity: number;
}

const BusinessCatalogue: React.FC = () => {
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [, setSelectedItem] = useState<CatalogueItem | null>(null);

  useEffect(() => {
    fetchBusinessCatalogue();
  }, []);

  const fetchBusinessCatalogue = async () => {
    setLoading(true);
    try {
      // Business catalogue API endpoint not yet implemented
      // Will be available when business features are fully developed
      setItems([]);
    } catch (error) {
      console.error('Error fetching business catalogue:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'in-stock') return item.inStock;
    if (filter === 'out-of-stock') return !item.inStock;
    return true;
  });

  const totalValue = items.reduce((total, item) => total + (item.price * item.stockQuantity), 0);
  const totalItems = items.reduce((total, item) => total + item.stockQuantity, 0);
  const inStockItems = items.filter(item => item.inStock).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading business catalogue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Business Catalogue</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700"
          >
            + Add Item
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {items.length}
            </div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {totalItems}
            </div>
            <div className="text-sm text-gray-600">Items in Stock</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              ${totalValue.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {inStockItems}
            </div>
            <div className="text-sm text-gray-600">Available Types</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setFilter('in-stock')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'in-stock' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            In Stock ({inStockItems})
          </button>
          <button
            onClick={() => setFilter('out-of-stock')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'out-of-stock' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Out of Stock ({items.length - inStockItems})
          </button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-6xl text-gray-300">👗</div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 flex-1">{item.name}</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.inStock ? 'In Stock' : 'Out of Stock'}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2">{item.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Brand:</span>
                  <span className="font-medium">{item.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Color:</span>
                  <span className="font-medium">{item.color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium text-green-600">${item.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock:</span>
                  <span className="font-medium">{item.stockQuantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sizes:</span>
                  <span className="font-medium">{item.size.join(', ')}</span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200"
                >
                  Edit
                </button>
                <button className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200">
                  Recommend
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏪</div>
          <p className="text-gray-600 mb-4">Business Catalogue Coming Soon</p>
          <p className="text-sm text-gray-500 mb-4">Business inventory management features are currently in development</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Add your first item
          </button>
        </div>
      )}

      {/* Add Item Modal - Simplified for demo */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Item name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Brand"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Color"
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  placeholder="Price"
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <textarea
                placeholder="Description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              ></textarea>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Add item logic here
                  setShowAddModal(false);
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Recommendations Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">💼</span>
          Client Styling Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-2">Personal Styling</h4>
            <p className="text-sm text-gray-600 mb-3">
              Use AI to create personalized outfit recommendations for your clients using your catalogue items.
            </p>
            <button className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded text-sm font-medium hover:bg-purple-200">
              Start Styling Session
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-2">Inventory Reports</h4>
            <p className="text-sm text-gray-600 mb-3">
              Generate detailed reports on your inventory, sales trends, and popular items.
            </p>
            <button className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200">
              Generate Report
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-2">Analytics</h4>
            <p className="text-sm text-gray-600 mb-3">
              Track which items are most recommended and help optimize your inventory.
            </p>
            <button className="w-full px-3 py-2 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCatalogue;