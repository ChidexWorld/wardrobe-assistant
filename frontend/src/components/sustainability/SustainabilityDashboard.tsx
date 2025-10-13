import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface SustainabilityInsights {
  total_items: number;
  average_usage: number;
  rarely_worn: Array<{
    id: string;
    name: string;
    usage_count: number;
  }>;
  most_worn: Array<{
    id: string;
    name: string;
    usage_count: number;
  }>;
  color_distribution: Record<string, number>;
  type_distribution: Record<string, number>;
  suggestions: string[];
}

interface SustainabilityResponse {
  user_id: string;
  sustainability_score: number;
  insights: SustainabilityInsights;
  recommendations: string[];
}

const SustainabilityDashboard: React.FC = () => {
  const apiService = ApiService.getInstance();
  const { user } = useAuth();
  const [data, setData] = useState<SustainabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchSustainabilityData();
  }, []);

  const fetchSustainabilityData = async (showRefreshIndicator = false) => {
    // Temporary fallback for debugging
    const userId = user?.id || 'test-user-123';

    if (!user?.id) {
      console.error('User ID is not available for sustainability, using fallback:', user);
    }

    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await apiService.getSustainabilityInsights(userId) as SustainabilityResponse;
      setData(result);
    } catch (error) {
      console.error('Error fetching sustainability data:', error);
      setData(null);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await fetchSustainabilityData(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Analyzing your wardrobe sustainability...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Unable to load sustainability data</p>
        <button
          onClick={fetchSustainabilityData}
          className="mt-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Sustainability Score */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Sustainability Score</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Refresh sustainability data"
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
            <div className={`px-4 py-2 rounded-full ${getScoreBgColor(data.sustainability_score)}`}>
              <span className={`text-lg font-bold ${getScoreColor(data.sustainability_score)}`}>
                {data.sustainability_score}/100
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {data.insights.total_items}
            </div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {data.insights.average_usage.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg. Uses per Item</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {data.insights.rarely_worn.length}
            </div>
            <div className="text-sm text-gray-600">Rarely Worn Items</div>
          </div>

          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${getScoreColor(data.sustainability_score)}`}>
              {getScoreLabel(data.sustainability_score)}
            </div>
            <div className="text-sm text-gray-600">Overall Rating</div>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">🌱 What this means:</h3>
          <p className="text-sm text-gray-700">
            Your sustainability score is based on how efficiently you use your wardrobe.
            Higher usage per item and fewer rarely-worn pieces indicate a more sustainable approach to fashion.
          </p>
        </div>
      </div>

      {/* Usage Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Worn Items */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">⭐</span>
            Most Worn Items
          </h3>
          <div className="space-y-3">
            {data.insights.most_worn.slice(0, 5).map((item, index) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                    {index + 1}
                  </div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-green-600 font-semibold">
                  {item.usage_count} uses
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            These are your wardrobe champions! They're getting the most wear and providing great value.
          </div>
        </div>

        {/* Rarely Worn Items */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">💤</span>
            Rarely Worn Items
          </h3>
          <div className="space-y-3">
            {data.insights.rarely_worn.slice(0, 5).map((item, index) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                    {index + 1}
                  </div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-orange-600 font-semibold">
                  {item.usage_count} uses
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            These items need more love! Try incorporating them into new outfit combinations.
          </div>
        </div>
      </div>

      {/* Wardrobe Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">🎨</span>
            Color Distribution
          </h3>
          <div className="space-y-2">
            {Object.entries(data.insights.color_distribution)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([color, count]) => (
              <div key={color} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3 border border-gray-300"
                    style={{ backgroundColor: color === 'white' ? '#f9f9f9' : color }}
                  ></div>
                  <span className="capitalize">{color}</span>
                </div>
                <span className="font-medium">{count} items</span>
              </div>
            ))}
          </div>
        </div>

        {/* Type Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">👕</span>
            Item Types
          </h3>
          <div className="space-y-2">
            {Object.entries(data.insights.type_distribution)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="capitalize">{type.replace('_', ' ')}</span>
                <span className="font-medium">{count} items</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">💡</span>
          Sustainability Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
              <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-sm text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          Action Items
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors">
            <div className="text-2xl mb-2">♻️</div>
            <div className="font-medium mb-1">Challenge Yourself</div>
            <div className="text-sm">Wear a rarely-used item this week</div>
          </button>

          <button className="p-4 border-2 border-dashed border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-medium mb-1">Mix & Match</div>
            <div className="text-sm">Create 3 new outfit combinations</div>
          </button>

          <button className="p-4 border-2 border-dashed border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium mb-1">Track Progress</div>
            <div className="text-sm">Check back next month</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityDashboard;