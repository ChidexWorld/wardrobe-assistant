export type LocationData = {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type WeatherData = {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
};

class LocationService {
  private static instance: LocationService;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Get user's current location using browser geolocation API
   */
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // Use reverse geocoding to get city name
            const locationData = await this.reverseGeocode(latitude, longitude);
            resolve(locationData);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(new Error(`Location access denied: ${error.message}`));
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // Cache location for 5 minutes
        }
      );
    });
  }

  /**
   * Convert coordinates to city name using reverse geocoding
   */
  private async reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
    try {
      // Using OpenStreetMap Nominatim for reverse geocoding (free, no API key)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'WardrobeAssistant/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reverse geocode location');
      }

      const data = await response.json();

      // Log the response to debug
      console.log('Geocoding response:', data);

      // Try multiple address fields to find the city
      const city = data.address.city
        || data.address.town
        || data.address.village
        || data.address.municipality
        || data.address.county
        || data.address.state
        || data.address.region
        || 'Unknown';

      return {
        city,
        country: data.address.country || 'Unknown',
        latitude,
        longitude,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Return coordinates as fallback
      return {
        city: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
        country: 'Unknown',
        latitude,
        longitude,
      };
    }
  }

  /**
   * Get current weather for a location
   */
  async getWeather(location: string | LocationData): Promise<WeatherData> {
    try {
      let query: string;

      if (typeof location === 'string') {
        query = location;
      } else {
        // Use city name if available, otherwise use coordinates
        query = location.city !== 'Unknown'
          ? `${location.city},${location.country}`
          : `${location.latitude},${location.longitude}`;
      }

      // Using wttr.in free weather API - no API key required
      const response = await fetch(
        `https://wttr.in/${encodeURIComponent(query)}?format=j1`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      const currentCondition = data.current_condition[0];

      // Map weather description to simplified conditions
      const weatherDesc = currentCondition.weatherDesc[0].value.toLowerCase();
      let condition = 'sunny';

      if (weatherDesc.includes('rain') || weatherDesc.includes('drizzle')) {
        condition = 'rainy';
      } else if (weatherDesc.includes('cloud') || weatherDesc.includes('overcast')) {
        condition = 'cloudy';
      } else if (weatherDesc.includes('snow')) {
        condition = 'snowy';
      } else if (weatherDesc.includes('wind')) {
        condition = 'windy';
      } else if (weatherDesc.includes('sun') || weatherDesc.includes('clear')) {
        condition = 'sunny';
      }

      return {
        temperature: parseInt(currentCondition.temp_C),
        condition,
        description: currentCondition.weatherDesc[0].value,
        humidity: parseInt(currentCondition.humidity),
        windSpeed: parseInt(currentCondition.windspeedKmph),
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  }

  /**
   * Get location and weather in one call
   */
  async getLocationAndWeather(): Promise<{ location: LocationData; weather: WeatherData }> {
    const location = await this.getCurrentLocation();
    const weather = await this.getWeather(location);
    return { location, weather };
  }
}

export const locationService = LocationService.getInstance();
