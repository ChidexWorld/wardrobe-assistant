import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { API_BASE_URL } from '../config';
import WardrobeUpload from './wardrobe/WardrobeUpload';
import OutfitBuilder from './outfits/OutfitBuilder';
import SmartRecommendations from './recommendations/SmartRecommendations';
import SustainabilityDashboard from './sustainability/SustainabilityDashboard';
import BusinessCatalogue from './business/BusinessCatalogue';

type TabType = 'wardrobe' | 'outfits' | 'recommendations' | 'sustainability' | 'business';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('wardrobe');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const apiService = ApiService.getInstance();

  // Debug user object
  useEffect(() => {
    console.log('Dashboard - Current user:', user);
  }, [user]);

  // Fetch wardrobe items when component mounts
  useEffect(() => {
    if (activeTab === 'wardrobe') {
      fetchWardrobeItems();
    }
  }, [activeTab]);

  const fetchWardrobeItems = async () => {
    try {
      setIsRefreshing(true);
      const response: any = await apiService.getWardrobeItems();
      setWardrobeItems(response.items || []);
    } catch (error) {
      console.error('Failed to fetch wardrobe items:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await fetchWardrobeItems();
  };

  const handleUpload = (newItem: any) => {
    setWardrobeItems(prev => [...prev, newItem]);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await apiService.deleteClothingItem(itemId);
      setWardrobeItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item');
    }
  };

  const handleMarkAsWorn = async (itemId: string) => {
    try {
      await apiService.markItemAsWorn(itemId);
      alert('Item marked as worn!');
      fetchWardrobeItems(); // Refresh to get updated usage count
    } catch (error) {
      console.error('Failed to mark item as worn:', error);
      alert('Failed to mark item as worn');
    }
  };

  const tabs = [
    { id: 'wardrobe', label: 'Wardrobe', icon: '👕' },
    { id: 'outfits', label: 'Outfit Builder', icon: '👗' },
    { id: 'recommendations', label: 'Recommendations', icon: '✨' },
    { id: 'sustainability', label: 'Sustainability', icon: '🌱' },
    { id: 'business', label: 'Business', icon: '🏪' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Style Assistant</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Your Visual Wardrobe</p>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="ml-2 text-gray-400 hover:text-gray-600 text-sm flex-shrink-0"
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>

        <nav className="mt-4 sm:mt-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center px-4 sm:px-6 py-3 text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3 text-lg sm:text-xl">{tab.icon}</span>
              <span className="font-medium text-sm sm:text-base">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 capitalize truncate">
              {activeTab}
            </h2>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {activeTab === 'wardrobe' && (
                <>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Refresh wardrobe"
                  >
                    <svg
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${isRefreshing ? 'animate-spin' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">+ Add Item</span>
                    <span className="sm:hidden">+</span>
                  </button>
                </>
              )}
              <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-sm h-full p-4 sm:p-6">
            {activeTab === 'wardrobe' && (
              <WardrobeContent
                items={wardrobeItems}
                onDelete={handleDeleteItem}
                onMarkAsWorn={handleMarkAsWorn}
              />
            )}
            {activeTab === 'outfits' && <OutfitBuilder />}
            {activeTab === 'recommendations' && <SmartRecommendations />}
            {activeTab === 'sustainability' && <SustainabilityDashboard />}
            {activeTab === 'business' && <BusinessCatalogue />}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <WardrobeUpload
          onUpload={handleUpload}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
};

interface WardrobeItem {
  id: string;
  name: string;
  type: string;
  imageUrl?: string;
  usageCount?: number;
}

interface WardrobeContentProps {
  items: WardrobeItem[];
  onDelete: (itemId: string) => void;
  onMarkAsWorn: (itemId: string) => void;
}

const WardrobeContent = ({ items, onDelete, onMarkAsWorn }: WardrobeContentProps) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Your Wardrobe</h3>
    {items.length === 0 ? (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">👕</div>
        <p className="text-gray-600 mb-4">Your wardrobe is empty</p>
        <p className="text-sm text-gray-500">Click "Add Item" to upload your first clothing item</p>
      </div>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <div key={item.id} className="group relative">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {item.imageUrl ? (
                <img
                  src={`${API_BASE_URL}${item.imageUrl}`}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}

              {/* Action buttons overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onMarkAsWorn(item.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                    title="Mark as worn"
                  >
                    Worn
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                    title="Delete item"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                {item.usageCount !== undefined && (
                  <p className="text-xs text-gray-400">Worn: {item.usageCount}x</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);



export default Dashboard;