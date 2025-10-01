import React, { useState, useCallback, useEffect } from 'react';
import { useDrop, useDrag, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ApiService } from '../../services/api';

interface ClothingItem {
  id: string;
  name: string;
  type: string;
  color: string;
  imageUrl: string;
  category: 'top' | 'bottom' | 'shoes' | 'accessories' | 'outerwear';
}

interface OutfitSlot {
  category: string;
  item?: ClothingItem;
  placeholder: string;
}

const OUTFIT_SLOTS: OutfitSlot[] = [
  { category: 'outerwear', placeholder: 'Jacket/Coat' },
  { category: 'top', placeholder: 'Shirt/Top' },
  { category: 'bottom', placeholder: 'Pants/Skirt' },
  { category: 'shoes', placeholder: 'Shoes' },
  { category: 'accessories', placeholder: 'Accessories' },
];

const OutfitBuilder: React.FC = () => {
  const apiService = ApiService.getInstance();
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentOutfit, setCurrentOutfit] = useState<{ [key: string]: ClothingItem }>({});
  const [outfitName, setOutfitName] = useState('');

  const mapClothingTypeToCategory = (type: string): 'top' | 'bottom' | 'shoes' | 'accessories' | 'outerwear' => {
    const typeMap: { [key: string]: 'top' | 'bottom' | 'shoes' | 'accessories' | 'outerwear' } = {
      'shirt': 'top',
      'pants': 'bottom',
      'dress': 'top',
      'jacket': 'outerwear',
      'shoes': 'shoes',
      'accessories': 'accessories',
      'formal': 'top',
      'casual': 'top',
      'activewear': 'top'
    };
    return typeMap[type] || 'accessories';
  };

  useEffect(() => {
    fetchWardrobeItems();
  }, []);

  const fetchWardrobeItems = async () => {
    try {
      setLoading(true);
      const response = await apiService.getWardrobeItems() as { items?: any[] };
      const items = (response.items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type || item.clothing_type,
        color: item.color,
        imageUrl: item.imageUrl ? `http://localhost:8000${item.imageUrl}` : '/api/placeholder/150/150',
        category: mapClothingTypeToCategory(item.type || item.clothing_type)
      }));
      setWardrobeItems(items);
    } catch (error) {
      console.error('Failed to fetch wardrobe items:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveItemToOutfit = useCallback((item: ClothingItem, targetCategory: string) => {
    setCurrentOutfit(prev => ({
      ...prev,
      [targetCategory]: item
    }));
  }, []);

  const removeItemFromOutfit = useCallback((category: string) => {
    setCurrentOutfit(prev => {
      const newOutfit = { ...prev };
      delete newOutfit[category];
      return newOutfit;
    });
  }, []);

  const saveOutfit = async () => {
    if (!outfitName.trim()) {
      alert('Please enter an outfit name');
      return;
    }

    if (Object.keys(currentOutfit).length === 0) {
      alert('Please add at least one item to the outfit');
      return;
    }

    setSaving(true);
    try {
      const outfitData = {
        name: outfitName,
        items: Object.values(currentOutfit).map(item => item.id),
        event: 'casual', // Default event type
        weather: {
          temperature: 22,
          condition: 'sunny'
        }
      };

      await apiService.createOutfit(outfitData);

      setCurrentOutfit({});
      setOutfitName('');
      alert('Outfit saved successfully!');
    } catch (error) {
      console.error('Failed to save outfit:', error);
      alert('Failed to save outfit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-6">
        {/* Wardrobe Items Panel */}
        <div className="w-full lg:w-1/3 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Your Wardrobe</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-3 text-gray-600">Loading items...</span>
            </div>
          ) : wardrobeItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">👕</div>
              <p className="text-gray-600 mb-2">No items in wardrobe</p>
              <p className="text-sm text-gray-500">Add items from the Wardrobe tab first</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {wardrobeItems.map(item => (
                <DraggableItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Outfit Builder Panel */}
        <div className="flex-1 bg-white rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold">Outfit Builder</h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <input
                type="text"
                placeholder="Outfit name..."
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <button
                onClick={saveOutfit}
                disabled={Object.keys(currentOutfit).length === 0 || saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {saving ? 'Saving...' : 'Save Outfit'}
              </button>
            </div>
          </div>

          {/* Avatar/Outfit Display */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-64 h-80 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                {/* Simple Avatar Outline */}
                <div className="relative w-48 h-64">
                  <svg viewBox="0 0 200 300" className="w-full h-full text-gray-300">
                    <circle cx="100" cy="50" r="25" fill="currentColor" opacity="0.3" />
                    <rect x="80" y="70" width="40" height="60" rx="20" fill="currentColor" opacity="0.3" />
                    <rect x="70" y="130" width="60" height="80" rx="8" fill="currentColor" opacity="0.3" />
                    <rect x="75" y="210" width="20" height="40" rx="10" fill="currentColor" opacity="0.3" />
                    <rect x="105" y="210" width="20" height="40" rx="10" fill="currentColor" opacity="0.3" />
                  </svg>

                  {/* Outfit Slots Overlay */}
                  <div className="absolute inset-0">
                    {OUTFIT_SLOTS.map(slot => (
                      <OutfitSlot
                        key={slot.category}
                        slot={slot}
                        item={currentOutfit[slot.category]}
                        onDrop={moveItemToOutfit}
                        onRemove={removeItemFromOutfit}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outfit Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Current Outfit</h4>
            {Object.keys(currentOutfit).length === 0 ? (
              <p className="text-gray-500 text-sm">Drag items from your wardrobe to create an outfit</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(currentOutfit).map(([category, item]) => (
                  <div key={category} className="flex items-center bg-white rounded-lg px-3 py-2 text-sm">
                    <span className="font-medium capitalize">{category}:</span>
                    <span className="ml-2">{item.name}</span>
                    <button
                      onClick={() => removeItemFromOutfit(category)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

interface DraggableItemProps {
  item: ClothingItem;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ item }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'clothing-item',
    item: item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as any}
      className={`bg-white rounded-lg p-2 cursor-move border hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
        {item.imageUrl && item.imageUrl !== '/api/placeholder/150/150' ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs text-gray-500">📷</span>
          </div>
        )}
      </div>
      <p className="text-xs font-medium truncate">{item.name}</p>
      <p className="text-xs text-gray-500 capitalize">{item.type}</p>
    </div>
  );
};

interface OutfitSlotProps {
  slot: OutfitSlot;
  item?: ClothingItem;
  onDrop: (item: ClothingItem, category: string) => void;
  onRemove: (category: string) => void;
}

const OutfitSlot: React.FC<OutfitSlotProps> = ({ slot, item, onDrop, onRemove }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'clothing-item',
    drop: (droppedItem: ClothingItem) => {
      if (droppedItem.category === slot.category ||
          (slot.category === 'accessories' && !['top', 'bottom', 'shoes', 'outerwear'].includes(droppedItem.category))) {
        onDrop(droppedItem, slot.category);
      }
    },
    canDrop: (droppedItem: ClothingItem) => {
      return droppedItem.category === slot.category ||
             (slot.category === 'accessories' && !['top', 'bottom', 'shoes', 'outerwear'].includes(droppedItem.category));
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const getSlotPosition = () => {
    switch (slot.category) {
      case 'outerwear':
        return 'top-16 left-12 right-12';
      case 'top':
        return 'top-20 left-16 right-16';
      case 'bottom':
        return 'top-36 left-14 right-14';
      case 'shoes':
        return 'bottom-8 left-20 right-20';
      case 'accessories':
        return 'top-12 left-2 w-8';
      default:
        return 'top-0 left-0';
    }
  };

  return (
    <div
      ref={drop as any}
      className={`absolute ${getSlotPosition()} h-12 rounded border-2 border-dashed transition-colors ${
        isOver && canDrop
          ? 'border-blue-400 bg-blue-50'
          : canDrop
          ? 'border-gray-300'
          : 'border-gray-200'
      } ${item ? 'border-solid border-green-400 bg-green-50' : ''}`}
    >
      {item ? (
        <div className="w-full h-full flex items-center justify-center relative group">
          <span className="text-xs font-medium text-green-700 text-center px-1">
            {item.name}
          </span>
          <button
            onClick={() => onRemove(slot.category)}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-xs text-gray-400 text-center px-1">
            {slot.placeholder}
          </span>
        </div>
      )}
    </div>
  );
};

export default OutfitBuilder;