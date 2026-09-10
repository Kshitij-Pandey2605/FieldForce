import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { useImageUpload } from '../../hooks/useImageUpload';
import { useVisitService } from '../../hooks/useVisitService';

export default function GuidedVisitFlowScreen() {
  const [step, setStep] = useState(1); // 1: Customer, 2: Location, 3: Details, 4: Camera, 5: Review

  // Step 1: Customer
  const [contacts, setContacts] = useState([]);
  const [searchContact, setSearchContact] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [manualContactName, setManualContactName] = useState('');
  const [manualContactPhone, setManualContactPhone] = useState('');

  // Step 2: Location
  const [locLoading, setLocLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('');

  // Step 3: Details
  const [visitTitle, setVisitTitle] = useState('');
  const [notes, setNotes] = useState('');

  // Step 4: Photo / Camera
  const cameraRef = useRef(null);
  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [zoom, setZoom] = useState(0);
  const [flash, setFlash] = useState('off');
  const [capturedPhotoUri, setCapturedPhotoUri] = useState(null);

  // Step 5: Submitting
  const [submitting, setSubmitting] = useState(false);
  const visitService = useVisitService();
  const { uploadImage } = useImageUpload();

  useEffect(() => {
    loadDeviceContacts();
  }, []);

  const loadDeviceContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        setContacts(data || []);
      }
    } catch (err) {
      console.log('Contacts load error:', err);
    }
  };

  // Step 2 Location Auto Fetch
  const fetchLocation = async () => {
    try {
      setLocLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for site visit verification.');
        setLocLoading(false);
        return;
      }

      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const lat = current.coords.latitude;
      const lng = current.coords.longitude;
      setCoords({ latitude: lat, longitude: lng });

      const res = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (res && res[0]) {
        const p = res[0];
        const formatted = `${p.name || ''} ${p.street || ''}, ${p.city || ''}, ${p.region || ''}`.trim();
        setAddress(formatted || 'Location Captured');
      } else {
        setAddress('Location Captured');
      }
    } catch (err) {
      Alert.alert('Location Error', 'Unable to retrieve GPS location.');
    } finally {
      setLocLoading(false);
    }
  };

  useEffect(() => {
    if (step === 2 && !coords) {
      fetchLocation();
    }
  }, [step]);

  // Step 4 Take Picture
  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setCapturedPhotoUri(photo?.uri || null);
    } catch (err) {
      Alert.alert('Camera Error', 'Could not take photo.');
    }
  };

  // Step 5 Submit
  const handleSubmitVisit = async () => {
    try {
      setSubmitting(true);
      const customerName = selectedContact ? selectedContact.name : manualContactName || 'General Client';
      const customerPhone =
        selectedContact && selectedContact.phoneNumbers && selectedContact.phoneNumbers[0]
          ? selectedContact.phoneNumbers[0].number
          : manualContactPhone || '';

      const titleText = visitTitle.trim() || `Visit - ${customerName}`;

      const created = await visitService.createVisit({
        title: titleText,
        status: 'completed',
        location: address || 'Site Location Captured',
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        contactName: customerName,
        contactPhone: customerPhone,
        notes: notes,
        startTime: new Date().toISOString(),
      });

      if (capturedPhotoUri && created._id) {
        try {
          await uploadImage(capturedPhotoUri, created._id);
        } catch (uploadErr) {
          console.log('Photo upload error:', uploadErr);
        }
      }

      Alert.alert('Visit Submitted!', 'Your field visit has been logged successfully.', [
        {
          text: 'View Visit Record',
          onPress: () => router.replace(`/visits/${created._id}`),
        },
      ]);
    } catch (err) {
      Alert.alert('Submission Error', err.message || 'Failed to submit visit.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredContacts = contacts.filter((c) =>
    (c.name || '').toLowerCase().includes(searchContact.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Top Header & Progress Stepper */}
      <View style={styles.topHeader}>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>✕ Cancel</Text>
        </Pressable>

        <Text style={styles.stepTitle}>Step {step} of 5</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${(step / 5) * 100}%` }]} />
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* ================= STEP 1: CUSTOMER ================= */}
        {step === 1 && (
          <View>
            <Text style={styles.heading}>Select Customer / Contact</Text>
            <Text style={styles.subheading}>Search device contacts or enter customer details manually.</Text>

            <CustomInput
              placeholder="🔍 Search contacts by name..."
              value={searchContact}
              onChangeText={setSearchContact}
            />

            {contacts.length > 0 ? (
              <View style={styles.contactListContainer}>
                {filteredContacts.slice(0, 5).map((item) => {
                  const isSelected = selectedContact?.id === item.id;
                  const phone = item.phoneNumbers?.[0]?.number || 'No phone';
                  return (
                    <Pressable
                      key={item.id || Math.random().toString()}
                      style={[styles.contactCard, isSelected && styles.selectedContactCard]}
                      onPress={() => {
                        setSelectedContact(item);
                        setManualContactName(item.name);
                        setManualContactPhone(phone);
                      }}
                    >
                      <View style={styles.contactAvatar}>
                        <Text style={styles.avatarText}>{item.name?.charAt(0) || '👤'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.contactName}>{item.name}</Text>
                        <Text style={styles.contactPhone}>{phone}</Text>
                      </View>
                      {isSelected ? <Text style={styles.checkMark}>✓ Selected</Text> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            <View style={styles.manualBox}>
              <Text style={styles.manualTitle}>Or Enter Customer Details:</Text>
              <CustomInput
                label="Customer Name"
                placeholder="e.g. Rahul Sharma"
                value={manualContactName}
                onChangeText={(val) => {
                  setManualContactName(val);
                  if (selectedContact && selectedContact.name !== val) {
                    setSelectedContact(null);
                  }
                }}
              />
              <CustomInput
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={manualContactPhone}
                onChangeText={setManualContactPhone}
                keyboardType="phone-pad"
              />
            </View>

            <CustomButton
              title="Continue to Location →"
              onPress={() => {
                if (!selectedContact && !manualContactName.trim()) {
                  Alert.alert('Required', 'Please select a customer contact or type a customer name.');
                  return;
                }
                setStep(2);
              }}
              style={{ marginTop: 16 }}
            />
          </View>
        )}

        {/* ================= STEP 2: LOCATION ================= */}
        {step === 2 && (
          <View>
            <Text style={styles.heading}>Capture Visit Location</Text>
            <Text style={styles.subheading}>Confirming your current GPS site coordinates.</Text>

            {locLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingBoxText}>Detecting GPS location & reverse geocoding...</Text>
              </View>
            ) : coords ? (
              <View style={styles.locationCard}>
                <View style={styles.locBadge}>
                  <Text style={styles.locBadgeText}>📍 LOCATION CAPTURED ✓</Text>
                </View>

                <Text style={styles.addressTitle}>{address || 'Site Location'}</Text>

                <View style={styles.coordsRow}>
                  <Text style={styles.coordLabel}>Latitude: <Text style={styles.coordValue}>{coords.latitude.toFixed(6)}</Text></Text>
                  <Text style={styles.coordLabel}>Longitude: <Text style={styles.coordValue}>{coords.longitude.toFixed(6)}</Text></Text>
                </View>

                {/* Mini Web/Map preview box */}
                <View style={styles.miniMapPreview}>
                  {Platform.OS === 'web' ? (
                    <iframe
                      title="Mini Map"
                      width="100%"
                      height="100%"
                      style={{ border: 0, borderRadius: 12 }}
                      src={`https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&z=15&output=embed`}
                    />
                  ) : (
                    <View style={styles.miniMapFallback}>
                      <Text style={{ fontSize: 32 }}>🗺️</Text>
                      <Text style={{ color: '#475569', fontWeight: '600', marginTop: 4 }}>GPS Pin Placed</Text>
                    </View>
                  )}
                </View>

                <Pressable style={styles.reFetchBtn} onPress={fetchLocation}>
                  <Text style={styles.reFetchText}>🔄 Refresh GPS Location</Text>
                </Pressable>
              </View>
            ) : (
              <CustomButton title="📍 Detect GPS Location" onPress={fetchLocation} />
            )}

            {coords ? (
              <View style={styles.stepBtnRow}>
                <CustomButton title="← Back" variant="secondary" onPress={() => setStep(1)} style={{ flex: 1 }} />
                <CustomButton title="Continue to Details →" onPress={() => setStep(3)} style={{ flex: 1 }} />
              </View>
            ) : null}
          </View>
        )}

        {/* ================= STEP 3: DETAILS ================= */}
        {step === 3 && (
          <View>
            <Text style={styles.heading}>Visit Details</Text>
            <Text style={styles.subheading}>Enter the purpose and notes for this site visit.</Text>

            <CustomInput
              label="Visit Title / Purpose"
              placeholder="e.g. Product Demo & Contract Discussion"
              value={visitTitle}
              onChangeText={setVisitTitle}
            />

            <View style={{ marginBottom: 16 }}>
              <Text style={{ marginBottom: 6, fontWeight: '600', color: '#334155' }}>Field Observation Notes</Text>
              <TextInput
                style={styles.textAreaInput}
                placeholder="Add meeting notes, customer feedback, or discussion outcomes..."
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>

            <View style={styles.stepBtnRow}>
              <CustomButton title="← Back" variant="secondary" onPress={() => setStep(2)} style={{ flex: 1 }} />
              <CustomButton
                title="Continue to Selfie →"
                onPress={() => {
                  if (!visitTitle.trim()) {
                    setVisitTitle(`Client Meeting - ${selectedContact?.name || manualContactName || 'Field Visit'}`);
                  }
                  setStep(4);
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {/* ================= STEP 4: SELFIE / PHOTO ================= */}
        {step === 4 && (
          <View>
            <Text style={styles.heading}>Verify Your Visit</Text>
            <Text style={styles.subheading}>Take a selfie or site photo to confirm your attendance on-site.</Text>

            {capturedPhotoUri ? (
              <View style={styles.capturedPhotoBox}>
                <Image source={{ uri: capturedPhotoUri }} style={styles.capturedImage} />
                <View style={styles.photoSuccessBadge}>
                  <Text style={styles.photoSuccessText}>✓ Photo Captured</Text>
                </View>

                <Pressable style={styles.retakeBtn} onPress={() => setCapturedPhotoUri(null)}>
                  <Text style={styles.retakeBtnText}>🔄 Retake Photo</Text>
                </Pressable>
              </View>
            ) : camPermission?.granted ? (
              <View style={styles.camContainer}>
                <CameraView
                  ref={cameraRef}
                  style={[styles.camView, zoom > 0 && Platform.OS === 'web' && { transform: [{ scale: 1 + zoom * 1.5 }] }]}
                  facing={facing}
                  zoom={zoom}
                  flash={flash}
                />
                <View style={styles.camOverlay}>
                  <Pressable style={styles.camFlipBtn} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>🔄 {facing}</Text>
                  </Pressable>

                  <Pressable style={styles.camShutterBtn} onPress={takePhoto}>
                    <Text style={{ fontSize: 24 }}>📸</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.camPermBox}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>📷</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 6 }}>Camera Permission Required</Text>
                <CustomButton title="Grant Camera Access" onPress={requestCamPermission} />
              </View>
            )}

            <View style={styles.stepBtnRow}>
              <CustomButton title="← Back" variant="secondary" onPress={() => setStep(3)} style={{ flex: 1 }} />
              <CustomButton
                title={capturedPhotoUri ? 'Continue to Review →' : 'Skip Photo & Review →'}
                onPress={() => setStep(5)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {/* ================= STEP 5: REVIEW & SUBMIT ================= */}
        {step === 5 && (
          <View>
            <Text style={styles.heading}>Review Visit Record</Text>
            <Text style={styles.subheading}>Please double check all information before submitting.</Text>

            <View style={styles.reviewCard}>
              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>CUSTOMER</Text>
                <Text style={styles.reviewValue}>{selectedContact?.name || manualContactName || 'General Client'}</Text>
                {selectedContact?.phoneNumbers?.[0]?.number || manualContactPhone ? (
                  <Text style={styles.reviewSubValue}>📞 {selectedContact?.phoneNumbers?.[0]?.number || manualContactPhone}</Text>
                ) : null}
              </View>

              <View style={styles.reviewDivider} />

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>LOCATION</Text>
                <Text style={styles.reviewValue}>{address || 'Captured Location'}</Text>
                {coords ? (
                  <Text style={styles.reviewSubValue}>GPS: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}</Text>
                ) : null}
              </View>

              <View style={styles.reviewDivider} />

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>PURPOSE / NOTES</Text>
                <Text style={styles.reviewValue}>{visitTitle || 'Site Visit'}</Text>
                {notes ? <Text style={styles.reviewSubValue}>{notes}</Text> : null}
              </View>

              {capturedPhotoUri ? (
                <>
                  <View style={styles.reviewDivider} />
                  <View style={styles.reviewSection}>
                    <Text style={styles.reviewLabel}>ATTACHED SELFIE / PHOTO</Text>
                    <Image source={{ uri: capturedPhotoUri }} style={styles.reviewPhotoPreview} />
                  </View>
                </>
              ) : null}
            </View>

            <View style={styles.stepBtnRow}>
              <CustomButton title="← Back" variant="secondary" onPress={() => setStep(4)} style={{ flex: 1 }} />
              <CustomButton
                title={submitting ? 'Submitting...' : '✓ Submit Visit'}
                onPress={handleSubmitVisit}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 16 : 40,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
  },
  cancelText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 13,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4f46e5',
    letterSpacing: 0.5,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#e2e8f0',
    width: '100%',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#4f46e5',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  contactListContainer: {
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedContactCard: {
    borderColor: '#4f46e5',
    backgroundColor: '#f5f3ff',
  },
  contactAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#4338ca',
    fontWeight: '800',
    fontSize: 16,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  contactPhone: {
    fontSize: 13,
    color: '#64748b',
  },
  checkMark: {
    color: '#4f46e5',
    fontWeight: '800',
    fontSize: 13,
  },
  manualBox: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
  },
  manualTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
  },
  loadingBox: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loadingBoxText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
  locationCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  locBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 12,
  },
  locBadgeText: {
    color: '#15803d',
    fontWeight: '800',
    fontSize: 11,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  coordsRow: {
    marginBottom: 14,
  },
  coordLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  coordValue: {
    fontWeight: '700',
    color: '#0f172a',
  },
  miniMapPreview: {
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    marginBottom: 14,
  },
  miniMapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reFetchBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
  },
  reFetchText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  stepBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  textAreaInput: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#0f172a',
  },
  capturedPhotoBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  capturedImage: {
    width: '100%',
    height: 240,
    borderRadius: 18,
  },
  photoSuccessBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  photoSuccessText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  retakeBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  retakeBtnText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 14,
  },
  camContainer: {
    height: 280,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 20,
  },
  camView: {
    flex: 1,
  },
  camOverlay: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  camFlipBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  camShutterBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camPermBox: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  reviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  reviewSection: {
    paddingVertical: 6,
  },
  reviewLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  reviewSubValue: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
  },
  reviewPhotoPreview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginTop: 6,
  },
});
