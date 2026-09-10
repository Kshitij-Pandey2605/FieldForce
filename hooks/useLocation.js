import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription = null;

    const startWatching = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setError('Location permission denied');
          setLoading(false);
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const coords = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        };

        setLocation(coords);

        try {
          const result = await Location.reverseGeocodeAsync(coords);
          if (result && result[0]) {
            const place = result[0];
            setAddress(
              `${place.name || ''} ${place.street || ''}, ${place.city || ''}, ${place.region || ''}`.trim()
            );
          }
        } catch (geoErr) {
          console.log('Reverse geocoding error:', geoErr);
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 10,
          },
          (position) => {
            const coordsData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setLocation(coordsData);
          }
        );
      } catch (err) {
        setError(err.message || 'Unable to get location');
      } finally {
        setLoading(false);
      }
    };

    startWatching();

    return () => {
      if (subscription) {
        try {
          if (typeof subscription.remove === 'function') {
            subscription.remove();
          }
        } catch (e) {
          console.log('Location subscription cleanup ignored on web:', e);
        }
      }
    };
  }, []);

  return {
    location,
    address,
    error,
    loading,
  };
}
