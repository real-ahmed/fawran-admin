import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LocationPickerMapProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
}

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.75rem',
};

// Default center (Cairo, Egypt)
const defaultCenter = {
  lat: 30.0444,
  lng: 31.2357,
};

const LIBRARIES: ('places' | 'drawing' | 'geometry' | 'localContext' | 'visualization')[] = ['places'];

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  onLocationSelect,
}) => {
  const { t, i18n } = useTranslation();
  
  // Use Vite environment variable for API Key
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
    language: i18n.language,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

  const center = latitude && longitude ? { lat: latitude, lng: longitude } : defaultCenter;

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      onLocationSelect(lat, lng);
      
      // Optionally, reverse geocode to get address if needed
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          onLocationSelect(lat, lng, results[0].formatted_address);
        }
      });
    }
  };

  const onPlacesChanged = () => {
    if (searchBoxRef.current) {
      const places = searchBoxRef.current.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address;
          
          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(15);
          }
          onLocationSelect(lat, lng, address);
        }
      }
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(15);
          }
          
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            const address = status === 'OK' && results && results[0] ? results[0].formatted_address : undefined;
            onLocationSelect(lat, lng, address);
          });
        },
        () => {
          console.error('Error getting current location');
        }
      );
    }
  };

  if (!isLoaded) return <div className="h-[400px] w-full animate-pulse bg-muted rounded-xl flex items-center justify-center text-muted-foreground">{t('loading')}</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 relative">
        <StandaloneSearchBox
          onLoad={(ref) => (searchBoxRef.current = ref)}
          onPlacesChanged={onPlacesChanged}
        >
          <div className="relative flex-1">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('search_location')}
              className="ps-9"
            />
          </div>
        </StandaloneSearchBox>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={getCurrentLocation}
          className="gap-2 shrink-0"
        >
          <MapPin className="h-4 w-4" />
          {t('current_location')}
        </Button>
      </div>

      <div className="rounded-xl overflow-hidden border border-border/60">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={latitude && longitude ? 15 : 12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          {latitude && longitude && (
            <Marker
              position={{ lat: latitude, lng: longitude }}
              draggable={true}
              onDragEnd={handleMapClick}
            />
          )}
        </GoogleMap>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {t('map_drag_hint')}
      </p>
    </div>
  );
};
