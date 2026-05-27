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
    }
  }, [coordinates]);

  const onMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handlePolygonComplete = (polygon: google.maps.Polygon) => {
    // If a polygon already exists, remove it so we only have one
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }
    polygonRef.current = polygon;

    const path = polygon.getPath();
    const newCoordinates: Coordinate[] = [];
    for (let i = 0; i < path.getLength(); i++) {
      const latLng = path.getAt(i);
      newCoordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
    }
    onChange(newCoordinates);

    // Setup listener for edits
    google.maps.event.addListener(path, 'insert_at', () => updateCoordinates(polygon));
    google.maps.event.addListener(path, 'remove_at', () => updateCoordinates(polygon));
    google.maps.event.addListener(path, 'set_at', () => updateCoordinates(polygon));
  };

  const updateCoordinates = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath();
    const newCoordinates: Coordinate[] = [];
    for (let i = 0; i < path.getLength(); i++) {
      const latLng = path.getAt(i);
      newCoordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
    }
    onChange(newCoordinates);
  };

  const clearPolygon = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    onChange([]);
  };

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
          center={coordinates && coordinates.length > 0 ? coordinates[0] : defaultCenter}
          zoom={11}
          onLoad={onMapLoad}
          onUnmount={onMapUnmount}
          options={{
            mapTypeControl: false,
            streetViewControl: false,
          }}
        >
          {/* If we have initial coordinates, draw them unless user has drawn a new one */}
          {coordinates && coordinates.length > 0 && !polygonRef.current && (
            <Polygon
              path={coordinates}
              options={{
                fillColor: '#2563eb',
                fillOpacity: 0.4,
                strokeColor: '#2563eb',
                strokeOpacity: 1,
                strokeWeight: 2,
                editable: true,
              }}
              onLoad={(polygon) => {
                polygonRef.current = polygon;
                const path = polygon.getPath();
                google.maps.event.addListener(path, 'insert_at', () => updateCoordinates(polygon));
                google.maps.event.addListener(path, 'remove_at', () => updateCoordinates(polygon));
                google.maps.event.addListener(path, 'set_at', () => updateCoordinates(polygon));
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
