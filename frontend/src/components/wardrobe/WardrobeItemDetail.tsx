import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';

interface WardrobeItemDetailProps {
  itemId: string;
  onClose: () => void;
  onUpdate?: () => void;
}

const WardrobeItemDetail: React.FC<WardrobeItemDetailProps> = ({ itemId, onClose, onUpdate }) => {
  const apiService = ApiService.getInstance();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '',
    size: '',
    brand: '',
    price: '',
  });

  useEffect(() => {
    fetchItemDetails();
  }, [itemId]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const data = await apiService.getClothingItem(itemId) as any;
      setItem(data);
      setFormData({
        name: data.name || '',
        color: data.color || '',
        size: data.size || '',
        brand: data.brand || '',
        price: data.price || '',
      });
    } catch (error) {
      console.error('Failed to fetch item details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await apiService.updateClothingItem(itemId, formData);
      setEditing(false);
      fetchItemDetails();
      if (onUpdate) onUpdate();
      alert('Item updated successfully!');
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Failed to update item');
    }
  };

  const handleMarkAsWorn = async () => {
    try {
      await apiService.markItemAsWorn(itemId);
      fetchItemDetails();
      alert('Item marked as worn!');
    } catch (error) {
      console.error('Failed to mark item as worn:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <span className="ml-3 text-gray-600">Loading item details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
          <p className="text-gray-600">Item not found</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-4 sm:p-8 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Item Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={`http://localhost:8000${item.imageUrl}`}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl text-gray-300">📷</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {!editing && (
              <div className="space-y-2">
                <button
                  onClick={handleMarkAsWorn}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
                >
                  Mark as Worn
                </button>
                <button
                  onClick={() => setEditing(true)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                >
                  Edit Item
                </button>
              </div>
            )}
          </div>

          {/* Details / Edit Form */}
          <div className="space-y-4">
            {!editing ? (
              <>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Name</label>
                  <p className="text-base sm:text-lg font-semibold">{item.name}</p>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Type</label>
                  <p className="text-base capitalize">{item.type}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Color</label>
                    <p className="text-base capitalize">{item.color}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Size</label>
                    <p className="text-base">{item.size || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Brand</label>
                    <p className="text-base">{item.brand || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Price</label>
                    <p className="text-base">{item.price ? `$${item.price}` : 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Usage Count</label>
                    <p className="text-base font-semibold text-green-600">{item.usageCount || 0} times</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Last Worn</label>
                    <p className="text-base text-sm">{item.lastWorn || 'Never'}</p>
                  </div>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs sm:text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardrobeItemDetail;
