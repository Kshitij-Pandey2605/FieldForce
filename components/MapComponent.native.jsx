import { useRef, useEffect } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';

export default function MapComponent() {
  const { location, address, loading, error } = useLocation();
  const mapRef = useRef(null);

  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }, 1000);
    }
  }, [location]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Map</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const openMapUrl = () => {
    if (!location) return;
    const url = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    Linking.openURL(url);
  };

  const handleRecenter = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          showsUserLocation={true}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your Location"
            description={address || "Current Coordinates"}
          />
        </MapView>
      ) : (
        <View style={styles.noMap}>
          <Text style={styles.errorText}>No location data available</Text>
        </View>
      )}

      {/* Floating Info Panel */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Current Location Details</Text>
        {location ? (
          <>
            <Text style={styles.coordText}>Lat: {location.latitude.toFixed(6)}</Text>
            <Text style={styles.coordText}>Lng: {location.longitude.toFixed(6)}</Text>
            {address ? <Text style={styles.addressText}>Address: {address}</Text> : null}
          </>
        ) : (
          <Text style={styles.coordText}>GPS coordinates unavailable</Text>
        )}

        <View style={styles.buttonRow}>
          <Pressable style={styles.actionButton} onPress={handleRecenter}>
            <Text style={styles.buttonText}>🎯 Recenter</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.secondaryButton]} onPress={openMapUrl}>
            <Text style={styles.buttonText}>🌐 Open Google Maps</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#475569',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  noMap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  coordText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    color: '#0c4a6e',
    fontWeight: '500',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#f97316',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
});
