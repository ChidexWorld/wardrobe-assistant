import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { locationService } from '../../services/location';
import type { LocationData, WeatherData } from '../../services/location';
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

const SmartRecommendations: React.FC = () => {
  const apiService = ApiService.getInstance();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [event, setEvent] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [manualLocation, setManualLocation] = useState('');

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

  // Automatically detect location and fetch weather on component mount
  const detectLocationAndWeather = async () => {
    setLoadingLocation(true);
    setLocationError(null);

    // Check if user has saved a manual location
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        await fetchWeatherForCity(savedLocation);
        return;
      } catch (error) {
        console.error('Error fetching weather for saved location:', error);
      }
    }

    try {
      const { location: detectedLocation, weather: detectedWeather } =
        await locationService.getLocationAndWeather();

      setLocation(detectedLocation);
      setWeather(detectedWeather);
    } catch (error) {
      console.error('Error detecting location:', error);
      setLocationError(error instanceof Error ? error.message : 'Failed to detect location');

      // Set default values if location detection fails
      setWeather({
        temperature: 20,
        condition: 'sunny',
        description: 'Clear',
        humidity: 50,
        windSpeed: 10,
      });
    } finally {
      setLoadingLocation(false);
    }
  };

  // Fetch weather for a manually entered city
  const fetchWeatherForCity = async (cityName: string) => {
    setLoadingLocation(true);
    setLocationError(null);

    try {
      const weatherData = await locationService.getWeather(cityName);
      setWeather(weatherData);

      // Parse city and country from the input
      const parts = cityName.split(',').map(p => p.trim());
      setLocation({
        city: parts[0] || cityName,
        country: parts[1] || '',
        latitude: 0,
        longitude: 0,
      });

      // Save to localStorage
      localStorage.setItem('userLocation', cityName);
      setShowLocationInput(false);
    } catch (error) {
      console.error('Error fetching weather for city:', error);
      setLocationError('Could not fetch weather for this location');
    } finally {
      setLoadingLocation(false);
    }
  };

  // Handle manual location submission
  const handleSetManualLocation = () => {
    if (manualLocation.trim()) {
      fetchWeatherForCity(manualLocation.trim());
    }
  };

  // Refresh weather data
  const refreshWeather = async () => {
    if (!location) return;

    setLoadingLocation(true);
    try {
      const updatedWeather = await locationService.getWeather(location);
      setWeather(updatedWeather);
    } catch (error) {
      console.error('Error refreshing weather:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const fetchRecommendations = async () => {
    // Temporary fallback for debugging - use a test user ID if real one is missing
    const userId = user?.id || 'test-user-123';

    if (!user?.id) {
      console.error('User ID is not available, using fallback:', user);
    }

    setLoading(true);
    try {
      const temperature = weather?.temperature ?? 20;
      const data = await apiService.getOutfitRecommendations(
        userId,
        event || undefined,
        temperature
      ) as { recommendations?: Recommendation[] };
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // Detect location and weather on component mount
  useEffect(() => {
    detectLocationAndWeather();
  }, []);

  // Fetch recommendations when weather data is available
  useEffect(() => {
    if (weather) {
      fetchRecommendations();
    }
  }, [weather]);

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

        {/* Weather Information Display */}
        {loadingLocation ? (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-blue-700">Detecting your location and weather...</span>
            </div>
          </div>
        ) : locationError ? (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-yellow-800 text-sm font-medium">Location Detection Failed</p>
                <p className="text-yellow-700 text-xs mt-1">{locationError}</p>
                <p className="text-yellow-600 text-xs mt-1">Using default weather settings</p>
              </div>
              <button
                onClick={detectLocationAndWeather}
                className="ml-2 px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : weather && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {showLocationInput ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSetManualLocation()}
                      placeholder="Enter city (e.g., Awka, Nigeria)"
                      className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSetManualLocation}
                      disabled={loadingLocation || !manualLocation.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Set
                    </button>
                    <button
                      onClick={() => setShowLocationInput(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-semibold text-blue-900">
                        {location?.city}{location?.country && `, ${location.country}`}
                      </span>
                      <button
                        onClick={() => {
                          setShowLocationInput(true);
                          setManualLocation(location?.city || '');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs underline"
                      >
                        Change
                      </button>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-blue-700">
                        <span className="font-medium">{weather.temperature}°C</span> - {weather.description}
                      </span>
                      <span className="text-blue-600">💧 {weather.humidity}%</span>
                      <span className="text-blue-600">💨 {weather.windSpeed} km/h</span>
                    </div>
                  </>
                )}
              </div>
              {!showLocationInput && (
                <button
                  onClick={refreshWeather}
                  disabled={loadingLocation}
                  className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                >
                  Refresh
                </button>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
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

          <div className="flex items-end">
            <button
              onClick={fetchRecommendations}
              disabled={loading || loadingLocation}
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