import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, Marker, Polyline, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { useTranslation } from 'react-i18next';
import { Order } from '@/types/order';
import { VehicleType } from '@/types/enums';
import { useCourierTrackingStore } from '@/store/courierTrackingStore';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// ── Custom SVG marker icons ────────────────────────────────────────────

/** Create a clean emoji-only SVG icon — no pin shape, no border */
function makeEmojiIcon(emoji: string, size = 36): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central"
      font-size="${size * 0.7}px">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/** Courier icon depends on vehicle type */
function getCourierIcon(vehicleType?: string): google.maps.Icon {
  let emoji = '🏍️';
  if (vehicleType === VehicleType.Car) emoji = '🚗';
  else if (vehicleType === VehicleType.Bicycle) emoji = '🚲';

  return {
    url: makeEmojiIcon(emoji, 40),
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 20),
  };
}

function getVendorIcon(): google.maps.Icon {
  return {
    url: makeEmojiIcon('🏪', 36),
    scaledSize: new window.google.maps.Size(36, 36),
    anchor: new window.google.maps.Point(18, 18),
  };
}

function getCustomerIcon(): google.maps.Icon {
  return {
    url: makeEmojiIcon('📍', 36),
    scaledSize: new window.google.maps.Size(36, 36),
    anchor: new window.google.maps.Point(18, 36),
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

const EMPTY_PATH: { lat: number; lng: number }[] = [];

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

  // ── Live courier path from WebSocket events ───────────────────────────
  const storePathRef = useCourierTrackingStore((state) => state.paths[order.id]);
  const livePath = storePathRef ?? EMPTY_PATH;
  const visitedVendors = useCourierTrackingStore((state) => state.visitedVendors[order.id]);

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
    const locs: { id: number; lat: number; lng: number; name: string }[] = [];
    order.sub_orders?.forEach(sub => {
      // Skip if courier already picked up this sub-order
      if (sub.status === 'picked_up') return;

      if (sub.vendor_lat && sub.vendor_lng) {
        const lat = parseFloat(String(sub.vendor_lat));
        const lng = parseFloat(String(sub.vendor_lng));
        if (!isNaN(lat) && !isNaN(lng) && !locs.some(v => v.id === sub.vendor_id)) {
          locs.push({ id: sub.vendor_id, lat, lng, name: sub.vendor_name });
        }
      }
    });
    return locs;
  }, [order.sub_orders]);

  /** Vendors not yet picked up — these are the only ones shown on the map */
  const activeVendorLocations = useMemo(() => {
    if (!visitedVendors || visitedVendors.size === 0) return vendorLocations;
    return vendorLocations.filter(v => !visitedVendors.has(v.id));
  }, [vendorLocations, visitedVendors]);

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
  }, [
    courierLocation?.lat, courierLocation?.lng,
    vendorLocations[0]?.lat, vendorLocations[0]?.lng,
    customerLocation?.lat, customerLocation?.lng
  ]);

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

    setRouteState('loading');
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

  // ── Calculate ETA and distance from the resolved road route ───────────
  const etaInfo = useMemo(() => {
    if (!directionsResult?.routes[0]) return null;

    let totalDistance = 0;
    let totalDuration = 0;

    directionsResult.routes[0].legs.forEach((leg) => {
      totalDistance += leg.distance?.value || 0;
      totalDuration += leg.duration?.value || 0;
    });

    return {
      distance: `${(totalDistance / 1000).toFixed(1)} km`,
      duration: `${Math.ceil(totalDuration / 60)} ${t('minutes_short', 'min')}`,
    };
  }, [directionsResult, t]);

  // ── Loading state ────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 animate-pulse">
        {t('loading')}
      </div>
    );
  }

  const hasLivePath = livePath.length > 0;
  const liveCurrentPosition = hasLivePath ? livePath[livePath.length - 1] : null;

  return (
    <div className="relative w-full h-full">
      {/* ── ETA Overlay ─────────────────────────────────────────────────── */}
      {etaInfo && routeState === 'directions' && !hasLivePath && (
        <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur-sm shadow-md border border-border rounded-lg p-3 text-sm flex gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase font-semibold">{t('estimated_time')}</span>
            <span className="font-bold text-base text-foreground">{etaInfo.duration}</span>
          </div>
          <div className="w-px bg-border my-1" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase font-semibold">{t('distance')}</span>
            <span className="font-bold text-base text-foreground">{etaInfo.distance}</span>
          </div>
        </div>
      )}

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

      {/* ── Vendors (Green pin with 🏪) — hides after pickup ────── */}
      {activeVendorLocations.map((vendor) => (
        <Marker
          key={`vendor-${vendor.id}`}
          position={{ lat: vendor.lat, lng: vendor.lng }}
          title={vendor.name}
          icon={getVendorIcon()}
        />
      ))}

      {/* ── Courier (vehicle emoji) — uses live position when available ── */}
      {(liveCurrentPosition || courierLocation) && (
        <Marker
          position={liveCurrentPosition || courierLocation!}
          title={`${t('courier')} – ${order.courier?.name || ''}`}
          icon={getCourierIcon(order.courier?.vehicle_type)}
        />
      )}

      {/* ── Road-level route via Directions API ───────────────────── */}
      {routeState === 'directions' && directionsResult && (
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
      {routeState === 'fallback' && routePath.length > 1 && (
        <Polyline
          path={routePath}
          options={{
            strokeColor: '#606C38',
            strokeOpacity: 0.7,
            strokeWeight: 4,
          }}
        />
      )}

    </GoogleMap>
    </div>
  );
};
