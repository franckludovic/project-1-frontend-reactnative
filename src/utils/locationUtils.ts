import * as Location from 'expo-location';

export interface ReverseGeocodeResult {
  readableName: string;
  success: boolean;
  error?: string;
}

/**
 * Performs reverse geocoding to get a readable location name from latitude and longitude.
 * @param latitude - The latitude of the location.
 * @param longitude - The longitude of the location.
 * @returns Promise<ReverseGeocodeResult>
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> => {
  try {
    // Request location permissions if not already granted
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        readableName: '',
        success: false,
        error: 'Location permission not granted',
      };
    }

    // Perform reverse geocoding with timeout to avoid hanging on unavailable service
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Reverse geocoding timeout')), 5000)
    );

    const geocodeResult = await Promise.race([
      Location.reverseGeocodeAsync({
        latitude,
        longitude,
      }),
      timeoutPromise,
    ]);

    if (geocodeResult.length > 0) {
      const address = geocodeResult[0];
      // Build a readable name from the address components
      const parts = [
        // address.name,
        // address.street,
        address.city,
        // address.region,
        address.country,
      ].filter(Boolean);

      const readableName = parts.join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      return {
        readableName,
        success: true,
      };
    } else {
      return {
        readableName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        success: true,
      };
    }
  } catch (error) {
    console.error('Error performing reverse geocoding:', error);
    return {
      readableName: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Gets the current device location.
 * @returns Promise<{latitude: number, longitude: number} | null>
 */
export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Location permission not granted');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

/**
 * Calculates the distance between two coordinates in kilometers.
 * @param lat1 - Latitude of first point.
 * @param lon1 - Longitude of first point.
 * @param lat2 - Latitude of second point.
 * @param lon2 - Longitude of second point.
 * @returns number - Distance in kilometers.
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
