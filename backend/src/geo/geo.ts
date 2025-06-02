import { Reader } from '@maxmind/geoip2-node';
import path from 'path';

interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export async function getLocationFromIp(ip: string): Promise<GeoLocation> {
  try {
    // Path to your .mmdb file - adjust the path according to where you store it
    const dbPath = path.resolve(__dirname, 'GeoLite2-City.mmdb');  

    // Create reader instance
    const reader = await Reader.open(dbPath);
    
    // Get location data
    const response = await reader.city(ip);
    
    return {
      country: response.country?.names?.en,
      region: response.subdivisions?.[0]?.names?.en,
      city: response.city?.names?.en,
      latitude: response.location?.latitude,
      longitude: response.location?.longitude
    };
  } catch {
    // Return same object with undefined values if error occurs
    // Prevents a crash and allows graceful handling in case of an invalid IP or database issues
    console.error('bad ip address:', ip);

    // return default values
    return {
      country: 'undefined',
      region: 'undefined',
      city: 'undefined',
      latitude: undefined,
      longitude: undefined
    };
  }
}

export async function compareCity(
    ip: string,
    city: string,
    ): Promise<boolean> {
    try {
        const location = await getLocationFromIp(ip);
        return location.city?.toLowerCase() === city.toLowerCase();
    } catch (error) {
        console.error('Error comparing city:', error);
        return false;
    }
}
