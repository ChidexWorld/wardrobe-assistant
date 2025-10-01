import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ExternalStores from '../external/ExternalStores';

interface Recommendation {
  id: string;
  name: string;
  items: string[];
  confidence: number;
  reasoning: string;
  weather_appropriate: boolean;
  event_match: boolean;
  style_score: number;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  criteria: {
    event?: string;
    weather?: any;
    user_preferences: string;
  };
}

const SmartRecommendations: React.FC = () => {
  const apiService = ApiService.getInstance();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState('');
  const [weatherTemp, setWeatherTemp] = useState<number>(20);
  const [weatherCondition, setWeatherCondition] = useState('sunny');

  const eventOptions = [
    { value: '', label: 'Any Event' },
    { value: 'work', label: 'Work' },
    { value: 'casual', label: 'Casual' },
    { value: 'formal', label: 'Formal' },
    { value: 'party', label: 'Party' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'date', label: 'Date' },
    { value: 'workout', label: 'Workout' }
  ];

  const weatherOptions = [
    { value: 'sunny', label: 'Sunny' },
    { value: 'cloudy', label: 'Cloudy' },
    { value: 'rainy', label: 'Rainy' },
    { value: 'snowy', label: 'Snowy' },
    { value: 'windy', label: 'Windy' }
  ];

  const fetchRecommendations = async () => {
    // Temporary fallback for debugging - use a test user ID if real one is missing
    const userId = user?.id || 'test-user-123';

    if (!user?.id) {
      console.error('User ID is not available, using fallback:', user);
    }

    setLoading(true);
    try {
      const data = await apiService.getOutfitRecommendations(userId, event || undefined, weatherTemp);
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Smart Outfit Recommendations</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
            <select
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {eventOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
            <input
              type="number"
              value={weatherTemp}
              onChange={(e) => setWeatherTemp(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="-20"
              max="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weather</label>
            <select
              value={weatherCondition}
              onChange={(e) => setWeatherCondition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {weatherOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end sm:col-span-2 md:col-span-1">
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Generating...' : 'Get Recommendations'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Analyzing your wardrobe...</span>
          </div>
        )}

        {/* Recommendations */}
        {!loading && recommendations.length > 0 && (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={rec.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold">{rec.name}</h3>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">Confidence:</span>
                      <span className={`font-medium ${getConfidenceColor(rec.confidence)}`}>
                        {getConfidenceLabel(rec.confidence)} ({Math.round(rec.confidence * 100)}%)
                      </span>
                    </div>

                    {rec.weather_appropriate && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        Weather ✓
                      </span>
                    )}

                    {rec.event_match && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        Event ✓
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{rec.reasoning}</p>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Items: {rec.items.length} • Style Score: {Math.round(rec.style_score * 100)}%
                  </div>

                  <div className="space-x-2">
                    <button className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 transition-colors">
                      Try This Outfit
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && recommendations.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">🤖</div>
            <p className="text-gray-600 mb-4">No recommendations available</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or adding more items to your wardrobe</p>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">💡 Styling Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Color Coordination</h4>
            <p className="text-gray-600">Our AI considers color harmony to ensure your outfits look cohesive and stylish.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Weather Awareness</h4>
            <p className="text-gray-600">Recommendations adapt to weather conditions for both comfort and style.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Event Appropriateness</h4>
            <p className="text-gray-600">Outfits are tailored to match the formality and requirements of your events.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Personal Style</h4>
            <p className="text-gray-600">The system learns your preferences to provide increasingly personalized suggestions.</p>
          </div>
        </div>
      </div>

      {/* External Stores Section */}
      <ExternalStores />
    </div>
  );
};

export default SmartRecommendations;