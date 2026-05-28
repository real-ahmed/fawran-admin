import { useCallback, useState } from 'react';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { useTranslation } from 'react-i18next';
import { Order } from '@/types/order';

const containerStyle = {
  width: '100%',
  height: '100%'
};

interface DeliveryTrackingMapProps {
  order: Order;
}

export const DeliveryTrackingMap = ({ order }: DeliveryTrackingMapProps) => {
  const { t } = useTranslation();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const customerLocation = order.delivery_info?.address ? {
    lat: parseFloat(order.delivery_info.address.latitude),
    lng: parseFloat(order.delivery_info.address.longitude)
  } : null;

  // For vendor location, we could average sub_order vendors if multiple, but let's just use the first one's store location if we had it.
  // Actually, the API doesn't return vendor latitude/longitude yet.
  // We'll just center on customer location for now.
  const center = customerLocation || { lat: 30.0444, lng: 31.2357 }; // Default Cairo

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    if (customerLocation) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(new window.google.maps.LatLng(customerLocation.lat, customerLocation.lng));
      // If we had delivery_path, we would extend bounds for all points
      if (order.delivery_path && order.delivery_path.length > 0) {
        order.delivery_path.forEach(point => {
          bounds.extend(new window.google.maps.LatLng(point.lat, point.lng));
        });
      }
      map.fitBounds(bounds);
      
      // Don't zoom in too much if there's only one point
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom()! > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }
    setMap(map);
  }, [customerLocation, order.delivery_path]);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  if (!isLoaded) return <div className="w-full h-full flex items-center justify-center bg-muted/20 animate-pulse">{t('loading')}</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
      }}
    >
      {/* Customer Location */}
      {customerLocation && (
        <Marker
          position={customerLocation}
          title={t('customer_location')}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
          }}
        />
      )}

      {/* Courier Path (if available from Redis later) */}
      {order.delivery_path && order.delivery_path.length > 0 && (
        <>
          <Polyline
            path={order.delivery_path}
            options={{
              strokeColor: '#3b82f6',
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
          />
          {/* Current Courier Location (last point) */}
          <Marker
            position={order.delivery_path[order.delivery_path.length - 1]}
            title={t('courier')}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }}
          />
        </>
      )}
    </GoogleMap>
  );
};
