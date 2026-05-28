import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, Marker, Polyline, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { useTranslation } from 'react-i18next';
import { Order } from '@/types/order';

const containerStyle = {
  width: '100%',
  height: '100%'
};

interface DeliveryTrackingMapProps {
  order: Order;
}

/** Nearest-neighbour greedy sort for waypoints so the polyline follows the shortest path */
function sortByNearest(start: { lat: number; lng: number }, points: { lat: number; lng: number; name: string }[]): { lat: number; lng: number; name: string }[] {
  if (points.length <= 1) return [...points];
  const remaining = [...points];
  const sorted: typeof points = [];
  let current = start;
  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = (remaining[i].lat - current.lat) ** 2 + (remaining[i].lng - current.lng) ** 2;
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }
    sorted.push(remaining[nearestIdx]);
    current = remaining[nearestIdx];
    remaining.splice(nearestIdx, 1);
  }
  return sorted;
}

type RouteState = 'loading' | 'directions' | 'fallback';

export const DeliveryTrackingMap = ({ order }: DeliveryTrackingMapProps) => {
  const { t } = useTranslation();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
  const [routeState, setRouteState] = useState<RouteState>('loading');
  const directionsRequested = useRef(false);

  // ── Parse locations ──────────────────────────────────────────────────
  const customerLocation = useMemo(() => {
    if (!order.delivery_info?.address) return null;
    const lat = parseFloat(order.delivery_info.address.latitude);
    const lng = parseFloat(order.delivery_info.address.longitude);
    return isNaN(lat) || isNaN(lng) ? null : { lat, lng };
  }, [order.delivery_info]);

  const courierLocation = useMemo(() => {
    if (!order.courier?.latitude || !order.courier?.longitude) return null;
    const lat = parseFloat(String(order.courier.latitude));
    const lng = parseFloat(String(order.courier.longitude));
    return isNaN(lat) || isNaN(lng) ? null : { lat, lng };
  }, [order.courier]);

  const vendorLocations = useMemo(() => {
    const locs: { lat: number; lng: number; name: string }[] = [];
    order.sub_orders?.forEach(sub => {
      if (sub.vendor_lat && sub.vendor_lng) {
        const lat = parseFloat(String(sub.vendor_lat));
        const lng = parseFloat(String(sub.vendor_lng));
        if (!isNaN(lat) && !isNaN(lng) && !locs.some(v => v.lat === lat && v.lng === lng)) {
          locs.push({ lat, lng, name: sub.vendor_name });
        }
      }
    });
    return locs;
  }, [order.sub_orders]);

  // ── Build route: courier → nearest vendors → customer ────────────────
  const routePath = useMemo(() => {
    const path: { lat: number; lng: number }[] = [];
    const start = courierLocation || vendorLocations[0] || null;
    if (!start) {
      if (customerLocation) path.push(customerLocation);
      return path;
    }
    path.push(start);
    const sortedVendors = sortByNearest(start, vendorLocations);
    sortedVendors.forEach(v => {
      if (path[path.length - 1].lat !== v.lat || path[path.length - 1].lng !== v.lng) {
        path.push({ lat: v.lat, lng: v.lng });
      }
    });
    if (customerLocation) path.push(customerLocation);
    return path;
  }, [courierLocation, vendorLocations, customerLocation]);

  const center = useMemo(() => {
    return courierLocation || vendorLocations[0] || customerLocation || { lat: 30.0444, lng: 31.2357 };
  }, [courierLocation, vendorLocations, customerLocation]);

  // ── Fit bounds on load ───────────────────────────────────────────────
  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (routePath.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    routePath.forEach(p => bounds.extend(p));
    if (order.delivery_path?.length) {
      order.delivery_path.forEach(p => bounds.extend(p));
    }
    map.fitBounds(bounds);
    window.google.maps.event.addListenerOnce(map, 'idle', () => {
      if (map.getZoom()! > 15) map.setZoom(15);
    });
  }, [routePath, order.delivery_path]);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // ── Request Google Directions for real road routing ──────────────────
  useEffect(() => {
    if (!isLoaded || !window.google) return;
    if (order.delivery_path?.length) return;
    if (routePath.length < 2) {
      setRouteState('fallback');
      return;
    }
    if (directionsRequested.current) return;
    directionsRequested.current = true;

    const service = new window.google.maps.DirectionsService();
    const origin = routePath[0];
    const destination = routePath[routePath.length - 1];
    const waypoints = routePath.slice(1, -1).map(p => ({
      location: new window.google.maps.LatLng(p.lat, p.lng),
      stopover: true
    }));

    service.route(
      {
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(destination.lat, destination.lng),
        waypoints,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          setDirectionsResult(result);
          setRouteState('directions');
        } else {
          console.warn('Directions API unavailable:', status, '– using straight-line fallback');
          setRouteState('fallback');
        }
      }
    );
  }, [isLoaded, routePath, order.delivery_path]);

  // ── Loading state ────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 animate-pulse">
        {t('loading')}
      </div>
    );
  }

  const hasLivePath = order.delivery_path && order.delivery_path.length > 0;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{ disableDefaultUI: false, zoomControl: true }}
    >
      {/* ── Customer (Red) ────────────────────────────────────────── */}
      {customerLocation && (
        <Marker
          position={customerLocation}
          title={t('customer_location')}
          icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
        />
      )}

      {/* ── Vendors (Green) ───────────────────────────────────────── */}
      {vendorLocations.map((vendor, i) => (
        <Marker
          key={`vendor-${i}`}
          position={{ lat: vendor.lat, lng: vendor.lng }}
          title={vendor.name}
          icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' }}
        />
      ))}

      {/* ── Courier (Blue) – shown when no live path ──────────────── */}
      {courierLocation && !hasLivePath && (
        <Marker
          position={courierLocation}
          title={t('courier')}
          icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
        />
      )}

      {/* ── Road-level route via Directions API (ONLY when directions succeeded) ── */}
      {routeState === 'directions' && directionsResult && !hasLivePath && (
        <DirectionsRenderer
          directions={directionsResult}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#606C38',
              strokeOpacity: 0.9,
              strokeWeight: 5,
            },
          }}
        />
      )}

      {/* ── Straight-line fallback (ONLY when directions failed) ── */}
      {routeState === 'fallback' && !hasLivePath && routePath.length > 1 && (
        <Polyline
          path={routePath}
          options={{
            strokeColor: '#606C38',
            strokeOpacity: 0.7,
            strokeWeight: 4,
          }}
        />
      )}

      {/* ── Live courier path (from Redis in the future) ──────────── */}
      {hasLivePath && (
        <>
          <Polyline
            path={order.delivery_path}
            options={{
              strokeColor: '#3b82f6',
              strokeOpacity: 0.9,
              strokeWeight: 5,
            }}
          />
          <Marker
            position={order.delivery_path[order.delivery_path.length - 1]}
            title={t('courier')}
            icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
          />
        </>
      )}
    </GoogleMap>
  );
};
