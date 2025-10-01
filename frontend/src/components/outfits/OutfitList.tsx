import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';

interface Outfit {
  id: string;
  name: string;
  items: string[];
  event?: string;
  weather?: any;
  rating?: number;
  created_at: string;
  last_worn?: string;
  wear_count: number;
}

const OutfitList: React.FC = () => {
  const apiService = ApiService.getInstance();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOutfits(20, 0);
      setOutfits(response.outfits || []);
    } catch (error) {
      console.error('Failed to fetch outfits:', error);
      setOutfits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsWorn = async (outfitId: string) => {
    try {
      await apiService.markOutfitAsWorn(outfitId);
      alert('Outfit marked as worn!');
      fetchOutfits();
    } catch (error) {
      console.error('Failed to mark outfit as worn:', error);
      alert('Failed to mark outfit as worn');
    }
  };

  const handleRateOutfit = async () => {
    if (!selectedOutfit) return;

    try {
      await apiService.rateOutfit(selectedOutfit.id, rating);
      setShowRatingModal(false);
      setSelectedOutfit(null);
      setRating(0);
      alert('Outfit rated successfully!');
      fetchOutfits();
    } catch (error) {
      console.error('Failed to rate outfit:', error);
      alert('Failed to rate outfit');
    }
  };

  const handleDeleteOutfit = async (outfitId: string) => {
    if (!confirm('Are you sure you want to delete this outfit?')) return;

    try {
      await apiService.deleteOutfit(outfitId);
      setOutfits(outfits.filter(o => o.id !== outfitId));
      alert('Outfit deleted successfully!');
    } catch (error) {
      console.error('Failed to delete outfit:', error);
      alert('Failed to delete outfit');
    }
  };

  const openRatingModal = (outfit: Outfit) => {
    setSelectedOutfit(outfit);
    setRating(outfit.rating || 0);
    setShowRatingModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        <span className="ml-3 text-gray-600">Loading outfits...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Saved Outfits</h2>
        <div className="text-sm text-gray-600">
          {outfits.length} outfit{outfits.length !== 1 ? 's' : ''} saved
        </div>
      </div>

      {outfits.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">👗</div>
          <p className="text-gray-600 mb-2">No saved outfits yet</p>
          <p className="text-sm text-gray-500">Create outfits in the Outfit Builder to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {outfits.map((outfit) => (
            <div
              key={outfit.id}
              className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              {/* Outfit Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {outfit.name}
                  </h3>
                  {outfit.event && (
                    <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                      {outfit.event}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteOutfit(outfit.id)}
                  className="text-gray-400 hover:text-red-600 ml-2"
                  title="Delete outfit"
                >
                  🗑️
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-gray-500 text-xs">Items</div>
                  <div className="font-semibold text-gray-900">{outfit.items.length}</div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-gray-500 text-xs">Worn</div>
                  <div className="font-semibold text-gray-900">{outfit.wear_count}x</div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-500">Rating:</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-base sm:text-lg ${
                          outfit.rating && star <= outfit.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weather */}
              {outfit.weather && (
                <div className="mb-4 text-xs sm:text-sm text-gray-600">
                  <span className="font-medium">Weather:</span> {outfit.weather.temp}°C,{' '}
                  {outfit.weather.condition}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleMarkAsWorn(outfit.id)}
                  className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded text-xs sm:text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  Mark as Worn
                </button>
                <button
                  onClick={() => openRatingModal(outfit)}
                  className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded text-xs sm:text-sm font-medium hover:bg-yellow-200 transition-colors"
                >
                  Rate
                </button>
              </div>

              {/* Metadata */}
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                <div>Created: {new Date(outfit.created_at).toLocaleDateString()}</div>
                {outfit.last_worn && (
                  <div>Last worn: {new Date(outfit.last_worn).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedOutfit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Rate Outfit</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">{selectedOutfit.name}</p>

            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl sm:text-4xl transition-colors ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-500`}
                >
                  ⭐
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setSelectedOutfit(null);
                  setRating(0);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleRateOutfit}
                disabled={rating === 0}
                className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutfitList;
