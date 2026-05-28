import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, Marker, Polyline, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { useTranslation } from 'react-i18next';
import { Order } from '@/types/order';
import { VehicleType } from '@/types/enums';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// ── Custom SVG marker icons ────────────────────────────────────────────

/** Create a data-URL SVG icon with a colored pin and an inner symbol */
function makeSvgIcon(bgColor: string, symbol: string, size = 40): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 10}" viewBox="0 0 ${size} ${size + 10}">
    <defs><filter id="s"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.3"/></filter></defs>
    <path d="M${size / 2} ${size + 8} C${size / 2} ${size + 8} 4 ${size * 0.6} 4 ${size * 0.42}
      A${size * 0.42 - 4} ${size * 0.42 - 4} 0 1 1 ${size - 4} ${size * 0.42}
      C${size - 4} ${size * 0.6} ${size / 2} ${size + 8} ${size / 2} ${size + 8}Z"
      fill="${bgColor}" stroke="#fff" stroke-width="2" filter="url(#s)"/>
    <text x="${size / 2}" y="${size * 0.45}" text-anchor="middle" dominant-baseline="central"
      font-size="${size * 0.4}px" fill="#fff">${symbol}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/** Courier icon depends on vehicle type */
function getCourierIcon(vehicleType?: string): google.maps.Icon {
  let symbol = '🏍️';
  if (vehicleType === VehicleType.Car) symbol = '🚗';
  else if (vehicleType === VehicleType.Bicycle) symbol = '🚲';

  return {
    url: makeSvgIcon('#3b82f6', symbol, 44),
    scaledSize: new window.google.maps.Size(44, 54),
    anchor: new window.google.maps.Point(22, 54),
  };
}

function getVendorIcon(): google.maps.Icon {
  return {
    url: makeSvgIcon('#16a34a', '🏪', 40),
    scaledSize: new window.google.maps.Size(40, 50),
    anchor: new window.google.maps.Point(20, 50),
  };
}

function getCustomerIcon(): google.maps.Icon {
  return {
    url: makeSvgIcon('#dc2626', '📍', 40),
    scaledSize: new window.google.maps.Size(40, 50),
    anchor: new window.google.maps.Point(20, 50),
  };
}

// ── Helpers ────────────────────────────────────────────────────────────

interface DeliveryTrackingMapProps {
  order: Order;
}

/** Nearest-neighbour greedy sort for waypoints so the route follows the shortest path */
function sortByNearest(
  start: { lat: number; lng: number },
  points: { lat: number; lng: number; name: string }[]
): { lat: number; lng: number; name: string }[] {
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

// ── Component ──────────────────────────────────────────────────────────

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
      {/* ── Customer (Red pin with 📍) ────────────────────────────── */}
      {customerLocation && (
        <Marker
          position={customerLocation}
          title={t('customer_location')}
          icon={getCustomerIcon()}
        />
      )}

      {/* ── Vendors (Green pin with 🏪) ──────────────────────────── */}
      {vendorLocations.map((vendor, i) => (
        <Marker
          key={`vendor-${i}`}
          position={{ lat: vendor.lat, lng: vendor.lng }}
          title={vendor.name}
          icon={getVendorIcon()}
        />
      ))}

      {/* ── Courier (Blue pin with vehicle emoji) ─────────────────── */}
      {courierLocation && !hasLivePath && (
        <Marker
          position={courierLocation}
          title={`${t('courier')} – ${order.courier?.name || ''}`}
          icon={getCourierIcon(order.courier?.vehicle_type)}
        />
      )}

      {/* ── Road-level route via Directions API ───────────────────── */}
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

      {/* ── Straight-line fallback (only when directions failed) ──── */}
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
            icon={getCourierIcon(order.courier?.vehicle_type)}
          />
        </>
      )}
    </GoogleMap>
  );
};
