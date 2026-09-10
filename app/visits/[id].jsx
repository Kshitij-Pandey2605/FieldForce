import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CustomButton from '../../components/CustomButton';
import { API_BASE } from '../../constants/api';
import { useImageUpload } from '../../hooks/useImageUpload';
import { useVisitService } from '../../hooks/useVisitService';

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const visitService = useVisitService();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const { uploadImage } = useImageUpload();

  const getPhotoUrl = (photoUri) => {
    if (!photoUri) return null;
    if (photoUri.startsWith('http') || photoUri.startsWith('data:')) return photoUri;
    const serverUrl = API_BASE.replace('/api', '');
    return `${serverUrl}${photoUri}`;
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need camera permission to take a picture.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await handleUploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to launch camera.');
    }
  };

  const handleUploadImage = async (uri) => {
    try {
      setUploading(true);
      const updatedVisit = await uploadImage(uri, id);
      setVisit(updatedVisit);
      setFormData(updatedVisit);
      Alert.alert('Success', 'Photo attached to visit successfully!');
    } catch (error) {
      Alert.alert('Upload Error', error.message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadVisit();
    }
  }, [id]);

  const loadVisit = async () => {
    try {
      setLoading(true);
      const data = await visitService.getVisitById(id);
      setVisit(data);
      setFormData(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load visit details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVisit = async () => {
    try {
      const updated = await visitService.updateVisit(id, formData);
      setVisit(updated);
      setEditing(false);
      Alert.alert('Success', 'Visit record updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update visit');
    }
  };

  const handleDeleteVisit = async () => {
    Alert.alert('Delete Visit Record', 'Are you sure you want to permanently delete this visit record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await visitService.deleteVisit(id);
            Alert.alert('Deleted', 'Visit record removed.');
            router.back();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete visit');
          }
        },
      },
    ]);
  };

  const handleToggleStatus = async () => {
    const newStatus = visit.status === 'completed' ? 'in-progress' : 'completed';
    try {
      const updated = await visitService.updateVisit(id, { status: newStatus });
      setVisit(updated);
      setFormData(updated);
    } catch (error) {
      Alert.alert('Error', 'Failed to change status');
    }
  };

  const openInMap = () => {
    if (visit?.latitude && visit?.longitude) {
      const url = `https://maps.google.com/?q=${visit.latitude},${visit.longitude}`;
      Linking.openURL(url);
    } else {
      router.push('/(tabs)/map');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading visit record...</Text>
      </View>
    );
  }

  if (!visit) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Visit record not found</Text>
      </View>
    );
  }

  const isCompleted = visit.status === 'completed';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header bar */}
      <View style={styles.topNav}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back to Visits</Text>
        </Pressable>
      </View>

      {/* Main Visit Card Record Header */}
      <View style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <Text style={styles.categoryBadge}>SITE VISIT RECORD</Text>
          <Pressable onPress={handleToggleStatus}>
            <View style={[styles.statusChip, isCompleted ? styles.completedChip : styles.inProgressChip]}>
              <Text style={[styles.statusChipText, isCompleted ? styles.completedText : styles.inProgressText]}>
                ● {visit.status?.toUpperCase() || 'IN-PROGRESS'}
              </Text>
            </View>
          </Pressable>
        </View>

        <Text style={styles.visitTitle}>{visit.title}</Text>
        <Text style={styles.visitDateText}>
          {visit.startTime ? new Date(visit.startTime).toLocaleDateString(undefined, { dateStyle: 'full' }) : 'Date N/A'}
        </Text>
      </View>

      {/* Section 1: Location Record */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>📍</Text>
          <Text style={styles.sectionTitle}>Location</Text>
        </View>

        {editing ? (
          <TextInput
            style={styles.input}
            value={formData.location || ''}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
            placeholder="Edit site location"
          />
        ) : (
          <Text style={styles.bodyText}>{visit.location || 'Unknown site address'}</Text>
        )}

        {visit.latitude && visit.longitude ? (
          <Text style={styles.coordSubText}>
            GPS Coords: {visit.latitude.toFixed(4)}, {visit.longitude.toFixed(4)}
          </Text>
        ) : null}

        <Pressable style={styles.inlineActionBtn} onPress={openInMap}>
          <Text style={styles.inlineActionText}>🗺️ View on Map</Text>
        </Pressable>
      </View>

      {/* Section 2: Customer / Contact Info */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>👤</Text>
          <Text style={styles.sectionTitle}>Customer Contact</Text>
        </View>

        {editing ? (
          <>
            <TextInput
              style={[styles.input, { marginBottom: 10 }]}
              value={formData.contactName || ''}
              onChangeText={(text) => setFormData({ ...formData, contactName: text })}
              placeholder="Contact Name"
            />
            <TextInput
              style={styles.input}
              value={formData.contactPhone || ''}
              onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
              placeholder="Contact Phone"
              keyboardType="phone-pad"
            />
          </>
        ) : (
          <>
            <Text style={styles.boldText}>{visit.contactName || 'No customer linked'}</Text>
            {visit.contactPhone ? (
              <Text style={styles.phoneText}>📞 {visit.contactPhone}</Text>
            ) : null}
          </>
        )}
      </View>

      {/* Section 3: Visit Time */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>🕐</Text>
          <Text style={styles.sectionTitle}>Visit Timestamp</Text>
        </View>
        <Text style={styles.bodyText}>
          Started: {visit.startTime ? new Date(visit.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
        </Text>
        {visit.endTime ? (
          <Text style={[styles.bodyText, { marginTop: 4 }]}>
            Ended: {new Date(visit.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        ) : null}
      </View>

      {/* Section 4: Notes */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>📝</Text>
          <Text style={styles.sectionTitle}>Field Notes</Text>
        </View>

        {editing ? (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes || ''}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Add field observation notes"
            multiline
          />
        ) : (
          <Text style={styles.bodyText}>{visit.notes || 'No field notes submitted'}</Text>
        )}
      </View>

      {/* Section 5: Visit Photo Evidence */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionIcon}>📷</Text>
          <Text style={styles.sectionTitle}>Visit Photo Evidence</Text>
        </View>

        {visit.photoUri ? (
          <View style={styles.photoBox}>
            <Image source={{ uri: getPhotoUrl(visit.photoUri) }} style={styles.photoImage} resizeMode="cover" />
            <Pressable style={styles.reuploadBtn} onPress={handlePickImage} disabled={uploading}>
              <Text style={styles.reuploadText}>{uploading ? 'Uploading...' : '🔄 Replace Photo'}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyPhotoBox}>
            <Text style={styles.emptyPhotoIcon}>📸</Text>
            <Text style={styles.emptyPhotoText}>No selfie / site photo attached</Text>
            <Pressable style={styles.attachBtn} onPress={handlePickImage} disabled={uploading}>
              <Text style={styles.attachBtnText}>{uploading ? 'Uploading...' : '+ Attach Visit Photo'}</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Primary Actions */}
      <View style={styles.actionsContainer}>
        {editing ? (
          <View style={styles.btnRow}>
            <CustomButton title="Save Record" onPress={handleUpdateVisit} style={{ flex: 1 }} />
            <CustomButton
              title="Cancel"
              variant="secondary"
              onPress={() => {
                setEditing(false);
                setFormData(visit);
              }}
              style={{ flex: 1 }}
            />
          </View>
        ) : (
          <View style={styles.btnRow}>
            <CustomButton title="Edit Record" onPress={() => setEditing(true)} style={{ flex: 1 }} />
            <CustomButton
              title={isCompleted ? 'Mark Active' : 'Mark Complete'}
              variant="secondary"
              onPress={handleToggleStatus}
              style={{ flex: 1 }}
            />
          </View>
        )}

        {!editing ? (
          <CustomButton title="Delete Visit Record" variant="danger" onPress={handleDeleteVisit} style={{ marginTop: 12 }} />
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  topNav: {
    marginBottom: 16,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
  },
  backBtnText: {
    color: '#4338ca',
    fontWeight: '700',
    fontSize: 14,
  },
  headerCard: {
    backgroundColor: '#1e1b4b',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inProgressChip: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
  },
  completedChip: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  inProgressText: {
    color: '#fbbf24',
  },
  completedText: {
    color: '#4ade80',
  },
  visitTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  visitDateText: {
    fontSize: 13,
    color: '#c7d2fe',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 15,
    color: '#0f172a',
    lineHeight: 22,
  },
  boldText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  phoneText: {
    fontSize: 14,
    color: '#4f46e5',
    marginTop: 4,
    fontWeight: '600',
  },
  coordSubText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  inlineActionBtn: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  inlineActionText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 13,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    fontSize: 15,
    color: '#0f172a',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  photoBox: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
  },
  reuploadBtn: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
  },
  reuploadText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyPhotoBox: {
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    borderRadius: 14,
  },
  emptyPhotoIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyPhotoText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  attachBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  attachBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  actionsContainer: {
    marginTop: 10,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
