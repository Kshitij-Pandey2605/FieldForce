import { router } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { useAuthContext } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Logout failed', 'Could not log out right now.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Profile</Text>
      <Text style={styles.subtitle}>Manage your field account and session</Text>

      {/* User Avatar Card */}
      <View style={styles.avatarCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'E'}</Text>
        </View>

        <Text style={styles.nameText}>{user?.name || 'Employee'}</Text>
        <View style={styles.roleChip}>
          <Text style={styles.roleText}>FIELD AGENT</Text>
        </View>
      </View>

      {/* Account Info Details */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Account Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Full Name</Text>
          <Text style={styles.value}>{user?.name || 'N/A'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email Address</Text>
          <Text style={styles.value}>{user?.email || 'N/A'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Backend System Status</Text>
          <Text style={[styles.value, { color: '#16a34a', fontWeight: '700' }]}>● Connected (Local MongoDB)</Text>
        </View>
      </View>

      <CustomButton title="Logout Session" onPress={handleLogout} variant="danger" style={styles.logoutBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 20,
  },
  avatarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  roleChip: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#4338ca',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  infoRow: {
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  logoutBtn: {
    marginTop: 'auto',
  },
});
