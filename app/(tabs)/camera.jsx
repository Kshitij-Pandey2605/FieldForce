import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [capturedUri, setCapturedUri] = useState(null);
  const [capturedType, setCapturedType] = useState('picture'); // 'picture' or 'video'
  const [mode, setMode] = useState('picture'); // 'picture' or 'video'
  const [zoom, setZoom] = useState(0); // 0 (min/1x) to 1 (max/5x)
  const [flash, setFlash] = useState('off'); // 'off', 'on', 'auto'
  const [isRecording, setIsRecording] = useState(false);

  // Video Player configuration
  const player = useVideoPlayer(capturedUri, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.play();
  });

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.title}>Camera Access Required</Text>
          <Text style={styles.message}>FieldForce requires camera permissions to capture photo evidence for site visits.</Text>
          <Pressable style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Grant Access</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  };

  const adjustZoom = (amount) => {
    setZoom((current) => {
      const next = current + amount;
      return Math.max(0, Math.min(1, parseFloat(next.toFixed(2))));
    });
  };

  const setPresetZoom = (value) => {
    setZoom(value);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    if (mode === 'picture') {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
        setCapturedUri(photo?.uri ?? null);
        setCapturedType('picture');
      } catch (error) {
        Alert.alert('Capture failed', 'Unable to take photo right now.');
      }
    } else {
      if (isRecording) {
        cameraRef.current.stopRecording();
      } else {
        if (!micPermission || !micPermission.granted) {
          const micStatus = await requestMicPermission();
          if (!micStatus.granted) {
            Alert.alert('Microphone required', 'Permission is needed to record video.');
            return;
          }
        }
        try {
          setIsRecording(true);
          const video = await cameraRef.current.recordAsync({ maxDuration: 60 });
          setCapturedUri(video?.uri ?? null);
          setCapturedType('video');
        } catch (error) {
          Alert.alert('Record failed', 'Unable to record video right now.');
        } finally {
          setIsRecording(false);
        }
      }
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
  };

  const displayZoom = (1 + zoom * 4).toFixed(1);

  return (
    <View style={styles.container}>
      {/* Top Workflow Header */}
      <View style={styles.screenHeader}>
        <Text style={styles.headerTitle}>Camera Studio</Text>
        <Text style={styles.headerSub}>Capture photo or video evidence for your field visits</Text>
      </View>

      {capturedUri ? (
        <View style={styles.previewFullScreen}>
          {capturedType === 'video' ? (
            <VideoView player={player} style={styles.previewMedia} nativeControls />
          ) : (
            <Image source={{ uri: capturedUri }} style={styles.previewMedia} />
          )}
          <View style={styles.previewHeaderContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Previewing {capturedType.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.previewControls}>
            <Pressable style={styles.retakeButton} onPress={handleRetake}>
              <Text style={styles.retakeButtonText}>🔄 Retake Photo</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.camBox}>
          <View style={styles.cameraWrapper}>
            <CameraView
              ref={cameraRef}
              style={[
                styles.camera,
                Platform.OS === 'web' && zoom > 0 && { transform: [{ scale: 1 + zoom * 1.5 }] },
              ]}
              facing={facing}
              mode={mode}
              zoom={zoom}
              flash={flash}
            />
          </View>

          <View style={styles.overlay}>
            {/* Top Bar Controls */}
            <View style={styles.topBar}>
              <View style={styles.modePill}>
                <Pressable
                  style={[styles.modeTab, mode === 'picture' && styles.activeModeTab]}
                  onPress={() => setMode('picture')}
                >
                  <Text style={[styles.modeTabText, mode === 'picture' && styles.activeModeTabText]}>Photo</Text>
                </Pressable>
                <Pressable
                  style={[styles.modeTab, mode === 'video' && styles.activeModeTab]}
                  onPress={() => setMode('video')}
                >
                  <Text style={[styles.modeTabText, mode === 'video' && styles.activeModeTabText]}>Video</Text>
                </Pressable>
              </View>

              <Pressable style={styles.glassIconButton} onPress={toggleFlash}>
                <Text style={styles.glassIconText}>⚡ {flash.toUpperCase()}</Text>
              </Pressable>
            </View>

            {/* Bottom Floating Bar & Zoom Control */}
            <View style={styles.bottomControlsContainer}>
              <View style={styles.zoomContainer}>
                <Pressable style={styles.zoomStepBtn} onPress={() => adjustZoom(-0.1)}>
                  <Text style={styles.zoomStepText}>-</Text>
                </Pressable>

                <Pressable style={[styles.zoomChip, zoom === 0 && styles.activeZoomChip]} onPress={() => setPresetZoom(0)}>
                  <Text style={[styles.chipText, zoom === 0 && styles.activeChipText]}>1x</Text>
                </Pressable>

                <Pressable style={[styles.zoomChip, zoom === 0.25 && styles.activeZoomChip]} onPress={() => setPresetZoom(0.25)}>
                  <Text style={[styles.chipText, zoom === 0.25 && styles.activeChipText]}>2x</Text>
                </Pressable>

                <Pressable style={[styles.zoomChip, zoom === 0.5 && styles.activeZoomChip]} onPress={() => setPresetZoom(0.5)}>
                  <Text style={[styles.chipText, zoom === 0.5 && styles.activeChipText]}>3x</Text>
                </Pressable>

                <Pressable style={[styles.zoomChip, zoom === 1 && styles.activeZoomChip]} onPress={() => setPresetZoom(1)}>
                  <Text style={[styles.chipText, zoom === 1 && styles.activeChipText]}>5x</Text>
                </Pressable>

                <Pressable style={styles.zoomStepBtn} onPress={() => adjustZoom(0.1)}>
                  <Text style={styles.zoomStepText}>+</Text>
                </Pressable>

                <Text style={styles.zoomValueLabel}>{displayZoom}x</Text>
              </View>

              <View style={styles.bottomBar}>
                <Pressable style={styles.flipBtn} onPress={toggleFacing}>
                  <Text style={styles.flipBtnText}>🔄 {facing === 'back' ? 'Back' : 'Front'}</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.shutterBtn,
                    mode === 'video' && styles.videoShutterBtn,
                    isRecording && styles.recordingShutterBtn,
                  ]}
                  onPress={handleCapture}
                >
                  <View style={styles.shutterInnerRing}>
                    <Text style={styles.shutterBtnText}>
                      {mode === 'picture' ? '📸' : isRecording ? '⏹' : '🔴'}
                    </Text>
                  </View>
                </Pressable>

                <View style={{ width: 70 }} />
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  screenHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 16 : 40,
    paddingBottom: 10,
    backgroundColor: '#0f172a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSub: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  camBox: {
    flex: 1,
    position: 'relative',
  },
  cameraWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0f172a',
  },
  permissionCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  permissionIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modePill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeModeTab: {
    backgroundColor: '#4f46e5',
  },
  modeTabText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 13,
  },
  activeModeTabText: {
    color: '#ffffff',
  },
  glassIconButton: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  glassIconText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  bottomControlsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Platform.OS === 'web' ? 16 : 24,
  },
  zoomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 28,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  zoomStepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomStepText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  zoomChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  activeZoomChip: {
    backgroundColor: '#4f46e5',
  },
  chipText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  activeChipText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  zoomValueLabel: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },
  bottomBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  flipBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  flipBtnText: {
    fontWeight: '700',
    color: '#ffffff',
    fontSize: 13,
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  videoShutterBtn: {
    backgroundColor: '#ef4444',
  },
  recordingShutterBtn: {
    backgroundColor: '#dc2626',
    transform: [{ scale: 1.1 }],
  },
  shutterInnerRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterBtnText: {
    fontSize: 24,
  },
  previewFullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#090d16',
  },
  previewMedia: {
    flex: 1,
  },
  previewHeaderContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  badge: {
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  previewControls: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});
