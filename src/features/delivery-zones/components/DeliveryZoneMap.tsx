import { useCallback, useRef, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, DrawingManager, Polygon } from '@react-google-maps/api';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import type { Coordinate } from '@/types/delivery-zone';

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.75rem',
};

const defaultCenter = {
  lat: 24.7136, // default to Riyadh, SA
  lng: 46.6753,
};

const getInitialCenter = (coordinates?: Coordinate[]) =>
  coordinates && coordinates.length > 0 ? coordinates[0] : defaultCenter;

interface DeliveryZoneMapProps {
  coordinates?: Coordinate[];
  onChange: (coordinates: Coordinate[]) => void;
  error?: string;
}

const libraries: ('drawing' | 'places')[] = ['drawing'];

export const DeliveryZoneMap = ({ coordinates, onChange, error }: DeliveryZoneMapProps) => {
  const { t } = useTranslation();
  const mapRef = useRef<google.maps.Map | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const hasCoordinates = Boolean(coordinates?.length);
  const [mapCenter, setMapCenter] = useState<Coordinate>(() => getInitialCenter(coordinates));

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (coordinates && coordinates.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      coordinates.forEach((coord) => bounds.extend(coord));
      map.fitBounds(bounds);
    } else {
      map.setCenter(mapCenter);
    }
  }, [coordinates, mapCenter]);

  const onMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handlePolygonComplete = (drawnPolygon: google.maps.Polygon) => {
    const path = drawnPolygon.getPath();
    const newCoordinates: Coordinate[] = [];
    for (let i = 0; i < path.getLength(); i++) {
      const latLng = path.getAt(i);
      newCoordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
    }
    
    // Immediately remove the native polygon created by the DrawingManager
    // We will rely purely on the React <Polygon /> component to render the shape
    drawnPolygon.setMap(null);
    
    onChange(newCoordinates);
  };

  const updateCoordinates = useCallback(() => {
    if (!polygonRef.current) return;
    const path = polygonRef.current.getPath();
    const newCoordinates: Coordinate[] = [];
    for (let i = 0; i < path.getLength(); i++) {
      const latLng = path.getAt(i);
      newCoordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
    }
    onChange(newCoordinates);
  }, [onChange]);

  const clearPolygon = () => {
    onChange([]);
  };

  useEffect(() => {
    if (hasCoordinates) {
      setMapCenter(getInitialCenter(coordinates));
      return;
    }

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const currentLocation = {
          lat: coords.latitude,
          lng: coords.longitude,
        };

        setMapCenter(currentLocation);
        mapRef.current?.setCenter(currentLocation);
        mapRef.current?.setZoom(13);
      },
      () => undefined,
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 10000,
      }
    );
  }, [coordinates, hasCoordinates]);

  if (loadError) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-xl border bg-destructive/10 text-destructive">
        {t('error_loading_map')}
      </div>
    );
  }

  if (!isLoaded) {
    return <Skeleton className="h-[500px] w-full rounded-xl" />;
  }

  return (
    <div className="space-y-2">
      <div className={`relative overflow-hidden rounded-xl border ${error ? 'border-destructive' : 'border-border'}`}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={hasCoordinates ? coordinates?.[0] : mapCenter}
          zoom={11}
          onLoad={onMapLoad}
          onUnmount={onMapUnmount}
          options={{
            mapTypeControl: false,
            streetViewControl: false,
          }}
        >
          {coordinates && coordinates.length > 0 && (
            <Polygon
              path={coordinates}
              options={{
                fillColor: '#2563eb',
                fillOpacity: 0.4,
                strokeColor: '#2563eb',
                strokeOpacity: 1,
                strokeWeight: 2,
                editable: true,
                draggable: true,
              }}
              onLoad={(polygon) => {
                polygonRef.current = polygon;
                const path = polygon.getPath();
                google.maps.event.addListener(path, 'insert_at', updateCoordinates);
                google.maps.event.addListener(path, 'remove_at', updateCoordinates);
                google.maps.event.addListener(path, 'set_at', updateCoordinates);
                google.maps.event.addListener(polygon, 'dragend', updateCoordinates);
              }}
            />
          )}

          <DrawingManager
            onPolygonComplete={handlePolygonComplete}
            options={{
              drawingControl: true,
              drawingControlOptions: {
                position: window.google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
              },
              polygonOptions: {
                fillColor: '#2563eb',
                fillOpacity: 0.4,
                strokeColor: '#2563eb',
                strokeWeight: 2,
                editable: true,
                draggable: true,
              },
            }}
          />
        </GoogleMap>
        
        {coordinates && coordinates.length > 0 && (
          <button
            type="button"
            onClick={clearPolygon}
            className="absolute bottom-4 left-4 z-10 rounded-lg bg-background px-4 py-2 text-sm font-semibold shadow-md hover:bg-secondary"
          >
            {t('clear_polygon')}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">{t('draw_polygon_instruction')}</p>
    </div>
  );
};
