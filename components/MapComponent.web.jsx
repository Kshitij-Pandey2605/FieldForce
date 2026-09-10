import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocation } from '../hooks/useLocation';

export default function MapComponent() {
  const { location, address, loading, error } = useLocation();

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

  return (
    <View style={styles.container}>
      <View style={styles.webMapContainer}>
        {location ? (
          <iframe
            title="Google Maps"
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: 12 }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`}
          />
        ) : (
          <View style={styles.noMap}>
            <Text style={styles.errorText}>No location data available</Text>
          </View>
        )}
      </View>

      {/* Floating Info Panel */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Current Location Details (Web View)</Text>
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
          <Pressable style={styles.actionButton} onPress={openMapUrl}>
            <Text style={styles.buttonText}>🌐 Open Full Google Maps</Text>
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
    padding: 16,
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
  webMapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 140,
    backgroundColor: '#e2e8f0',
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
